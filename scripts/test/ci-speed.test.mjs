// Holds the I-098 CI speed wiring: parallel Playwright, the Flutter path filter and the reuse-gate hand-off.
// Reading the workflow as text is the behaviour under test (same style as ci-portal-docs.test.mjs).
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const ci = read('.github/workflows/ci.yml');

test('Playwright uses 4 workers on CI and the default locally', () => {
  assert.match(read('apps/storybook-hub/playwright.config.ts'), /workers: process\.env\.CI \? 4 : undefined/);
});

test('the flutter filter covers the tokens, the Flutter packages and the gate itself', () => {
  const block = ci.slice(ci.indexOf('\n            flutter:'), ci.indexOf('\n  # ──', ci.indexOf('\n            flutter:')));
  for (const p of ['packages/flutter/**', 'apps/flutter-hub/**', 'packages/tokens/**', 'scripts/precheck.sh', '.github/workflows/**']) {
    assert.ok(block.includes(`'${p}'`), `flutter filter must include ${p}`);
  }
  assert.match(ci, /flutter: \$\{\{ steps\.filter\.outputs\.flutter \}\}/);
});

test('only pull requests with no Flutter change skip Flutter; push and dispatch always run it', () => {
  assert.match(ci, /SKIP_FLUTTER: \$\{\{ github\.event_name == 'pull_request' && needs\.changes\.outputs\.flutter != 'true' && '1' \|\| '' \}\}/);
  assert.match(ci, /if: needs\.changes\.outputs\.flutter == 'true' \|\| github\.event_name != 'pull_request'\n\s+uses: subosito\/flutter-action@v2/);
  const pre = read('scripts/precheck.sh');
  assert.match(pre, /if \[ "\$\{SKIP_FLUTTER:-\}" = "1" \]/);
  assert.match(read('apps/storybook-hub/tests/flutter-smoke.spec.ts'), /test\.skip\(process\.env\.SKIP_FLUTTER === "1"/);
});

test('reuse-gate runs only on push to main, can only skip build, and the image still needs a green or vouched gate', () => {
  const job = ci.slice(ci.indexOf('\n  reuse-gate:'), ci.indexOf('\n  # ──', ci.indexOf('\n  reuse-gate:')));
  assert.match(job, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
  assert.match(job, /checks: read/);
  assert.match(job, /run: bash scripts\/gate-reuse\.sh >> "\$GITHUB_OUTPUT"/);
  const img = ci.slice(ci.indexOf('\n  build-push-image:'), ci.indexOf('\n  # ──', ci.indexOf('\n  build-push-image:')));
  assert.match(img, /needs\.build\.result == 'success' \|\| needs\.reuse-gate\.outputs\.reuse == 'true'/);
});
