import test from 'node:test';
import assert from 'node:assert';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';
import { MARK } from '@joymify/brand';

// F-043: BrandMark + Wordmark (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/brand-components.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props) => (await renderRaw(name, props)).replace(/<!--[\s\S]*?-->/g, '');

test('F-043: BrandMark/Wordmark compile with zero warnings', () => {
  for (const name of ['BrandMark', 'Wordmark']) assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), []);
});

test('F-043: BrandMark tile variant draws the tile and no hex', async () => {
  const html = await renderSvelte('BrandMark', {});
  assert.match(html, /<rect[^>]*rx="6"/);
  assert.match(html, /var\(--joy-brand-tile\)/);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(html), 'no colour literals');
  assert.match(html, /aria-hidden="true"/);
});

test('F-043: BrandMark bare + title is an accessible image without tile or dot', async () => {
  const html = await renderSvelte('BrandMark', { variant: 'bare', title: 'Joymify' });
  assert.ok(!/<rect/.test(html) && !/<circle/.test(html));
  assert.match(html, /role="img"/);
  assert.match(html, /<title>Joymify<\/title>/);
  assert.match(html, /var\(--joy-brand-mark\)/);
});

test('F-043: BrandMark invalid size falls back to 32', async () => {
  assert.match(await renderSvelte('BrandMark', { size: 0 }), /width="32"/);
});

test('F-043: Wordmark renders outlined glyphs, labelled, tone-aware', async () => {
  const deep = await renderSvelte('Wordmark', {});
  assert.match(deep, /role="img"/);
  assert.match(deep, /aria-label="Joymify"/);
  assert.ok(!/<text\b/.test(deep));
  assert.match(deep, /var\(--joy-brand-ink\)/);
  assert.match(await renderSvelte('Wordmark', { tone: 'cream' }), /var\(--joy-brand-ink-on-tile\)/);
  const noMark = await renderSvelte('Wordmark', { withMark: false });
  assert.ok(!/<svg[\s\S]*<svg/.test(noMark));
  assert.ok(!noMark.includes(MARK.outline));
});
