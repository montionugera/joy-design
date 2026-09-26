import test from 'node:test';
import assert from 'node:assert';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-043: Ribbon + BrandBanner (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/brand-ribbon-banner.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props) => (await renderRaw(name, props)).replace(/<!--[\s\S]*?-->/g, '');

test('F-043: Ribbon/BrandBanner compile with zero warnings', () => {
  for (const n of ['Ribbon', 'BrandBanner']) assert.deepStrictEqual(compileSvelte(n).warnings.map((w) => w.code), []);
});

test('F-043: Ribbon renders label, variant and tone classes, readable by default', async () => {
  const html = await renderSvelte('Ribbon', { label: 'New', variant: 'corner', tone: 'navy' });
  assert.match(html, /class="joy-ribbon joy-ribbon--corner joy-ribbon--navy[^"]*"[^>]*>New</);
  assert.ok(!/aria-hidden/.test(html));
  assert.match(await renderSvelte('Ribbon', { label: 'Beta', decorative: true }), /aria-hidden="true"/);
});

test('F-043: BrandBanner renders title in a heading, decorative lattice, no gradient, CTA via LandingAction', async () => {
  const html = await renderSvelte('BrandBanner', { title: 'One quiet product.', lede: 'Built deliberately.', primaryCtaText: 'Try Algo Trading', primaryCtaHref: '/algo' });
  assert.match(html, /<h2[^>]*>One quiet product\.<\/h2>/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.ok(!/gradient/i.test(html));
  assert.match(html, /href="\/algo"/);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(html));
});
