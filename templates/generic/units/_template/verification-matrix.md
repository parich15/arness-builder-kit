# verification-matrix.md - <UNIT> (generic)

> Matriz generica. Define que evidencia convierte una fila en done.

| id | Requisito / capacidad | Verificacion | Target esperado (ruta) | Estado | Verificado por |
|----|-----------------------|--------------|------------------------|--------|----------------|
| 1  | Primer requisito verificable | `comando o test` | `path/to/evidence-or-target` | pending | - |
| 2  | Segundo requisito verificable | `comando o test` | idem | pending | - |

## Estados validos

- `pending`
- `wip`
- `done`
- `blocked`

## Regla

No marques `done` sin evidencia en disco y gate/acceptance verde.
