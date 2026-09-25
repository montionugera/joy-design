// HUB-069: every icon must render the same SVG in Svelte and React for the same size,
// colour and stroke width. Svelte icons are rendered with svelte/server; React icons are
// called directly (they are plain function components) and their element tree is walked.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';

const require = createRequire(import.meta.url);
const srcDir = new URL('../src/', import.meta.url);

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith('.svelte')) return nextLoad(url, context);
    const file = fileURLToPath(url);
    const { js } = compile(fs.readFileSync(file, 'utf8'), { generate: 'server', filename: file, dev: false });
    return { format: 'module', source: js.code, shortCircuit: true };
  }
});

function loadReactIcon(name) {
  const ts = require('typescript');
  const file = fileURLToPath(new URL(`react/${name}.tsx`, srcDir));
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', out)(require, mod, mod.exports);
  return mod.exports[name];
}

const exportedNames = (file, re) => [...fs.readFileSync(new URL(file, srcDir), 'utf8').matchAll(re)].map((m) => m[1]).sort();
const svelteNames = exportedNames('index.ts', /export \{ default as (\w+) \}/g);
const reactNames = exportedNames('react.ts', /export \{ (\w+) \}/g);

// Attributes that only carry framework-specific formatting, not the drawn result.
const IGNORED = new Set(['style', 'class', 'className', 'xmlns', 'children', 'key']);
const kebab = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const canonAttrs = (entries) =>
  Object.fromEntries(
    entries
      .filter(([k, v]) => !IGNORED.has(k) && v !== undefined && v !== null && v !== false)
      .map(([k, v]) => [kebab(k), String(v)])
      .sort(([a], [b]) => a.localeCompare(b))
  );

function reactTree(node) {
  if (node === null || node === undefined || node === false || typeof node === 'string') return [];
  if (Array.isArray(node)) return node.flatMap(reactTree);
  if (typeof node.type === 'function') return reactTree(node.type(node.props));
  return [{ tag: node.type, attrs: canonAttrs(Object.entries(node.props)), children: reactTree(node.props.children) }];
}

function svelteTree(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  for (const m of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const [, closing, tag, rawAttrs, selfClosing] = m;
    if (closing) {
      stack.pop();
      continue;
    }
    const attrs = canonAttrs([...rawAttrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const el = { tag, attrs, children: [] };
    stack[stack.length - 1].children.push(el);
    if (!selfClosing) stack.push(el);
  }
  return root.children;
}

const KNOCKOUT = 'var(--joy-surface-canvas)';

// Icons that legitimately hard-code a stroke-width regardless of the `strokeWidth` prop.
// Each entry names the exact fixed weight and why it doesn't follow the knob.
const STROKE_WIDTH_ALLOWLIST = {
  // SearchFilled's magnifying-glass handle is a fixed decorative accent on a filled
  // glyph, not an outline stroke — it keeps its weight at every strokeWidth setting
  // in both twins, so it is exempt rather than made to track the prop.
  SearchFilled: '2.5'
};

const CASES = [
  { label: 'defaults', props: {} },
  { label: 'size and colour', props: { size: '20px', color: 'var(--joy-accent-default)' } },
  { label: 'stroke width', props: { size: '32px', color: 'var(--joy-text-primary)', strokeWidth: 2 } }
];

test('Svelte and React export the same icon set', () => {
  assert.deepStrictEqual(svelteNames, reactNames);
  assert.ok(svelteNames.length > 100, `expected the full icon set, got ${svelteNames.length}`);
});

for (const name of svelteNames) {
  test(`${name}: Svelte and React render the same SVG for size, colour and stroke width`, async () => {
    const { default: SvelteIcon } = await import(new URL(`${name}.svelte`, srcDir).href);
    const ReactIcon = loadReactIcon(name);
    for (const { label, props } of CASES) {
      const svelte = svelteTree(render(SvelteIcon, { props }).body);
      const react = reactTree(ReactIcon(props));
      assert.deepStrictEqual(svelte, react, `${name} (${label}) differs between Svelte and React`);
      const root = react[0].attrs;
      assert.strictEqual(root.width, String(props.size ?? '1em'), `${name} (${label}) width must follow size`);
      assert.strictEqual(root.height, String(props.size ?? '1em'), `${name} (${label}) height must follow size`);
      const paints = [];
      const collect = (nodes) => nodes.forEach((n) => {
        for (const k of ['stroke', 'fill']) if (n.attrs[k] !== undefined && n.attrs[k] !== 'none') paints.push(n.attrs[k]);
        collect(n.children);
      });
      collect(react);
      assert.ok(paints.length > 0, `${name} (${label}) paints nothing`);
      // Filled icons knock details out of the shape with the canvas surface token; nothing else may paint.
      const color = String(props.color ?? 'currentColor');
      const stray = paints.filter((p) => p !== color && p !== KNOCKOUT);
      assert.deepStrictEqual(stray, [], `${name} (${label}) must paint only with the color prop or ${KNOCKOUT}`);
      assert.ok(paints.includes(color), `${name} (${label}) must paint with the color prop`);

      if (props.strokeWidth !== undefined) {
        const expected = STROKE_WIDTH_ALLOWLIST[name] ?? String(props.strokeWidth);
        const strokeWidths = [];
        const collectStrokeWidths = (nodes) => nodes.forEach((n) => {
          if (n.attrs.stroke !== undefined && n.attrs.stroke !== 'none') strokeWidths.push(n.attrs['stroke-width']);
          collectStrokeWidths(n.children);
        });
        collectStrokeWidths(react);
        // Fully-filled icons (e.g. solid triangles) have no stroked nodes at all — nothing to assert.
        for (const sw of strokeWidths) {
          assert.strictEqual(sw, expected, `${name} (${label}) stroke-width must be ${expected}`);
        }
      }
    }
  });
}
