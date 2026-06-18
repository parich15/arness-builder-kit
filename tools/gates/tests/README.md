# Tests del kit

Ejecuta la suite completa desde la raiz del repo:

```bash
bash tools/gates/tests/run-tests.sh
# o directamente:
node tools/gates/tests/run-tests.mjs
```

Requiere Node.js >= 18 y `git` instalado. No necesita `npm install`.

## Cobertura

- **matrix-check**: pending rows, done con target real, target inexistente, target vacio (0 bytes y ALLOW_EMPTY), fila malformada, estado invalido, ids duplicados, unidad sin matriz.
- **no-mocks**: patron `MOCK_DATA` detectado, fichero limpio, directorio inexistente.
- **scope-check**: sin scope configurado (advisory), fichero dentro de scope, fichero fuera de scope, directorio sin git.

Los tests crean fixtures en directorios temporales bajo `os.tmpdir()` y los eliminan al terminar (incluso si hay fallos).
