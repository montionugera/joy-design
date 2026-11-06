import './helpers.js';
import test from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from 'svelte/server';
import { firstTagAttrs } from './helpers.js';

const { Mascot } = await import('../src/react/Mascot.tsx');
const { default: SvelteMascot } = await import('../src/Mascot.svelte');
const reactHtml = (props) => renderToStaticMarkup(h(Mascot, props));
const svelteHtml = (props) => render(SvelteMascot, { props }).body;

// React keeps assetUrl() (file:// URL in plain Node), Svelte uses the static asset imports (site-absolute URL):
// compare the picture by file name, everything else exactly.
const byFile = (url) => url.split('/').pop();
const same = (a) => ({ ...a, src: byFile(a.src), srcset: a.srcset.split(', ').map((p) => byFile(p)).join(', ') });

const cases = [
  {},
  { name: 'rex', pose: 'cheer', size: 96, label: 'Rex' },
  { name: 'luna', pose: 'try-again', size: 128, glow: 3, eager: true },
  { name: 'dragon', pose: 'flying', size: 999, glow: 9 },
  { name: 'byte', pose: 'thinking', size: 0 },
];

for (const props of cases) {
  test(`React and Svelte render the same image for ${JSON.stringify(props)}`, () => {
    assert.deepStrictEqual(same(firstTagAttrs(reactHtml(props))), same(firstTagAttrs(svelteHtml(props))));
  });
}

test('React: Rex cheer at 96 has alt Rex; no label is decorative', () => {
  const a = firstTagAttrs(reactHtml({ name: 'rex', pose: 'cheer', size: 96, label: 'Rex' }));
  assert.strictEqual(a.alt, 'Rex');
  assert.strictEqual(a.width, '96');
  assert.match(a.src, /rex-cheer\.webp$/);
  assert.strictEqual(firstTagAttrs(reactHtml({ name: 'rex' })).alt, '');
});

test('the built dist/react.js loads in plain Node and renders the same image as src', async () => {
  // The .js extensions in the sources are what make this work; build the shipped artefact and import it.
  execFileSync(path.resolve('node_modules/.bin/tsc'), ['-p', 'tsconfig.build.json'], { stdio: 'pipe' });
  const built = await import('../dist/react.js');
  assert.deepStrictEqual(Object.keys(built).sort(), ['MASCOTS', 'Mascot', 'POSES', 'assetUrl']);
  assert.strictEqual(built.MASCOTS.length, 7);
  const props = { name: 'rex', pose: 'cheer', label: 'Rex' };
  assert.deepStrictEqual(
    firstTagAttrs(renderToStaticMarkup(h(built.Mascot, props))),
    firstTagAttrs(reactHtml(props)),
  );
});
