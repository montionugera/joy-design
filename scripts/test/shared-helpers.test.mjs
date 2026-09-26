// README promises that the framework-neutral helpers are byte-identical in both packages.
// This test is that promise: every .ts helper present in both source trees must match,
// and the set must be the one README lists.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const svelteDir = path.join(root, 'packages/svelte/src/lib');
const reactDir = path.join(root, 'packages/react/src');
const PACKAGE_ENTRY = 'index.ts'; // each package's own export list, different by design

const shared = fs
  .readdirSync(reactDir)
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && f !== PACKAGE_ENTRY && fs.existsSync(path.join(svelteDir, f)))
  .sort();

test('helpers present in both packages are byte-identical', () => {
  assert.ok(shared.length > 0);
  for (const f of shared) {
    assert.ok(fs.readFileSync(path.join(svelteDir, f)).equals(fs.readFileSync(path.join(reactDir, f))), `${f} differs between packages/svelte/src/lib and packages/react/src`);
  }
});

test('README lists exactly the shared helpers', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const section = readme.slice(readme.indexOf('### Shared helpers'));
  const listLine = section.split('\n').find((l) => /^`[\w-]+\.ts`/.test(l));
  assert.ok(listLine, 'README Shared helpers section must list the files');
  const listed = [...listLine.matchAll(/`([\w-]+\.ts)`/g)].map((m) => m[1]).sort();
  assert.deepStrictEqual(listed, shared);
});
