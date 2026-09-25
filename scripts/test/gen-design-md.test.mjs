// Tests for scripts/gen-design-md.mjs. Inputs are read-only; the CLI tests write only to temp copies.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { COMPONENTS } from '../parity-check.mjs';
import { contrastRatio } from '../../packages/tokens/scripts/color.mjs';
import { buildModel, componentMatrixRow, selectorsOf, resolveRef, kebab, deprecatedAliases, contrastRows, CONTRAST_PAIRS } from '../design-md/model.mjs';
import { renderDesignMd, replaceRegion } from '../design-md/render.mjs';
import { inventory } from '../gen-design-md.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const tokens = JSON.parse(read('packages/tokens/src/tokens.json'));
const themeCss = read('packages/tokens/dist/theme.css');
const dts = read('packages/tokens/dist/index.d.ts');
const sources = Object.fromEntries(COMPONENTS.map((c) => [c, read(`packages/svelte/src/lib/${c}.svelte`)]));
const model = buildModel({ tokens, themeCss, dts, components: COMPONENTS, sources });
const cli = path.join(root, 'scripts/gen-design-md.mjs');

test('semantic references resolve to primitive values', () => {
  assert.strictEqual(model.semantic.light.surface.canvas.value, tokens.color.cream['100'].value);
  assert.strictEqual(model.semantic.light.surface.canvas.cssVar, '--joy-surface-canvas');
  assert.throws(() => resolveRef(tokens, '{color.nope.1}'), /unresolved token reference/);
});

test('contrast rows are computed with the token colour maths and meet their minimum', () => {
  for (const theme of ['light', 'dark']) {
    for (const role of ['primary', 'secondary', 'muted', 'link']) {
      for (const surface of ['canvas', 'card']) {
        const row = model.contrast.find((r) => r.theme === theme && r.fg === `--joy-text-${role}` && r.bg === `--joy-surface-${surface}`);
        assert.ok(row, `missing ${theme} text-${role} on surface-${surface}`);
        const expected = contrastRatio(model.semantic[theme].text[role].value, model.semantic[theme].surface[surface].value);
        assert.strictEqual(row.ratio, Math.round(expected * 100) / 100);
      }
    }
  }
  const failing = model.contrast.filter((r) => r.min !== null && !r.pass);
  assert.deepStrictEqual(failing, []);
  // One row per pair per theme — a non-hex value used to `continue` past its pair silently,
  // so DESIGN.md could quietly lose rows with nothing failing. Guard the count directly.
  assert.strictEqual(model.contrast.length, CONTRAST_PAIRS.length * 2, 'every CONTRAST_PAIRS entry must produce a row in both themes');
});

test('a contrast pair that does not resolve to hex fails loudly instead of being silently dropped', () => {
  const semantic = { light: {}, dark: {} };
  for (const theme of ['light', 'dark']) {
    for (const { fg, bg } of CONTRAST_PAIRS) {
      for (const [group, role] of [fg, bg]) {
        semantic[theme][group] ??= {};
        semantic[theme][group][role] ??= { cssVar: `--joy-${group}-${role}`, value: '#000000' };
      }
    }
  }
  // Simulate a token-authoring bug: a contrast-pair role resolves to something other than hex
  // (e.g. a stray rgba() string) instead of the flat hex every primitive is supposed to be.
  semantic.light.text.primary = { cssVar: '--joy-text-primary', value: 'rgba(0, 0, 0, 0.5)' };
  assert.throws(() => contrastRows(semantic), /did not resolve to hex/);
});

test('state matrix has one row per parity-gated component, read from the stylesheet', () => {
  assert.deepStrictEqual(model.componentMatrix.map((r) => r.component), COMPONENTS);
  const button = model.componentMatrix.find((r) => r.component === 'Button');
  assert.deepStrictEqual(button.sizes, ['sm', 'md', 'lg']);
  for (const v of ['solid', 'outline', 'ghost', 'danger', 'link']) assert.ok(button.variants.includes(v), `Button variant ${v}`);
  for (const s of ['hover', 'focus-visible', 'active', 'disabled', 'loading']) assert.ok(button.states.includes(s), `Button state ${s}`);
  assert.ok(!button.variants.some((v) => v.startsWith('demo-')), 'hub-only demo modifiers are not variants');
  // Input sizes live on its wrapper block, which only the source-class scan finds.
  assert.deepStrictEqual(model.componentMatrix.find((r) => r.component === 'Input').sizes, ['sm', 'lg']);
});

