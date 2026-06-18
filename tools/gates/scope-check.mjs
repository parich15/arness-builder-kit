#!/usr/bin/env node
// scope-check.mjs - falla si el diff de git toca ficheros fuera del scope permitido.
// Uso: node tools/gates/scope-check.mjs <unit>
//
// Configuracion:
//   HARNESS_SCOPE="src/auth:src/utils"  node tools/gates/scope-check.mjs auth
//   O bien fichero tools/gates/scope/<unit>.txt (un patron por linea)
//   HARNESS_BASE=HEAD~1  (base del diff; por defecto HEAD)

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const unit = process.argv[2];
if (!unit) {
  console.error("  (scope) falta <unit>. Uso: node tools/gates/scope-check.mjs <unit>");
  process.exit(2);
}

// 1. Verificar repo git
try {
  execFileSync("git", ["rev-parse", "--git-dir"], { stdio: "pipe" });
} catch {
  console.error("  (scope) no es un repositorio git");
  process.exit(2);
}

// 2. Rutas tocadas: diff working tree, diff staged y untracked
const base = process.env.HARNESS_BASE || "HEAD";

function gitLines(args) {
  try {
    const out = execFileSync("git", args, { stdio: ["pipe", "pipe", "pipe"] });
    return out.toString().split("\n").map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const diffWorking = gitLines(["diff", "--name-only", base]);
const diffCached  = gitLines(["diff", "--name-only", "--cached", base]);
const untracked   = gitLines(["ls-files", "--others", "--exclude-standard"]);

const touched = new Set(
  [...diffWorking, ...diffCached, ...untracked].map((p) => p.replace(/\\/g, "/"))
);

// 3. Allow-list de scope
let allowPatterns = [];
let source = null;

if (process.env.HARNESS_SCOPE) {
  allowPatterns = process.env.HARNESS_SCOPE.split(/[:,]/).map((s) => s.trim()).filter(Boolean);
  source = "HARNESS_SCOPE";
} else {
  const scopeFile = `tools/gates/scope/${unit}.txt`;
  if (existsSync(scopeFile)) {
    const lines = readFileSync(scopeFile, "utf8").split("\n");
    allowPatterns = lines.map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    source = scopeFile;
  }
}

// Auto-permiso: docs propios de la unidad (el PROTOCOL obliga a actualizar matriz y status)
allowPatterns.push(`docs/**/${unit}/**`);

// 4. Sin scope configurado: advisory
if (!source) {
  console.log(`  (scope) sin HARNESS_SCOPE ni tools/gates/scope/${unit}.txt; no hay reglas de scope`);
  process.exit(0);
}

// 5. Sin cambios
if (touched.size === 0) {
  console.log("  (scope) sin cambios que revisar");
  process.exit(0);
}

// Compilar patrones a RegExp
const regexps = allowPatterns.map(globToRegex);

const violations = [];
for (const ruta of touched) {
  if (!regexps.some((rx) => rx.test(ruta))) {
    violations.push(ruta);
  }
}

if (violations.length) {
  for (const v of violations) console.error(`  (scope) fuera de scope: ${v}`);
  process.exit(1);
}

console.log(`  (scope) ${touched.size} fichero(s) en scope`);
process.exit(0);

// Convierte un glob minimalista a RegExp.
// Soporta: ** (cualquier numero de segmentos), * (sin /), ? (un char sin /)
// Sin wildcards: match exacto o cualquier ruta bajo ese directorio.
function globToRegex(pattern) {
  const p = pattern.replace(/\\/g, "/").replace(/\/$/, "");

  if (!/[*?]/.test(p)) {
    // Sin wildcards: match exacto o subdirectorio
    return new RegExp(`^${escapeRegExp(p)}($|/)`);
  }

  // Con wildcards: convertir caracter a caracter
  let rx = "";
  const len = p.length;
  let i = 0;

  while (i < len) {
    const ch = p[i];

    if (ch === "*" && i + 1 < len && p[i + 1] === "*") {
      const hasPrev = i > 0 && p[i - 1] === "/";
      const hasNext = i + 2 < len && p[i + 2] === "/";

      if (hasPrev && hasNext) {
        // a/**/b -> a/ + (cualquier-segmento/)* + b
        rx = rx.slice(0, -1) + "(?:.*/)?";
        i += 3;
      } else if (hasPrev && !hasNext) {
        // a/** -> a + (/cualquier-cosa)?
        rx = rx.slice(0, -1) + "(?:/.*)?";
        i += 2;
      } else if (!hasPrev && hasNext) {
        // **/b -> (cualquier-cosa/)? + b
        rx += "(?:.+/)?";
        i += 3;
      } else {
        // ** solo -> cualquier cosa
        rx += ".*";
        i += 2;
      }
    } else if (ch === "*") {
      rx += "[^/]*";
      i++;
    } else if (ch === "?") {
      rx += "[^/]";
      i++;
    } else {
      rx += escapeRegExpChar(ch);
      i++;
    }
  }

  return new RegExp(`^${rx}$`);
}

function escapeRegExp(str) {
  return str.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

function escapeRegExpChar(c) {
  return /[.+^${}()|[\]\\]/.test(c) ? `\\${c}` : c;
}
