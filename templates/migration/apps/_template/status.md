# status.md — <APP>

> Estado vivo de la app. Lo actualizan los workers al terminar cada tarjeta (regla 6 del
> PROTOCOL). Un worker nuevo lee esto + parity-matrix.md para saber dónde retomar.
> NO se actualiza por memoria del agente — solo por lo que está en disco.

## Resumen

- **Fase:** Fase 0 (arnés) | Fase 1 (piloto) | Fase 2 (escala)
- **Última actualización:** _(fecha + id de tarjeta)_
- **Filas parity done / total:** 0 / N
- **Tarjetas blocked esperando humano:** ninguna

## Cadena de tarjetas de esta app

```
contracts  →  data-access  →  features  →  review
 (T-c)         (T-da)          (T-f)        (T-r)
```

| Tarjeta | Estado | Worker | Notas |
|---------|--------|--------|-------|
| T-c contracts (tipos, interfaces, tokens) | pending | — | |
| T-da data-access (servicios, llamadas API) | pending | — | depende de T-c |
| T-f features (componentes, páginas) | pending | — | depende de T-da |
| T-r review (auditoría de paridad) | pending | — | depende de T-f |

## Log de eventos (append-only, lo más reciente arriba)

- _(vacío — los workers añaden líneas aquí: "2026-06-17 T-da done, filas 12-14 parity, 5 ficheros")_

## Decisiones de producto pendientes (bloquean el humano)

- _(vacío)_
