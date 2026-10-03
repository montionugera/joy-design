import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// F-039 C1b + T2: the hub's `#view-landing-blocks` markup and the body of the full-page simulator (`#view-landing-preview`:
// main content and footer, not the hand-written header/drawer/toolbar) are generated from the Svelte components' SSR output
// by apps/storybook-hub/scripts/gen-landing-blocks.mjs. This test runs the generator in --check mode so a component change
// that is not followed by a regeneration (`node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write`) fails here.
// It reads only source files (build.js, the components), never dist output.

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const generator = path.join(repoRoot, 'apps/storybook-hub/scripts/gen-landing-blocks.mjs');

function check(root) {
  return spawnSync(process.execPath, [generator, '--check', '--root', root], { encoding: 'utf8', timeout: 300000 });
}

test('hub landing blocks match the current landing components', { timeout: 300000 }, () => {
  const run = check(repoRoot);
  assert.equal(run.status, 0, `drift between components and the hub landing blocks:\n${run.stderr}${run.stdout}`);
});

// A scratch root with the same layout the generator expects: components, SSR helper, build.js; node_modules is linked.
function withScratch(fn) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-hub-blocks-'));
  try {
    fs.mkdirSync(path.join(scratch, 'apps/storybook-hub'), { recursive: true });
    fs.cpSync(path.join(repoRoot, 'packages/svelte/src'), path.join(scratch, 'packages/svelte/src'), { recursive: true });
    fs.cpSync(path.join(repoRoot, 'packages/svelte/test/helpers'), path.join(scratch, 'packages/svelte/test/helpers'), { recursive: true });
    fs.symlinkSync(path.join(repoRoot, 'packages/svelte/node_modules'), path.join(scratch, 'packages/svelte/node_modules'));
    fs.copyFileSync(path.join(repoRoot, 'packages/svelte/package.json'), path.join(scratch, 'packages/svelte/package.json'));
    fs.copyFileSync(path.join(repoRoot, 'apps/storybook-hub/build.js'), path.join(scratch, 'apps/storybook-hub/build.js'));
    // Sanity: the untouched copy is clean, so a failure inside fn comes from its mutation and not from the copy.
    const clean = check(scratch);
    assert.equal(clean.status, 0, `scratch copy should start clean:\n${clean.stderr}${clean.stdout}`);
    fn(scratch);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}
function mutate(scratch, file, from, to) {
  const target = path.join(scratch, 'packages/svelte/src/lib', file);
  const source = fs.readFileSync(target, 'utf8');
  assert.ok(source.includes(from), `${file} still contains ${from}`);
  fs.writeFileSync(target, source.replaceAll(from, to));
}

test('the drift check turns red when a component class changes (scratch copy, real repo untouched)', { timeout: 300000 }, () => {
  withScratch((scratch) => {
    mutate(scratch, 'FeatureGrid.svelte', 'joy-feature-grid--lead', 'joy-feature-grid--lead-renamed');
    const drifted = check(scratch);
    assert.equal(drifted.status, 1, `a renamed component class must be reported as drift:\n${drifted.stderr}${drifted.stdout}`);
    assert.match(drifted.stderr, /landing blocks drift/);
    assert.match(drifted.stderr, /joy-feature-grid--lead/);
  });
});

test('T2: the drift check covers the simulator body: a LandingPage change turns it red in the simulator region only', { timeout: 300000 }, () => {
  withScratch((scratch) => {
    // The simulator page is the real LandingPage render, so a class the page itself emits (not a sub-component's) is a drift.
    mutate(scratch, 'LandingPage.svelte', '<div id="telemetry">', '<div id="telemetry" class="joy-landing-page__telemetry-renamed">');
    const drifted = check(scratch);
    assert.equal(drifted.status, 1, `a renamed LandingPage class must be reported as drift:\n${drifted.stderr}${drifted.stdout}`);
    assert.match(drifted.stderr, /landing blocks drift in landing-simulator:/);
    assert.match(drifted.stderr, /joy-landing-page__telemetry-renamed/);
    assert.ok(!/drift in landing-blocks:/.test(drifted.stderr), 'the blocks view does not use that class, so only the simulator drifts');
  });
});

test('T2: the drift check catches the tag defect the taste review found (a bare joy-badge without a size class)', { timeout: 300000 }, () => {
  withScratch((scratch) => {
    mutate(scratch, 'LandingPage.svelte', '<Badge variant="brand" size="sm">FPGA-Core</Badge>', '<span class="joy-badge joy-badge--brand">FPGA-Core</span>');
    const drifted = check(scratch);
    assert.equal(drifted.status, 1, `a bare joy-badge must be reported as drift:\n${drifted.stderr}${drifted.stdout}`);
    assert.match(drifted.stderr, /landing blocks drift in landing-simulator:/);
    assert.match(drifted.stderr, /joy-badge--sm|joy-badge--brand/);
  });
});

