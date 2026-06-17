# inventory.md — Qué existe en el legacy

> Mapa del territorio. Lo rellena un **explorador** (profile read-only) en Fase 0.
> No se migra nada sin que la zona esté inventariada aquí.

## Cómo se rellena

Una tarjeta de tipo "explore" asignada al profile `explorer` recorre el legacy y
completa estas tablas. El explorador NO escribe código de producción; solo cataloga.

## Apps / dominios

| App / dominio | Ruta legacy | Estado migración | Prioridad | Notas |
|---------------|-------------|------------------|-----------|-------|
| venues        | `src/app/venues` | pendiente | 1 | app piloto |
| billing       | `src/app/billing` | pendiente | 2 | |
| _(añade filas)_ | | | | |

## Componentes

| Componente | Ruta legacy | Tipo (page/widget/shared) | Depende de | Target lib |
|------------|-------------|---------------------------|------------|------------|
| | | | | |

## Servicios

| Servicio | Ruta legacy | Responsabilidad | Endpoints que llama | Target lib |
|----------|-------------|-----------------|---------------------|------------|
| | | | | |

## Endpoints (contrato con backend — NO cambiar sin decisión de producto)

| Método | URL | Usado por | Request shape | Response shape |
|--------|-----|-----------|---------------|----------------|
| GET | `/api/venues` | VenueService | — | `Venue[]` |
| | | | | |

## Rutas

| Ruta legacy | Componente | Guards | Target |
|-------------|-----------|--------|--------|
| | | | |
