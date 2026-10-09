// Holds ci.yml to the cli-state-handler docs fetch contract (spec I-079): the optional input, where the
// fetch step sits, that the token lives in exactly one step, the image tag form and the smoke hand-off.
// Reading the workflow as text is the behaviour under test (same style as publish-contract.test.mjs).
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');

test('declares the optional cli_docs_tag input', () => {
  assert.match(ci, /cli_docs_tag:[\s\S]*?required: false[\s\S]*?default: ''/);
});

test('fetch step sits between Checkout and Set image tag', () => {
  const a = ci.indexOf('- name: Checkout');
  const b = ci.indexOf('- name: Fetch cli-state-handler docs');
  const c = ci.indexOf('- name: Set image tag');
  assert.ok(a >= 0 && b > a && c > b, `order was ${a}, ${b}, ${c}`);
});

test('token is passed only as GH_TOKEN of the fetch step', () => {
  const hits = ci.split('\n').filter((l) => l.includes('secrets.CLI_DOCS_READ_TOKEN'));
  assert.strictEqual(hits.length, 1);
  assert.match(hits[0], /^\s*GH_TOKEN:/);
});

test('image tag carries the docs version', () => {
  assert.ok(ci.includes('-cli${CLI_DOCS_VERSION}'));
});

test('build context stays the workspace', () => {
  assert.match(ci, /context: \.\n/);
});

test('job exports cli_docs_version', () => {
  assert.match(ci, /cli_docs_version: \$\{\{ steps\.cli_docs\.outputs\.cli_docs_version \}\}/);
});

test('only the dev.joymify.com smoke call gets EXPECTED_CLI_DOCS_VERSION', () => {
  const hits = ci.split('\n').filter((l) => l.includes('EXPECTED_CLI_DOCS_VERSION'));
  assert.strictEqual(hits.length, 1);
  assert.match(hits[0], /smoke-prod\.sh dev\.joymify\.com/);
});

test('no build-arg or secret mount carries the token', () => {
  const start = ci.indexOf('- name: Build and push');
  const block = ci.slice(start, ci.indexOf('\n  # ──', start));
  assert.ok(start > 0);
  assert.ok(!/build-args:|secrets:/.test(block));
});
