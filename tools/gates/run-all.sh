#!/usr/bin/env bash
# run-all.sh — Orquesta todos los gates. Exit 0 = pasa, ≠0 = no pasa.
# Uso: bash tools/gates/run-all.sh <app>
# Este es el ÚNICO árbitro de "done" a nivel técnico. El juez/QA lee SOLO su exit code.

set -euo pipefail

APP="${1:-}"
if [ -z "$APP" ]; then
  echo "ERROR: falta <app>. Uso: bash tools/gates/run-all.sh <app>" >&2
  exit 2
fi

# Raíz del repo (este script vive en tools/gates/)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

FAILED=0
run_gate () {
  local name="$1"; shift
  echo "──────────────────────────────────────────"
  echo "▶ GATE: $name"
  if "$@"; then
    echo "  ✔ $name"
  else
    echo "  x $name FALLO (exit $?)" >&2
    FAILED=1
  fi
}

# ── Gates de stack (NX/Angular) — DESCOMENTA y adapta a tu proyecto ──
# run_gate "typecheck" npx nx run "${APP}:typecheck"
# run_gate "build"     npx nx run "${APP}:build" --skip-nx-cache
# run_gate "lint+boundaries" npx nx run "${APP}:lint"   # con @nx/enforce-module-boundaries + tags

# ── Gates portables (Node puro, sin dependencias) — funcionan ya ──
run_gate "no-mocks"        node tools/gates/no-mocks.mjs "$APP"
run_gate "matrix-check"    node tools/gates/matrix-check.mjs "$APP"
run_gate "boundaries-extra" node tools/gates/boundaries-extra.mjs "$APP"

echo "──────────────────────────────────────────"
if [ "$FAILED" -eq 0 ]; then
  echo "✅ TODOS LOS GATES VERDES para '$APP'"
  exit 0
else
  echo "❌ HAY GATES EN ROJO para '$APP' — la tarjeta NO está done." >&2
  exit 1
fi