test('state detection maps selectors to states', () => {
  const css = `.joy-x:hover{} .joy-x:focus-visible{} .joy-x[aria-pressed="true"]{} .joy-x--disabled{}
    .joy-x[aria-busy="true"]{} .joy-x__f[aria-invalid="true"]{} .joy-x__o[aria-selected="true"]{} .joy-x--open{}
    .joy-x--sm{} .joy-x--lg{} .joy-x--ghost{} .joy-x--demo-hover{} .joy-xy:active{}`;
  const row = componentMatrixRow('X', selectorsOf(css), '<div class="joy-x joy-x--{size}"><i class="joy-x__f joy-x__o"></i></div>');
  assert.deepStrictEqual(row.states, ['hover', 'focus-visible', 'active', 'disabled', 'loading', 'error', 'selected', 'open']);
  assert.deepStrictEqual(row.sizes, ['sm', 'lg']);
  assert.deepStrictEqual(row.variants, ['ghost']);
  assert.throws(() => componentMatrixRow('Nope', selectorsOf(css), '<div class="joy-nope"></div>'), /does not emit a styled \.joy-nope/);
});

test('kebab handles acronyms', () => {
  assert.strictEqual(kebab('CTASection'), 'cta-section');
  assert.strictEqual(kebab('InputNumber'), 'input-number');
});

test('deprecated aliases come from the generated type declarations', () => {
  const count = (dts.match(/@deprecated/g) || []).length;
  assert.strictEqual(model.deprecatedAliases.length, count);
  const withTarget = model.deprecatedAliases.filter((a) => a.target);
  assert.strictEqual(withTarget.length, (dts.match(/@deprecated Use '/g) || []).length);
  assert.deepStrictEqual(model.deprecatedAliases[0], { alias: '--joy-color-brand-primary', target: '--joy-accent-default' });
  assert.deepStrictEqual(deprecatedAliases("  /**\n   * @deprecated Legacy alias token\n   */\n  'x-y': string;"), [{ alias: '--joy-x-y', target: null }]);
});

test('DESIGN.md follows the Stitch format and is deterministic', () => {
  const md = renderDesignMd(model);
  assert.strictEqual(md, renderDesignMd(model));
  assert.ok(md.startsWith('---\n'));
  const fm = md.slice(4, md.indexOf('\n---\n', 4));
  const topKeys = fm.split('\n').filter((l) => /^[a-z]/.test(l)).map((l) => l.split(':')[0]);
  assert.deepStrictEqual(topKeys, ['name', 'description', 'colors', 'typography', 'rounded', 'spacing', 'components']);
  for (const line of fm.split('\n').filter((l) => /^ {2}[\w-]+: "#/.test(l))) assert.match(line, /: "#[0-9a-fA-F]{3,8}"$/);
  const headers = md.split('\n').filter((l) => /^## /.test(l));
  assert.deepStrictEqual(headers, ['## Overview', '## Colors', '## Typography', '## Elevation', '## Components', "## Do's and Don'ts"]);
  assert.doesNotMatch(md, /\d{4}-\d{2}-\d{2}/, 'no dates');
});

test('replaceRegion rewrites only between its markers', () => {
  const text = 'a\n<!-- BEGIN GENERATED:x -->\nold\n<!-- END GENERATED:x -->\nb\n';
  const out = replaceRegion(text, 'x', 'new');
  assert.ok(out.startsWith('a\n<!-- BEGIN GENERATED:x -->\n'));
  assert.ok(out.endsWith('\nnew\n\n<!-- END GENERATED:x -->\nb\n'));
  assert.ok(!out.includes('old'));
  assert.strictEqual(replaceRegion(out, 'x', 'new'), out);
  assert.throws(() => replaceRegion('no markers', 'x', 'y'), /missing/);
});

test('inventory marks parity-gated twins and one-sided components', () => {
  const inv = inventory({
    svelteIndex: "export { default as A } from './A.svelte';\nexport { default as B } from './B.svelte';",
    reactIndex: "export { A, type AProps } from './A.js';\nexport { C } from './C.js';",
    components: ['A']
  });
  assert.deepStrictEqual(inv, [
    { name: 'A', svelte: true, react: true, gated: true },
    { name: 'B', svelte: true, react: false, gated: false },
    { name: 'C', svelte: false, react: true, gated: false }
  ]);
});

test('--check passes on the committed tree and fails on a drifted copy', () => {
  const ok = spawnSync(process.execPath, [cli, '--check'], { encoding: 'utf8' });
  assert.strictEqual(ok.status, 0, ok.stderr);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-design-md-'));
  try {
    const design = path.join(dir, 'DESIGN.md');
    const readme = path.join(dir, 'README.md');
    fs.copyFileSync(path.join(root, 'DESIGN.md'), design);
    fs.writeFileSync(readme, read('README.md').replace(/(<!-- BEGIN GENERATED:component-inventory -->)/, '$1\nstale row'));
    const drift = spawnSync(process.execPath, [cli, '--check', '--design', design, '--readme', readme], { encoding: 'utf8' });
    assert.strictEqual(drift.status, 1);
    assert.match(drift.stderr, /README\.md/);
    const fix = spawnSync(process.execPath, [cli, '--design', design, '--readme', readme], { encoding: 'utf8' });
    assert.strictEqual(fix.status, 0, fix.stderr);
    const again = spawnSync(process.execPath, [cli, '--check', '--design', design, '--readme', readme], { encoding: 'utf8' });
    assert.strictEqual(again.status, 0, again.stderr);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
