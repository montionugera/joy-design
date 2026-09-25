import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-043: Ribbon + BrandBanner (React twin). The Svelte twin asserts the same expectations in
// packages/svelte/test/brand-ribbon-banner.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { Ribbon } = loadComponent('Ribbon');
const { BrandBanner } = loadComponent('BrandBanner');
const ribbon = (props) => renderToStaticMarkup(React.createElement(Ribbon, props));
const banner = (props) => renderToStaticMarkup(React.createElement(BrandBanner, props));

test('F-043: Ribbon renders label, variant and tone classes, readable by default', () => {
  const html = ribbon({ label: 'New', variant: 'corner', tone: 'navy' });
  assert.match(html, /class="joy-ribbon joy-ribbon--corner joy-ribbon--navy[^"]*"[^>]*>New</);
  assert.ok(!/aria-hidden/.test(html));
  assert.match(ribbon({ label: 'Beta', decorative: true }), /aria-hidden="true"/);
});

test('F-043: BrandBanner renders title in a heading, decorative lattice, no gradient, CTA via LandingAction', () => {
  const html = banner({ title: 'One quiet product.', lede: 'Built deliberately.', primaryCtaText: 'Try Algo Trading', primaryCtaHref: '/algo' });
  assert.match(html, /<h2[^>]*>One quiet product\.<\/h2>/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.ok(!/gradient/i.test(html));
  assert.match(html, /href="\/algo"/);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(html));
});
