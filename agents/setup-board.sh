#!/usr/bin/env bash
# setup-board.sh - Adaptador Hermes Kanban de ejemplo.
#
# Crea una cadena minima: define -> execute -> review.
# Uso: bash setup-board.sh <unit> [preset]

set -euo pipefail

UNIT="${1:-unit1}"
PRESET="${2:-generic}"

echo "Inicializando board para unidad: $UNIT (preset: $PRESET)"

hermes kanban init 2>/dev/null || echo "= board ya inicializado"

echo "+ T-define: fuente de verdad y matriz"
TDEFINE=$(hermes kanban create \
  --title "$UNIT: define truth source and verification matrix" \
  --assignee explorer \
  --body "Preset: $PRESET. Scope: SOLO docs/. Rellena la fuente de verdad y la matriz de $UNIT. Acceptance: matriz con filas verificables + status inicial. No escribas codigo productivo." \
  | grep -oE 't_[a-f0-9]+' | head -1)
echo "  id=$TDEFINE"

echo "+ T-execute: implementar slice (depende de T-define)"
TEXEC=$(hermes kanban create \
  --title "$UNIT: execute scoped slice" \
  --assignee executor \
  --parent "$TDEFINE" \
  --body "Lee docs/PROTOCOL.md y la matriz de $UNIT. Scope: definir en la tarjeta antes de empezar. Acceptance: bash tools/gates/run-all.sh $UNIT sale 0 + filas correspondientes done. Si falta decision, bloquea." \
  | grep -oE 't_[a-f0-9]+' | head -1)
echo "  id=$TEXEC"

echo "+ T-review: QA (depende de T-execute)"
hermes kanban create \
  --title "$UNIT: review gates and matrix" \
  --assignee qa \
  --parent "$TEXEC" \
  --body "Corre bash tools/gates/run-all.sh $UNIT. Audita matriz/status/diff contra scope y acceptance criteria. Completa si cuadra; bloquea con detalle reproducible si no." \
  >/dev/null

echo ""
echo "Board para '$UNIT' listo: define -> execute -> review"
hermes kanban list
