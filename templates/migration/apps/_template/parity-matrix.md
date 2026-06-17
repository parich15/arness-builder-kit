# parity-matrix.md — <APP> (legacy vs target)

> El corazón del sistema. Demuestra paridad **fila a fila**. El gate `parity-check.mjs`
> lee este fichero y compara con los ficheros reales en disco.
> Una fila solo se marca `done` cuando existe el target Y pasa los gates.

## Formato (no cambiar las columnas — el gate las parsea)

| id | Capacidad legacy | Ruta legacy | Target esperado (ruta) | Estado | Verificado por |
|----|------------------|-------------|------------------------|--------|----------------|
| 1  | Listar venues | `src/app/venues/list` | `libs/venues/feature-list/...` | pending | — |
| 2  | Detalle venue | `src/app/venues/detail` | `libs/venues/feature-detail/...` | pending | — |
| 12 | VenueService.getAll | `src/app/venues/venue.service.ts` | `libs/venues/data-access/venue.service.ts` | pending | — |
| 13 | VenueService.getById | idem | idem | pending | — |
| 14 | VenueService.create | idem | idem | pending | — |

## Estados válidos (el gate solo acepta estos)

- `pending`  — no empezado
- `wip`      — en progreso (worker activo)
- `done`     — target existe + gates verdes + acceptance cumplido
- `blocked`  — escalado al humano

## Reglas de la matriz

1. El `Target esperado (ruta)` es un contrato: el worker DEBE crear exactamente ese fichero.
2. `parity-check.mjs <app>` falla (exit 1) si una fila está `done` pero el fichero target
   no existe. Esto impide el self-report fraudulento.
3. Los endpoints listados en `inventory.md` deben aparecer idénticos en el target.
   Cambiar un endpoint = decisión de producto = `kanban_block`.
