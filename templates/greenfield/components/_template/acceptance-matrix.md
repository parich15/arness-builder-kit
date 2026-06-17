# acceptance-matrix.md — <CAPABILITY> (greenfield)

> El equivalente greenfield de parity-matrix.md. En vez de "legacy vs target", aquí es
> "capacidad esperada → artefacto + test que la demuestra". El gate matrix-check.mjs lee
> este fichero con el MISMO parser que la parity-matrix: mismas columnas, misma máquina.
> Una fila solo es `done` cuando el artefacto existe en disco Y su test pasa.

## Formato (no cambies las columnas — el gate las parsea igual que parity-matrix)

| id | Capacidad esperada | Test que la demuestra | Target esperado (ruta) | Estado | Verificado por |
|----|--------------------|-----------------------|------------------------|--------|----------------|
| 1  | Usuario hace login con credenciales válidas | `auth/login.spec.ts::valid` | `src/features/auth/login.tsx` | pending | — |
| 2  | Login rechaza credenciales inválidas | `auth/login.spec.ts::invalid` | idem | pending | — |
| 3  | Sesión persiste tras refresh | `auth/session.spec.ts` | `src/features/auth/session.ts` | pending | — |

## Estados válidos (idénticos a parity-matrix — el gate solo acepta estos)

- `pending` — no empezado
- `wip` — en progreso
- `done` — target existe + test verde + acceptance cumplido
- `blocked` — escalado al humano

## Diferencia clave vs migración

- **Migración:** la verdad de referencia es el **legacy** (paridad = comportarse igual).
- **Greenfield:** la verdad de referencia es el **spec + el test** (corrección = pasar el test
  que codifica la capacidad). No hay con qué comparar salvo lo que tú definiste en spec.md.

Por eso en greenfield el gate fuerte es **el test**, no la paridad. El `run-all.sh` debe
correr la suite de tests de la capability, no un diff contra legacy.
