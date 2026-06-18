# Tarjeta ejemplo - refactor: separar repositorio de pagos

**Preset:** `refactor`

**Unit:** `payments`

**Scope permitido:**
- SOLO `packages/payments/repository/`
- SOLO `packages/payments/tests/repository/`

**Fuente de verdad:**
- `docs/refactor/architecture-map.md`
- `docs/refactor/units/payments/change-matrix.md`, filas 3-5

**Acceptance criteria:**
- `bash tools/gates/run-all.sh payments` sale `0`.
- Las filas 3-5 de `change-matrix.md` estan `done` solo si existen los targets/evidencias.
- La API publica de `payments` no cambia.
- Los tests existentes de pagos siguen verdes.
- No se toca codigo fuera del scope permitido.

**Budget:** max. 6 intentos / 45 minutos.

**Al terminar:**
1. Filas 3-5 -> `done` en `change-matrix.md`.
2. Entrada append-only en `docs/refactor/units/payments/status.md`.
3. Gate final ejecutado y resumido.
4. Completar tarjeta con resumen + ficheros tocados.

**Si bloqueado:**
Bloquear con comando reproducible y razon concreta. Ejemplo: "el test publico X falla antes del cambio, necesito decision sobre si reparar baseline o excluirlo del scope".
