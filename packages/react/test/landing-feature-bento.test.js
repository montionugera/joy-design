import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L3: FeatureCard, FeatureGrid, BentoCard, BentoGrid (React twin). The Svelte twin asserts the same expectations
// in packages/svelte/test/landing-feature-bento.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { FeatureCard } = loadComponent('FeatureCard');
const { FeatureGrid } = loadComponent('FeatureGrid');
const { BentoCard } = loadComponent('BentoCard');
const { BentoGrid } = loadComponent('BentoGrid');
const h = React.createElement;
const html = (C, props, ...children) => renderToStaticMarkup(h(C, props, ...children));
const card = (props = {}) => html(FeatureCard, { title: 'Fast', description: 'Quick to ship', ...props });
const openTag = (markup, first = /<div\b[^>]*>/) => markup.match(first)[0];
const GLYPH = h('svg', { className: 'glyph', width: 20, height: 20 });

test('F-039 L3: React feature and bento twins are forwardRef components', () => {
  for (const C of [FeatureCard, FeatureGrid, BentoCard, BentoGrid]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be a forwardRef component`);
  }
});

test('F-039 L3: FeatureCard renders the icon slot inside .joy-feature-card__icon, and no wrapper without one', () => {
  const withIcon = card({ icon: GLYPH });
  assert.match(withIcon, /<div class="joy-feature-card__icon"><svg class="glyph"/);
  assert.strictEqual((withIcon.match(/joy-feature-card__icon/g) || []).length, 1, 'the slot is rendered once, not duplicated');
  assert.ok(!card().includes('joy-feature-card__icon'));
  assert.match(card({ badge: 'New' }), /<div class="joy-feature-card__badge">New<\/div>/);
});

test('F-039 L3: FeatureCard link text carries no arrow character, arrow svg or middle dot', () => {
  const link = card({ linkText: 'Read more', linkHref: '/docs' });
  const anchor = link.match(/<a\b[\s\S]*?<\/a>/)[0];
  assert.match(anchor, /^<a href="\/docs" class="joy-feature-card__link">Read more<\/a>$/);
  assert.ok(!/&rarr;|&#8594;|→|›|&gt;|<svg|&bull;|·/.test(anchor), anchor);
  assert.ok(!card().includes('joy-feature-card__link'), 'no link without linkText');
});

test('F-039 L3: FeatureCard link is an anchor with a real href, and a button when it only runs a handler', () => {
  assert.match(card({ linkText: 'More' }), /<a href="#" class="joy-feature-card__link">More<\/a>/, 'default href stays #');
  assert.match(card({ linkText: 'More', linkHref: '/x', onLinkClick() {} }), /<a href="\/x" class="joy-feature-card__link">/);
  const action = card({ linkText: 'Open', onLinkClick() {} });
  assert.match(action, /<button type="button" class="joy-feature-card__link">Open<\/button>/);
  assert.ok(!/<a\b/.test(action), 'a handler without an href is not a fake # anchor');
});

// Behaviour without a DOM: call the forwardRef render function and inspect the element tree (React 19 keeps `ref` in
// props). None of these components use hooks, so no render context is needed.
const findAll = (node, type, found = []) => {
  if (Array.isArray(node)) node.forEach((n) => findAll(n, type, found));
  else if (node && typeof node === 'object' && node.props) {
    if (node.type === type) found.push(node);
    findAll(node.props.children, type, found);
  }
  return found;
};
const render = (C, props, ref = null) => C.render(props, ref);

test('F-039 L3: onLinkClick runs on click and cancels the # navigation; without a handler nothing is intercepted', () => {
  let calls = 0;
  const handler = () => { calls += 1; };
  const [anchor] = findAll(render(FeatureCard, { title: 'T', description: 'D', linkText: 'More', linkHref: '/x', onLinkClick: handler }), 'a');
  let prevented = 0;
  anchor.props.onClick({ preventDefault: () => { prevented += 1; } });
  assert.deepStrictEqual([calls, prevented], [1, 1]);
  const [plain] = findAll(render(FeatureCard, { title: 'T', description: 'D', linkText: 'More', linkHref: '/x' }), 'a');
  assert.strictEqual(plain.props.onClick, undefined, 'a plain link is left to the browser');
  const [button] = findAll(render(FeatureCard, { title: 'T', description: 'D', linkText: 'Open', onLinkClick: handler }), 'button');
  button.props.onClick();
  assert.strictEqual(calls, 2, 'the button runs the handler');
});

test('F-039 L3: FeatureGrid layout defaults to lead; uniform drops the lead class', () => {
  assert.match(openTag(html(FeatureGrid, {})), /class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead\s*"/);
  assert.match(openTag(html(FeatureGrid, { layout: 'lead' })), /joy-feature-grid--lead/);
  const uniform = openTag(html(FeatureGrid, { layout: 'uniform' }));
  assert.ok(!uniform.includes('joy-feature-grid--lead'), uniform);
  assert.match(uniform, /joy-feature-grid--cols-3/);
});

test('F-039 L3: FeatureGrid never emits an empty or unknown column modifier', () => {
  for (const columns of [undefined, null, 0, 1, 5, '3', NaN]) {
    const tag = openTag(html(FeatureGrid, { columns }));
    assert.match(tag, /joy-feature-grid--cols-3(\s|")/, `columns=${String(columns)} falls back to 3`);
    assert.ok(!/cols-(?!\d)/.test(tag));
  }
  for (const columns of [2, 4]) {
    assert.match(openTag(html(FeatureGrid, { columns })), new RegExp(`joy-feature-grid--cols-${columns}(\\s|")`));
  }
});

test('F-039 L3: BentoCard emits joy-bento-card--col-N for every span 1..12 and falls back to 4 for anything else', () => {
  for (let n = 1; n <= 12; n += 1) {
    assert.match(openTag(html(BentoCard, { colSpan: n })), new RegExp(`class="joy-bento-card joy-bento-card--col-${n}(\\s|")`));
  }
  for (const colSpan of [undefined, null, 0, 13, 2.5, '6', NaN]) {
    const tag = openTag(html(BentoCard, { colSpan }));
    assert.match(tag, /joy-bento-card--col-4(\s|")/, `colSpan=${String(colSpan)} falls back to 4`);
    assert.ok(!/--col-(?!\d)/.test(tag));
  }
});

test('F-039 L3: BentoCard renders badge, title, description and content only when given', () => {
  const full = html(BentoCard, { badge: 'Metric', title: 'Latency', description: 'Sub-ms' }, h('span', { className: 'kid' }, 'x'));
  assert.match(full, /<div class="joy-bento-card__badge">Metric<\/div><h4 class="joy-bento-card__title">Latency<\/h4><p class="joy-bento-card__desc">Sub-ms<\/p>/);
  assert.match(full, /<div class="joy-bento-card__content"><span class="kid">x<\/span><\/div>/);
  const bare = html(BentoCard, {});
  assert.ok(!/joy-bento-card__(badge|title|desc|content)/.test(bare));
});

test('F-039 L3: BentoGrid is a forwardRef grid that renders children and stays empty without them', () => {
  assert.match(html(BentoGrid, {}, h('i', null, 'a')), /^<div class="joy-bento-grid\s*"><i>a<\/i><\/div>$/);
  assert.match(html(BentoGrid, {}), /^<div class="joy-bento-grid\s*"><\/div>$/);
});

test('F-039 L3: every twin forwards className and rest props to its root element', () => {
  const extra = { className: 'extra', 'data-testid': 'root', id: 'r1' };
  const cases = {
    FeatureCard: card(extra),
    FeatureGrid: html(FeatureGrid, extra),
    BentoCard: html(BentoCard, extra),
    BentoGrid: html(BentoGrid, extra)
  };
  for (const [name, markup] of Object.entries(cases)) {
    const root = openTag(markup);
    assert.match(root, /class="[^"]*\bextra"/, `${name} class`);
    assert.match(root, /data-testid="root"/, `${name} rest`);
    assert.match(root, /id="r1"/, `${name} id`);
  }
});

test('F-039 L3: the forwarded ref lands on the root element of every twin', () => {
  const ref = React.createRef();
  const cases = {
    FeatureCard: render(FeatureCard, { title: 'T', description: 'D' }, ref),
    FeatureGrid: render(FeatureGrid, {}, ref),
    BentoCard: render(BentoCard, {}, ref),
    BentoGrid: render(BentoGrid, {}, ref)
  };
  for (const [name, el] of Object.entries(cases)) {
    assert.strictEqual(el.type, 'div', `${name} root is the div`);
    assert.strictEqual(el.props.ref, ref, `${name} forwards ref to its root`);
  }
});

test('F-039 L3: no inline style, hex colour or phantom colour token in any feature or bento markup', () => {
  const markup = [
    card({ icon: GLYPH, badge: 'New', linkText: 'More', linkHref: '/x' }),
    html(FeatureGrid, {}, h('i')),
    html(BentoCard, { badge: 'b', title: 't', description: 'd', colSpan: 6 }, h('i')),
    html(BentoGrid, {}, h('i'))
  ].join('');
  assert.ok(!/style=|#[0-9a-f]{3,8}\b|var\(--joy-color/i.test(markup.replace(/<svg\b[^>]*>/g, '')));
});
