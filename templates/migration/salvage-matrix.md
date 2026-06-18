# salvage-matrix.md - Que se reusa de intentos o artefactos previos

> Si existe un intento anterior, no se tira ni se copia a ciegas: se convierte en cantera auditada.

## Criterio de clasificacion

- **REUSE** - pasa los gates actuales tal cual y respeta los contratos.
- **ADAPT** - la idea sirve, pero incumple algun contrato o necesita reescritura.
- **DISCARD** - roto, obsoleto, contradice la fuente de verdad o cuesta mas rescatarlo que rehacerlo.

## Matriz

| Artefacto previo | Ruta | Clasificacion | Por que | Gate/contrato afectado |
|------------------|------|---------------|---------|------------------------|
| modulo previo A | `old/path/a` | ADAPT | buena idea, mal boundary | boundaries-extra |
| util comun B | `old/path/b` | REUSE | aislado y probado | - |
| | | | | |

## Regla

Nada entra en produccion solo porque "parece util". Entra si pasa `tools/gates/run-all.sh <unit>` y queda reflejado en la matriz correspondiente.
