# PROTOCOL.md — Reglas del juego

> Este fichero lo lee CADA worker al arrancar, antes de tocar nada.
> Es el contrato. Si algo no está aquí, no es regla: es opinión.

## 0. Tu identidad y tu límite

Eres un worker de contexto fresco. No tienes memoria de conversaciones anteriores.
Todo lo que necesitas saber está en disco:

- Estas reglas (`PROTOCOL.md`).
- Tu tarjeta (título + body que recibiste al arrancar).
- El estado del proyecto en `docs/migration/`.

Si necesitas algo que no está en disco, **estás bloqueado** — no lo inventes.

## 1. Política de autonomía (la regla que elimina el "Hermes pregunta cada vez")

- **Decisión técnica dentro del scope de tu tarjeta** → la tomas tú. No preguntas.
- **Decisión de producto** (qué debe hacer la feature, qué endpoint es el correcto,
  cambiar comportamiento visible al usuario) → `kanban_block` y escalas al humano.
- **Gate imposible de pasar** tras agotar tu budget → `kanban_block`.

Nunca inventes una decisión de producto. Nunca degrades un requisito para "terminar".

## 2. Scope estricto

Tu tarjeta declara un scope (ej: `SOLO libs/venues/data-access`). Está PROHIBIDO
tocar cualquier fichero fuera de ese scope. Si crees que necesitas tocar algo fuera,
`kanban_block` y explica por qué. El scope creep es motivo de bloqueo, no de iniciativa.

## 3. Definición de "done"

Tú NO te autodeclaras done. "Done" lo declaran:

1. **Los gates**: `bash tools/gates/run-all.sh <app>` sale 0.
2. **Los acceptance criteria** de tu tarjeta, verificados uno a uno.

"Build verde" ≠ "migrado". Build verde significa que compila. La paridad la demuestra
la `parity-matrix.md`, fila a fila. Un self-report sin gates verdes es marketing.

## 4. Contratos arquitectónicos (se verifican con gates, no con buena fe)

> Adapta esta lista a tu proyecto. Ejemplos del caso NX/microfrontends:

- **Sin NgModules.** Componentes y servicios standalone. `inject()` en vez de constructor DI.
- **Boundaries.** `shared` no importa dominios; los remotes no se importan entre sí
  (verificado por `@nx/enforce-module-boundaries` + tags y por `boundaries-extra.mjs`).
- **Sin mocks/placeholders en código productivo** (verificado por `no-mocks.mjs`).
- **Endpoints idénticos a legacy** (URLs listadas en la parity-matrix).

## 5. Budget y stop conditions

Tu tarjeta declara un budget (ej: máx. 8 intentos / 45 min). Cuando se agota:

- NO sigas "un poco más".
- NO bajes el listón.
- `kanban_block` con un resumen de dónde te quedaste y qué falta.

Otras stop conditions que disparan `kanban_block` inmediato:
conflicto de merge, decisión de producto, scope creep necesario, gate roto por causa externa.

## 6. Al terminar una tarjeta (done real)

1. Actualiza `docs/migration/apps/<app>/parity-matrix.md` (marca las filas como done).
2. Actualiza `docs/migration/apps/<app>/status.md` (qué hiciste, qué queda).
3. Commit con mensaje claro (`type: scope - qué`).
4. `kanban_complete` con un resumen y la lista de ficheros tocados.

## 7. Tamaño correcto de slice

Una tarjeta es lo que terminas SIN necesitar un compaction de contexto (~30-60 min de
trabajo de agente). Si necesitas compactar, la tarjeta era demasiado grande: `kanban_block`
y pide que se divida.
