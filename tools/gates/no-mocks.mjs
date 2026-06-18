#!/usr/bin/env node
// no-mocks.mjs - falla si encuentra mocks/placeholders/stubs en codigo productivo.
// Uso: node tools/gates/no-mocks.mjs <unit>
//
// Configuracion opcional:
//   HARNESS_TARGET_ROOTS="src/foo:packages/foo" node tools/gates/no-mocks.mjs foo

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const unit = process.argv[2];
if (!unit) {
  console.error("falta <unit>");
  process.exit(2);
}

const ROOTS = configuredRoots(unit).filter(dirExists);
const FORBIDDEN = [
  /\bwindow\.prompt\s*\(/,
  /\bwindow\.alert\s*\(/,
  /\bTODO\s*:?\s*mock/i,
  /\bMOCK_DATA\b/,
  /\bfakeData\b/i,
  /\bplaceholder(?:Data|Response)?\b/i,
  /\breturn\s+\[\s*\]\s*;\s*\/\/\s*stub/i,
  /\bthrow new Error\(['"]not implemented/i,
  /\bhardcoded?\b.*\b(token|secret|password)\b/i,
];

const ALLOW_PATH = /(\.spec\.|\.test\.|__mocks__|\/testing\/|\/fixtures\/|\.stories\.)/;
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".py", ".go", ".rs"]);
const hits = [];

for (const root of ROOTS) walk(root);

if (ROOTS.length === 0) {
  console.error(`  (no-mocks) no hay target en disco para '${unit}' todavia - nada que escanear`);
  process.exit(0);
}

if (hits.length) {
  console.error(`  (no-mocks) ${hits.length} ocurrencia(s) prohibida(s):`);
  for (const h of hits) console.error(`    ${h}`);
  process.exit(1);
}

console.log(`  (no-mocks) limpio en: ${ROOTS.join(", ")}`);
process.exit(0);

function configuredRoots(name) {
  if (process.env.HARNESS_TARGET_ROOTS) {
    return process.env.HARNESS_TARGET_ROOTS.split(":").map((v) => v.trim()).filter(Boolean);
  }
  return [
    `libs/${name}`,
    `apps/${name}`,
    `packages/${name}`,
    `modules/${name}`,
    `services/${name}`,
    `src/${name}`,
    `src/app/${name}`,
  ];
}

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".git", "dist", "build", "coverage"].includes(entry)) continue;
      walk(p);
    } else if (EXT.has(extname(p)) && !ALLOW_PATH.test(p)) {
      const txt = readFileSync(p, "utf8");
      txt.split("\n").forEach((line, i) => {
        for (const rx of FORBIDDEN) {
          if (rx.test(line)) hits.push(`${p}:${i + 1}  ${line.trim().slice(0, 100)}`);
        }
      });
    }
  }
}

function dirExists(d) {
  try { return statSync(d).isDirectory(); } catch { return false; }
}
