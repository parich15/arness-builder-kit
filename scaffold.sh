#!/usr/bin/env bash
# scaffold.sh — Instancia el arnés (este kit) DENTRO de un repo destino.
#
# El kit es el MOLDE (genérico, vive una vez). Este script crea una INSTANCIA del arnés
# dentro de tu repo de proyecto. El estado específico del proyecto (inventory, parity)
# vive en ESE repo, versionado junto a su código — NO aquí.
#
# Uso:
#   bash scaffold.sh <ruta-repo-destino> [app1 app2 ...]
# Ejemplo:
#   bash scaffold.sh ~/work/vw-monorepo venues billing auth
#
# Idempotente: no sobrescribe ficheros de estado ya rellenados (pregunta antes).

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-}"
shift || true
APPS=("$@")

if [ -z "$DEST" ]; then
  echo "ERROR: falta <ruta-repo-destino>." >&2
  echo "Uso: bash scaffold.sh <ruta-repo-destino> [app1 app2 ...]" >&2
  exit 2
fi
if [ ! -d "$DEST" ]; then
  echo "ERROR: el destino '$DEST' no existe o no es un directorio." >&2
  exit 2
fi
[ ${#APPS[@]} -eq 0 ] && APPS=(app1)

echo "Kit (molde):   $KIT_DIR"
echo "Destino (repo): $DEST"
echo "Apps:           ${APPS[*]}"
echo ""

# 1. Copiar las piezas GENÉRICAS del arnés (no se editan por proyecto, salvo gates).
echo "▶ Copiando arnés al repo destino…"
mkdir -p "$DEST/docs/migration/apps" "$DEST/tools/gates" "$DEST/cards"

# PROTOCOL: copia como PROTOCOL.md (no .template) si no existe ya.
if [ ! -f "$DEST/docs/migration/PROTOCOL.md" ]; then
  cp "$KIT_DIR/PROTOCOL.template.md" "$DEST/docs/migration/PROTOCOL.md"
  echo "  + docs/migration/PROTOCOL.md"
else
  echo "  = PROTOCOL.md ya existe — no toco"
fi

# Gates: siempre se actualizan (son código, no estado). Adapta boundaries por proyecto luego.
cp "$KIT_DIR/tools/gates/"*.mjs "$DEST/tools/gates/"
cp "$KIT_DIR/tools/gates/run-all.sh" "$DEST/tools/gates/"
chmod +x "$DEST/tools/gates/run-all.sh"
echo "  + tools/gates/ (run-all.sh + 3 gates)"

# Plantilla de tarjeta (referencia para quien escribe tarjetas).
cp "$KIT_DIR/cards/card.template.md" "$DEST/cards/"
echo "  + cards/card.template.md"

# Estado base que se rellena: inventory + salvage (solo si no existen).
for f in inventory.md salvage-matrix.md; do
  if [ ! -f "$DEST/docs/migration/$f" ]; then
    cp "$KIT_DIR/docs/migration/$f" "$DEST/docs/migration/$f"
    echo "  + docs/migration/$f (rellénalo)"
  else
    echo "  = docs/migration/$f ya existe — no toco"
  fi
done

# 2. Instanciar la parity-matrix + status por cada app (renombrando _template).
for app in "${APPS[@]}"; do
  appdir="$DEST/docs/migration/apps/$app"
  if [ -d "$appdir" ]; then
    echo "  = app '$app' ya tiene carpeta — no toco"
    continue
  fi
  mkdir -p "$appdir"
  sed "s/<APP>/$app/g" "$KIT_DIR/docs/migration/apps/_template/parity-matrix.md" > "$appdir/parity-matrix.md"
  sed "s/<APP>/$app/g" "$KIT_DIR/docs/migration/apps/_template/status.md"        > "$appdir/status.md"
  echo "  + docs/migration/apps/$app/ (parity-matrix + status)"
done

# 3. Copiar los scripts de agentes (profiles + board) al repo, para que vivan con el proyecto.
mkdir -p "$DEST/tools/agents"
cp "$KIT_DIR/agents/"*.sh "$DEST/tools/agents/"
cp "$KIT_DIR/agents/AGENTS.md" "$DEST/tools/agents/"
chmod +x "$DEST/tools/agents/"*.sh
echo "  + tools/agents/ (setup-profiles.sh, setup-board.sh, AGENTS.md)"

cat <<EOF

✅ Arnés instanciado en: $DEST

SIGUIENTES PASOS (dentro del repo destino):
  cd "$DEST"
  # 1. Verifica que los gates corren (en vacío deberían pasar):
  bash tools/gates/run-all.sh ${APPS[0]}
  # 2. Rellena el estado real:
  #    docs/migration/inventory.md, salvage-matrix.md
  #    docs/migration/apps/<app>/parity-matrix.md (fila a fila)
  # 3. Adapta los gates a tu stack (descomenta las líneas nx en run-all.sh,
  #    ajusta los dominios en boundaries-extra.mjs).
  # 4. Crea la jerarquía de agentes y el board:
  bash tools/agents/setup-profiles.sh
  bash tools/agents/setup-board.sh ${APPS[0]}
  # 5. git add docs/migration tools/ cards/  &&  git commit -m "chore: bootstrap agentic harness"
EOF
