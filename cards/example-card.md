# Tarjeta — venues: data-access de VenueService

**Scope:** SOLO `libs/venues/data-access`. Prohibido tocar cualquier otra carpeta.

**Input:** `docs/migration/apps/venues/parity-matrix.md`, filas 12-14.
Endpoints en `inventory.md`. En `salvage-matrix.md`, VenueService v1 está marcado ADAPT
(usa NgModule + mock de auth: úsalo como referencia, NO lo copies tal cual).

**Acceptance criteria:**
- `bash tools/gates/run-all.sh venues` sale 0.
- Existen en disco: `libs/venues/data-access/venue.service.ts` con `getAll`, `getById`, `create`.
- Endpoints idénticos a legacy:
  - `GET /api/venues` → `Venue[]`
  - `GET /api/venues/:id` → `Venue`
  - `POST /api/venues` → `Venue`
- `inject(HttpClient)` (sin constructor DI), servicio standalone, sin NgModule.
- Sin mocks/placeholders (lo verifica `no-mocks.mjs`).

**Budget:** máx. 8 intentos / 45 minutos.

**Al terminar:**
1. Filas 12-14 → `done` en `parity-matrix.md`.
2. Línea en log de `status.md`: fecha + "T-da done, filas 12-14, N ficheros".
3. Commit `feat: venues - data-access VenueService (getAll/getById/create)`.
4. `kanban_complete` con resumen + lista de ficheros.

**Si bloqueado:** `kanban_block`. Ejemplo de bloqueo legítimo: "el endpoint POST /api/venues
del legacy devuelve un shape distinto al documentado en inventory.md — necesito decisión
de producto sobre cuál es el contrato correcto".
