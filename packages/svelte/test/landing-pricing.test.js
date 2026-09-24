import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L2: PricingCard + PricingMatrix (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/landing-pricing.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props, opts) => (await renderRaw(name, props, opts)).replace(/<!--[\s\S]*?-->/g, '');
const card = (props = {}) => renderSvelte('PricingCard', { title: 'Pro', price: '$29', ...props });
const matrix = (props = {}, children) => renderSvelte('PricingMatrix', props, children ? { children } : undefined);
const openTag = (html, first = /<div\b[^>]*>/) => html.match(first)[0];

const DATA = {
  columns: ['Starter', 'Pro'],
  rows: [
    { label: 'Projects', values: ['3', 'Unlimited'] },
    { label: 'SSO', values: [false, true] }
  ]
};

test('F-039 L2: Svelte pricing files compile with zero warnings', () => {
  for (const name of ['PricingCard', 'PricingMatrix']) {
    assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), [], `${name} compiles without warnings`);
  }
});

test('F-039 L2: card default CTA is sentence case, featured is solid and others outline, both block-width', async () => {
  const plain = await card();
  assert.match(plain, /<button\b[^>]*joy-button--outline[^>]*>/);
  assert.match(plain, /<button\b[^>]*joy-button--block[^>]*>/);
  assert.ok(plain.includes('Get started') && !plain.includes('Get Started'));
  const featured = await card({ featured: true });
  assert.match(featured, /joy-pricing-card--featured/);
  assert.match(featured, /<button\b[^>]*joy-button--solid[^>]*>/);
  assert.match(featured, /<button\b[^>]*joy-button--block[^>]*>/);
  assert.ok(!/joy-button--outline/.test(featured));
});

