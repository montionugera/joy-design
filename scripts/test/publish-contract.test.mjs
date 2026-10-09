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
    assert.notStrictEqual(pkg.private, true, `${spec.name}: a published package must not be private`);
    const expected = {
      name: spec.name,
      version: spec.version,
      publishConfig: { registry: REGISTRY },
      repository: { type: 'git', url: REPO_URL, directory: `packages/${spec.dir}` },
      license: spec.license,
      sideEffects: spec.sideEffects,
      files: spec.files,
    };
    for (const [field, value] of Object.entries(expected)) {
      assert.deepStrictEqual(pkg[field], value, `${spec.name}: ${field} does not match the contract`);
    }
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

for (const [dir, peers] of [['react', ['react', 'react-dom']], ['icons', ['react']]]) {
  test(`joy-${dir} declares React 19 peer dependencies`, () => {
    const pkg = readJson(`packages/${dir}/package.json`);
    for (const peer of peers) assert.strictEqual(pkg.peerDependencies[peer], '^19.0.0', `joy-${dir}: peerDependencies.${peer}`);
  });
}

test('joy-tokens exports theme.css and tailwind entry points', () => {
  const pkg = readJson('packages/tokens/package.json');
  assert.strictEqual(pkg.exports['./theme.css'], './dist/theme.css');
  assert.strictEqual(pkg.exports['./tailwind'], './dist/tailwind-theme.css');
});

test('the publish workflow gates, builds, tests, then publishes in dependency order', () => {
  const wf = read('.github/workflows/publish.yml');
  assert.match(wf, /^\s+- 'packages-v\*'$/m, 'trigger must be a packages-v* tag');
  assert.match(wf, /^\s+dry_run:$/m, 'manual runs need a dry_run input');
  assert.match(wf, /dry_run:[\s\S]*?default:\s*true/, 'dry_run input must default to true');
  assert.match(wf, /^\s+packages: write$/m, 'the job token needs packages: write');
  assert.ok(wf.includes('git merge-base --is-ancestor "$GITHUB_SHA" origin/main'), 'must refuse a commit that is not on main');
  for (const needle of ["flutter-version: '3.32.8'", 'playwright install --with-deps chromium', 'apt-get install -y -qq ripgrep', 'pnpm install --frozen-lockfile']) {
    assert.ok(wf.includes(needle), `runner setup must include: ${needle}`);
  }

  // Structural step block checks
  const [, ...stepBlocks] = wf.split('\n      - name:');
  const steps = stepBlocks.map((b) => {
    const newline = b.indexOf('\n');
    const name = (newline === -1 ? b : b.slice(0, newline)).trim();
    return { name, block: b };
  });

  const gateStep = steps.find((s) => s.block.includes('scripts/integration.sh'));
  assert.ok(gateStep, 'gate step must exist');
  assert.ok(!gateStep.block.includes('if:'), 'gate step must have no if:');
  assert.ok(!gateStep.block.includes('continue-on-error'), 'gate step must have no continue-on-error');

  const tarballStep = steps.find((s) => s.block.includes('scripts/test/consumer-smoke.sh'));
  assert.ok(tarballStep, 'tarball step must exist');
  assert.ok(!tarballStep.block.includes('if:'), 'tarball step must have no if:');
  assert.ok(!tarballStep.block.includes('continue-on-error'), 'tarball step must have no continue-on-error');

  const dryRunStep = steps.find((s) => s.block.includes('pnpm publish --dry-run'));
  assert.ok(dryRunStep, 'Dry run step must exist');
  assert.ok(dryRunStep.block.includes("if: env.DRY_RUN == 'true'"), "Dry run step must have if: env.DRY_RUN == 'true'");

  const publishStep = steps.find((s) => s.block.includes('pnpm publish --no-git-checks'));
  assert.ok(publishStep, 'Publish step must exist');
  assert.ok(publishStep.block.includes("if: env.DRY_RUN == 'false'"), "Publish step must have if: env.DRY_RUN == 'false'");

  const verifyStep = steps.find((s) => s.name.startsWith('Verify'));
  assert.ok(verifyStep, 'Verify step must exist');

  const tagStep = steps.find((s) => s.name === 'Check the tag matches the package versions');
  assert.ok(tagStep, 'tag check step must exist');
  assert.ok(tagStep.block.includes("if: github.ref_type == 'tag'"), "tag check step must have if: github.ref_type == 'tag'");

  const topLevel = wf.split(/\njobs:\s*\n/)[0];
  assert.ok(!topLevel.includes('NODE_AUTH_TOKEN'), 'no top-level NODE_AUTH_TOKEN');
  assert.ok(dryRunStep.block.includes('NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}'), 'Dry run must have step-level NODE_AUTH_TOKEN');
  assert.ok(publishStep.block.includes('NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}'), 'Publish must have step-level NODE_AUTH_TOKEN');
  assert.ok(verifyStep.block.includes('NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}'), 'Verify must have step-level NODE_AUTH_TOKEN');
  const tokenMatches = wf.match(/NODE_AUTH_TOKEN:\s*\${{\s*secrets\.GITHUB_TOKEN\s*}}/g) || [];
  assert.strictEqual(tokenMatches.length, 3, 'NODE_AUTH_TOKEN must appear only in step-level env of the three steps');

  const order = [
    'run: ./scripts/integration.sh',
    'pnpm --filter @montionugera/joy-icons build',
    'pnpm --filter @montionugera/joy-react build',
    'run: ./scripts/test/consumer-smoke.sh',
    'git status --porcelain',
    'pnpm publish --dry-run --no-git-checks',
    'pnpm publish --no-git-checks)',
  ];
  const positions = order.map((needle) => wf.indexOf(needle));
  for (const [i, pos] of positions.entries()) assert.ok(pos >= 0, `workflow must contain: ${order[i]}`);
  assert.deepStrictEqual(positions, [...positions].sort((a, b) => a - b), 'steps must run in gate, build, tarball-test, clean-tree, publish order');
  assert.ok(!/\bnpm publish\b/.test(wf.replace(/pnpm publish/g, '')), 'npm publish does not replace workspace:* and must not be used');
  assert.ok(wf.includes('npm view "$name@$version" version'), 'must ask the registry before publishing each package');
  const loops = wf.match(/for dir in ([a-z ]+); do/g) || [];
  assert.ok(loops.length >= 3, 'dry run, publish and verify each loop over the packages');
  for (const loop of loops) assert.strictEqual(loop, 'for dir in tokens icons brand react; do', 'packages must be handled in dependency order');
  assert.ok(!wf.includes('packages/brand && node build.js') && !wf.includes('joy-brand build'), 'the workflow must not run the brand build itself');
});


