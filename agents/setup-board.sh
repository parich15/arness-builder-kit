#!/usr/bin/env bash
# setup-board.sh — Inicializa el board de kanban y crea la cadena de tarjetas de una app.
# Demuestra el patrón de dependencias: contracts -> data-access -> features -> review.
#
# Ejecuta DESPUÉS de setup-profiles.sh (los assignees deben existir).
# Uso: bash setup-board.sh <app>     (default: venues)

set -euo pipefail

APP="${1:-venues}"
echo "Inicializando board para app: $APP"

# 1. Init del board (idempotente).
hermes kanban init 2>/dev/null || echo "= board ya inicializado"

# 2. Cadena de tarjetas con dependencias reales.
#    Capturamos el id de cada tarjeta para enlazar la siguiente con --parent.
#    NOTA: la sintaxis exacta de flags puede variar por versión — revisa `hermes kanban create --help`.

echo "+ T-c: contracts"
TC=$(hermes kanban create \
  --title "$APP: contracts (tipos, interfaces, tokens)" \
  --assignee executor \
  --body "Scope: SOLO libs/$APP/types. Define interfaces y tokens DI. Acceptance: bash tools/gates/run-all.sh $APP sale 0. Lee PROTOCOL.md y parity-matrix.md filas de tipos. Si bloqueado, kanban_block." \
  | grep -oE 't_[a-f0-9]+' | head -1)
echo "  id=$TC"

echo "+ T-da: data-access (depende de T-c)"
TDA=$(hermes kanban create \
  --title "$APP: data-access (servicios, API)" \
  --assignee executor \
  --parent "$TC" \
  --body "Scope: SOLO libs/$APP/data-access. Implementa servicios con inject(HttpClient), endpoints idénticos a inventory.md. Acceptance: run-all.sh $APP sale 0 + filas parity done. Ver cards/example-card.md." \
  | grep -oE 't_[a-f0-9]+' | head -1)
echo "  id=$TDA"

echo "+ T-f: features (depende de T-da)"
TF=$(hermes kanban create \
  --title "$APP: features (componentes, páginas)" \
  --assignee executor \
  --parent "$TDA" \
  --body "Scope: SOLO libs/$APP/feature-*. Componentes standalone, sin NgModule. Acceptance: run-all.sh $APP sale 0 + paridad de rutas. Si falta una decisión de producto, kanban_block." \
  | grep -oE 't_[a-f0-9]+' | head -1)
echo "  id=$TF"

echo "+ T-r: review/QA (depende de T-f)"
hermes kanban create \
  --title "$APP: review — auditoría de paridad" \
  --assignee qa \
  --parent "$TF" \
  --body "Corre bash tools/gates/run-all.sh $APP. Audita parity-matrix.md fila a fila contra ficheros reales y endpoints de inventory.md. Si todo cuadra, kanban_complete. Si hay desviación, kanban_block con el detalle (crea tarjeta nueva para el executor, no re-ejecutes la misma)." \
  >/dev/null
echo "  T-r creada"

echo ""
echo "Board para '$APP' listo. Cadena: contracts -> data-access -> features -> review"
hermes kanban list
echo ""
echo "El dispatcher promoverá T-c a 'ready' ya. Las hijas esperan a su padre."
echo "Sigue el progreso con: hermes kanban tail <id>   (o el dashboard)"
