// Holds ci.yml to the portal docs fetch contract (specs I-079 cli-state-handler, I-082 server-decorator): the optional input, where the
// fetch step sits, that the token lives in exactly one step, the image tag form and the smoke hand-off.
// Reading the workflow as text is the behaviour under test (same style as publish-contract.test.mjs).
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');

test('declares the optional cli_docs_tag and decorator_docs_tag inputs', () => {
  assert.match(ci, /cli_docs_tag:[\s\S]*?required: false[\s\S]*?default: ''/);
  assert.match(ci, /decorator_docs_tag:[\s\S]*?required: false[\s\S]*?default: ''/);
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
  const b = job.indexOf('- name: Fetch portal docs');
  const c = job.indexOf('- name: Set image tag');
  assert.ok(a >= 0 && b > a && c > b, `order was ${a}, ${b}, ${c}`);
});

test('cli_docs_tag reaches the shell only as the CLI_DOCS_TAG env value', () => {
  const hits = ci.split('\n').filter((l) => l.includes('inputs.cli_docs_tag'));
  assert.strictEqual(hits.length, 2, 'fetch step and Gate 1 step');
  for (const h of hits) assert.match(h, /^\s*CLI_DOCS_TAG:/);
});

test('decorator_docs_tag reaches the shell only as the DECORATOR_DOCS_TAG env value', () => {
  const hits = ci.split('\n').filter((l) => l.includes('inputs.decorator_docs_tag'));
  assert.strictEqual(hits.length, 2, 'fetch step and Gate 1 step');
  for (const h of hits) assert.match(h, /^\s*DECORATOR_DOCS_TAG:/);
});

test('one fetch step downloads both bundles through the one generalised script', () => {
  const job = jobBlock();
  const step = job.slice(job.indexOf('- name: Fetch portal docs'), job.indexOf('- name: Set up Flutter'));
  assert.match(step, /fetch-portal-docs\.sh montionugera\/cli-state-handler cli-state-handler "\$CLI_DOCS_TAG"/);
  assert.match(step, /fetch-portal-docs\.sh montionugera\/node-server-decorator server-decorator "\$DECORATOR_DOCS_TAG"/);
  assert.ok(!fs.existsSync(path.join(root, 'scripts/fetch-cli-docs.sh')), 'no second copy of the fetch script');
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
  assert.strictEqual(hits.length, 2, 'fetch step and the Gate 1 step only in ci.yml');
  for (const h of hits) assert.match(h, /^\s*GH_TOKEN: \$\{\{ github\.token \}\}/);
  const job = jobBlock();
  const step = job.slice(job.indexOf('- name: Fetch portal docs'), job.indexOf('- name: Set up Flutter'));
  assert.ok(step.includes('GH_TOKEN: ${{ github.token }}'));
});

test('Gate 1 gets a token and precheck.sh fetches the docs before the hub build', () => {
  const gate = ci.slice(ci.indexOf('- name: Gate 1'), ci.indexOf('# ── Job 2'));
  assert.match(gate, /GH_TOKEN: \$\{\{ github\.token \}\}/);
  const pre = fs.readFileSync(path.join(root, 'scripts/precheck.sh'), 'utf8');
  const f = pre.indexOf('scripts/fetch-portal-docs.sh');
  assert.ok(f > 0 && f < pre.indexOf('node apps/storybook-hub/build.js'));
});

for (const name of ['cli-state-handler', 'server-decorator']) {
  test(`image build fails when the ${name} bundle is missing`, () => {
    const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'), 'utf8');
    assert.match(dockerfile, new RegExp(`RUN test -s apps/storybook-hub/dist/${name}/version\\.json`));
  });

  test(`the fetched ${name} bundle folder is gitignored and not tracked`, () => {
    const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8').split('\n');
    assert.ok(ignore.includes(`apps/storybook-hub/portal-bundles/${name}/`));
    const tracked = execFileSync('git', ['ls-files', `apps/storybook-hub/portal-bundles/${name}`], { cwd: root, encoding: 'utf8' });
    assert.strictEqual(tracked.trim(), '');
  });
}

