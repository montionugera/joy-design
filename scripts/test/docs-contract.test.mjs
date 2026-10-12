// Holds the hand-written docs (AGENTS.md, PRODUCT.md, README.md) and the CI workflow to the code.
// These rules are about source text, so reading the files is the behaviour under test.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const packageNames = fs
  .readdirSync(path.join(root, 'packages'))
  .filter((d) => fs.existsSync(path.join(root, 'packages', d, 'package.json')))
  .map((d) => JSON.parse(read(`packages/${d}/package.json`)).name);

test('AGENTS.md states the semantic token contract, not primitive variables', () => {
  const agents = read('AGENTS.md');
  const primitives = agents.match(/--(?:joy-color-)?(?:navy|gold|cream|ink|neutral)-\d{2,3}\b/g) || [];
  assert.deepStrictEqual(primitives, [], 'primitive ramp variables must not appear as the contract');
  for (const needle of ['--joy-surface-canvas', '--joy-text-primary', '--joy-accent-default', '--joy-border-default', '44px', 'prefers-reduced-motion', '375px', '1280px', 'DESIGN.md', 'PRODUCT.md', 'scripts/lint-colors.sh', 'scripts/parity-check.mjs', 'impeccable', 'frontend-design']) {
    assert.ok(agents.includes(needle), `AGENTS.md must mention ${needle}`);
  }
});

test('PRODUCT.md has the product sections and cites real package names', () => {
  const product = read('PRODUCT.md');
  for (const h of ['Register', 'Users', 'Product Purpose', 'Brand Personality', 'Anti-references', 'Design Principles', 'Accessibility & Inclusion']) {
    assert.match(product, new RegExp(`^## ${h}$`, 'm'), `PRODUCT.md needs ## ${h}`);
  }
  const cited = [...new Set(product.match(/@[\w-]+\/[\w-]+/g) || [])];
  assert.ok(cited.length > 0, 'PRODUCT.md should name the packages consumers install');
  for (const name of cited) assert.ok(packageNames.includes(name), `PRODUCT.md cites ${name}, which is not a workspace package`);
});

test('README lists every Gate 1 step and the theme contract', () => {
  const readme = read('README.md');
  const precheck = read('scripts/precheck.sh');
  const invoked = [...new Set(precheck.match(/scripts\/[\w-]+\.(?:sh|mjs)/g))];
  assert.ok(invoked.length >= 5, `expected precheck to invoke several scripts, found ${invoked.join(', ')}`);
  for (const s of [...invoked, 'pnpm check', 'pnpm -r test', 'packages/tokens/test/contrast.test.js', 'scripts/test/*.test.mjs', 'scripts/epic-check.sh', 'scripts/integration.sh']) {
    assert.ok(readme.includes(s), `README must document the gate step ${s}`);
  }
  for (const needle of ['data-theme', 'prefers-color-scheme', '@montionugera/joy-tokens/tailwind', 'What production-grade means here', 'DESIGN.md', 'PRODUCT.md', '.claude/refined_backlog']) {
    assert.ok(readme.includes(needle), `README must mention ${needle}`);
  }
});

test('the CI workflow runs the type check and Gate 1', () => {
  const ci = read('.github/workflows/ci.yml');
  assert.match(ci, /^\s+run: pnpm check$/m, 'CI must run pnpm check as a step');
  assert.match(ci, /^\s+run: \.\/scripts\/integration\.sh$/m, 'CI must run scripts/integration.sh');
  assert.match(read('scripts/integration.sh'), /^\.\/scripts\/precheck\.sh$/m, 'integration.sh must run Gate 1');
});

test('the stale F-031 plan.md is gone from the repo root', () => {
  assert.ok(!fs.existsSync(path.join(root, 'plan.md')));
});

test('README documents installing from the registry, and AGENTS.md the build and type-check rule', () => {
  const readme = read('README.md');
  assert.match(readme, /^## Install from the registry$/m, 'README needs the Install from the registry section');
  for (const needle of [
    '@montionugera:registry=https://npm.pkg.github.com',
    '//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}',
    "import '@montionugera/joy-tokens/theme.css';",
    "import { Button, Tabs } from '@montionugera/joy-react';",
    'read:packages',
    'access to the `joymify` organisation',
    'scripts/test/consumer-smoke.sh',
    '.github/workflows/publish.yml',
    'packages-v',
  ]) {
    assert.ok(readme.includes(needle), `README must mention ${needle}`);
  }
  for (const name of packageNames) assert.ok(readme.includes(name), `README must name ${name}`);
  assert.ok(!/@joymify\/(tokens|icons|brand|react|svelte)/.test(readme), 'README must not use the old package scope');
  assert.ok(!readme.includes('@joymify/joy-'), 'README must not use a half-renamed package name');

  const agents = read('AGENTS.md');
  for (const needle of ['tsconfig.build.json', 'pnpm check', '^build', 'turbo.json', 'scripts/test/consumer-smoke.sh', '.github/workflows/publish.yml']) {
    assert.ok(agents.includes(needle), `AGENTS.md must mention ${needle}`);
  }
});

