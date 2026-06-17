#!/usr/bin/env node
// parity-check.mjs — Compara parity-matrix.md vs ficheros reales en disco.
// Uso: node tools/gates/parity-check.mjs <app>
//
// Por qué existe: el self-report de un agente es marketing. Un worker puede decir
// "fila 12 done" sin que el fichero target exista. Este gate falla (exit 1) si una fila
// está marcada `done` pero su "Target esperado (ruta)" no existe en disco.
// Así "done" deja de ser una opinión del worker y pasa a ser un hecho verificable.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const app = process.argv[2];
if (!app) { console.error("falta <app>"); process.exit(2); }

// Agnóstico al tipo de tarea: busca la matriz en las ubicaciones conocidas.
// Migración  -> docs/migration/apps/<app>/parity-matrix.md
// Greenfield  -> docs/build/components/<app>/acceptance-matrix.md
// Override explícito -> env HARNESS_MATRIX (ruta directa al .md)
const CANDIDATES = process.env.HARNESS_MATRIX
  ? [process.env.HARNESS_MATRIX]
  : [
      `docs/migration/apps/${app}/parity-matrix.md`,
      `docs/build/components/${app}/acceptance-matrix.md`,
    ];

const matrixPath = CANDIDATES.find((p) => existsSync(p));
if (!matrixPath) {
  console.error(`  (matrix) no encontré matriz para '${app}'. Busqué:`);
  for (const c of CANDIDATES) console.error(`    - ${c}`);
  console.error(`  (define HARNESS_MATRIX=<ruta> para forzar una)`);
  process.exit(2);
}

const txt = readFileSync(matrixPath, "utf8");
const lines = txt.split("\n");

// Parseamos filas de tabla markdown: | id | cap | ruta legacy | target | estado | verif |
const rows = [];
for (const line of lines) {
  const m = line.match(/^\s*\|(.+)\|\s*$/);
  if (!m) continue;
  const cells = m[1].split("|").map((c) => c.trim());
  if (cells.length < 6) continue;
  const [id, , , target, estado] = cells;
  // saltar cabecera y separadores
  if (id.toLowerCase() === "id" || /^-+$/.test(id) || id === "") continue;
  rows.push({ id, target, estado: estado.toLowerCase() });
}

const validStates = new Set(["pending", "wip", "done", "blocked"]);
let problems = [];

for (const r of rows) {
  if (!validStates.has(r.estado)) {
    problems.push(`fila ${r.id}: estado inválido '${r.estado}' (usa pending/wip/done/blocked)`);
    continue;
  }
  if (r.estado === "done") {
    // El target debe existir en disco. Aceptamos ruta a fichero o a carpeta/glob simple.
    const target = r.target.replace(/`/g, "").replace(/\/?\.\.\.$/, "").trim();
    if (!target) {
      problems.push(`fila ${r.id}: marcada done pero sin target declarado`);
    } else if (!existsSync(target)) {
      problems.push(`fila ${r.id}: marcada DONE pero el target NO existe en disco: ${target}`);
    }
  }
}

const done = rows.filter((r) => r.estado === "done").length;
console.log(`  (matrix) ${app}: ${done}/${rows.length} filas done`);

if (problems.length) {
  console.error(`  (matrix) ${problems.length} problema(s):`);
  for (const p of problems) console.error(`    - ${p}`);
  process.exit(1);
}
process.exit(0);
