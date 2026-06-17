#!/usr/bin/env bash
# scaffold.sh — Instancia el arnés DENTRO de un repo destino, según el TIPO de tarea.
#
# El kit es el MOLDE (genérico). Este script crea una INSTANCIA del arnés dentro de tu
# repo de proyecto. La maquinaria (PROTOCOL, gates, formato de tarjeta, status, scripts de
# agentes) es la MISMA para cualquier tarea. Solo cambia el VOCABULARIO según --type:
#
#   migration  -> docs/migration/  : inventory.md, salvage-matrix.md, parity-matrix.md
#   greenfield -> docs/build/      : spec.md, acceptance-matrix.md
#
# Uso:
#   bash scaffold.sh --type <migration|greenfield> <ruta-repo> [unidad1 unidad2 ...]
# Ejemplos:
#   bash scaffold.sh --type migration  ~/work/vw-monorepo venues billing auth
#   bash scaffold.sh --type greenfield ~/work/nueva-app   auth dashboard

set -euo pipefail
KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TYPE="migration"
if [ "${1:-}" = "--type" ]; then TYPE="$2"; shift 2; fi
DEST="${1:-}"; shift || true
UNITS=("$@")

case "$TYPE" in migration|greenfield) ;; *) echo "ERROR: --type debe ser migration|greenfield" >&2; exit 2;; esac
if [ -z "$DEST" ] || [ ! -d "$DEST" ]; then echo "ERROR: destino inválido: '$DEST'" >&2; exit 2; fi
[ ${#UNITS[@]} -eq 0 ] && UNITS=(unit1)

echo "Tipo:    $TYPE"
echo "Kit:     $KIT_DIR"
echo "Destino: $DEST"
echo "Unidades: ${UNITS[*]}"
echo ""

# ── 1. MAQUINARIA (idéntica para los dos tipos) ──────────────────────
mkdir -p "$DEST/tools/gates" "$DEST/tools/agents" "$DEST/cards"
[ -f "$DEST/docs/PROTOCOL.md" ] || { mkdir -p "$DEST/docs"; cp "$KIT_DIR/PROTOCOL.template.md" "$DEST/docs/PROTOCOL.md"; echo "  + docs/PROTOCOL.md"; }
cp "$KIT_DIR/tools/gates/"*.mjs "$DEST/tools/gates/"
cp "$KIT_DIR/tools/gates/run-all.sh" "$DEST/tools/gates/"; chmod +x "$DEST/tools/gates/run-all.sh"
cp "$KIT_DIR/cards/card.template.md" "$DEST/cards/"
cp "$KIT_DIR/agents/"*.sh "$DEST/tools/agents/" && chmod +x "$DEST/tools/agents/"*.sh
cp "$KIT_DIR/agents/AGENTS.md" "$DEST/tools/agents/"
echo "  + tools/gates/ (run-all.sh + 3 gates) · tools/agents/ · cards/"

# ── 2. VOCABULARIO (según tipo) ──────────────────────────────────────
if [ "$TYPE" = "migration" ]; then
  SRC="$KIT_DIR/templates/migration"
  BASE="$DEST/docs/migration"; APPS="$BASE/apps"
  mkdir -p "$APPS"
  for f in inventory.md salvage-matrix.md; do
    [ -f "$BASE/$f" ] || { cp "$SRC/$f" "$BASE/$f"; echo "  + docs/migration/$f (rellénalo)"; }
  done
  for u in "${UNITS[@]}"; do
    [ -d "$APPS/$u" ] && { echo "  = app '$u' ya existe"; continue; }
    mkdir -p "$APPS/$u"
    sed "s/<APP>/$u/g" "$SRC/apps/_template/parity-matrix.md" > "$APPS/$u/parity-matrix.md"
    sed "s/<APP>/$u/g" "$SRC/apps/_template/status.md"        > "$APPS/$u/status.md"
    echo "  + docs/migration/apps/$u/ (parity-matrix + status)"
  done
else
  SRC="$KIT_DIR/templates/greenfield"
  BASE="$DEST/docs/build"; COMP="$BASE/components"
  mkdir -p "$COMP"
  [ -f "$BASE/spec.md" ] || { cp "$SRC/spec.md" "$BASE/spec.md"; echo "  + docs/build/spec.md (rellénalo PRIMERO)"; }
  for u in "${UNITS[@]}"; do
    [ -d "$COMP/$u" ] && { echo "  = component '$u' ya existe"; continue; }
    mkdir -p "$COMP/$u"
    sed "s/<CAPABILITY>/$u/g" "$SRC/components/_template/acceptance-matrix.md" > "$COMP/$u/acceptance-matrix.md"
    sed "s/<APP>/$u/g"        "$SRC/components/_template/status.md"            > "$COMP/$u/status.md"
    echo "  + docs/build/components/$u/ (acceptance-matrix + status)"
  done
fi

cat <<EOF

✅ Arnés ($TYPE) instanciado en: $DEST

SIGUIENTES PASOS:
  cd "$DEST"
  bash tools/gates/run-all.sh ${UNITS[0]}        # verifica gates (verdes en vacío)
EOF
if [ "$TYPE" = "migration" ]; then
  echo "  # rellena docs/migration/inventory.md + apps/<u>/parity-matrix.md (fila a fila)"
else
  echo "  # rellena docs/build/spec.md PRIMERO, luego components/<u>/acceptance-matrix.md"
fi
cat <<EOF
  bash tools/agents/setup-profiles.sh            # crea jerarquía de agentes
  bash tools/agents/setup-board.sh ${UNITS[0]}
  git add docs tools cards && git commit -m "chore: bootstrap agentic harness ($TYPE)"
EOF
