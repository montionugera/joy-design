import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const yml = fs.readFileSync(new URL('../../../.github/workflows/publish.yml', import.meta.url), 'utf8');
const smoke = fs.readFileSync(new URL('../../../scripts/test/consumer-smoke.sh', import.meta.url), 'utf8');
const loops = yml.split('\n').filter((l) => /for dir in tokens icons brand react svelte/.test(l));

test('mascots is in every package loop, GitHub Packages and npmjs.org', () => {
  assert.strictEqual(loops.length, 7, 'seven package loops in publish.yml');
  assert.strictEqual(loops.filter((l) => l.includes('mascots')).length, 7);
});

test('the manifest and the trap name mascots, with both tarballs', () => {
  assert.ok(yml.includes("'mascots'"), 'manifest loop lists mascots');
  assert.ok(yml.includes("packages/mascots/package.json"), 'the trap restores the mascots package.json too');
});

test('the build job builds joy-mascots before the smoke test', () => {
  assert.ok(yml.includes('pnpm --filter @montionugera/joy-mascots build'));
});

test('consumer smoke packs, checks and renders joy-mascots', () => {
  assert.ok(smoke.includes('packages=(tokens icons brand react svelte mascots)'));
  assert.ok(smoke.includes('mascots) echo'), 'allowed paths and required files are defined');
  assert.ok(smoke.includes('MASCOTS_TGZ'));
  assert.ok(smoke.includes('@montionugera/joy-mascots/react'));
  assert.ok(smoke.includes('rex-cheer'));
});
