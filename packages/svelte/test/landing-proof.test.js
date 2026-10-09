import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { createRawSnippet } from 'svelte';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L4: LogoCloud, StatsSection, TestimonialCard, FAQSection (Svelte twin). The React twin asserts the same
// expectations in packages/react/test/landing-proof.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props, opts) => (await renderRaw(name, props, opts)).replace(/<!--[\s\S]*?-->/g, '');
const snippet = (markup) => createRawSnippet(() => ({ render: () => markup }));
const openTag = (markup, first = /<(?:section|div)\b[^>]*>/) => markup.match(first)[0];
const NAMES = ['LogoCloud', 'StatsSection', 'TestimonialCard', 'FAQSection'];

const STATS = [
  { label: 'P99 latency', value: '4.2 us', description: 'Colocated', change: '-14%', trend: 'up' },
  { label: 'Uptime', value: '99.999%', change: '-2%', trend: 'down' },
  { label: 'Volume', value: 48, change: 'flat', trend: 'neutral' },
  { label: 'Chains', value: '14' }
];
const ITEMS = [
  { question: 'Is it fast?', answer: 'Yes.', defaultOpen: true },
  { question: 'Is it safe?', answer: 'Very.' },
  { question: 'Is it cheap?', answer: 'Free.' }
];
const LOGO = snippet('<svg class="glyph" width="24" height="24"></svg>');
const LOGOS = [{ name: 'Quantum', logo: LOGO }, { name: 'Orbit', logo: LOGO, href: 'https://example.com' }];

test('F-039 L4: Svelte proof files compile with zero warnings', () => {
  for (const name of NAMES) {
    assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), [], `${name} compiles without warnings`);
  }
});

// ---------------------------------------------------------------- LogoCloud

test('F-039 L4: LogoCloud title is a plain paragraph that names the section', async () => {
  const markup = await renderSvelte('LogoCloud', { title: 'Trusted by desks', logos: LOGOS });
  const id = markup.match(/<p class="joy-logo-cloud__title" id="([^"]+)">Trusted by desks<\/p>/)[1];
  assert.ok(openTag(markup).includes(`aria-labelledby="${id}"`), 'section is labelled by its title');
  const noTitle = await renderSvelte('LogoCloud', { logos: LOGOS });
  assert.ok(!/joy-logo-cloud__title|aria-labelledby/.test(noTitle), 'no title, no dangling label');
  const named = openTag(await renderSvelte('LogoCloud', { title: 'T', logos: LOGOS, 'aria-label': 'Partners' }));
  assert.ok(named.includes('aria-label="Partners"') && !named.includes('aria-labelledby'), 'a caller aria-label wins over the title label');
});

