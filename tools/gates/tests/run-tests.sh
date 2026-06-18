#!/usr/bin/env bash
# run-tests.sh - wrapper para la suite de tests del arnes.
# Uso: bash tools/gates/tests/run-tests.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"
node tools/gates/tests/run-tests.mjs
