import './helpers.js';
import test from 'node:test';
import assert from 'node:assert';
import { render } from 'svelte/server';
import { firstTagAttrs } from './helpers.js';

const { default: Mascot } = await import('../src/Mascot.svelte');
const html = (props) => render(Mascot, { props }).body;

test('Rex cheer at 96 shows the right picture, size and alt', () => {
  const a = firstTagAttrs(html({ name: 'rex', pose: 'cheer', size: 96, label: 'Rex' }));
  assert.strictEqual(a.tag, 'img');
  assert.strictEqual(a.alt, 'Rex');
  assert.strictEqual(a.width, '96');
  assert.strictEqual(a.height, '96');
  assert.match(a.src, /rex-cheer\.webp$/);
  assert.ok(a.src.startsWith('/'), 'a site-absolute URL, never file:');
  assert.match(a.srcset, /rex-cheer\.webp 1x, .*rex-cheer@2x\.webp 2x$/);
  assert.strictEqual(a['data-joy-mascot'], 'rex');
  assert.strictEqual(a['data-pose'], 'cheer');
  assert.strictEqual(a.loading, 'lazy');
  assert.strictEqual(a.class, 'joy-mascot');
});

test('no label means a decorative picture; eager switches loading', () => {
  const a = firstTagAttrs(html({ name: 'luna', eager: true }));
  assert.strictEqual(a.alt, '');
  assert.strictEqual(a.loading, 'eager');
  assert.match(a.src, /luna-idle\.webp$/, 'pose defaults to idle');
});

test('unknown name or pose shows Yoji idle', () => {
  const a = firstTagAttrs(html({ name: 'dragon', pose: 'flying' }));
  assert.match(a.src, /yoji-idle\.webp$/);
});

test('size is capped at 256 and glow at 5', () => {
  const a = firstTagAttrs(html({ size: 999, glow: 9 }));
  assert.strictEqual(a.width, '256');
  assert.strictEqual(a.style, '--joy-mascot-glow:5');
});

test('defaults: Yoji idle at 96, glow 0', () => {
  const a = firstTagAttrs(html({}));
  assert.match(a.src, /yoji-idle\.webp$/);
  assert.strictEqual(a.width, '96');
  assert.strictEqual(a.style, '--joy-mascot-glow:0');
});

test('the Svelte entry assetUrl is SSR-safe: a bundler URL from the static imports, never file:', async () => {
  const { assetUrl } = await import('../src/index.ts');
  assert.ok(!assetUrl('rex', 'cheer').startsWith('file:'));
  assert.match(assetUrl('rex', 'cheer'), /rex-cheer\.webp$/);
  assert.match(assetUrl('rex', 'cheer', 2), /rex-cheer@2x\.webp$/);
  assert.throws(() => assetUrl('nope', 'idle'), RangeError);
  const a = firstTagAttrs(html({ name: 'rex', pose: 'cheer' }));
  assert.strictEqual(assetUrl('rex', 'cheer'), a.src, 'the same URL the component renders');
});
