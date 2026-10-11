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

function jobBlock() {
  const start = ci.indexOf('\n  build-push-image:');
  assert.ok(start >= 0, 'build-push-image job not found');
  const next = ci.indexOf('\n  # ──', start + 1);
  return ci.slice(start, next < 0 ? undefined : next);
}

test('fetch step sits between Checkout and Set image tag inside build-push-image', () => {
  const job = jobBlock();
  const a = job.indexOf('- name: Checkout');
  const b = job.indexOf('- name: Fetch cli-state-handler docs');
  const c = job.indexOf('- name: Set image tag');
  assert.ok(a >= 0 && b > a && c > b, `order was ${a}, ${b}, ${c}`);
});

test('cli_docs_tag reaches the shell only as the CLI_DOCS_TAG env value', () => {
  const hits = ci.split('\n').filter((l) => l.includes('inputs.cli_docs_tag'));
  assert.strictEqual(hits.length, 1);
  assert.match(hits[0], /^\s*CLI_DOCS_TAG:/);
});

test('build-push-image never runs on pull requests', () => {
  const job = jobBlock();
  const cond = job.slice(job.indexOf('if: |'), job.indexOf('permissions:'));
  assert.ok(cond.includes("github.event_name == 'push'") && cond.includes("github.event_name == 'workflow_dispatch'"));
  assert.ok(!cond.includes('pull_request'));
});

test('fetch step uses the built-in github.token as GH_TOKEN and no personal secret remains', () => {
  assert.ok(!ci.includes('CLI_DOCS_READ_TOKEN'), 'the personal secret must no longer be referenced');
  const hits = ci.split('\n').filter((l) => l.includes('github.token'));
  assert.strictEqual(hits.length, 2, 'fetch step and the Gate 1 step only');
  for (const h of hits) assert.match(h, /^\s*GH_TOKEN: \$\{\{ github\.token \}\}/);
  const job = jobBlock();
  const step = job.slice(job.indexOf('- name: Fetch cli-state-handler docs'), job.indexOf('- name: Set up Flutter'));
  assert.ok(step.includes('GH_TOKEN: ${{ github.token }}'));
});

test('Gate 1 gets a token and precheck.sh fetches the docs before the hub build', () => {
  const gate = ci.slice(ci.indexOf('- name: Gate 1'), ci.indexOf('# ── Job 2'));
  assert.match(gate, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  const pre = fs.readFileSync(path.join(root, 'scripts/precheck.sh'), 'utf8');
  const f = pre.indexOf('scripts/fetch-cli-docs.sh');
  assert.ok(f > 0 && f < pre.indexOf('node apps/storybook-hub/build.js'));
});

test('image build fails when the cli-state-handler bundle is missing', () => {
  const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');
  assert.match(dockerfile, /RUN test -s apps\/storybook-hub\/dist\/cli-state-handler\/version\.json/);
});

test('the fetched bundle folder is gitignored', () => {
  const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n');
  assert.ok(ignore.includes('apps/storybook-hub/portal-bundles/cli-state-handler/'));
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
