# acceptance-matrix.md - <UNIT> (greenfield)

> Matriz de aceptacion para una capacidad nueva. La verdad de referencia es `docs/build/spec.md` + tests.

## Formato (no cambies las columnas; `matrix-check.mjs` las parsea)

| id | Capacidad esperada | Test / verificacion | Target esperado (ruta) | Estado | Verificado por |
|----|--------------------|---------------------|------------------------|--------|----------------|
| 1  | Primera capacidad verificable | `tests/<UNIT>.spec.*` | `src/<UNIT>/...` | pending | - |
| 2  | Segunda capacidad verificable | `tests/<UNIT>.spec.*` | idem | pending | - |

## Estados validos

- `pending` - no empezado
- `wip` - en progreso
- `done` - target/evidencia existe + test/gate verde + acceptance cumplido
- `blocked` - escalado al humano

## Regla

Una fila sin test/verificacion no debe pasar a `done`. Si aun no hay suite de tests, crea primero una tarjeta para definirla.
