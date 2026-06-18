#!/usr/bin/env bash
# run-all.sh - orquesta gates del arnes. Exit 0 = pasa, distinto de 0 = falla.
# Uso: bash tools/gates/run-all.sh <unit>

set -euo pipefail

UNIT="${1:-}"
if [ -z "$UNIT" ]; then
  echo "ERROR: falta <unit>. Uso: bash tools/gates/run-all.sh <unit>" >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

FAILED=0
run_gate () {
  local name="$1"; shift
  echo "──────────────────────────────────────────"
  echo "GATE: $name"
  if "$@"; then
    echo "  OK $name"
  else
    local code=$?
    echo "  FAIL $name (exit $code)" >&2
    FAILED=1
  fi
}

# Gates especificos del stack del repo destino. Crea este fichero si necesitas build,
# typecheck, lint, test, e2e, contrato de API, etc.
if [ -x tools/gates/stack-gates.sh ]; then
  run_gate "stack-gates" bash tools/gates/stack-gates.sh "$UNIT"
else
  echo "──────────────────────────────────────────"
  echo "GATE: stack-gates"
  echo "  SKIP no existe tools/gates/stack-gates.sh (anadelo en el repo destino si aplica)"
fi

# Gates portables sin dependencias.
run_gate "no-mocks"         node tools/gates/no-mocks.mjs "$UNIT"
run_gate "matrix-check"     node tools/gates/matrix-check.mjs "$UNIT"
run_gate "boundaries-extra" node tools/gates/boundaries-extra.mjs "$UNIT"
run_gate "scope-check"      node tools/gates/scope-check.mjs "$UNIT"

echo "──────────────────────────────────────────"
if [ "$FAILED" -eq 0 ]; then
  echo "TODOS LOS GATES VERDES para '$UNIT'"
  exit 0
else
  echo "HAY GATES EN ROJO para '$UNIT' - la tarjeta NO esta done." >&2
  exit 1
fi
