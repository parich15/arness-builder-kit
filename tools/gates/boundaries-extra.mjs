#!/usr/bin/env node
// boundaries-extra.mjs - reglas portables de boundaries por imports.
// Uso: node tools/gates/boundaries-extra.mjs <unit>
//
// Por defecto no impone dominios concretos. Configura en el repo destino si aplica:
//   HARNESS_DOMAIN_NAMES="auth,billing,catalog" bash tools/gates/run-all.sh auth
//   HARNESS_SHARED_ROOTS="libs/shared:packages/shared"
//   HARNESS_UNIT_ROOTS="libs/auth:apps/auth"

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const unit = process.argv[2];
if (!unit) {
  console.error("falta <unit>");
  process.exit(2);
}

const domainNames = splitEnv("HARNESS_DOMAIN_NAMES");
const sharedRoots = splitEnv("HARNESS_SHARED_ROOTS", ["libs/shared", "packages/shared", "src/shared", "shared"]);
const unitRoots = splitEnv("HARNESS_UNIT_ROOTS", [
  `libs/${unit}`,
  `apps/${unit}`,
  `packages/${unit}`,
  `modules/${unit}`,
  `services/${unit}`,
  `src/${unit}`,
  `src/app/${unit}`,
]);

const ROOTS = ["libs", "apps", "packages", "modules", "services", "src"].filter(dirExists);
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const ALLOW_PATH = /(\.spec\.|\.test\.|__mocks__|\/testing\/|\/fixtures\/)/;
const violations = [];

if (domainNames.length === 0) {
  console.log("  (boundaries) sin HARNESS_DOMAIN_NAMES; no hay reglas de dominios configuradas");
  process.exit(0);
}

for (const root of ROOTS) walk(root);

if (violations.length) {
  console.error(`  (boundaries) ${violations.length} violacion(es):`);
  for (const v of violations) console.error(`    - ${v}`);
  process.exit(1);
}

console.log("  (boundaries) imports OK");
process.exit(0);

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
      checkFile(p);
    }
  }
}

function checkFile(filePath) {
  const normalizedPath = normalize(filePath);
  const imports = extractImports(readFileSync(filePath, "utf8"));

  for (const specifier of imports) {
    if (pathInRoots(normalizedPath, sharedRoots)) {
      const importedDomain = domainNames.find((domain) => importsDomain(specifier, domain));
      if (importedDomain) {
        violations.push(`${filePath}: shared no puede importar dominio '${importedDomain}' (${specifier})`);
      }
    }

    if (pathInRoots(normalizedPath, unitRoots)) {
      const sibling = domainNames.find((domain) => domain !== unit && importsDomain(specifier, domain));
      if (sibling) {
        violations.push(`${filePath}: unit '${unit}' no puede importar sibling '${sibling}' directamente (${specifier})`);
      }
    }
  }
}

function extractImports(text) {
  const imports = [];
  const rx = /(?:from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match;
  while ((match = rx.exec(text)) !== null) {
    imports.push(match[1] || match[2] || match[3]);
  }
  return imports;
}

function importsDomain(specifier, domain) {
  const escaped = escapeRegExp(domain);
  return new RegExp(`(^|[/@._-])${escaped}($|[/._-])`).test(specifier);
}

function pathInRoots(filePath, roots) {
  return roots.some((root) => filePath === root || filePath.startsWith(`${root}/`));
}

function splitEnv(name, fallback = []) {
  const raw = process.env[name];
  const values = raw ? raw.split(":") : fallback;
  return values.map((v) => normalize(v.trim())).filter(Boolean);
}

function normalize(value) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "");
}

function dirExists(d) {
  try { return statSync(d).isDirectory(); } catch { return false; }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
