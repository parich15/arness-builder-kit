# parity-matrix.md - <UNIT> (migration)

> Demuestra paridad fila a fila entre el sistema actual y el target.

## Formato (no cambies las columnas; `matrix-check.mjs` las parsea)

| id | Capacidad actual | Ruta / evidencia actual | Target esperado (ruta) | Estado | Verificado por |
|----|------------------|-------------------------|------------------------|--------|----------------|
| 1  | Capacidad observable A | `legacy/path/a` | `target/path/a` | pending | - |
| 2  | Capacidad observable B | `legacy/path/b` | `target/path/b` | pending | - |

## Estados validos

- `pending` - no empezado
- `wip` - en progreso
- `done` - target/evidencia existe + gates verdes + paridad revisada
- `blocked` - escalado al humano

## Reglas

1. El target esperado es contrato de la tarjeta.
2. Una fila `done` debe tener target/evidencia existente en disco.
3. Cambiar comportamiento visible requiere decision de producto documentada.
