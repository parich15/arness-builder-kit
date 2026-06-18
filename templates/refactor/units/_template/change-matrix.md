# change-matrix.md - <UNIT> (refactor)

> Matriz de cambio para refactors. La verdad de referencia es comportamiento actual + contratos publicos + tests.

| id | Cambio interno esperado | Baseline / contrato que protege | Target esperado (ruta) | Estado | Verificado por |
|----|-------------------------|---------------------------------|------------------------|--------|----------------|
| 1  | Extraer responsabilidad A | `test/baseline` | `target/path/a` | pending | - |
| 2  | Mover dependencia B detras de interfaz | `test/baseline` | `target/path/b` | pending | - |

## Estados validos

- `pending`
- `wip`
- `done`
- `blocked`

## Regla

Una fila `done` requiere target/evidencia en disco y baseline verde. Si el comportamiento cambia, bloquear.
