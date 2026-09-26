import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { createRawSnippet } from 'svelte';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L3: FeatureCard, FeatureGrid, BentoCard, BentoGrid (Svelte twin). The React twin asserts the same expectations
// in packages/react/test/landing-feature-bento.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props, opts) => (await renderRaw(name, props, opts)).replace(/<!--[\s\S]*?-->/g, '');
const snippet = (markup) => createRawSnippet(() => ({ render: () => markup }));
const card = (props = {}) => renderSvelte('FeatureCard', { title: 'Fast', description: 'Quick to ship', ...props });
const grid = (props = {}, children) => renderSvelte('FeatureGrid', props, { children: children ?? '<i>a</i>' });
const openTag = (markup, first = /<div\b[^>]*>/) => markup.match(first)[0];
const GLYPH = snippet('<svg class="glyph" width="20" height="20"></svg>');
const NAMES = ['FeatureCard', 'FeatureGrid', 'BentoCard', 'BentoGrid'];

test('F-039 L3: Svelte feature and bento files compile with zero warnings', () => {
  for (const name of NAMES) {
    assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), [], `${name} compiles without warnings`);
  }
});

test('F-039 L3: FeatureCard renders the icon slot inside .joy-feature-card__icon, and no wrapper without one', async () => {
  const withIcon = await card({ icon: GLYPH });
  assert.match(withIcon, /<div class="joy-feature-card__icon"><svg class="glyph"/);
  assert.strictEqual((withIcon.match(/joy-feature-card__icon/g) || []).length, 1, 'the slot is rendered once, not duplicated');
  assert.ok(!(await card()).includes('joy-feature-card__icon'));
  assert.match(await card({ badge: snippet('New') }), /<div class="joy-feature-card__badge">New<\/div>/);
});

