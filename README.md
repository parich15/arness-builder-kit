# Agentic Harness Kit

Plantilla reutilizable para bootstrapear un **sistema de loops agénticos auto-gestionado**
sobre Hermes Agent + Codex. Sirve para cualquier tarea titánica (migraciones, refactors
masivos, reescrituras), no solo la migración de Venue Workspace.

Basado en el documento `Ingenieria de Loops Agenticos.html`. Resume el principio central:

> El loop no se bootstrapea con prompts. Se bootstrapea con un **arnés**:
> estado en disco + gates ejecutables + protocolo de tarjetas.
> El arnés se construye ANTES de migrar/refactorizar una sola línea.

## Las tres piezas del arnés

1. **Estado en disco** (`docs/migration/`) — un worker con contexto vacío debe poder
   retomar el trabajo leyendo SOLO estos ficheros. Es la prueba de fuego.
2. **Gates como código** (`tools/gates/`) — cada contrato arquitectónico es un comando
   que devuelve exit 0 (pasa) o ≠0 (no pasa). Sin prosa, sin interpretación.
3. **Protocolo de tarjeta** (`cards/`) — cada unidad de trabajo tiene scope, input,
   acceptance criteria, budget y stop conditions explícitas.

## Dos tipos de tarea: misma máquina, distinto vocabulario

La pregunta clave: *"¿y si no es una migración, sino una app nueva?"*. El arnés se separa
en dos capas:

- **Maquinaria (invariante)** — vale para CUALQUIER tarea titánica:
  `PROTOCOL.md`, los gates (`run-all.sh`, `no-mocks`, `matrix-check`, `boundaries-extra`),
  el formato de tarjeta, `status.md`, y los scripts de agentes.
- **Vocabulario (según el tipo)** — solo cambian un par de documentos:

| | **migration** | **greenfield (app nueva)** |
|--|---------------|----------------------------|
| Mapa del territorio | `inventory.md` (cataloga legacy) + `salvage-matrix.md` | `spec.md` (qué construir + contratos) |
| Matriz fila-a-fila | `parity-matrix.md` (legacy vs target) | `acceptance-matrix.md` (capacidad → test + artefacto) |
| Verdad de referencia | el legacy (comportarse igual) | el spec + el test (pasar el test) |
| Ubicación | `docs/migration/apps/<app>/` | `docs/build/components/<comp>/` |

El gate `matrix-check.mjs` es **agnóstico**: detecta automáticamente cuál de las dos
matrices existe (o usa `HARNESS_MATRIX=<ruta>` para forzar una) y valida ambas con el
mismo parser. La regla anti-fraude ("fila done ⇒ el target existe en disco") es idéntica.

Las plantillas de cada tipo viven en `templates/migration/` y `templates/greenfield/`.

## Cómo instanciar el arnés en un repo

```bash
# Migración de un monorepo legacy:
bash scaffold.sh --type migration  ~/work/vw-monorepo venues billing auth

# App nueva (greenfield):
bash scaffold.sh --type greenfield ~/work/nueva-app    auth dashboard
```

El scaffold copia la maquinaria + el vocabulario del tipo elegido, renombra las plantillas
por cada unidad de trabajo, y deja los gates listos (verdes en vacío). Probado end-to-end.

## Orden de ejecución (no te saltes fases)

- **Fase 0 — Arnés completo (1-2 días).** Repo limpio, gates verdes en vacío,
  PROTOCOL.md, board creado. SIN migrar nada.
- **Fase 1 — Piloto (1 app pequeña).** El objetivo NO es migrar la app; es descubrir
  agujeros del arnés (gates que faltan, tarjetas mal dimensionadas).
- **Fase 2 — Escala (2-3 apps en paralelo).** Cada app en su worktree, cada una con
  su cadena `contracts → data-access → features → review`.

## La métrica de éxito

Si matas todos los procesos a mitad de la migración y mañana arrancas workers nuevos,
¿retoman exactamente donde se quedó todo leyendo SOLO el disco?

- **Sí** → tienes un sistema.
- **No** → tienes una conversación larga que se degrada (lo de la última vez).

## Estructura

```
agentic-harness-kit/
├── README.md                       este fichero
├── PROTOCOL.template.md             reglas del juego (cópialo como PROTOCOL.md)
├── docs/migration/
│   ├── inventory.md                 qué existe en legacy
│   ├── salvage-matrix.md            reuse / adapt / discard del intento anterior
│   └── apps/_template/
│       ├── parity-matrix.md         checklist legacy vs target, fila a fila
│       └── status.md                estado actual (lo actualizan los workers)
├── tools/gates/
│   ├── run-all.sh                   orquesta todos los gates → exit 0/1
│   ├── no-mocks.mjs                 prohíbe mocks/placeholders en prod
│   ├── parity-check.mjs             compara parity-matrix vs ficheros reales
│   └── boundaries-extra.mjs         reglas de import (shared no importa dominios…)
├── cards/
│   ├── card.template.md             forma exacta de una tarjeta
│   └── example-card.md              ejemplo relleno
└── agents/
    ├── AGENTS.md                    qué hace cada profile + modelo recomendado
    ├── setup-profiles.sh            crea orquestador/explorador/ejecutor/qa
    └── setup-board.sh               init board + tarjetas de ejemplo
```
