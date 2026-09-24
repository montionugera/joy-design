import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// F-039 C1b: the hub's `#view-landing-blocks` markup is generated from the Svelte components' SSR output by
// apps/storybook-hub/scripts/gen-landing-blocks.mjs. This test runs the generator in --check mode so a component change
// that is not followed by a regeneration (`node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write`) fails here.
// It reads only source files (build.js, the components), never dist output.

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const generator = path.join(repoRoot, 'apps/storybook-hub/scripts/gen-landing-blocks.mjs');

function check(root) {
  return spawnSync(process.execPath, [generator, '--check', '--root', root], { encoding: 'utf8', timeout: 120000 });
}

test('hub landing blocks match the current landing components', () => {
  const run = check(repoRoot);
  assert.equal(run.status, 0, `drift between components and the hub landing blocks:\n${run.stderr}${run.stdout}`);
});

test('the drift check turns red when a component class changes (scratch copy, real repo untouched)', () => {
  // A scratch root with the same layout the generator expects: components, SSR helper, build.js; node_modules is linked.
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-hub-blocks-'));
  try {
    fs.mkdirSync(path.join(scratch, 'packages/svelte/test'), { recursive: true });
    fs.mkdirSync(path.join(scratch, 'apps/storybook-hub'), { recursive: true });
    fs.cpSync(path.join(repoRoot, 'packages/svelte/src'), path.join(scratch, 'packages/svelte/src'), { recursive: true });
    fs.cpSync(path.join(repoRoot, 'packages/svelte/test/helpers'), path.join(scratch, 'packages/svelte/test/helpers'), { recursive: true });
    fs.symlinkSync(path.join(repoRoot, 'packages/svelte/node_modules'), path.join(scratch, 'packages/svelte/node_modules'));
    fs.copyFileSync(path.join(repoRoot, 'packages/svelte/package.json'), path.join(scratch, 'packages/svelte/package.json'));
    fs.copyFileSync(path.join(repoRoot, 'apps/storybook-hub/build.js'), path.join(scratch, 'apps/storybook-hub/build.js'));

    // Sanity: the untouched copy is clean, so a failure below comes from the mutation and not from the copy.
    const clean = check(scratch);
    assert.equal(clean.status, 0, `scratch copy should start clean:\n${clean.stderr}${clean.stdout}`);

    const grid = path.join(scratch, 'packages/svelte/src/lib/FeatureGrid.svelte');
    const source = fs.readFileSync(grid, 'utf8');
    assert.ok(source.includes('joy-feature-grid--lead'), 'the lead class is still emitted by FeatureGrid');
    fs.writeFileSync(grid, source.replaceAll('joy-feature-grid--lead', 'joy-feature-grid--lead-renamed'));

    const drifted = check(scratch);
    assert.equal(drifted.status, 1, `a renamed component class must be reported as drift:\n${drifted.stderr}${drifted.stdout}`);
    assert.match(drifted.stderr, /landing blocks drift/);
    assert.match(drifted.stderr, /joy-feature-grid--lead/);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});
