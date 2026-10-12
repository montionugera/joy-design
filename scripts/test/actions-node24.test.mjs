// Holds every `uses:` in .github/workflows to a major that runs on Node 24 (spec I-084). The minimums below were
// verified on 2026-10-11 by reading `using:` in each action's action.yml at that major (see the F-078 spec).
// subosito/flutter-action is composite (no Node runtime of its own) and its v2 tag calls actions/cache@v5.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dir = path.join(root, '.github/workflows');
const MIN_MAJOR = {
  'actions/checkout': 5,
  'actions/setup-node': 5,
  'pnpm/action-setup': 5,
  'dorny/paths-filter': 4,
  'docker/setup-buildx-action': 4,
  'docker/login-action': 4,
  'docker/build-push-action': 7, // v6 is still node20
  'azure/setup-kubectl': 5,
  'subosito/flutter-action': 2,
};

const uses = [];
for (const f of fs.readdirSync(dir).filter((n) => /\.ya?ml$/.test(n))) {
  fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((line, i) => {
    const m = line.match(/^\s*(?:-\s+)?uses:\s*([^@\s]+)@v(\d+)/);
    if (m) uses.push({ file: f, line: i + 1, action: m[1], major: Number(m[2]) });
  });
}

test('workflows pin at least one action', () => assert.ok(uses.length > 0));

for (const u of uses) {
  test(`${u.file}:${u.line} ${u.action}@v${u.major} runs on Node 24`, () => {
    assert.ok(u.action in MIN_MAJOR, `${u.action} has no verified Node 24 major in this test; verify it and add it`);
    assert.ok(u.major >= MIN_MAJOR[u.action], `${u.action}@v${u.major} is below v${MIN_MAJOR[u.action]}, the first Node 24 major`);
  });
}

test('publish.yml keeps setup-node on a major that still exports the dummy NODE_AUTH_TOKEN (below v7)', () => {
  const publish = fs.readFileSync(path.join(dir, 'publish.yml'), 'utf8');
  const m = publish.match(/actions\/setup-node@v(\d+)/);
  assert.ok(m && Number(m[1]) < 7, 'setup-node v7 removed the dummy token that the registry-url install step needs');
});
