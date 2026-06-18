# CHANGELOG del arnes

## Hardening inicial (2026-06-18)

### Nuevo: `tools/gates/scope-check.mjs`
- Gate que detecta si el diff de git toca rutas fuera del scope declarado.
- Configurable via `HARNESS_SCOPE` (env, separado por `:` o `,`) o `tools/gates/scope/<unit>.txt`.
- Advisory (exit 0 con aviso) cuando no hay configuracion de scope, para no romper repos recien scaffoldeados.
- Auto-permite `docs/**/<unit>/**` siempre (el PROTOCOL obliga a actualizar matriz y status).
- Resuelve: el scope estricto era solo prosa; ahora tiene gate ejecutable.

### Modificado: `tools/gates/matrix-check.mjs`
- **Filas malformadas**: filas de datos con menos de 6 columnas ya no se silencian; producen problema y fallan el gate.
- **Target vacio**: filas `done` cuyo target es un fichero de 0 bytes o un directorio vacio fallan el gate. Relajable con `HARNESS_ALLOW_EMPTY_TARGETS=1`. Cierra el gaming de `touch target`.
- **IDs duplicados**: dos filas con el mismo `id` producen problema y fallan el gate.
- **Matriz sin filas**: una matriz sin ninguna fila de datos ya no pasa silenciosamente; falla con mensaje claro.
- Resuelve: varias formas de gaming del gate que producian falsos verdes.

### Nuevo: `tools/gates/tests/` (suite de tests)
- `run-tests.mjs`: runner sin frameworks, fixtures en tmpdir, limpieza en try/finally.
- `run-tests.sh`: wrapper para ejecutar desde la raiz del repo.
- `README.md`: instrucciones de uso.
- Cubre 15 casos entre los tres gates (matrix-check, no-mocks, scope-check).
- Resuelve: el kit predicaba "lo que importa tiene gate" pero sus propios gates no tenian tests.

### Modificado: `tools/gates/run-all.sh`
- Anade `scope-check` como gate portable despues de `boundaries-extra`.

### Nuevo: `LICENSE`
- Licencia MIT, copyright Parich15, 2026.

### Modificado: `README.md`
- Nueva seccion `## Requisitos` (Node >= 18, bash, git).
- Tabla de gates portables con descripcion y configuracion.
- Nueva seccion `## Tests del kit`.
- Estructura de ficheros actualizada con `scope-check.mjs` y `tests/`.

### Modificado: `PROTOCOL.template.md`
- Seccion §2 (Scope estricto): menciona `scope-check.mjs` y `HARNESS_SCOPE`.
- Seccion §5 (Gates): lista los cuatro gates portables incluidos.

### Nuevo: `docs/CHANGELOG-harness.md`
- Este fichero.
