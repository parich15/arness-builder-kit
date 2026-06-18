# Tarjeta - <titulo corto>

> Copia este bloque al sistema de tracking que uses. El worker debe recibir esta tarjeta mas `docs/PROTOCOL.md`.

**Preset:** `<generic|migration|greenfield|refactor|audit>`

**Unit:** `<unit>`

**Scope permitido:**
- SOLO `<ruta exacta 1>`
- SOLO `<ruta exacta 2 si aplica>`

Todo lo demas esta prohibido. Si hace falta tocar fuera, bloquear.

**Fuente de verdad:**
- `<ruta al spec/inventory/policy/brief>`
- `<ruta a la matriz: docs/.../<unit>/...-matrix.md>`, filas `<N>-<M>`

**Acceptance criteria (todos verificables):**
- `bash tools/gates/run-all.sh <unit>` sale `0`.
- Las filas `<N>-<M>` pasan a `done` solo si el target/evidencia existe.
- `<criterio funcional/de contrato concreto>`.
- `<criterio de calidad concreto>`.

**Budget:** max. `<intentos>` intentos / `<minutos>` minutos. Si se agota, bloquear.

**Al terminar (done real):**
1. Actualiza la matriz indicada.
2. Anade entrada append-only en `status.md` de la unidad.
3. Ejecuta el gate final y registra el comando.
4. Completa la tarjeta con resumen + ficheros tocados.
5. Commit solo si la politica de la tarjeta/repo lo pide.

**Si bloqueado:**
Parar y registrar motivo reproducible. No inventar decisiones de producto. No degradar requisitos para terminar.
