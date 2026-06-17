#!/usr/bin/env bash
# setup-profiles.sh — Crea la jerarquía de agentes como profiles de Hermes.
# Idempotente: si un profile ya existe, lo salta.
#
# La razón de existir: el dispatcher de kanban descarta en silencio cualquier assignee
# que no sea un profile real. Sin estos profiles, las tarjetas se quedan en 'ready' para
# siempre. Ejecuta esto ANTES de crear tarjetas.
#
# Ajusta los modelos a lo que tengas configurado (hermes model lista los disponibles).

set -euo pipefail

# profile_name  ->  modelo sugerido (cámbialos a tu gusto)
declare -A ROLES=(
  [orchestrator]="claude-opus-4-8"     # razonador fuerte: descompone, no ejecuta
  [explorer]="claude-sonnet-4"          # rápido/barato: cataloga legacy
  [executor]="gpt-5.5-codex"            # músculo: implementa (vía Codex)
  [qa]="gpt-5.5"                         # juez: corre gates, audita paridad
)

existing="$(hermes profile list 2>/dev/null || true)"

for role in "${!ROLES[@]}"; do
  if echo "$existing" | grep -qw "$role"; then
    echo "= profile '$role' ya existe — salto"
    continue
  fi
  echo "+ creando profile '$role' (modelo: ${ROLES[$role]})"
  # --clone copia la config base del profile actual; luego fijamos el modelo.
  hermes profile create "$role" --clone || hermes profile create "$role"
  hermes -p "$role" config set model.default "${ROLES[$role]}" 2>/dev/null \
    || echo "  ! ajusta el modelo de '$role' a mano: hermes -p $role model"
done

echo ""
echo "Profiles tras el setup:"
hermes profile list

cat <<'EOF'

SIGUIENTE PASO MANUAL (toolsets por rol — se hace una vez):
  hermes -p orchestrator tools enable kanban
  hermes -p explorer     tools enable file terminal
  hermes -p executor     tools enable terminal file
  hermes -p qa           tools enable terminal file

  # El orquestador NO debe tener terminal de implementación (anti-temptation):
  hermes -p orchestrator tools disable terminal   # opcional pero recomendado

Recuerda: el dispatcher corre en el gateway si kanban.dispatch_in_gateway=true,
o arráncalo a mano con `hermes kanban daemon`.
EOF
