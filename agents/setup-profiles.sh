#!/usr/bin/env bash
# setup-profiles.sh - Adaptador Hermes Kanban de ejemplo.
#
# Crea perfiles para los roles del arnes. Ajusta modelos via variables de entorno o edita
# este fichero antes de usarlo en un proyecto real.

set -euo pipefail

declare -A ROLES=(
  [orchestrator]="${HARNESS_ORCHESTRATOR_MODEL:-claude-opus-4-8}"
  [explorer]="${HARNESS_EXPLORER_MODEL:-claude-sonnet-4}"
  [executor]="${HARNESS_EXECUTOR_MODEL:-gpt-5.5-codex}"
  [qa]="${HARNESS_QA_MODEL:-gpt-5.5}"
)

existing="$(hermes profile list 2>/dev/null || true)"

for role in "${!ROLES[@]}"; do
  if echo "$existing" | grep -qw "$role"; then
    echo "= profile '$role' ya existe - salto"
    continue
  fi

  echo "+ creando profile '$role' (modelo sugerido: ${ROLES[$role]})"
  hermes profile create "$role" --clone || hermes profile create "$role"
  hermes -p "$role" config set model.default "${ROLES[$role]}" 2>/dev/null \
    || echo "  ! ajusta el modelo de '$role' a mano si ese nombre no existe"
done

echo ""
echo "Profiles tras el setup:"
hermes profile list

cat <<'EOF'

SIGUIENTE PASO MANUAL (toolsets por rol, una vez):
  hermes -p orchestrator tools enable kanban file
  hermes -p explorer     tools enable file terminal
  hermes -p executor     tools enable terminal file
  hermes -p qa           tools enable terminal file

Recomendado: el orquestador no deberia tener herramientas de implementacion salvo que sea necesario.
El dispatcher debe estar activo en tu entorno (`hermes kanban daemon` o gateway configurado).
EOF
