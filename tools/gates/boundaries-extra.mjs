#!/usr/bin/env node
// boundaries-extra.mjs — Reglas de import que enforce-module-boundaries de NX no cubre.
// Uso: node tools/gates/boundaries-extra.mjs <app>
//
// Por qué existe: "shared no importa dominios" y "los remotes no se importan entre sí"
// eran prosa en el intento anterior. Aquí es un gate por análisis estático de imports.
// Node puro, sin dependencias (regex sobre los import/require). exit 1 si hay violación.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const app = process.argv[2];
if (!app) { console.error("falta <app>"); process.exit(2); }

// Reglas: { cuando el fichero esté bajo `where`, prohíbe imports que casen `forbid` }
// Adapta a tu grafo de dependencias permitido.
const RULES = [
  {
    name: "shared-no-importa-dominios",
    where: /(^|\/)(libs|src)\/shared\//,
    forbid: /from ['"].*\/(venues|billing|auth|catalog|maps)\//,
    msg: "shared/ no puede importar de dominios concretos",
  },
  {
    name: "remotes-no-se-importan-entre-si",
    where: new RegExp(`(^|/)(libs|apps)/${app}/`),
    // un remote no importa OTRO remote (lista los dominios hermanos)
    forbid: new RegExp(`from ['"].*/(?!${app}/)(venues|billing|auth|catalog|maps)/`),
    msg: `el remote '${app}' no puede importar otro remote directamente (usa contratos en shared)`,
  },
];

const EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const ALLOW_PATH = /(\.spec\.|\.test\.|__mocks__|\/testing\/)/;
const ROOTS = ["libs", "apps", "src"].filter(dirExists);
let violations = [];

for (const root of ROOTS) walk(root);

if (violations.length) {
  console.error(`  (boundaries) ${violations.length} violación(es):`);
  for (const v of violations) console.error(`    - ${v}`);
  process.exit(1);
}
console.log(`  (boundaries) imports OK`);
process.exit(0);

function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (["node_modules", ".git", "dist"].includes(e)) continue;
      walk(p);
    } else if (EXT.has(extname(p)) && !ALLOW_PATH.test(p)) {
      const txt = readFileSync(p, "utf8");
      for (const rule of RULES) {
        if (!rule.where.test(p)) continue;
        txt.split("\n").forEach((line, i) => {
          if (rule.forbid.test(line)) {
            violations.push(`${rule.name} @ ${p}:${i + 1} — ${rule.msg}`);
          }
        });
      }
    }
  }
}
function dirExists(d) { try { return statSync(d).isDirectory(); } catch { return false; } }