test('F-039 L4: LogoCloud gives every logo an accessible name and discloses the new tab on links', async () => {
  const markup = await renderSvelte('LogoCloud', { logos: LOGOS });
  assert.match(markup, /<div class="joy-logo-cloud__item" title="Quantum" role="img" aria-label="Quantum"><svg class="glyph"/);
  assert.match(markup, /<a href="https:\/\/example.com" class="joy-logo-cloud__item" title="Orbit" aria-label="Orbit \(opens in a new tab\)" target="_blank" rel="noreferrer noopener"><svg class="glyph"/);
  assert.strictEqual((markup.match(/joy-logo-cloud__item"/g) || []).length, 2, 'one item per logo');
  const raw = await renderSvelte('LogoCloud', { logos: [{ name: 'Raw', svgHtml: '<svg class="raw"></svg>' }] });
  assert.match(raw, /aria-label="Raw"><svg class="raw">/, 'svgHtml logos render inside the item');
});

// ---------------------------------------------------------------- StatsSection

test('F-039 L4: StatsSection renders every value inside .joy-stat-item__value with its label', async () => {
  const markup = await renderSvelte('StatsSection', { stats: STATS });
  const values = [...markup.matchAll(/<div class="joy-stat-item__value">([^<]*)<\/div>/g)].map((m) => m[1]);
  assert.deepStrictEqual(values, ['4.2 us', '99.999%', '48', '14']);
  assert.match(markup, /<div class="joy-stat-item__label">P99 latency<\/div>\s*<p class="joy-stat-item__desc">Colocated<\/p>/);
  assert.strictEqual((markup.match(/joy-stat-item__desc/g) || []).length, 1, 'description only when given');
  assert.strictEqual((markup.match(/<div class="joy-stat-item">/g) || []).length, 4);
});

test('F-039 L4: StatsSection change carries a tone class only for up and down, plus words for the trend', async () => {
  const markup = await renderSvelte('StatsSection', { stats: STATS });
  const changes = [...markup.matchAll(/<div class="(joy-stat-item__change[^"]*)">/g)].map((m) => m[1]);
  assert.deepStrictEqual(changes, [
    'joy-stat-item__change joy-stat-item__change--positive',
    'joy-stat-item__change joy-stat-item__change--negative',
    'joy-stat-item__change'
  ]);
  assert.match(markup, /<span class="joy-stat-item__sr">Trend up:<\/span>\s*<span class="joy-stat-item__change-text">-14%<\/span>/);
  assert.match(markup, /<span class="joy-stat-item__sr">Trend down:<\/span>\s*<span class="joy-stat-item__change-text">-2%<\/span>/);
  assert.strictEqual((markup.match(/joy-stat-item__sr/g) || []).length, 2, 'neutral trend adds no direction words');
  assert.strictEqual((markup.match(/<svg aria-hidden="true"/g) || []).length, 2, 'trend arrows are decorative');
});

// F-039 T1 fix round 2: text-overflow does not apply to an inline-flex pill, so the change text lives in its own span
// (`joy-stat-item__change-text`, which the CSS lets wrap, never clip) and the direction words stay outside it. No title/aria-label copy of
// the text: the words are already in the DOM, so a second name would be announced twice.
test('F-039 T1: the change text sits inside .joy-stat-item__change-text, direction words and caret stay outside it', async () => {
  const markup = await renderSvelte('StatsSection', { stats: STATS });
  const pills = [...markup.matchAll(/<div class="joy-stat-item__change[^"]*">([\s\S]*?)<\/div>/g)].map((m) => m[1]);
  assert.strictEqual(pills.length, 3);
  const texts = pills.map((pill) => (pill.match(/<span class="joy-stat-item__change-text">([^<]*)<\/span>/) || [])[1]);
  assert.deepStrictEqual(texts, ['-14%', '-2%', 'flat'], 'every change (also the neutral one) is wrapped');
  for (const pill of pills) {
    assert.ok(!/change-text">[^<]*<(svg|span)/.test(pill), 'the inner span holds text only');
    assert.ok(!/title=|aria-label=/.test(pill), 'no duplicated accessible name');
  }
  assert.match(pills[0], /<svg[\s\S]*<\/svg>\s*<span class="joy-stat-item__sr">Trend up:<\/span>\s*<span class="joy-stat-item__change-text">/);
});

// ---------------------------------------------------------------- TestimonialCard

const testimonial = (props = {}) => renderSvelte('TestimonialCard', { quote: 'Great', authorName: 'Ada Lovelace', ...props });
const starCount = (markup) => (markup.match(/<svg\b[^>]*viewBox="0 0 24 24"[^>]*fill="currentColor"/g) || []).length;

test('F-039 L4: TestimonialCard renders 5 stars for rating 5 (the default) inside a labelled image', async () => {
  for (const props of [{ rating: 5 }, {}]) {
    const markup = await testimonial(props);
    assert.strictEqual(starCount(markup), 5);
    assert.match(markup, /<div class="joy-testimonial-card__stars" role="img" aria-label="Rated 5 out of 5">/);
  }
});

test('F-039 L4: TestimonialCard rating is a whole number from 0 to 5 and 0 renders no star row', async () => {
  const cases = [[3, 3], [1, 1], [2.6, 3], [9, 5], [-2, 0], [0, 0], [NaN, 0], ['4', 4]];
  for (const [rating, expected] of cases) {
    const markup = await testimonial({ rating });
    assert.strictEqual(starCount(markup), expected, `rating=${String(rating)}`);
    assert.strictEqual(markup.includes('joy-testimonial-card__stars'), expected > 0);
    if (expected > 0) assert.ok(markup.includes(`aria-label="Rated ${expected} out of 5"`));
  }
});

test('F-039 L4: TestimonialCard has no inline style carrying a colour (the avatar is styled by CSS only)', async () => {
  const markup = await testimonial({ authorRole: 'CTO', avatarInitials: 'AL' });
  assert.ok(!/style=/.test(markup.replace(/<svg\b[^>]*>/g, '')), markup);
  assert.ok(!/var\(|#[0-9a-f]{3,8}\b|7c3aed/i.test(markup));
  assert.match(markup, /<div class="joy-avatar joy-avatar--circle joy-avatar--md"><span class="joy-avatar__fallback" aria-hidden="true">AL<\/span><\/div>/);
});

test('F-039 L4: TestimonialCard initials fall back to the first two letters, and an avatar image is decorative', async () => {
  assert.match(await testimonial(), /joy-avatar__fallback" aria-hidden="true">AD<\/span>/);
  const withImage = await testimonial({ avatarSrc: '/ada.png', authorRole: 'CTO' });
  assert.match(withImage, /<img class="joy-avatar__image" src="\/ada.png" alt=""\s*\/?>/, 'the name is right next to it in text');
  assert.ok(!withImage.includes('joy-avatar__fallback'));
  assert.match(withImage, /<h6>Ada Lovelace<\/h6>\s*<p>CTO<\/p>/);
  assert.ok(!(await testimonial()).includes('<p>'), 'no role, no role paragraph');
});

test('F-039 G1: TestimonialCard initials never split a surrogate pair', async () => {
  const initialsOf = (markup) => markup.match(/joy-avatar__fallback" aria-hidden="true">([^<]*)<\/span>/)[1];
  const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
  // U+20BB7 (a CJK letter outside the BMP) and U+1D400 (mathematical bold A) are each two UTF-16 code units
  for (const name of ['\u{20BB7}\u{91CE}\u{5BB6}', 'a\u{20BB7}', '\u{1D400}\u{1D401}\u{1D402}']) {
    const initials = initialsOf(await testimonial({ authorName: name }));
    assert.ok(!loneSurrogate.test(initials), `no lone surrogate in initials of ${JSON.stringify(name)}: ${JSON.stringify(initials)}`);
    assert.strictEqual(Array.from(initials).length, 2, `two whole code points for ${JSON.stringify(name)}: ${JSON.stringify(initials)}`);
  }
  assert.strictEqual(initialsOf(await testimonial({ authorName: '\u{20BB7}\u{91CE}\u{5BB6}' })), '\u{20BB7}\u{91CE}');
  assert.strictEqual(initialsOf(await testimonial({ authorName: 'ada lovelace' })), 'AD', 'BMP names keep the two-letter uppercase behaviour');
});

// ---------------------------------------------------------------- FAQSection

const faq = (props = {}) => renderSvelte('FAQSection', { items: ITEMS, ...props });
const triggers = (markup) => [...markup.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);

test('F-039 L4: FAQSection SSR marks only defaultOpen items aria-expanded="true" and hides the rest', async () => {
  const markup = await faq();
  assert.deepStrictEqual(triggers(markup).map((t) => t.match(/aria-expanded="(\w+)"/)[1]), ['true', 'false', 'false']);
  const contents = [...markup.matchAll(/<div\b[^>]*class="joy-faq-item__content"[^>]*>/g)].map((m) => /\shidden(=|\s|>)/.test(m[0]));
  assert.deepStrictEqual(contents, [false, true, true], 'closed answers are hidden, the open one is not');
  assert.deepStrictEqual([...markup.matchAll(/joy-faq-item( joy-faq-item--open)?"/g)].map((m) => Boolean(m[1])), [true, false, false]);
  assert.ok(!/aria-expanded="true"/.test(await faq({ items: ITEMS.map((i) => ({ ...i, defaultOpen: false })) })));
});

test('F-039 L4: FAQSection trigger is a real button that controls an answer which always exists', async () => {
  const markup = await faq();
  for (const trigger of triggers(markup)) {
    assert.match(trigger, /^<button type="button" id="[^"]+" aria-expanded="(true|false)" aria-controls="[^"]+" class="joy-faq-item__trigger">$/);
    const controls = trigger.match(/aria-controls="([^"]+)"/)[1];
    const id = trigger.match(/ id="([^"]+)"/)[1];
    assert.match(markup, new RegExp(`<div id="${controls}" role="region" aria-labelledby="${id}" class="joy-faq-item__content"`), 'aria-controls resolves, also when closed');
  }
  assert.strictEqual(new Set([...markup.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])).size, 6, 'every id is unique');
});

test('F-039 L4: FAQSection chevron is an @montionugera/joy-icons icon inside the rotating wrapper, and the title is sentence case', async () => {
  const markup = await faq();
  assert.strictEqual((markup.match(/<span class="joy-faq-item__icon" aria-hidden="true"><svg [^>]*><polyline points="6 9 12 15 18 9">/g) || []).length, 3);
  assert.match(markup, /<h2 class="joy-faq-section__title">Frequently asked questions<\/h2>/);
  assert.ok(!markup.includes('&bull;') && !/·/.test(markup));
  assert.ok(!(await faq({ title: '', subtitle: '' })).includes('joy-faq-section__header'));
});

// Behaviour without a DOM: evaluate the compiled CLIENT component against a small stand-in for svelte/internal/client.
// Every element created from a template is a distinct tagged node (created[0] is the root); child/sibling lookups return
// separate `derived` nodes. The stand-in has real (tiny) signals, so a click handler that writes state changes what the
// recorded template effects then write to the nodes, and the tests re-run those effects and read the attributes back.
// It records WHICH node each delegated handler and each bind:this setter is attached to.
const libFile = (name) => fileURLToPath(new URL(`../src/lib/${name}.svelte`, import.meta.url));
const clientCode = new Map();
const clientCodeFor = (name) => {
  if (!clientCode.has(name)) {
    clientCode.set(name, compile(fs.readFileSync(libFile(name), 'utf8'), { generate: 'client', filename: libFile(name) }).js.code
      .replace(/^import .*$/gm, '')
      .replace('export default function', 'function'));
  }
  return clientCode.get(name);
};
function runClient(name, props, { propsId = 'uid' } = {}) {
  const code = clientCodeFor(name);
  const created = [];
  const delegated = [];
  const binds = [];
  const effects = [];
  const touched = new Set();
  const noop = () => noop;
  const derivedNode = (parent) => ({ derived: true, parent, attrs: {} });
  const $ = new Proxy({}, {
    get: (_, key) => {
      switch (key) {
        case 'from_html': return (html) => () => { const node = { html, attrs: {} }; created.push(node); return node; };
        case 'child':
        case 'sibling':
        case 'first_child':
        case 'only_child': return derivedNode;
        case 'prop': return (p, k, _flags, fallback) => (...args) => (args.length ? (p[k] = args[0]) : (p[k] === undefined ? fallback : p[k]));
        case 'rest_props': return () => ({});
        case 'props_id': return () => propsId;
        case 'state': return (v) => ({ v });
        case 'set': return (s, v) => { s.v = v; };
        case 'derived': return (fn) => ({ fn });
        case 'get': return (d) => (d.fn ? d.fn() : d.v);
        case 'template_effect': return (fn) => { effects.push(fn); fn(); };
        case 'attribute_effect': return (el, fn) => { el.spread = fn(); touched.add(el); };
        case 'set_attribute': return (el, attr, value) => { el.attrs[attr] = value; touched.add(el); };
        case 'each': return (_node, _flags, items, _key, render) => { items().forEach((value, i) => render({}, { fn: () => value }, i)); };
        case 'if': return (_node, render) => render((branch) => branch({}));
        case 'delegated': return (event, el, handler) => { delegated.push({ event, el, handler }); };
        case 'bind_this': return (el, setter) => { binds.push({ el, setter }); };
        default: return noop;
      }
    }
  });
  new Function('$', 'props', 'ChevronDown', `${code}\nreturn ${name}({}, props);`)($, props, noop);
  return { created, delegated, binds, touched, rerun: () => effects.forEach((fn) => fn()) };
}

test('F-039 L4: the click handler is on each FAQ trigger button (the node that carries aria-expanded), and toggling flips state', () => {
  const run = runClient('FAQSection', { items: ITEMS });
  assert.strictEqual(run.delegated.length, 3, 'one delegated click handler per item');
  run.delegated.forEach((d, i) => {
    assert.strictEqual(d.event, 'click');
    assert.ok(d.el.attrs['aria-expanded'] !== undefined && d.el.attrs['aria-controls'], 'the handler is on the node that carries aria-expanded and aria-controls');
    assert.ok(d.el.attrs.id.endsWith(`-trigger-${i}`), 'and on the trigger of item ' + i);
  });
  const expanded = () => run.delegated.map((d) => d.el.attrs['aria-expanded']);
  const hidden = () => [...run.touched].filter((n) => n.attrs.hidden !== undefined).map((n) => n.attrs.hidden);
  assert.deepStrictEqual(expanded(), [true, false, false]);
  assert.deepStrictEqual(hidden(), [false, true, true]);
  run.delegated[1].handler();
  run.rerun();
  assert.deepStrictEqual(expanded(), [false, true, false], 'opening one closes the default-open one');
  assert.deepStrictEqual(hidden(), [true, false, true]);
  run.delegated[1].handler();
  run.rerun();
  assert.deepStrictEqual(expanded(), [false, false, false], 'clicking the open one closes it');
  run.delegated[0].handler();
  run.rerun();
  assert.deepStrictEqual(expanded(), [true, false, false]);
});

test('F-039 L4: FAQ ids are built from the per-instance $props.id(), so two sections never share an id, and each trigger controls its own answer', () => {
  const a = runClient('FAQSection', { items: ITEMS }, { propsId: 'idA' });
  const b = runClient('FAQSection', { items: ITEMS }, { propsId: 'idB' });
  const all = new Set();
  for (const [run, prefix] of [[a, 'idA'], [b, 'idB']]) {
    const panels = [...run.touched].filter((n) => n.attrs['aria-labelledby'] !== undefined);
    assert.strictEqual(panels.length, 3);
    for (const d of run.delegated) {
      const { id, 'aria-controls': controls } = d.el.attrs;
      assert.ok(id.startsWith(prefix) && controls.startsWith(prefix), `${id} / ${controls} carry the instance prefix`);
      const panel = panels.find((n) => n.attrs.id === controls);
      assert.ok(panel, 'aria-controls resolves to a panel of the same instance');
      assert.strictEqual(panel.attrs['aria-labelledby'], id, 'and that panel is labelled by this trigger');
      all.add(id).add(controls);
    }
  }
  assert.strictEqual(all.size, 12, 'no id is shared between the two instances');
});

test('F-039 L4: LogoCloud title id is scoped per instance and the section is labelled by its own title', () => {
  const ids = ['idA', 'idB'].map((propsId) => {
    const run = runClient('LogoCloud', { title: 'Trusted', logos: LOGOS }, { propsId });
    const section = run.created[0];
    const title = [...run.touched].find((n) => n.attrs.id !== undefined && n.attrs.id.includes('title'));
    assert.ok(title, 'the title paragraph gets an id');
    assert.ok(title.attrs.id.includes(propsId), 'built from the instance id');
    assert.strictEqual(section.spread['aria-labelledby'], title.attrs.id, 'the section is labelled by its own title');
    return title.attrs.id;
  });
  assert.notStrictEqual(ids[0], ids[1]);
});

// PINNED LIMITATION: the reader's open/closed choice is stored by index. Before any click the open items follow
// `defaultOpen` of the current items; after a click the same positions stay open even if `items` is reordered.
test('F-039 L4: FAQ open state follows defaultOpen until the first click, then is pinned by index', () => {
  const props = { items: ITEMS };
  const run = runClient('FAQSection', props);
  const expanded = () => run.delegated.map((d) => d.el.attrs['aria-expanded']);
  assert.deepStrictEqual(expanded(), [true, false, false]);
  props.items = [{ ...ITEMS[1], defaultOpen: true }, { ...ITEMS[0], defaultOpen: false }, ITEMS[2]];
  run.rerun();
  assert.deepStrictEqual(expanded(), [true, false, false], 'no click yet: follows the new defaultOpen (position 0)');
  props.items = [ITEMS[1], ITEMS[2], ITEMS[0]];
  run.rerun();
  assert.deepStrictEqual(expanded(), [false, false, true], 'no click yet: follows the new defaultOpen (position 2)');
  run.delegated[1].handler();
  props.items = [ITEMS[2], ITEMS[1], ITEMS[0]];
  run.rerun();
  assert.deepStrictEqual(expanded(), [false, true, false], 'after a click the same index stays open whatever now sits there');
});

test('F-039 L4: allowMultiple keeps other items open and toggles each independently', () => {
  const run = runClient('FAQSection', { items: ITEMS, allowMultiple: true });
  const expanded = () => run.delegated.map((d) => d.el.attrs['aria-expanded']);
  run.delegated[2].handler();
  run.rerun();
  assert.deepStrictEqual(expanded(), [true, false, true]);
  run.delegated[0].handler();
  run.rerun();
  assert.deepStrictEqual(expanded(), [false, false, true]);
});

test('F-039 L4: StatsSection accepts an accessible name from the caller (no fixed English label baked in)', async () => {
  const root = openTag(await renderSvelte('StatsSection', { stats: STATS, 'aria-label': 'Key metrics' }));
  assert.match(root, /aria-label="Key metrics"/);
  assert.ok(!openTag(await renderSvelte('StatsSection', { stats: STATS })).includes('aria-label'), 'unnamed by default');
});

test('F-039 L4: ref is bound once per twin, on the root element, and writes the element back to the bindable prop', () => {
  const sentinel = { el: true };
  const propsFor = {
    LogoCloud: { logos: LOGOS },
    StatsSection: { stats: STATS },
    TestimonialCard: { quote: 'q', authorName: 'An' },
    FAQSection: { items: ITEMS }
  };
  for (const name of NAMES) {
    const props = { ...propsFor[name], ref: null };
    const { binds, created } = runClient(name, props);
    assert.strictEqual(binds.length, 1, `${name} calls bind_this once`);
    assert.strictEqual(binds[0].el, created[0], `${name} binds the root element, not a descendant`);
    assert.ok(!binds[0].el.derived, `${name} root is a template node`);
    binds[0].setter(sentinel);
    assert.strictEqual(props.ref, sentinel, `${name} writes the element to ref`);
  }
});

// ---------------------------------------------------------------- shared contracts

test('F-039 L4: every twin forwards class and rest props to its root element (Svelte rest contract: SVELTE_REF_REST)', async () => {
  const extra = { class: 'extra', 'data-testid': 'root', id: 'r1' };
  const cases = {
    LogoCloud: await renderSvelte('LogoCloud', { logos: LOGOS, ...extra }),
    StatsSection: await renderSvelte('StatsSection', { stats: STATS, ...extra }),
    TestimonialCard: await testimonial(extra),
    FAQSection: await faq(extra)
  };
  for (const [name, markup] of Object.entries(cases)) {
    const root = openTag(markup);
    assert.match(root, /class="[^"]*\bextra"/, `${name} class`);
    assert.match(root, /data-testid="root"/, `${name} rest`);
    assert.match(root, /id="r1"/, `${name} id`);
  }
});

test('F-039 L4: no phantom colour token, hex literal or middle dot in any proof markup', async () => {
  const markup = [
    await renderSvelte('LogoCloud', { title: 'T', logos: LOGOS }),
    await renderSvelte('StatsSection', { stats: STATS }),
    await testimonial({ authorRole: 'CTO' }),
    await faq()
  ].join('');
  assert.ok(!/#[0-9a-f]{3,8}\b|var\(--joy-color|&bull;|·/i.test(markup.replace(/<svg\b[^>]*>/g, '')));
});

// F-039 F1 (final review A): the default subtitle follows the same plain-copy rule as the other landing defaults.
test('F-039 F1: FAQSection default subtitle has no word over 12 characters', async () => {
  const subtitle = (await faq()).match(/<p class="joy-faq-section__subtitle">([^<]*)<\/p>/)[1];
  const long = subtitle.split(/\s+/).map((w) => w.replace(/[^a-z]/gi, '')).filter((w) => w.length > 12);
  assert.deepStrictEqual(long, [], `words over 12 characters in "${subtitle}"`);
});
