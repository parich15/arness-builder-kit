# Agentic Harness Kit

Plantilla reutilizable para crear un **arnes de trabajo para agentes autonomos**. El arnes no depende de una herramienta concreta: puedes operarlo con Hermes Kanban, Claude Code, Codex, otro runner, o incluso manualmente. Lo importante es que el trabajo no viva en una conversacion larga, sino en artefactos verificables del repo.

Principio central:

> El loop no se bootstrapea con prompts. Se bootstrapea con un arnes:
> estado en disco + gates ejecutables + tarjetas con scope.

## Requisitos

- **Node.js >= 18** — los gates son ficheros `.mjs` (ESM nativo); versiones anteriores no los ejecutan.
- **bash** — para `run-all.sh` y los wrappers de scaffold.
- **git** — varios gates leen el estado del repositorio (`scope-check`, entre otros).

Aunque los gates son "portables" (sin `npm install`), siguen requiriendo Node en el sistema donde se ejecuten.

## Que problema resuelve

Sirve para trabajos grandes o de alto riesgo donde un agente aislado tiende a perder contexto:

- migraciones de legacy a una nueva arquitectura;
- greenfield de productos o modulos nuevos;
- refactors grandes preservando comportamiento;
- auditorias, hardening o saneamiento de deuda tecnica;
- cualquier iniciativa que necesite varias tarjetas, varios workers y una definicion fuerte de "done".

## Las tres piezas invariantes

1. **Estado en disco** (`docs/...`)
   Un worker con contexto limpio debe poder retomar leyendo solo el repo: protocolo, matriz, status y docs de verdad.

2. **Gates como codigo** (`tools/gates/`)
   Cada contrato importante debe ser un comando con exit `0` si pasa y distinto de `0` si falla. La prosa orienta; el gate decide.

3. **Protocolo de tarjeta** (`cards/`)
   Cada unidad de trabajo declara scope, inputs, acceptance criteria, budget, acciones de done y condiciones de bloqueo.

## Presets soportados

Todos los presets usan la misma maquina. Cambia el vocabulario y la fuente de verdad.

| Preset | Usalo cuando | Fuente de verdad | Matriz principal |
|--------|--------------|------------------|------------------|
| `generic` | Aun no encaja en un modo especifico, pero necesitas estado + gates + tarjetas | brief del objetivo + criterios escritos | `docs/harness/units/<unit>/verification-matrix.md` |
| `migration` | Hay un sistema existente cuyo comportamiento debe preservarse | legacy observado + decisiones explicitas de producto | `docs/migration/apps/<unit>/parity-matrix.md` |
| `greenfield` | Estas creando algo nuevo sin legacy que copiar | spec + tests de aceptacion | `docs/build/components/<unit>/acceptance-matrix.md` |
| `refactor` | Cambias estructura interna manteniendo comportamiento observable | tests existentes + mapa de cambio + contratos publicos | `docs/refactor/units/<unit>/change-matrix.md` |
| `audit` | Quieres auditar, hardenizar o cerrar deuda contra una politica | policy/checklist + evidencia reproducible | `docs/audit/scopes/<unit>/evidence-matrix.md` |

Si el caso no encaja, usa `generic` primero y convierte el preset cuando la fuente de verdad este clara.

## Como instanciar el arnes

```bash
# Modo generico: buena opcion si aun estas definiendo el tipo de trabajo.
bash scaffold.sh --type generic ~/work/proyecto core

# Migracion con paridad contra legacy.
bash scaffold.sh --type migration ~/work/monorepo legacy-area billing

# Producto o modulo nuevo.
bash scaffold.sh --type greenfield ~/work/app auth dashboard

# Refactor grande preservando comportamiento.
bash scaffold.sh --type refactor ~/work/api payments reporting

# Auditoria / hardening / deuda tecnica.
bash scaffold.sh --type audit ~/work/platform security performance
```

El scaffold copia la maquinaria comun, crea los documentos del preset elegido y deja los gates portables listos. Tras instanciar:

```bash
cd ~/work/proyecto
bash tools/gates/run-all.sh core
```

Ese primer run debe estar verde en vacio o explicar claramente que falta adaptar.

## Flujo recomendado

1. **Fase 0 - Preparar el arnes.**
   Elegir preset, rellenar docs de verdad, adaptar gates al stack y crear tarjetas pequenas. No implementar aun.

2. **Fase 1 - Piloto.**
   Ejecutar una unidad pequena para descubrir huecos del arnes: gates debiles, matrices ambiguas, scope demasiado grande.

3. **Fase 2 - Escala controlada.**
   Paralelizar solo cuando el piloto demuestre que el sistema de estado + gates + tarjetas es suficiente.

## Integraciones de agentes

El kit incluye scripts de ejemplo para Hermes Kanban en `agents/`, porque era el entorno original. Tratalos como **adaptadores**, no como el nucleo del arnes. El mismo protocolo funciona con otros runners si cumplen estas reglas:

- arrancan con contexto fresco;
- leen `docs/PROTOCOL.md` y la tarjeta;
- respetan scope estricto;
- ejecutan `bash tools/gates/run-all.sh <unit>`;
- actualizan matriz/status solo cuando los gates y acceptance criteria pasan.

## Estructura del kit

```text
agentic-harness-kit/
├── README.md
├── PROTOCOL.template.md
├── scaffold.sh
├── templates/
│   ├── generic/
│   ├── migration/
│   ├── greenfield/
│   ├── refactor/
│   └── audit/
├── tools/gates/
│   ├── run-all.sh
│   ├── matrix-check.mjs
│   ├── no-mocks.mjs
│   ├── boundaries-extra.mjs
│   ├── scope-check.mjs
│   └── tests/
│       ├── run-tests.sh
│       ├── run-tests.mjs
│       └── README.md
├── cards/
│   ├── card.template.md
│   └── example-card.md
└── agents/
    ├── AGENTS.md
    ├── setup-profiles.sh
    └── setup-board.sh
```

## Gates portables incluidos

| Gate | Que hace | Configuracion |
|------|----------|---------------|
| `no-mocks.mjs` | Falla si hay mocks/stubs/placeholders en codigo productivo | `HARNESS_TARGET_ROOTS` |
| `matrix-check.mjs` | Valida que filas `done` tengan target en disco, sin ids duplicados ni filas malformadas | `HARNESS_MATRIX`, `HARNESS_ALLOW_EMPTY_TARGETS` |
| `boundaries-extra.mjs` | Impide imports entre dominios hermanos | `HARNESS_DOMAIN_NAMES`, `HARNESS_SHARED_ROOTS` |
| `scope-check.mjs` | Falla si el diff de git toca rutas fuera del scope declarado | `HARNESS_SCOPE` (separado por `:` o `,`) o fichero `tools/gates/scope/<unit>.txt` |

`scope-check` es advisory cuando no hay configuracion de scope: sale `0` con un aviso, para no romper repos recien scaffoldeados.

## Tests del kit

El propio kit tiene tests para verificar que los gates funcionan:

```bash
bash tools/gates/tests/run-tests.sh
```

La suite cubre `matrix-check`, `no-mocks` y `scope-check` con casos tanto de exito como de fallo. No requiere dependencias externas. Consulta `tools/gates/tests/README.md` para mas detalles.

## Metrica de exito

Si paras todos los procesos a mitad de una iniciativa y manana arrancas workers nuevos, deben poder contestar:

1. que falta,
2. que esta bloqueado,
3. que comandos prueban el estado,
4. que scope tiene la siguiente tarjeta.

Si eso sale de los ficheros del repo, tienes un sistema. Si sale de la memoria de una conversacion, todavia no tienes arnes.
