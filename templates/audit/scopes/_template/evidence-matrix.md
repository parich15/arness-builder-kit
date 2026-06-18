# evidence-matrix.md - <UNIT> (audit)

> Matriz de evidencia. Una fila done significa que el control fue verificado con evidencia reproducible.

| id | Control / pregunta | Verificacion | Target esperado (ruta) | Estado | Verificado por |
|----|--------------------|--------------|------------------------|--------|----------------|
| 1  | Control A aplicado a <UNIT> | `comando o checklist` | `docs/audit/scopes/<UNIT>/evidence/control-a.md` | pending | - |
| 2  | Control B aplicado a <UNIT> | `comando o checklist` | idem | pending | - |

## Estados validos

- `pending`
- `wip`
- `done`
- `blocked`

## Regla

No marques `done` sin evidencia en disco. Si hay hallazgo, registra entrada en `docs/audit/findings.md`.
