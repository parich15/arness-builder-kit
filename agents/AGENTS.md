# Jerarquía de agentes (profiles de Hermes)

> En Hermes, cada "rol" de tu jerarquía es un **profile** independiente: config, modelo,
> skills y memoria aislados. El dispatcher de kanban spawnea un worker del profile que
> figura como `assignee` de cada tarjeta. **OJO:** si el assignee no existe como profile,
> el dispatcher lo descarta en silencio y la tarjeta se queda en `ready` para siempre.
> Por eso este kit crea los profiles ANTES de crear tarjetas.

## El roster (jerarquía propuesta)

| Profile        | Rol            | Modelo sugerido        | Toolset clave | Qué hace |
|----------------|----------------|------------------------|---------------|----------|
| `orchestrator` | Orquestador    | razonador fuerte (opus/gpt-5.5) | `kanban` | Descompone el objetivo en tarjetas, las enlaza con `parents`, NO ejecuta. |
| `explorer`     | Explorador     | rápido/barato          | `file`,`terminal` (read) | Rellena inventory.md y salvage-matrix.md. No escribe código de producción. |
| `executor`     | Ejecutor       | `gpt-5.x-codex` (vía Codex) | `terminal`,`file` | Implementa el slice de la tarjeta. Lanza `codex exec`. |
| `qa`           | Juez / Revisor | razonador fuerte       | `terminal`,`file` | Corre los gates, audita paridad fila a fila. Bloquea o aprueba. |

> El `mmc-agent` que ya tienes (gpt-5.5, parado) puede reutilizarse como `qa` u
> `orchestrator` si no quieres crear uno nuevo. Ajusta los scripts a tu gusto.

## Dos modelos de ejecución (elige según el caso)

### A) Goal-mode dentro de la tarjeta (más simple, recomendado para empezar)
La tarjeta se crea con `goal_mode=True`. El propio worker de Hermes itera en la misma
sesión: tras cada turno un juez auxiliar re-evalúa la respuesta contra el body de la
tarjeta. Si agota el budget → la tarjeta queda `blocked` para ti. Es el loop de objetivo
que faltó en el intento anterior, ya integrado.

### B) Codex como músculo (contexto 100% fresco por slice — el patrón Ralph Wiggum puro)
El worker `executor` lanza `codex exec` con un prompt autocontenido (tarjeta + PROTOCOL).
Cada slice es un proceso Codex nuevo: nada de un Codex de 6 horas compactándose.
`gpt-5.x-codex` para implementar; un razonador fuerte para las tarjetas de `qa`.

Ambos modelos coexisten: el board es el sistema de registro, el worker es intercambiable.

## El loop completo (cómo encaja todo)

```
BOARD (kanban, SQLite)  ──dispatcher toma tarjeta──▶  WORKER (profile, contexto fresco)
        ▲                                                     │ lee PROTOCOL.md + tarjeta
        │                                                     ▼
        │                                              implementa el slice
        │                                                     │
        │                                                     ▼
        │                                        GATES: bash tools/gates/run-all.sh <app>
        │                                          ┌──────────┴──────────┐
        │                                       exit 0                 exit ≠0
        │                                          ▼                     │ lee error,
        │                                        QA / juez               │ corrige,
        │                                  audita parity fila a fila     │ reintenta
        │                          ┌───────────────┼───────────────┐     │
        │                       done            no done         budget agotado
        │                          ▼               ▼ (reintenta)      ▼
        └── commit + update parity-matrix ◀────────┘            BLOCKED → humano (tú)
```

La continuidad la dan los ficheros de estado, no la memoria del agente.
