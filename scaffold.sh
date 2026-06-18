#!/usr/bin/env bash
# scaffold.sh - instancia el arnes dentro de un repo destino.
#
# El kit es el molde. El repo destino contiene la instancia: docs, gates, tarjetas y
# adaptadores. La maquinaria es comun; el --type solo cambia vocabulario y fuente de verdad.
#
# Uso:
#   bash scaffold.sh --type <generic|migration|greenfield|refactor|audit> <ruta-repo> [unidad1 unidad2 ...]

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Uso:
  bash scaffold.sh --type <generic|migration|greenfield|refactor|audit> <ruta-repo> [unidad...]

Ejemplos:
  bash scaffold.sh --type generic    ~/work/proyecto core
  bash scaffold.sh --type migration  ~/work/monorepo legacy-area billing
  bash scaffold.sh --type greenfield ~/work/app auth dashboard
  bash scaffold.sh --type refactor   ~/work/api payments reporting
  bash scaffold.sh --type audit      ~/work/platform security performance
EOF
}

TYPE="generic"
if [ "${1:-}" = "--type" ]; then
  if [ $# -lt 2 ]; then
    echo "ERROR: --type requiere un valor" >&2
    exit 2
  fi
  TYPE="$2"
  shift 2
elif [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
else
  echo "AVISO: no se indico --type; uso 'generic'." >&2
fi

DEST="${1:-}"
if [ -n "$DEST" ]; then shift || true; fi
UNITS=("$@")

case "$TYPE" in
  generic|migration|greenfield|refactor|audit) ;;
  *) echo "ERROR: --type debe ser generic|migration|greenfield|refactor|audit" >&2; exit 2 ;;
esac

if [ -z "$DEST" ] || [ ! -d "$DEST" ]; then
  echo "ERROR: destino invalido: '$DEST'" >&2
  usage >&2
  exit 2
fi

