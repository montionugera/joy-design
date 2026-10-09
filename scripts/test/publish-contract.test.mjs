// Holds the four published packages to the publish contract (spec I-077): names, versions,
// registry, repository link, licence, sideEffects, the files allowlist and that every path in
// `exports` is covered by it. Reading package.json is the behaviour under test.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const REGISTRY = 'https://npm.pkg.github.com';
const REPO_URL = 'git+https://github.com/montionugera/joy-design.git';

// Dependency order: this is also the order the workflow publishes in.
const PUBLISHED = [
  { dir: 'tokens', name: '@montionugera/joy-tokens', version: '0.2.0', license: 'UNLICENSED', sideEffects: ['**/*.css'], files: ['dist'] },
  { dir: 'icons', name: '@montionugera/joy-icons', version: '0.3.0', license: 'SEE LICENSE IN PROVENANCE.md', sideEffects: false, files: ['dist', 'src/index.ts', 'src/index.d.ts', 'src/*.svelte', 'PROVENANCE.md'] },
  { dir: 'brand', name: '@montionugera/joy-brand', version: '0.2.0', license: 'UNLICENSED', sideEffects: false, files: ['src', 'assets'] },
  { dir: 'react', name: '@montionugera/joy-react', version: '0.2.0', license: 'UNLICENSED', sideEffects: false, files: ['dist'] },
];

/** Every string leaf of an `exports` value. */
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportTargets);
  return [];
}

/** True when a package-relative path (`./dist/index.js`, `./assets/*`) is shipped by the allowlist. */
function covered(target, files) {
  const rel = target.replace(/^\.\//, '');
  return files.some((entry) => {
    if (entry.includes('*')) {
      const pattern = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(rel);
    }
    return rel === entry || rel.startsWith(`${entry}/`);
  });
}

for (const spec of PUBLISHED) {
  test(`${spec.name}: publish metadata matches the contract`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    assert.strictEqual(pkg.name, spec.name);
    assert.strictEqual(pkg.version, spec.version);
    assert.notStrictEqual(pkg.private, true, 'a published package must not be private');
    assert.deepStrictEqual(pkg.publishConfig, { registry: REGISTRY });
    assert.deepStrictEqual(pkg.repository, { type: 'git', url: REPO_URL, directory: `packages/${spec.dir}` });
    assert.strictEqual(pkg.license, spec.license);
    assert.deepStrictEqual(pkg.sideEffects, spec.sideEffects);
    assert.deepStrictEqual(pkg.files, spec.files);
  });

  test(`${spec.name}: every exports, main, module and types path is inside files`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    const targets = [...exportTargets(pkg.exports), pkg.main, pkg.module, pkg.types].filter(Boolean);
    assert.ok(targets.length > 0, 'expected at least one entry point');
    for (const target of targets) {
      assert.ok(covered(target, pkg.files), `${target} is not shipped by files ${JSON.stringify(pkg.files)}`);
    }
  });
}

test('joy-react resolves to built output, not TypeScript source', () => {
  const pkg = readJson('packages/react/package.json');
  assert.strictEqual(pkg.main, './dist/index.js');
  assert.strictEqual(pkg.module, './dist/index.js');
  assert.strictEqual(pkg.types, './dist/index.d.ts');
  assert.deepStrictEqual(pkg.exports, {
    '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
  });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
});

test('joy-icons builds only its React entry; the Svelte entry stays source', () => {
  const pkg = readJson('packages/icons/package.json');
  assert.deepStrictEqual(pkg.exports['./react'], { types: './dist/react.d.ts', default: './dist/react.js' });
  assert.deepStrictEqual(pkg.exports['.'], { types: './src/index.d.ts', svelte: './src/index.ts', default: './src/index.ts' });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
  assert.match(read('packages/icons/src/react.ts'), /^export type \{ IconProps \} from "\.\/react\/Activity\.js";$/m);
});

test('joy-react depends only on published workspace packages', () => {
  const pkg = readJson('packages/react/package.json');
  const publishedNames = PUBLISHED.map((p) => p.name);
  const workspaceDeps = Object.entries(pkg.dependencies).filter(([, range]) => String(range).startsWith('workspace:'));
  assert.deepStrictEqual(
    workspaceDeps.map(([name]) => name).sort(),
    ['@montionugera/joy-brand', '@montionugera/joy-icons', '@montionugera/joy-tokens'],
  );
  for (const [name] of workspaceDeps) assert.ok(publishedNames.includes(name), `${name} is not a published package`);
});

test('joy-svelte is renamed and private', () => {
  const pkg = readJson('packages/svelte/package.json');
  assert.strictEqual(pkg.name, '@montionugera/joy-svelte');
  assert.strictEqual(pkg.private, true);
  assert.strictEqual(pkg.publishConfig, undefined);
});

test('turbo builds dependencies before the type-check', () => {
  const turbo = readJson('turbo.json');
  assert.ok(turbo.tasks.check.dependsOn.includes('^build'), 'check must depend on ^build: joy-react reads joy-icons declarations from dist');
});

test('joy-react declares React 19 peer dependencies', () => {
  const pkg = readJson('packages/react/package.json');
  assert.strictEqual(pkg.peerDependencies.react, '^19.0.0');
  assert.strictEqual(pkg.peerDependencies['react-dom'], '^19.0.0');
});

test('joy-icons declares React 19 peer dependency', () => {
  const pkg = readJson('packages/icons/package.json');
  assert.strictEqual(pkg.peerDependencies.react, '^19.0.0');
});

test('joy-tokens exports theme.css and tailwind entry points', () => {
  const pkg = readJson('packages/tokens/package.json');
  assert.strictEqual(pkg.exports['./theme.css'], './dist/theme.css');
  assert.strictEqual(pkg.exports['./tailwind'], './dist/tailwind-theme.css');
});

