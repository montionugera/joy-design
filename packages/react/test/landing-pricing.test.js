import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L2: PricingCard + PricingMatrix (React twin). The Svelte twin asserts the same expectations in
// packages/svelte/test/landing-pricing.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { PricingCard } = loadComponent('PricingCard');
const { PricingMatrix } = loadComponent('PricingMatrix');
const card = (props = {}) => renderToStaticMarkup(React.createElement(PricingCard, { title: 'Pro', price: '$29', ...props }));
const matrix = (props = {}, ...children) => renderToStaticMarkup(React.createElement(PricingMatrix, props, ...children));

const DATA = {
  columns: ['Starter', 'Pro'],
  rows: [
    { label: 'Projects', values: ['3', 'Unlimited'] },
    { label: 'SSO', values: [false, true] }
  ]
};

test('F-039 L2: React pricing twins are forwardRef components', () => {
  for (const C of [PricingCard, PricingMatrix]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be a forwardRef component`);
  }
});

test('F-039 L2: card default CTA is sentence case, featured is solid and others outline, both block-width', () => {
  const plain = card();
  assert.match(plain, /<button\b[^>]*joy-button--outline[^>]*>/);
  assert.match(plain, /<button\b[^>]*joy-button--block[^>]*>/);
  assert.ok(plain.includes('Get started') && !plain.includes('Get Started'));
  const featured = card({ featured: true });
  assert.match(featured, /joy-pricing-card--featured/);
  assert.match(featured, /<button\b[^>]*joy-button--solid[^>]*>/);
  assert.match(featured, /<button\b[^>]*joy-button--block[^>]*>/);
  assert.ok(!/joy-button--outline/.test(featured));
});

test('F-039 L2: card carries no inline colour or layout style and no foreign colour fallback', () => {
  const html = card({ featured: true, badge: 'Most popular', features: ['One', 'Two'] });
  assert.ok(!/style=/.test(html.replace(/<svg\b[^>]*>/g, '')), 'no inline style outside the icon svg (the icon package owns its own)');
  assert.ok(!/#[0-9a-f]{3,8}\b|var\(--joy-color/i.test(html), 'no hex or phantom var(--joy-color-*)');
});

test('F-039 L2: features render one decorative Check icon each; badge is plain text', () => {
  const html = card({ badge: 'Most popular', features: ['One', 'Two', 'Three'] });
  assert.strictEqual((html.match(/class="joy-pricing-card__check"/g) || []).length, 3);
  assert.strictEqual((html.match(/<svg\b[^>]*aria-hidden="true"/g) || []).length, 3, 'icons are hidden from assistive tech');
  assert.match(html, /<div class="joy-pricing-card__badge">Most popular<\/div>/);
  assert.ok(!/&bull;|•|·/.test(html));
  assert.ok(!card().includes('joy-pricing-card__features'), 'no list without features');
});

test('F-039 L2: disabled and loading reach the button (aria-busy, spinner, disabled)', () => {
  const off = card({ disabled: true }).match(/<button\b[^>]*>/)[0];
  assert.match(off, /\sdisabled/);
  assert.ok(!/aria-busy/.test(off));
  const busy = card({ loading: true });
  assert.match(busy.match(/<button\b[^>]*>/)[0], /aria-busy="true"/);
  assert.match(busy, /\sdisabled/);
  assert.match(busy, /class="joy-button__spinner"/);
  assert.ok(!/\sdisabled/.test(card().match(/<button\b[^>]*>/)[0]));
});

test('F-039 L2: card forwards className and rest props to the root', () => {
  const html = card({ className: 'extra', 'data-testid': 'plan', id: 'p1' });
  assert.match(html, /^<div class="joy-pricing-card\s+extra"[^>]*data-testid="plan"/);
  assert.match(html, /id="p1"/);
});

test('F-039 L2: matrix without data is a labelled region wrapping its children in the card grid', () => {
  const html = matrix({}, React.createElement('div', { className: 'kid' }, 'x'));
  assert.match(html, /^<div class="joy-pricing-matrix\s*"[^>]*role="region"[^>]*aria-label="Pricing plans"/);
  assert.ok(html.includes('<div class="kid">x</div>'));
  assert.ok(!html.includes('<table') && !html.includes('joy-pricing-matrix__scroll'));
  assert.match(matrix({ label: 'Compare plans' }), /aria-label="Compare plans"/);
});

test('F-039 L2: matrix with columns and rows renders a real table in a focusable scroll region', () => {
  const html = matrix(DATA);
  assert.match(html, /<div class="joy-pricing-matrix__scroll"[^>]*role="region"[^>]*tabindex="0"[^>]*aria-label="Pricing plans"|<div class="joy-pricing-matrix__scroll"[^>]*tabindex="0"[^>]*role="region"/);
  assert.match(html, /<table class="joy-table joy-table--scroll joy-pricing-matrix__table">/);
  assert.ok(!/role="region"[^>]*>\s*<div class="joy-pricing-matrix__scroll/.test(html), 'the wrapper itself is not a second region');
  const heads = [...html.matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepStrictEqual(heads, ['Feature', 'Starter', 'Pro']);
  assert.match(html, /<th scope="row">Projects<\/th><td>3<\/td><td>Unlimited<\/td>/);
  assert.match(html, /<th scope="row">SSO<\/th>/);
  const custom = matrix({ ...DATA, rowHeaderLabel: 'Capability', label: 'Plan comparison' });
  assert.match(custom, /<th scope="col">Capability<\/th>/);
  assert.match(custom.match(/<div class="joy-pricing-matrix__scroll"[^>]*>/)[0], /aria-label="Plan comparison"/);
});

test('F-039 L2: boolean cells are labelled Check or Minus icons, never a text glyph', () => {
  const html = matrix(DATA);
  assert.match(html, /<td><span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg[^>]*aria-hidden="true"/);
  assert.match(html, /<td><span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg[^>]*aria-hidden="true"/);
  assert.ok(!/[\u2713\u2714\u2717\u00d7\u2013\u2014]/.test(html), 'no glyph characters');
  assert.ok(!/<td>(true|false)<\/td>/.test(html));
});

test('F-039 L2: matrix forwards className and rest to the root in both modes', () => {
  for (const props of [{}, DATA]) {
    const html = matrix({ ...props, className: 'extra', 'data-testid': 'm' });
    assert.match(html, /^<div class="joy-pricing-matrix[^"]*\bextra"[^>]*data-testid="m"/);
  }
});
