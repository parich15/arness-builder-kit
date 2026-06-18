# Agentes y runners

> Este directorio contiene un adaptador de ejemplo para Hermes Kanban. No es el nucleo del arnes.
> Puedes sustituirlo por Claude Code, Codex, otro orquestador, o ejecucion manual si respetan el protocolo.

## Roles recomendados

| Rol | Responsabilidad | Puede escribir codigo | Lee |
|-----|-----------------|-----------------------|-----|
| `orchestrator` | Descompone objetivo en tarjetas, dependencias y budgets | No | docs + matrices + status |
| `explorer` | Rellena fuente de verdad: inventory/spec/policy/brief | No produccion | repo + docs |
| `executor` | Implementa una tarjeta acotada | Si, solo scope | PROTOCOL + tarjeta + matriz |
| `qa` | Ejecuta gates, revisa diff y valida matriz | No o minimo | gates + matriz + diff |

La jerarquia puede vivir en profiles de Hermes, agentes de Claude Code, procesos Codex o personas. Lo importante es separar decision, ejecucion y verificacion.

## Contrato minimo de cualquier runner

Un runner valido debe:

1. arrancar con contexto fresco o explicitamente limitado;
2. leer `docs/PROTOCOL.md`;
3. recibir una tarjeta con scope estricto;
4. no tocar fuera del scope;
5. ejecutar `bash tools/gates/run-all.sh <unit>`;
6. actualizar matriz/status solo cuando proceda;
7. bloquear en vez de inventar decisiones de producto.

## Adaptador Hermes Kanban incluido

`setup-profiles.sh` crea perfiles de ejemplo y `setup-board.sh` crea una cadena simple de tarjetas. Ajusta modelos y toolsets a tu instalacion antes de usarlo en serio.

Ejemplo conceptual:

```text
BOARD -> dispatcher -> worker con PROTOCOL + tarjeta
                         -> modifica dentro del scope
                         -> run-all.sh <unit>
                         -> qa revisa matriz/diff
```

## Modelos

Usa nombres de modelo reales de tu entorno. Como regla practica:

- `orchestrator` y `qa`: razonador fuerte;
- `explorer`: modelo rapido/barato, preferiblemente read-only;
- `executor`: modelo/coding agent bueno escribiendo codigo y ejecutando tests.

No acoples el arnes a una marca de modelo. Acopla el arnes a outputs verificables.
