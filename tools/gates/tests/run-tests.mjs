#!/usr/bin/env node
// run-tests.mjs - suite hermetica para los gates del arnes.
// Sin dependencias externas. Limpia fixtures en try/finally.

import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import os from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const GATES      = resolve(__dirname, "..");

let PASS = 0, FAIL = 0;

function expect(name, ok) {
  if (ok) { console.log(`  PASS  ${name}`); PASS++; }
  else     { console.log(`  FAIL  ${name}`); FAIL++; }
}

function run(gate, args, { cwd = process.cwd(), env = {} } = {}) {
  try {
    const out = execFileSync("node", [gate, ...args], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { status: 0, stdout: out.toString(), stderr: "" };
  } catch (e) {
    return {
      status: e.status ?? 1,
      stdout: e.stdout ? e.stdout.toString() : "",
      stderr: e.stderr ? e.stderr.toString() : "",
    };
  }
}

// Inicializa un repo git con un commit base para que HEAD exista
function gitInit(dir) {
  const g = (...args) => execFileSync("git", args, { cwd: dir, stdio: "pipe" });
  g("init");
  g("config", "user.email", "t@t.t");
  g("config", "user.name", "T");
  g("config", "commit.gpgsign", "false");
  writeFileSync(join(dir, ".gitkeep"), "init");
  g("add", ".gitkeep");
  g("commit", "-m", "init");
}

const ROOT_TMP = mkdtempSync(join(os.tmpdir(), "harness-test-"));

try {

  // ================================================================
  // matrix-check
  // ================================================================
  console.log("\n=== matrix-check ===");
  const MATRIX_GATE = join(GATES, "matrix-check.mjs");

  const matrixTmp = join(ROOT_TMP, "matrix");
  mkdirSync(matrixTmp);

  const realTarget = join(matrixTmp, "target.txt");
  writeFileSync(realTarget, "contenido real");

  let mIdx = 0;
  function matrixFile(content) {
    const p = join(matrixTmp, `m${++mIdx}.md`);
    writeFileSync(p, content);
    return p;
  }

  // a) 2 filas pending -> exit 0
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | ${realTarget} | pending | - |\n` +
      `| 2  | Cosa B | test     | ${realTarget} | pending | - |\n`
    );
    expect("matrix-check (a) pending -> 0",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 0);
  }

  // b) done con target existente y no vacio -> exit 0
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | ${realTarget} | done | - |\n`
    );
    expect("matrix-check (b) done target real -> 0",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 0);
  }

  // c) done con target inexistente -> exit 1
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | /no/existe/aqui/xyz | done | - |\n`
    );
    expect("matrix-check (c) done inexistente -> 1",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 1);
  }

  // d) done con target 0 bytes -> exit 1; con HARNESS_ALLOW_EMPTY_TARGETS=1 -> exit 0
  {
    const emptyTarget = join(matrixTmp, "empty.txt");
    writeFileSync(emptyTarget, "");
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | ${emptyTarget} | done | - |\n`
    );
    expect("matrix-check (d1) done vacio -> 1",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 1);
    expect("matrix-check (d2) done vacio + ALLOW_EMPTY -> 0",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m, HARNESS_ALLOW_EMPTY_TARGETS: "1" } }).status === 0);
  }

  // e) fila de datos con 4 columnas -> exit 1
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Estado |\n` +
      `|----|--------|----------|--------|\n` +
      `| 1  | Cosa A | test     | pending |\n`
    );
    expect("matrix-check (e) fila malformada -> 1",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 1);
  }

  // f) estado invalido -> exit 1
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | ${realTarget} | finished | - |\n`
    );
    expect("matrix-check (f) estado invalido -> 1",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 1);
  }

  // g) ids duplicados -> exit 1
  {
    const m = matrixFile(
      `| id | Cambio | Baseline | Target | Estado | Verificado |\n` +
      `|----|--------|----------|--------|--------|------------|\n` +
      `| 1  | Cosa A | test     | ${realTarget} | pending | - |\n` +
      `| 1  | Cosa B | test     | ${realTarget} | pending | - |\n`
    );
    expect("matrix-check (g) ids duplicados -> 1",
      run(MATRIX_GATE, ["x"], { env: { HARNESS_MATRIX: m } }).status === 1);
  }

  // h) unidad sin matriz -> exit 2
  {
    const emptyDir = join(ROOT_TMP, "empty-cwd");
    mkdirSync(emptyDir);
    expect("matrix-check (h) sin matriz -> 2",
      run(MATRIX_GATE, ["noexiste"], { cwd: emptyDir }).status === 2);
  }

  // ================================================================
  // no-mocks
  // ================================================================
  console.log("\n=== no-mocks ===");
  const NOMOCKS_GATE = join(GATES, "no-mocks.mjs");

  const mocksTmp = join(ROOT_TMP, "mocks");
  mkdirSync(mocksTmp);

  // a) fichero .ts con MOCK_DATA -> exit 1
  {
    const dirA = join(mocksTmp, "dirty");
    mkdirSync(dirA);
    writeFileSync(join(dirA, "service.ts"), "const MOCK_DATA = [];\n");
    expect("no-mocks (a) MOCK_DATA -> 1",
      run(NOMOCKS_GATE, ["auth"], { cwd: mocksTmp, env: { HARNESS_TARGET_ROOTS: dirA } }).status === 1);
  }

  // b) fichero .ts limpio -> exit 0
  {
    const dirB = join(mocksTmp, "clean");
    mkdirSync(dirB);
    writeFileSync(join(dirB, "service.ts"), "export const service = {};\n");
    expect("no-mocks (b) limpio -> 0",
      run(NOMOCKS_GATE, ["auth"], { cwd: mocksTmp, env: { HARNESS_TARGET_ROOTS: dirB } }).status === 0);
  }

  // c) sin dirs target -> exit 0
  {
    const noDir = join(mocksTmp, "nonexistent-dir");
    expect("no-mocks (c) sin dirs -> 0",
      run(NOMOCKS_GATE, ["auth"], { cwd: mocksTmp, env: { HARNESS_TARGET_ROOTS: noDir } }).status === 0);
  }

  // ================================================================
  // scope-check
  // ================================================================
  console.log("\n=== scope-check ===");
  const SCOPE_GATE = join(GATES, "scope-check.mjs");

  // a) sin HARNESS_SCOPE ni fichero -> exit 0 (advisory)
  {
    const d = join(ROOT_TMP, "scope-a");
    mkdirSync(d);
    gitInit(d);
    expect("scope-check (a) sin scope -> 0",
      run(SCOPE_GATE, ["auth"], { cwd: d }).status === 0);
  }

  // b) HARNESS_SCOPE=src/auth, fichero nuevo en src/auth -> exit 0
  {
    const d = join(ROOT_TMP, "scope-b");
    mkdirSync(d);
    gitInit(d);
    mkdirSync(join(d, "src", "auth"), { recursive: true });
    writeFileSync(join(d, "src", "auth", "foo.ts"), "export const x = 1;\n");
    expect("scope-check (b) en scope -> 0",
      run(SCOPE_GATE, ["auth"], { cwd: d, env: { HARNESS_SCOPE: "src/auth" } }).status === 0);
  }

  // c) HARNESS_SCOPE=src/auth, fichero nuevo en src/billing -> exit 1
  {
    const d = join(ROOT_TMP, "scope-c");
    mkdirSync(d);
    gitInit(d);
    mkdirSync(join(d, "src", "billing"), { recursive: true });
    writeFileSync(join(d, "src", "billing", "bar.ts"), "export const y = 1;\n");
    expect("scope-check (c) fuera de scope -> 1",
      run(SCOPE_GATE, ["auth"], { cwd: d, env: { HARNESS_SCOPE: "src/auth" } }).status === 1);
  }

  // d) directorio sin git -> exit 2
  {
    const d = join(ROOT_TMP, "scope-d");
    mkdirSync(d);
    expect("scope-check (d) no git -> 2",
      run(SCOPE_GATE, ["auth"], { cwd: d }).status === 2);
  }

} finally {
  rmSync(ROOT_TMP, { recursive: true, force: true });
}

const total = PASS + FAIL;
console.log(`\nRESULTADO: ${PASS}/${total} tests verdes`);
process.exit(FAIL > 0 ? 1 : 0);