test('T2 fix: the render-id rewrite (s<digits> to sim<digits>) touches attribute values only, never text or SVG path data', { timeout: 300000 }, () => {
  withScratch((scratch) => {
    // Text and path data that look like a render id sit in the generated region; ids and aria refs must still be renamed.
    mutate(scratch, 'LandingPage.svelte', '<Smartphone size="1.5rem" />', '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M0 0 s1.5 2 3 4 s2 1" /></svg>');
    mutate(scratch, 'LandingPage.svelte', 'title="Tables that fit phones"', 'title="Tables that fit s2 phones"');
    const write = spawnSync(process.execPath, [generator, '--write', '--root', scratch], { encoding: 'utf8', timeout: 300000 });
    assert.equal(write.status, 0, `${write.stderr}${write.stdout}`);
    const out = fs.readFileSync(path.join(scratch, 'apps/storybook-hub/build.js'), 'utf8');
    assert.ok(out.includes('d="M0 0 s1.5 2 3 4 s2 1"'), 'SVG path data is untouched');
    assert.ok(out.includes('Tables that fit s2 phones'), 'visible text is untouched');
    assert.ok(!/sim1\.5|sim2 phones/.test(out), 'no rewritten text or path data');
    assert.match(out, /id="sim\d+-trigger-0"/, 'FAQ trigger ids are still renamed');
    assert.match(out, /aria-controls="sim\d+-answer-0"/, 'aria references are still renamed');
  });
});

// ── T2: the simulator copy rules (plain words, one brand, sentence-case headings), read from the source of build.js ──
const buildSource = fs.readFileSync(path.join(repoRoot, 'apps/storybook-hub/build.js'), 'utf8');
const region = (name) => {
  const a = buildSource.indexOf(`<!-- ${name}:generated:start -->`);
  const b = buildSource.indexOf(`<!-- ${name}:generated:end -->`);
  assert.ok(a > 0 && b > a, `${name} markers exist`);
  return buildSource.slice(a, b);
};
const simulatorView = () => {
  const a = buildSource.indexOf('<section id="view-landing-preview"');
  const b = buildSource.indexOf('<!-- View:', a);
  assert.ok(a > 0 && b > a);
  return buildSource.slice(a, b);
};
const visibleText = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/g, ' ')
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&copy;/g, '');

test('T2: the simulator has the three regions, a pricing section (3 plans and the comparison table) and section headings', () => {
  const main = region('landing-simulator');
  const footer = region('landing-simulator-footer');
  assert.equal((main.match(/class="joy-pricing-card[ "]/g) ?? []).length, 3, 'three plan cards');
  assert.equal((main.match(/<table class="joy-table joy-table--scroll joy-pricing-matrix__table"/g) ?? []).length, 1, 'one comparison table');
  for (const id of ['sim-features', 'sim-pricing', 'sim-telemetry', 'sim-faq']) assert.ok(main.includes(`id="${id}"`), `${id} anchor`);
  assert.equal((main.match(/<h2 class="joy-landing-page__section-title">/g) ?? []).length, 2, 'features and pricing headings (the FAQ brings its own)');
  assert.ok(main.includes('joy-faq-section__title'), 'FAQ heading');
  assert.ok(footer.includes('<footer class="joy-site-footer">'));
  assert.ok(!/ style="/.test(main + footer), 'no inline style in the generated body');
  assert.ok(!/class="joy-badge joy-badge--\w+"/.test(main), 'no bare joy-badge without a size class');
});

test('T2: simulator copy: no word over 12 characters, one brand name, sentence-case headings, no emoji', () => {
  const view = simulatorView();
  const text = visibleText(view);
  const long = text.split(/\s+/).map((w) => w.replace(/^[^\w]+|[^\w]+$/g, '')).filter((w) => w.length > 12);
  assert.deepEqual(long, [], 'no long words');
  assert.deepEqual([...new Set(text.match(/Joymify (?:Design|Quant)/g) ?? [])], ['Joymify Design'], 'one brand name');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(view), 'no emoji');
  const headings = [...view.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => visibleText(m[2]).replace(/\s+/g, ' ').trim());
  assert.ok(headings.length >= 8, `headings found: ${headings.join(' | ')}`);
  const proper = /^(Joymify|Design|WCAG|SOC|FAQ|P99|\d)/;
  for (const h of headings) {
    const words = h.split(' ').slice(1).filter((w) => /^[A-Z][a-z]/.test(w) && !proper.test(w));
    assert.deepEqual(words, [], `sentence case: ${h}`);
  }
});
