# PROTOCOL.md - Reglas del arnes

> Cada worker lee este fichero antes de tocar nada. Es el contrato operativo del arnes.
> Si una regla importante no esta aqui, no esperes que un worker la respete de forma fiable.

## 0. Identidad y limite

Eres un worker de contexto fresco. No dependes de memoria de chats anteriores. Todo lo necesario para avanzar debe estar en disco:

- estas reglas (`docs/PROTOCOL.md`);
- tu tarjeta (scope, inputs, acceptance, budget y stop conditions);
- la fuente de verdad del preset (`spec`, `inventory`, `policy`, `brief`, etc.);
- la matriz de verificacion de tu unidad;
- `status.md` de la unidad.

Si falta informacion para decidir correctamente, estas bloqueado. No inventes decisiones de producto, contratos publicos ni criterios de done.

## 1. Politica de autonomia

- **Decision tecnica dentro del scope de la tarjeta**: tomala y deja evidencia en status o en el diff.
- **Decision de producto/contrato visible**: bloquea y escala al humano.
- **Necesidad de tocar fuera del scope**: bloquea y explica por que.
- **Gate imposible tras agotar budget**: bloquea con resumen reproducible.

No rebajes requisitos para terminar. No conviertas una duda de producto en una suposicion tecnica.

## 2. Scope estricto

La tarjeta declara rutas permitidas. Tocar fuera de esas rutas esta prohibido salvo que la tarjeta lo permita explicitamente. El scope tiene gate: `scope-check.mjs` falla si el diff de git incluye rutas no declaradas; configuralo con `HARNESS_SCOPE` o con `tools/gates/scope/<unit>.txt`.

Si descubres que el scope estaba mal definido:

1. para,
2. registra el motivo,
3. bloquea la tarjeta,
4. pide una tarjeta nueva o una ampliacion explicita.

## 3. Fuente de verdad segun preset

| Preset | Fuente de verdad | Cambio visible permitido |
|--------|------------------|--------------------------|
| `migration` | comportamiento legacy + inventario | solo con decision de producto |
| `greenfield` | spec + tests de aceptacion | solo actualizando spec/test primero |
| `refactor` | comportamiento actual + tests/contratos publicos | no, salvo decision explicita |
| `audit` | policy/checklist + evidencia | no aplica; se reporta o remedia segun tarjeta |
| `generic` | brief + verification-matrix | solo si se actualiza el brief |

## 4. Definicion de done

Una tarjeta esta done solo cuando se cumplen todas estas condiciones:

1. `bash tools/gates/run-all.sh <unit>` sale `0`.
2. Todos los acceptance criteria de la tarjeta estan verificados.
3. La matriz de la unidad marca como `done` solo filas cuyo artefacto/evidencia existe.
4. `status.md` resume que cambio, que queda y que se bloqueo.
5. El diff respeta el scope de la tarjeta.

Un self-report sin gates verdes es marketing, no done.

## 5. Gates

`tools/gates/run-all.sh <unit>` es el arbitro tecnico comun. Por defecto ejecuta gates portables sin dependencias:

- `no-mocks` — sin mocks/stubs en codigo productivo;
- `matrix-check` — filas `done` con evidencia real en disco;
- `boundaries-extra` — imports entre dominios;
- `scope-check` — diff de git dentro del scope declarado.

Cada repo debe adaptar o anadir gates de stack para su realidad:

- build/typecheck/lint/test;
- tests de contrato o de paridad;
- e2e o smoke tests si son parte del done.

Si una regla importa, debe tener gate o acceptance verificable. La prosa sola no basta.

## 6. Budget y stop conditions

La tarjeta declara un budget (intentos, tiempo o ambos). Al agotarlo:

- no sigas "un poco mas";
- no bajes el liston;
- bloquea con el ultimo comando ejecutado, salida relevante y siguiente hipotesis.

Stop conditions inmediatas:

- decision de producto pendiente;
- scope creep necesario;
- conflicto de merge;
- dependencia externa caida;
- gate roto por causa fuera de la tarjeta;
- matriz o fuente de verdad contradictoria.

## 7. Al terminar

1. Actualiza la matriz de verificacion de la unidad.
2. Actualiza `status.md` con una entrada append-only.
3. Ejecuta `bash tools/gates/run-all.sh <unit>` y conserva el resultado.
4. Completa la tarjeta en el sistema de tracking que uses.
5. Haz commit solo si la politica del repo/tarjeta lo pide.

## 8. Tamano de slice

Una tarjeta debe caber en una sesion corta de agente. Si necesitas compactar contexto o tocar demasiadas areas, la tarjeta esta mal cortada: bloquea y pide dividirla.
