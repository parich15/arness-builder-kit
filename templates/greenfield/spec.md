# spec.md — Qué vamos a construir (greenfield)

> El "mapa del territorio" para una app NUEVA. Sustituye a inventory.md (que cataloga
> legacy). Aquí no hay legacy: hay una visión de producto que hay que volver verificable.
> Lo rellena el humano (tú) con apoyo del `explorer` para investigar referencias técnicas.

## Visión (1 párrafo)

_(Qué es la app, para quién, qué problema resuelve. Sin esto, el juez no tiene contra qué medir.)_

## Stack y decisiones de arquitectura (contratos)

> Estas decisiones se vuelven gates. Si no están aquí, el worker las inventa.

- **Framework / runtime:** _(ej: Next.js 15 + React 19, o NestJS, o Angular standalone)_
- **Estado:** _(ej: signals, sin Redux)_
- **Estilos:** _(ej: Tailwind, sin CSS inline)_
- **Datos / API:** _(ej: tRPC, REST, GraphQL — define el contrato)_
- **Boundaries:** _(ej: `features/` no se importan entre sí; `shared/` no importa features)_
- **Tests:** _(ej: Vitest unit + Playwright e2e; cobertura mínima por feature)_

## Capacidades (epics) — cada una se expande a filas en acceptance-matrix.md

| id | Capacidad | Prioridad | Notas |
|----|-----------|-----------|-------|
| C1 | Auth (login, registro, sesión) | 1 | |
| C2 | Dashboard | 2 | depende de C1 |
| C3 | _(añade)_ | | |

## Endpoints / contrato de datos (si aplica)

| Método | Ruta | Request | Response | Capacidad |
|--------|------|---------|----------|-----------|
| POST | `/api/auth/login` | `{email,password}` | `{token}` | C1 |
| | | | | |

## Fuera de scope (explícito — evita scope creep)

- _(lista lo que NO se construye en esta tanda. El worker que toque esto → kanban_block.)_