test('image tag carries both docs versions and is checked against the Docker tag rules', () => {
  assert.ok(ci.includes('-cli${CLI_DOCS_VERSION}-dec${DECORATOR_DOCS_VERSION}'));
  assert.ok(ci.includes('DECORATOR_DOCS_VERSION: ${{ steps.docs.outputs.server_decorator_docs_version }}'));
  assert.match(ci, /\$\{#IMAGE_TAG\} -le 128/);
  assert.match(ci, /\[A-Za-z0-9_\]\[A-Za-z0-9_\.-\]\*\$/);
});

test('the image tag step has no expression interpolated inside its run script', () => {
  const job = jobBlock();
  const start = job.indexOf('- name: Set image tag');
  const run = job.slice(job.indexOf('run: |', start), job.indexOf('- name: Set up Docker Buildx'));
  assert.ok(!run.includes('${{'), 'pass values through env: only');
});

test('build context stays the workspace', () => {
  assert.match(ci, /context: \.\n/);
});

test('job exports both docs versions', () => {
  assert.match(ci, /cli_docs_version: \$\{\{ steps\.docs\.outputs\.cli_state_handler_docs_version \}\}/);
  assert.match(ci, /decorator_docs_version: \$\{\{ steps\.docs\.outputs\.server_decorator_docs_version \}\}/);
});

test('only the dev.joymify.com smoke call gets the expected docs versions', () => {
  for (const v of ['EXPECTED_CLI_DOCS_VERSION', 'EXPECTED_DECORATOR_DOCS_VERSION']) {
    const hits = ci.split('\n').filter((l) => l.includes(v));
    assert.strictEqual(hits.length, 1, v);
    assert.match(hits[0], /smoke-prod\.sh dev\.joymify\.com/);
  }
  assert.match(ci, /DECORATOR_DOCS_VERSION: \$\{\{ needs\.build-push-image\.outputs\.decorator_docs_version \}\}/);
});

test('no build-arg or secret mount carries the token', () => {
  const start = ci.indexOf('- name: Build and push');
  const block = ci.slice(start, ci.indexOf('\n  # ──', start));
  assert.ok(start > 0);
  assert.ok(!/build-args:|secrets:/.test(block));
});

// Every workflow step that runs a gate script (precheck.sh pulls the docs bundle on a fresh runner and
// fetch-portal-docs.sh exits 1 on an empty token) must get GH_TOKEN through its env: block.
function workflowSteps(text) {
  const code = text.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
  const parts = code.split(/\n(?=\s*- (?:name|uses|run):)/);
  return parts.slice(1);
}

test('every workflow step running the gate scripts provides GH_TOKEN via env', () => {
  const dir = path.join(root, '.github/workflows');
  const files = fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length >= 2);
  let seen = 0;
  for (const f of files) {
    for (const step of workflowSteps(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      const runLine = step.split('\n').find((l) => /^\s*(- )?run:/.test(l)) ?? '';
      const runs = /(precheck|integration|assemble-portal|fetch-portal-docs)\.sh/.test(
        step.slice(step.search(/^\s*(- )?run:/m) >= 0 ? step.search(/^\s*(- )?run:/m) : step.length),
      );
      if (!runs) continue;
      seen++;
      const name = step.split('\n')[0].trim();
      assert.match(step, /^\s+GH_TOKEN: \$\{\{ github\.token \}\}/m, `${f}: step "${name}" needs GH_TOKEN`);
      assert.ok(!/GH_TOKEN/.test(runLine), `${f}: token must come from env:, not the run line`);
    }
  }
  assert.ok(seen >= 3, `expected at least 3 gate steps, saw ${seen}`);
});

test('the Gate 1 step in ci.yml passes both tags so the gate checks the shipped docs versions', () => {
  const gate = ci.slice(ci.indexOf('- name: Gate 1'), ci.indexOf('# ── Job 2'));
  assert.match(gate, /CLI_DOCS_TAG: \$\{\{ inputs\.cli_docs_tag \}\}/);
  assert.match(gate, /DECORATOR_DOCS_TAG: \$\{\{ inputs\.decorator_docs_tag \}\}/);
});

test('precheck.sh fetches both bundles when empty and explains a missing token without printing one', () => {
  const pre = fs.readFileSync(path.join(root, 'scripts/precheck.sh'), 'utf8');
  assert.match(pre, /fetch_docs montionugera\/cli-state-handler cli-state-handler "\$\{CLI_DOCS_TAG:-\}"/);
  assert.match(pre, /fetch_docs montionugera\/node-server-decorator server-decorator "\$\{DECORATOR_DOCS_TAG:-\}"/);
  assert.match(pre, /portal-bundles\/\$2\/version\.json/);
  assert.match(pre, /gh auth login/);
});