[ ${#UNITS[@]} -eq 0 ] && UNITS=(unit1)

replace_unit() {
  local src="$1"
  local dst="$2"
  local unit="$3"
  sed -e "s/<UNIT>/$unit/g" -e "s/<APP>/$unit/g" -e "s/<CAPABILITY>/$unit/g" "$src" > "$dst"
}

copy_if_missing() {
  local src="$1"
  local dst="$2"
  local label="$3"
  if [ -f "$dst" ]; then
    echo "  = $label ya existe"
  else
    mkdir -p "$(dirname "$dst")"
    cp "$src" "$dst"
    echo "  + $label"
  fi
}

copy_render_if_missing() {
  local src="$1"
  local dst="$2"
  local unit="$3"
  local label="$4"
  if [ -f "$dst" ]; then
    echo "  = $label ya existe"
  else
    mkdir -p "$(dirname "$dst")"
    replace_unit "$src" "$dst" "$unit"
    echo "  + $label"
  fi
}

echo "Tipo:     $TYPE"
echo "Kit:      $KIT_DIR"
echo "Destino:  $DEST"
echo "Unidades: ${UNITS[*]}"
echo ""

# 1. Maquinaria comun.
mkdir -p "$DEST/tools/gates" "$DEST/tools/agents" "$DEST/cards" "$DEST/docs"
copy_if_missing "$KIT_DIR/PROTOCOL.template.md" "$DEST/docs/PROTOCOL.md" "docs/PROTOCOL.md"
cp "$KIT_DIR/tools/gates/"*.mjs "$DEST/tools/gates/"
cp "$KIT_DIR/tools/gates/run-all.sh" "$DEST/tools/gates/"
chmod +x "$DEST/tools/gates/run-all.sh"
cp "$KIT_DIR/cards/card.template.md" "$DEST/cards/"
cp "$KIT_DIR/agents/"*.sh "$DEST/tools/agents/"
chmod +x "$DEST/tools/agents/"*.sh
cp "$KIT_DIR/agents/AGENTS.md" "$DEST/tools/agents/"
echo "  + tools/gates/ · tools/agents/ · cards/"

# 2. Vocabulario por preset.
case "$TYPE" in
  migration)
    SRC="$KIT_DIR/templates/migration"
    BASE="$DEST/docs/migration"
    copy_if_missing "$SRC/inventory.md" "$BASE/inventory.md" "docs/migration/inventory.md"
    copy_if_missing "$SRC/salvage-matrix.md" "$BASE/salvage-matrix.md" "docs/migration/salvage-matrix.md"
    for unit in "${UNITS[@]}"; do
      UDIR="$BASE/apps/$unit"
      copy_render_if_missing "$SRC/apps/_template/parity-matrix.md" "$UDIR/parity-matrix.md" "$unit" "docs/migration/apps/$unit/parity-matrix.md"
      copy_render_if_missing "$SRC/apps/_template/status.md" "$UDIR/status.md" "$unit" "docs/migration/apps/$unit/status.md"
    done
    ;;
  greenfield)
    SRC="$KIT_DIR/templates/greenfield"
    BASE="$DEST/docs/build"
    copy_if_missing "$SRC/spec.md" "$BASE/spec.md" "docs/build/spec.md"
    for unit in "${UNITS[@]}"; do
      UDIR="$BASE/components/$unit"
      copy_render_if_missing "$SRC/components/_template/acceptance-matrix.md" "$UDIR/acceptance-matrix.md" "$unit" "docs/build/components/$unit/acceptance-matrix.md"
      copy_render_if_missing "$SRC/components/_template/status.md" "$UDIR/status.md" "$unit" "docs/build/components/$unit/status.md"
    done
    ;;
  refactor)
    SRC="$KIT_DIR/templates/refactor"
    BASE="$DEST/docs/refactor"
    copy_if_missing "$SRC/architecture-map.md" "$BASE/architecture-map.md" "docs/refactor/architecture-map.md"
    copy_if_missing "$SRC/change-plan.md" "$BASE/change-plan.md" "docs/refactor/change-plan.md"
    for unit in "${UNITS[@]}"; do
      UDIR="$BASE/units/$unit"
      copy_render_if_missing "$SRC/units/_template/change-matrix.md" "$UDIR/change-matrix.md" "$unit" "docs/refactor/units/$unit/change-matrix.md"
      copy_render_if_missing "$SRC/units/_template/status.md" "$UDIR/status.md" "$unit" "docs/refactor/units/$unit/status.md"
    done
    ;;
  audit)
    SRC="$KIT_DIR/templates/audit"
    BASE="$DEST/docs/audit"
    copy_if_missing "$SRC/policy.md" "$BASE/policy.md" "docs/audit/policy.md"
    copy_if_missing "$SRC/findings.md" "$BASE/findings.md" "docs/audit/findings.md"
    for unit in "${UNITS[@]}"; do
      UDIR="$BASE/scopes/$unit"
      copy_render_if_missing "$SRC/scopes/_template/evidence-matrix.md" "$UDIR/evidence-matrix.md" "$unit" "docs/audit/scopes/$unit/evidence-matrix.md"
      copy_render_if_missing "$SRC/scopes/_template/status.md" "$UDIR/status.md" "$unit" "docs/audit/scopes/$unit/status.md"
    done
    ;;
  generic)
    SRC="$KIT_DIR/templates/generic"
    BASE="$DEST/docs/harness"
    copy_if_missing "$SRC/brief.md" "$BASE/brief.md" "docs/harness/brief.md"
    for unit in "${UNITS[@]}"; do
      UDIR="$BASE/units/$unit"
      copy_render_if_missing "$SRC/units/_template/verification-matrix.md" "$UDIR/verification-matrix.md" "$unit" "docs/harness/units/$unit/verification-matrix.md"
      copy_render_if_missing "$SRC/units/_template/status.md" "$UDIR/status.md" "$unit" "docs/harness/units/$unit/status.md"
    done
    ;;
esac

cat <<EOF

Arnes ($TYPE) instanciado en: $DEST

SIGUIENTES PASOS:
  cd "$DEST"
  bash tools/gates/run-all.sh ${UNITS[0]}
  # Rellena la fuente de verdad y adapta gates de stack antes de ejecutar tarjetas reales.
  # Opcional: bash tools/agents/setup-profiles.sh && bash tools/agents/setup-board.sh ${UNITS[0]} $TYPE
EOF
