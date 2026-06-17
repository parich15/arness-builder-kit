# Tarjeta — <título corto>

> Esta es la forma EXACTA del body de una tarjeta de kanban. El worker recibe esto
> al arrancar (más PROTOCOL.md). Todo lo que el worker necesita decidir debe estar aquí.
> Copia este bloque al campo `body` de `kanban_create` / `hermes kanban create`.

**Scope:** SOLO `<ruta exacta>`. Prohibido tocar cualquier otra carpeta.

**Input:** `docs/migration/apps/<app>/parity-matrix.md`, filas <N>-<M>.
Lee también `inventory.md` (endpoints) y `salvage-matrix.md` (qué reusar).

**Acceptance criteria (todos, verificables):**
- `bash tools/gates/run-all.sh <app>` sale 0.
- Las filas <N>-<M> de la parity-matrix existen como target en disco.
- Endpoints idénticos a legacy (URLs en inventory.md) — sin cambios de contrato.
- Sin NgModules; `inject()` en vez de constructor DI. _(adapta a tu stack)_

**Budget:** máx. 8 intentos / 45 minutos. Si se agota → `kanban_block`.

**Al terminar (done real):**
1. Marca filas <N>-<M> como `done` en `parity-matrix.md`.
2. Añade línea al log de `status.md`.
3. Commit `type: <app> - <qué>`.
4. `kanban_complete` con resumen + ficheros tocados.

**Si bloqueado:** PARAR y `kanban_block` con el motivo. NUNCA inventar una decisión
de producto. NUNCA degradar un requisito para "terminar".