test('F-039 L3: FeatureCard link text carries no arrow character, arrow svg or middle dot', async () => {
  const link = await card({ linkText: 'Read more', linkHref: '/docs' });
  const anchor = link.match(/<a\b[\s\S]*?<\/a>/)[0];
  assert.match(anchor, /^<a href="\/docs" class="joy-feature-card__link">Read more<\/a>$/);
  assert.ok(!/&rarr;|&#8594;|→|›|&gt;|<svg|&bull;|·/.test(anchor), anchor);
  assert.ok(!(await card()).includes('joy-feature-card__link'), 'no link without linkText');
});

test('F-039 L3: FeatureCard link is an anchor with a real href, and a button when it only runs a handler', async () => {
  assert.match(await card({ linkText: 'More' }), /<a href="#" class="joy-feature-card__link">More<\/a>/, 'default href stays #');
  assert.match(await card({ linkText: 'More', linkHref: '/x', onlinkclick() {} }), /<a href="\/x" class="joy-feature-card__link">/);
  const action = await card({ linkText: 'Open', onlinkclick() {} });
  assert.match(action, /<button type="button" class="joy-feature-card__link">Open<\/button>/);
  assert.ok(!/<a\b/.test(action), 'a handler without an href is not a fake # anchor');
});

// Behaviour without a DOM: evaluate the compiled CLIENT component against a recording stand-in for svelte/internal/client.
// Every element the component creates from a template is a distinct tagged node (`created`, in creation order, so
// created[0] is the root); child/sibling lookups return separate `derived` nodes. The stand-in records WHICH node each
// delegated handler and each bind:this setter is attached to, and the tests then run the real closures against the props
// (no browser or jsdom is available in this repo). Anything else is a no-op.
const libFile = (name) => fileURLToPath(new URL(`../src/lib/${name}.svelte`, import.meta.url));
function runClient(name, props) {
  const code = compile(fs.readFileSync(libFile(name), 'utf8'), { generate: 'client', filename: libFile(name) }).js.code
    .replace(/^import .*$/gm, '')
    .replace('export default function', 'function');
  const created = [];
  const delegated = [];
  const binds = [];
  const noop = () => noop;
  const derivedNode = (parent) => ({ derived: true, parent });
  const $ = new Proxy({}, {
    get: (_, key) => {
      switch (key) {
        case 'from_html': return (html) => () => { const node = { html }; created.push(node); return node; };
        case 'child':
        case 'sibling':
        case 'first_child':
        case 'only_child': return derivedNode;
        case 'prop': return (p, k, _flags, fallback) => (...args) => (args.length ? (p[k] = args[0]) : (p[k] === undefined ? fallback : p[k]));
        case 'rest_props': return () => ({});
        case 'derived': return (fn) => ({ fn });
        case 'get': return (d) => d.fn();
        case 'if': return (_node, render) => render((branch) => branch({}));
        case 'delegated': return (event, el, handler) => { delegated.push({ event, el, handler }); };
        case 'bind_this': return (el, setter) => { binds.push({ el, setter }); };
        default: return noop;
      }
    }
  });
  new Function('$', 'props', `${code}\nreturn ${name}({}, props);`)($, props);
  return { created, delegated, binds };
}
const plainClick = (extra = {}) => {
  const event = { button: 0, defaultPrevented: false, prevented: 0, preventDefault() { this.prevented += 1; }, ...extra };
  return event;
};

test('F-039 L3: a plain primary click runs onlinkclick and cancels navigation; no handler, or a modified click, is left to the browser', () => {
  let calls = 0;
  const handler = () => { calls += 1; };
  const anchor = runClient('FeatureCard', { title: 'T', description: 'D', linkText: 'More', linkHref: '/x', onlinkclick: handler });
  assert.strictEqual(anchor.delegated.length, 1);
  const link = anchor.delegated[0];
  assert.strictEqual(link.event, 'click');
  assert.ok(!link.el.derived && /^<a\b[^>]*class="joy-feature-card__link"/.test(link.el.html), `the handler is on the link anchor itself (${link.el.html})`);
  const plain = plainClick();
  link.handler(plain);
  assert.deepStrictEqual([calls, plain.prevented], [1, 1]);
  for (const extra of [{ metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    const event = plainClick(extra);
    link.handler(event);
    assert.deepStrictEqual([calls, event.prevented], [1, 0], `modified click ${JSON.stringify(extra)} keeps browser behaviour`);
  }
  const noHandler = runClient('FeatureCard', { title: 'T', description: 'D', linkText: 'More', linkHref: '/x' });
  const untouched = plainClick();
  noHandler.delegated[0].handler(untouched);
  assert.deepStrictEqual([calls, untouched.prevented], [1, 0], 'a plain link is left to the browser');
});

test('F-039 L3: the action button carries the handler itself (not a sibling), and only a button renders for a handler with no href', () => {
  let calls = 0;
  const button = runClient('FeatureCard', { title: 'T', description: 'D', linkText: 'Open', onlinkclick: () => { calls += 1; } });
  assert.strictEqual(button.delegated.length, 1);
  const { el, handler } = button.delegated[0];
  assert.ok(!el.derived && /^<button\b[^>]*class="joy-feature-card__link"/.test(el.html) && !/hidden/.test(el.html), `handler is on the link button (${el.html})`);
  handler();
  assert.strictEqual(calls, 1);
  assert.ok(!button.created.some((n) => /^<a\b/.test(n.html)), 'no anchor is created for an action');
});

test('F-039 L3: FeatureGrid layout defaults to lead; uniform drops the lead class', async () => {
  assert.match(openTag(await grid()), /class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead\s*"/);
  assert.match(openTag(await grid({ layout: 'lead' })), /joy-feature-grid--lead/);
  const uniform = openTag(await grid({ layout: 'uniform' }));
  assert.ok(!uniform.includes('joy-feature-grid--lead'), uniform);
  assert.match(uniform, /joy-feature-grid--cols-3/);
});

test('F-039 L3: FeatureGrid never emits an empty or unknown column modifier', async () => {
  for (const columns of [undefined, null, 0, 1, 5, '3', NaN]) {
    const tag = openTag(await grid({ columns }));
    assert.match(tag, /joy-feature-grid--cols-3(\s|")/, `columns=${String(columns)} falls back to 3`);
    assert.ok(!/cols-(?!\d)/.test(tag));
  }
  for (const columns of [2, 4]) {
    assert.match(openTag(await grid({ columns })), new RegExp(`joy-feature-grid--cols-${columns}(\\s|")`));
  }
});

test('F-039 L3: BentoCard emits joy-bento-card--col-N for every span 1..12 and falls back to 4 for anything else', async () => {
  for (let n = 1; n <= 12; n += 1) {
    assert.match(openTag(await renderSvelte('BentoCard', { colSpan: n })), new RegExp(`class="joy-bento-card joy-bento-card--col-${n}(\\s|")`));
  }
  for (const colSpan of [undefined, null, 0, 13, 2.5, '6', NaN]) {
    const tag = openTag(await renderSvelte('BentoCard', { colSpan }));
    assert.match(tag, /joy-bento-card--col-4(\s|")/, `colSpan=${String(colSpan)} falls back to 4`);
    assert.ok(!/--col-(?!\d)/.test(tag));
  }
});

test('F-039 L3: BentoCard renders badge, title, description and content only when given', async () => {
  const full = await renderSvelte('BentoCard', { badge: 'Metric', title: 'Latency', description: 'Sub-ms' }, { children: '<span class="kid">x</span>' });
  assert.match(full, /<div class="joy-bento-card__badge">Metric<\/div>\s*<h4 class="joy-bento-card__title">Latency<\/h4>\s*<p class="joy-bento-card__desc">Sub-ms<\/p>/);
  assert.match(full, /<div class="joy-bento-card__content">\s*<span class="kid">x<\/span>\s*<\/div>/);
  const bare = await renderSvelte('BentoCard', {});
  assert.ok(!/joy-bento-card__(badge|title|desc|content)/.test(bare));
});

test('F-039 L3: BentoGrid is a grid that renders children and stays empty without them', async () => {
  assert.match(await renderSvelte('BentoGrid', {}, { children: '<i>a</i>' }), /^<div class="joy-bento-grid\s*"><i>a<\/i><\/div>$/);
  assert.match(await renderSvelte('BentoGrid', {}), /^<div class="joy-bento-grid\s*"><\/div>$/);
});

test('F-039 L3: every twin forwards class and rest props to its root element (Svelte rest contract: SVELTE_REF_REST)', async () => {
  const extra = { class: 'extra', 'data-testid': 'root', id: 'r1' };
  const cases = {
    FeatureCard: await card(extra),
    FeatureGrid: await grid(extra),
    BentoCard: await renderSvelte('BentoCard', extra),
    BentoGrid: await renderSvelte('BentoGrid', extra)
  };
  for (const [name, markup] of Object.entries(cases)) {
    const root = openTag(markup);
    assert.match(root, /class="[^"]*\bextra"/, `${name} class`);
    assert.match(root, /data-testid="root"/, `${name} rest`);
    assert.match(root, /id="r1"/, `${name} id`);
  }
});

test('F-039 L3: ref is bound once per twin, on the root element, and writes the element back to the bindable prop', () => {
  const sentinel = { el: true };
  for (const name of NAMES) {
    const props = { title: 'T', description: 'D', children: () => {}, ref: null };
    const { binds, created } = runClient(name, props);
    assert.strictEqual(binds.length, 1, `${name} calls bind_this once`);
    assert.strictEqual(binds[0].el, created[0], `${name} binds the root element, not a descendant`);
    assert.ok(!binds[0].el.derived, `${name} root is a template node`);
    binds[0].setter(sentinel);
    assert.strictEqual(props.ref, sentinel, `${name} writes the element to ref`);
  }
});

test('F-039 L3: no inline style, hex colour or phantom colour token in any feature or bento markup', async () => {
  const markup = [
    await card({ icon: GLYPH, badge: snippet('New'), linkText: 'More', linkHref: '/x' }),
    await grid({}, '<i></i>'),
    await renderSvelte('BentoCard', { badge: 'b', title: 't', description: 'd', colSpan: 6 }, { children: '<i></i>' }),
    await renderSvelte('BentoGrid', {}, { children: '<i></i>' })
  ].join('');
  assert.ok(!/style=|#[0-9a-f]{3,8}\b|var\(--joy-color/i.test(markup.replace(/<svg\b[^>]*>/g, '')));
});
