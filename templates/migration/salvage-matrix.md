# salvage-matrix.md — Qué se reusa del intento anterior

> El intento de migración fallido NO se tira a la basura: se convierte en **cantera auditada**.
> Cada artefacto del intento anterior se clasifica: REUSE / ADAPT / DISCARD.
> Lo rellena el `explorer` con apoyo del `qa` en Fase 0.

## Criterio de clasificación

- **REUSE** — pasa los gates actuales tal cual. Se copia sin tocar.
- **ADAPT** — la idea es buena pero incumple un contrato (boundaries, mocks, NgModules).
  Se reusa como referencia pero se reescribe para pasar gates.
- **DISCARD** — roto, obsoleto, o contradice el target. Se ignora (no se borra el legacy;
  solo no se usa como fuente).

## Matriz

| Artefacto (intento anterior) | Ruta | Clasificación | Por qué | Gate que incumple |
|------------------------------|------|---------------|---------|-------------------|
| VenueService v1 | `old-attempt/venues/...` | ADAPT | usa NgModule + mock de auth | no-mocks, standalone |
| venue-card component | `old-attempt/...` | REUSE | standalone, sin deuda | — |
| | | | | |

## Regla de oro del salvage

Nunca copies código del intento anterior directo a producción sin pasarlo por
`tools/gates/run-all.sh`. La razón por la que el intento falló fue que el código
"parecía bien" pero incumplía contratos que eran prosa. Ahora son gates: si no pasa, no entra.