test('F-039 L2: card carries no inline colour or layout style and no foreign colour fallback', async () => {
  const html = await card({ featured: true, badge: 'Most popular', features: ['One', 'Two'] });
  assert.ok(!/style=/.test(html.replace(/<svg\b[^>]*>/g, '')), 'no inline style outside the icon svg (the icon package owns its own)');
  assert.ok(!/#[0-9a-f]{3,8}\b|var\(--joy-color/i.test(html), 'no hex or phantom var(--joy-color-*)');
});

test('F-039 L2: features render one decorative Check icon each; badge is plain text', async () => {
  const html = await card({ badge: 'Most popular', features: ['One', 'Two', 'Three'] });
  assert.strictEqual((html.match(/class="joy-pricing-card__check"/g) || []).length, 3);
  assert.strictEqual((html.match(/<svg\b[^>]*aria-hidden="true"/g) || []).length, 3, 'icons are hidden from assistive tech');
  assert.match(html, /<div class="joy-pricing-card__badge">Most popular<\/div>/);
  assert.ok(!/&bull;|•|·/.test(html));
  assert.ok(!(await card()).includes('joy-pricing-card__features'), 'no list without features');
});

test('F-039 L2: disabled and loading reach the button (aria-busy, spinner, disabled)', async () => {
  const off = (await card({ disabled: true })).match(/<button\b[^>]*>/)[0];
  assert.match(off, /\sdisabled/);
  assert.ok(!/aria-busy/.test(off));
  const busy = await card({ loading: true });
  assert.match(busy.match(/<button\b[^>]*>/)[0], /aria-busy="true"/);
  assert.match(busy, /\sdisabled/);
  assert.match(busy, /class="joy-button__spinner"/);
  assert.ok(!/\sdisabled/.test((await card()).match(/<button\b[^>]*>/)[0]));
});

test('F-039 L2: card forwards class and rest props to the root (Svelte rest contract: SVELTE_REF_REST)', async () => {
  const root = openTag(await card({ class: 'extra', 'data-testid': 'plan', id: 'p1' }));
  assert.match(root, /class="joy-pricing-card\s+extra"/);
  assert.match(root, /data-testid="plan"/);
  assert.match(root, /id="p1"/);
});

test('F-039 L2: matrix without data is a labelled region wrapping its children in the card grid', async () => {
  const html = await matrix({}, '<div class="kid">x</div>');
  const root = openTag(html);
  assert.match(root, /class="joy-pricing-matrix\s*"/);
  assert.match(root, /role="region"/);
  assert.match(root, /aria-label="Pricing plans"/);
  assert.ok(html.includes('<div class="kid">x</div>'));
  assert.ok(!html.includes('<table') && !html.includes('joy-pricing-matrix__scroll'));
  assert.match(openTag(await matrix({ label: 'Compare plans' })), /aria-label="Compare plans"/);
});

test('F-039 L2: matrix with columns and rows renders a real table in a focusable scroll region', async () => {
  const html = await matrix(DATA);
  const scroll = openTag(html, /<div class="joy-pricing-matrix__scroll"[^>]*>/);
  assert.match(scroll, /role="region"/);
  assert.match(scroll, /tabindex="0"/);
  assert.match(scroll, /aria-label="Pricing plans"/);
  assert.ok(!/role=/.test(openTag(html)), 'the wrapper itself is not a second region');
  assert.match(html, /<table class="joy-table joy-table--scroll joy-pricing-matrix__table">/);
  const heads = [...html.matchAll(/<th scope="col">([^<]*)<\/th>/g)].map((m) => m[1]);
  assert.deepStrictEqual(heads, ['Feature', 'Starter', 'Pro']);
  assert.match(html, /<th scope="row">Projects<\/th><td>3<\/td><td>Unlimited<\/td>/);
  assert.match(html, /<th scope="row">SSO<\/th>/);
  const custom = await matrix({ ...DATA, rowHeaderLabel: 'Capability', label: 'Plan comparison' });
  assert.match(custom, /<th scope="col">Capability<\/th>/);
  assert.match(openTag(custom, /<div class="joy-pricing-matrix__scroll"[^>]*>/), /aria-label="Plan comparison"/);
});

test('F-039 L2: boolean cells are labelled Check or Minus icons, never a text glyph', async () => {
  const html = await matrix(DATA);
  assert.match(html, /<td><span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg[^>]*aria-hidden="true"/);
  assert.match(html, /<td><span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg[^>]*aria-hidden="true"/);
  assert.ok(!/[\u2713\u2714\u2717\u00d7\u2013\u2014]/.test(html), 'no glyph characters');
  assert.ok(!/<td>(true|false)<\/td>/.test(html));
});

test('F-039 L2: matrix forwards class and rest to the root in both modes', async () => {
  for (const props of [{}, DATA]) {
    const root = openTag(await matrix({ ...props, class: 'extra', 'data-testid': 'm' }));
    assert.match(root, /class="joy-pricing-matrix[^"]*\bextra"/);
    assert.match(root, /data-testid="m"/);
  }
});

const libFile = (name) => fileURLToPath(new URL(`../src/lib/${name}.svelte`, import.meta.url));

test('F-039 L2: onselect reaches the plan button, with the featured variant (real PricingCard, recording Button stub)', async () => {
  // SSR cannot click, so the compiled PricingCard is rendered next to a stub Button that records the props it receives.
  const dir = fs.mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '.tmp-pricing-btn-'));
  try {
    fs.writeFileSync(path.join(dir, 'PricingCard.svelte'), fs.readFileSync(libFile('PricingCard'), 'utf8'));
    fs.writeFileSync(path.join(dir, 'Button.svelte'), `<script>let props = $props(); globalThis.__joyPricingButton = props;</script><button></button>`);
    await renderRaw('Badge', {}); // registers the .svelte load hook
    const { default: Card } = await import(pathToFileURL(path.join(dir, 'PricingCard.svelte')).href);
    const handler = () => {};
    for (const [featured, variant] of [[false, 'outline'], [true, 'solid']]) {
      render(Card, { props: { title: 'Pro', price: '$29', featured, onselect: handler } }).body; // .body forces the lazy render
      const btn = globalThis.__joyPricingButton;
      assert.strictEqual(btn.onclick, handler, `featured=${featured}`);
      assert.strictEqual(btn.variant, variant);
      assert.strictEqual(btn.block, true);
    }
    render(Card, { props: { title: 'Pro', price: '$29' } }).body;
    assert.strictEqual(globalThis.__joyPricingButton.onclick, undefined);
  } finally {
    delete globalThis.__joyPricingButton;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('F-039 L2: ref is bound on the root of every branch (client compile output, one bind_this per root)', () => {
  // Server rendering ignores bind:this, so the compiled client output is the observable contract. PricingMatrix has two
  // roots (data and grid) and parity-check only needs one binding anywhere, so count them here.
  const binds = (name) => (compile(fs.readFileSync(libFile(name), 'utf8'), { generate: 'client', filename: libFile(name) }).js.code.match(/\$\.bind_this\(/g) || []).length;
  assert.strictEqual(binds('PricingCard'), 1);
  assert.strictEqual(binds('PricingMatrix'), 2);
});

test('F-039 L2: defaults match the React twin (period, no badge, no description)', async () => {
  const html = await card();
  assert.match(html, /class="joy-pricing-card__period">\/month</);
  assert.ok(!html.includes('joy-pricing-card__badge') && !html.includes('joy-pricing-card__desc'));
});

test('F-039 L2: columns without rows (or rows without columns) fall back to the children card grid', async () => {
  for (const partial of [{ columns: DATA.columns }, { rows: DATA.rows }]) {
    const html = await matrix(partial, '<div class="kid">x</div>');
    assert.ok(html.includes('<div class="kid">x</div>'), 'children still rendered');
    assert.match(html, /role="region"[^>]*aria-label="Pricing plans"|aria-label="Pricing plans"[^>]*role="region"/);
    assert.ok(!html.includes('<table') && !html.includes('joy-pricing-matrix--table'));
  }
});
