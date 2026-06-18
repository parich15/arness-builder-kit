#!/usr/bin/env node
// matrix-check.mjs - valida matrices de verificacion del arnes.
// Uso: node tools/gates/matrix-check.mjs <unit>
//
// Invariante universal: una fila marcada done debe tener target/evidencia existente
// en disco. Evita que "done" sea solo self-report del worker.

import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";

const unit = process.argv[2];
if (!unit) {
  console.error("falta <unit>");
  process.exit(2);
}

const CANDIDATES = process.env.HARNESS_MATRIX
  ? [process.env.HARNESS_MATRIX]
  : [
      `docs/migration/apps/${unit}/parity-matrix.md`,
      `docs/build/components/${unit}/acceptance-matrix.md`,
      `docs/refactor/units/${unit}/change-matrix.md`,
      `docs/audit/scopes/${unit}/evidence-matrix.md`,
      `docs/harness/units/${unit}/verification-matrix.md`,
    ];

const matrixPath = CANDIDATES.find((p) => existsSync(p));
if (!matrixPath) {
  console.error(`  (matrix) no encontre matriz para '${unit}'. Busque:`);
  for (const c of CANDIDATES) console.error(`    - ${c}`);
  console.error("  (define HARNESS_MATRIX=<ruta> para forzar una)");
  process.exit(2);
}

const txt = readFileSync(matrixPath, "utf8");
const lines = txt.split("\n");
const rows = [];
let previousTarget = "";
const problems = [];

for (const line of lines) {
  const m = line.match(/^\s*\|(.+)\|\s*$/);
  if (!m) continue;

  const cells = m[1].split("|").map((c) => c.trim());

  // Saltar encabezados y separadores
  if (isHeaderOrSeparator(cells[0])) continue;

  // Fila de datos: debe tener al menos 6 columnas
  if (cells.length < 6) {
    problems.push(`fila ${cells[0] || "??"}: malformada (se esperaban >=6 columnas)`);
    continue;
  }

  const [id, subject, verification, targetCell, estadoCell] = cells;

  const target = resolveTarget(targetCell, previousTarget);
  if (target) previousTarget = target;

  rows.push({
    id,
    subject,
    verification,
    target,
    rawTarget: targetCell,
    estado: estadoCell.toLowerCase(),
  });
}

// Detectar ids duplicados
const seenIds = new Map();
for (const row of rows) {
  const count = (seenIds.get(row.id) || 0) + 1;
  seenIds.set(row.id, count);
  if (count === 2) {
    problems.push(`id duplicado: ${row.id}`);
  }
}

// Matriz sin filas de datos
if (rows.length === 0) {
  problems.push("matriz sin filas de datos");
}

const validStates = new Set(["pending", "wip", "done", "blocked"]);
const allowEmptyTargets = process.env.HARNESS_ALLOW_EMPTY_TARGETS === "1";

for (const row of rows) {
  if (!validStates.has(row.estado)) {
    problems.push(`fila ${row.id}: estado invalido '${row.estado}' (usa pending/wip/done/blocked)`);
    continue;
  }

  if (row.estado !== "done") continue;

  const targets = splitTargets(row.target);
  if (targets.length === 0) {
    problems.push(`fila ${row.id}: marcada done pero sin target/evidencia declarado`);
    continue;
  }

  for (const target of targets) {
    if (!existsSync(target)) {
      problems.push(`fila ${row.id}: marcada done pero no existe en disco: ${target}`);
      continue;
    }

    if (!allowEmptyTargets) {
      let st;
      try { st = statSync(target); } catch { continue; }
      if (st.isFile() && st.size === 0) {
        problems.push(`fila ${row.id}: target vacio (0 bytes): ${target}`);
      } else if (st.isDirectory()) {
        try {
          if (readdirSync(target).length === 0) {
            problems.push(`fila ${row.id}: target es directorio vacio: ${target}`);
          }
        } catch { /* sin permisos, pasar */ }
      }
    }
  }
}

const done = rows.filter((r) => r.estado === "done").length;
console.log(`  (matrix) ${unit}: ${done}/${rows.length} filas done (${matrixPath})`);

if (problems.length) {
  console.error(`  (matrix) ${problems.length} problema(s):`);
  for (const p of problems) console.error(`    - ${p}`);
  process.exit(1);
}

process.exit(0);

function isHeaderOrSeparator(value) {
  const v = value.trim().toLowerCase();
  return v === "" || v === "id" || /^:?-{3,}:?$/.test(v);
}

function resolveTarget(value, previous) {
  const clean = stripMarkdown(value);
  if (/^(idem|same|igual)$/i.test(clean)) return previous;
  if (/^(-|—|n\/a|na|none)$/i.test(clean)) return "";
  return clean;
}

function stripMarkdown(value) {
  return value
    .replace(/`/g, "")
    .replace(/<br\s*\/?\s*>/gi, ",")
    .replace(/\/?\.\.\.$/, "")
    .trim();
}

function splitTargets(value) {
  if (!value) return [];
  return value
    .split(/\s*,\s*/)
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => !/^(idem|same|igual|-|—|n\/a|na|none)$/i.test(v));
}
