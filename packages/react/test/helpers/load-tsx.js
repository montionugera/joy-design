import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const requireFromHere = createRequire(import.meta.url);

/** Transpile a source file (.tsx/.ts) to CJS on the fly and load it. Relative ./X.js imports resolve to sibling .tsx/.ts; `@montionugera/joy-icons/react` resolves to the icons package source. */
const moduleCache = new Map();
export function loadFile(file, cache = moduleCache) {
  if (cache.has(file)) return cache.get(file);
  const ts = requireFromHere('typescript');
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  const localRequire = (id) => {
    if (id === '@montionugera/joy-icons/react') return loadFile(fileURLToPath(new URL('../../../icons/src/react.ts', import.meta.url)), cache);
    const m = id.match(/^\.\/([\w/-]+)\.js$/);
    if (!m) return requireFromHere(id);
    const base = path.join(path.dirname(file), m[1]);
    return loadFile(fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`, cache);
  };
  new Function('require', 'module', 'exports', out)(localRequire, mod, mod.exports);
  cache.set(file, mod.exports);
  return mod.exports;
}

export function loadComponent(name, cache = moduleCache) {
  return loadFile(fileURLToPath(new URL(`../../src/${name}.tsx`, import.meta.url)), cache);
}
