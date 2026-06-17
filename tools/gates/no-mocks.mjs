#!/usr/bin/env node
// no-mocks.mjs — Falla (exit 1) si encuentra mocks/placeholders/stubs en código productivo.
// Uso: node tools/gates/no-mocks.mjs <app>
//
// Por qué existe: en el intento anterior "sin mocks" era prosa en un prompt, así que el
// agente bajo presión de terminar metió mocks. Ahora es un gate: si aparece, exit 1.
//
// Node puro, sin dependencias. Recorre el árbol del target de la app.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const app = process.argv[2];
if (!app) { console.error("falta <app>"); process.exit(2); }

// Dónde vive el código productivo de esta app. Adapta a tu layout NX.
const ROOTS = [`libs/${app}`, `apps/${app}`, `src/app/${app}`].filter(dirExists);

// Señales de mock/placeholder prohibidas en producción.
const FORBIDDEN = [
  /\bwindow\.prompt\s*\(/,
  /\bwindow\.alert\s*\(/,
  /\bTODO\s*:?\s*mock/i,
  /\bMOCK_DATA\b/,
  /\bfakeData\b/i,
  /\bplaceholder(?:Data|Response)\b/i,
  /\breturn\s+\[\s*\]\s*;\s*\/\/\s*stub/i,
  /\bthrow new Error\(['"]not implemented/i,
  /\bhardcoded?\b.*\b(token|secret|password)\b/i,
];

// Ficheros que SÍ pueden tener "mock" en el nombre/contenido (tests, specs, fixtures).
const ALLOW_PATH = /(\.spec\.|\.test\.|__mocks__|\/testing\/|\.stories\.)/;

const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".html"]);
let hits = [];

for (const root of ROOTS) walk(root);

if (ROOTS.length === 0) {
  console.error(`  (no-mocks) no hay target en disco para '${app}' todavía — nada que escanear`);
  // No es un fallo: en Fase 0 el target aún no existe.
  process.exit(0);
}

if (hits.length) {
  console.error(`  (no-mocks) ${hits.length} ocurrencia(s) prohibida(s):`);
  for (const h of hits) console.error(`    ${h}`);
  process.exit(1);
}
console.log(`  (no-mocks) limpio en: ${ROOTS.join(", ")}`);
process.exit(0);

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (e === "node_modules" || e === ".git" || e === "dist") continue;
      walk(p);
    } else if (EXT.has(extname(p)) && !ALLOW_PATH.test(p)) {
      const txt = readFileSync(p, "utf8");
      const lines = txt.split("\n");
      lines.forEach((line, i) => {
        for (const rx of FORBIDDEN) {
          if (rx.test(line)) hits.push(`${p}:${i + 1}  ${line.trim().slice(0, 80)}`);
        }
      });
    }
  }
}
function dirExists(d) { try { return statSync(d).isDirectory(); } catch { return false; } }
