import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L4: LogoCloud, StatsSection, TestimonialCard, FAQSection (React twin). The Svelte twin asserts the same
// expectations in packages/svelte/test/landing-proof.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { LogoCloud } = loadComponent('LogoCloud');
const { StatsSection } = loadComponent('StatsSection');
const { TestimonialCard } = loadComponent('TestimonialCard');
const { FAQSection } = loadComponent('FAQSection');
const h = React.createElement;
const html = (C, props, ...children) => renderToStaticMarkup(h(C, props, ...children));
const openTag = (markup, first = /<(?:section|div)\b[^>]*>/) => markup.match(first)[0];
const ALL = { LogoCloud, StatsSection, TestimonialCard, FAQSection };

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
const LOGO = h('svg', { className: 'glyph', width: 24, height: 24 });
const LOGOS = [{ name: 'Quantum', logo: LOGO }, { name: 'Orbit', logo: LOGO, href: 'https://example.com' }];

test('F-039 L4: React proof twins are forwardRef components', () => {
  for (const [name, C] of Object.entries(ALL)) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${name} must be a forwardRef component`);
  }
});

// ---------------------------------------------------------------- LogoCloud

test('F-039 L4: LogoCloud title is a plain paragraph that names the section', () => {
  const markup = html(LogoCloud, { title: 'Trusted by desks', logos: LOGOS });
  const id = markup.match(/<p class="joy-logo-cloud__title" id="([^"]+)">Trusted by desks<\/p>/)[1];
  assert.ok(openTag(markup).includes(`aria-labelledby="${id}"`), 'section is labelled by its title');
  const noTitle = html(LogoCloud, { logos: LOGOS });
  assert.ok(!/joy-logo-cloud__title|aria-labelledby/.test(noTitle), 'no title, no dangling label');
  const named = openTag(html(LogoCloud, { title: 'T', logos: LOGOS, 'aria-label': 'Partners' }));
  assert.ok(named.includes('aria-label="Partners"') && !named.includes('aria-labelledby'), 'a caller aria-label wins over the title label');
});

test('F-039 L4: LogoCloud gives every logo an accessible name and discloses the new tab on links', () => {
  const markup = html(LogoCloud, { logos: LOGOS });
  assert.match(markup, /<div class="joy-logo-cloud__item" title="Quantum" role="img" aria-label="Quantum"><svg class="glyph"/);
  assert.match(markup, /<a href="https:\/\/example.com" class="joy-logo-cloud__item" title="Orbit" aria-label="Orbit \(opens in a new tab\)" target="_blank" rel="noreferrer noopener"><svg class="glyph"/);
  assert.strictEqual((markup.match(/joy-logo-cloud__item"/g) || []).length, 2, 'one item per logo');
});

// ---------------------------------------------------------------- StatsSection

test('F-039 L4: StatsSection renders every value inside .joy-stat-item__value with its label', () => {
  const markup = html(StatsSection, { stats: STATS });
  const values = [...markup.matchAll(/<div class="joy-stat-item__value">([^<]*)<\/div>/g)].map((m) => m[1]);
  assert.deepStrictEqual(values, ['4.2 us', '99.999%', '48', '14']);
  assert.match(markup, /<div class="joy-stat-item__label">P99 latency<\/div><p class="joy-stat-item__desc">Colocated<\/p>/);
  assert.strictEqual((markup.match(/joy-stat-item__desc/g) || []).length, 1, 'description only when given');
  assert.strictEqual((markup.match(/<div class="joy-stat-item">/g) || []).length, 4);
});

test('F-039 L4: StatsSection change carries a tone class only for up and down, plus words for the trend', () => {
  const markup = html(StatsSection, { stats: STATS });
  const changes = [...markup.matchAll(/<div class="(joy-stat-item__change[^"]*)">/g)].map((m) => m[1]);
  assert.deepStrictEqual(changes, [
    'joy-stat-item__change joy-stat-item__change--positive',
    'joy-stat-item__change joy-stat-item__change--negative',
    'joy-stat-item__change'
  ]);
  assert.match(markup, /<span class="joy-stat-item__sr">Trend up:<\/span><span class="joy-stat-item__change-text">-14%<\/span>/);
  assert.match(markup, /<span class="joy-stat-item__sr">Trend down:<\/span><span class="joy-stat-item__change-text">-2%<\/span>/);
  assert.strictEqual((markup.match(/joy-stat-item__sr/g) || []).length, 2, 'neutral trend adds no direction words');
  assert.strictEqual((markup.match(/<svg aria-hidden="true"/g) || []).length, 2, 'trend arrows are decorative');
});

// F-039 T1 fix round 2: text-overflow does not apply to an inline-flex pill, so the change text lives in its own span
// (`joy-stat-item__change-text`, which the CSS lets wrap, never clip) and the direction words stay outside it. No title/aria-label copy of
// the text: the words are already in the DOM, so a second name would be announced twice.
test('F-039 T1: the change text sits inside .joy-stat-item__change-text, direction words and caret stay outside it', () => {
  const markup = html(StatsSection, { stats: STATS });
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

const testimonial = (props = {}) => html(TestimonialCard, { quote: 'Great', authorName: 'Ada Lovelace', ...props });
const starCount = (markup) => (markup.match(/<svg\b[^>]*viewBox="0 0 24 24"[^>]*fill="currentColor"/g) || []).length;

test('F-039 L4: TestimonialCard renders 5 stars for rating 5 (the default) inside a labelled image', () => {
  for (const props of [{ rating: 5 }, {}]) {
    const markup = testimonial(props);
    assert.strictEqual(starCount(markup), 5);
    assert.match(markup, /<div class="joy-testimonial-card__stars" role="img" aria-label="Rated 5 out of 5">/);
  }
});

test('F-039 L4: TestimonialCard rating is a whole number from 0 to 5 and 0 renders no star row', () => {
  const cases = [[3, 3], [1, 1], [2.6, 3], [9, 5], [-2, 0], [0, 0], [NaN, 0], ['4', 4]];
  for (const [rating, expected] of cases) {
    const markup = testimonial({ rating });
    assert.strictEqual(starCount(markup), expected, `rating=${String(rating)}`);
    assert.strictEqual(markup.includes('joy-testimonial-card__stars'), expected > 0);
    if (expected > 0) assert.ok(markup.includes(`aria-label="Rated ${expected} out of 5"`));
  }
});

test('F-039 L4: TestimonialCard has no inline style carrying a colour (the avatar is styled by CSS only)', () => {
  const markup = testimonial({ authorRole: 'CTO', avatarInitials: 'AL' });
  assert.ok(!/style=/.test(markup.replace(/<svg\b[^>]*>/g, '')), markup);
  assert.ok(!/var\(|#[0-9a-f]{3,8}\b|7c3aed/i.test(markup));
  assert.match(markup, /<div class="joy-avatar joy-avatar--circle joy-avatar--md"><span class="joy-avatar__fallback" aria-hidden="true">AL<\/span><\/div>/);
});

test('F-039 L4: TestimonialCard initials fall back to the first two letters, and an avatar image is decorative', () => {
  assert.match(testimonial(), /joy-avatar__fallback" aria-hidden="true">AD<\/span>/);
  const withImage = testimonial({ avatarSrc: '/ada.png', authorRole: 'CTO' });
  assert.match(withImage, /<img class="joy-avatar__image" src="\/ada.png" alt=""\/>/, 'the name is right next to it in text');
  assert.ok(!withImage.includes('joy-avatar__fallback'));
  assert.match(withImage, /<h6>Ada Lovelace<\/h6><p>CTO<\/p>/);
  assert.ok(!testimonial().includes('<p>'), 'no role, no role paragraph');
});

test('F-039 G1: TestimonialCard initials never split a surrogate pair', () => {
  const initialsOf = (markup) => markup.match(/joy-avatar__fallback" aria-hidden="true">([^<]*)<\/span>/)[1];
  const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
  // U+20BB7 (a CJK letter outside the BMP) and U+1D400 (mathematical bold A) are each two UTF-16 code units
  for (const name of ['\u{20BB7}\u{91CE}\u{5BB6}', 'a\u{20BB7}', '\u{1D400}\u{1D401}\u{1D402}']) {
    const initials = initialsOf(testimonial({ authorName: name }));
    assert.ok(!loneSurrogate.test(initials), `no lone surrogate in initials of ${JSON.stringify(name)}: ${JSON.stringify(initials)}`);
    assert.strictEqual(Array.from(initials).length, 2, `two whole code points for ${JSON.stringify(name)}: ${JSON.stringify(initials)}`);
  }
  assert.strictEqual(initialsOf(testimonial({ authorName: '\u{20BB7}\u{91CE}\u{5BB6}' })), '\u{20BB7}\u{91CE}');
  assert.strictEqual(initialsOf(testimonial({ authorName: 'ada lovelace' })), 'AD', 'BMP names keep the two-letter uppercase behaviour');
});

// ---------------------------------------------------------------- FAQSection

const faq = (props = {}) => html(FAQSection, { items: ITEMS, ...props });
const triggers = (markup) => [...markup.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);

test('F-039 L4: FAQSection SSR marks only defaultOpen items aria-expanded="true" and hides the rest', () => {
  const markup = faq();
  assert.deepStrictEqual(triggers(markup).map((t) => t.match(/aria-expanded="(\w+)"/)[1]), ['true', 'false', 'false']);
  const contents = [...markup.matchAll(/<div\b[^>]*class="joy-faq-item__content"[^>]*>/g)].map((m) => /\shidden(=|\s|>)/.test(m[0]));
  assert.deepStrictEqual(contents, [false, true, true], 'closed answers are hidden, the open one is not');
  assert.deepStrictEqual([...markup.matchAll(/joy-faq-item( joy-faq-item--open)?"/g)].map((m) => Boolean(m[1])), [true, false, false]);
  assert.ok(!/aria-expanded="true"/.test(faq({ items: ITEMS.map((i) => ({ ...i, defaultOpen: false })) })));
});

test('F-039 L4: FAQSection trigger is a real button that controls an answer which always exists', () => {
  const markup = faq();
  for (const trigger of triggers(markup)) {
    assert.match(trigger, /^<button type="button" id="[^"]+" aria-expanded="(true|false)" aria-controls="[^"]+" class="joy-faq-item__trigger">$/);
    const controls = trigger.match(/aria-controls="([^"]+)"/)[1];
    const id = trigger.match(/ id="([^"]+)"/)[1];
    assert.match(markup, new RegExp(`<div id="${controls}" role="region" aria-labelledby="${id}" class="joy-faq-item__content"`), 'aria-controls resolves, also when closed');
  }
  assert.strictEqual(new Set([...markup.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])).size, 6, 'every id is unique');
});

test('F-039 L4: FAQSection ids are scoped per instance, so two sections on one page do not collide', () => {
  const both = renderToStaticMarkup(h('div', null, h(FAQSection, { items: ITEMS }), h(FAQSection, { items: ITEMS })));
  const ids = [...both.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(ids.length, 12);
  assert.strictEqual(new Set(ids).size, 12);
});

test('F-039 L4: FAQSection chevron is an @joymify/icons icon inside the rotating wrapper, and the title is sentence case', () => {
  const markup = faq();
  assert.strictEqual((markup.match(/<span class="joy-faq-item__icon" aria-hidden="true"><svg [^>]*><polyline points="6 9 12 15 18 9">/g) || []).length, 3);
  assert.match(markup, /<h2 class="joy-faq-section__title">Frequently asked questions<\/h2>/);
  assert.ok(!markup.includes('&bull;') && !/·/.test(markup));
  assert.ok(!faq({ title: '', subtitle: '' }).includes('joy-faq-section__header'));
});

// Behaviour without a DOM: React hooks are driven by a tiny dispatcher that keeps state between renders, and the test
// clicks the real trigger's onClick from the element tree (no jsdom is available in this repo).
const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function mount(C, props, ref = null) {
  const slots = [];
  return {
    setProps(next) { props = next; },
    render() {
      let cursor = 0;
      const previous = internals.H;
      internals.H = {
        useState(initial) {
          const k = cursor++;
          if (!(k in slots)) slots[k] = typeof initial === 'function' ? initial() : initial;
          return [slots[k], (value) => { slots[k] = typeof value === 'function' ? value(slots[k]) : value; }];
        },
        useId: () => ':t:'
      };
      try { return C.render(props, ref); } finally { internals.H = previous; }
    }
  };
}
const findAll = (node, pred, found = []) => {
  if (Array.isArray(node)) node.forEach((n) => findAll(n, pred, found));
  else if (node && typeof node === 'object' && node.props) {
    if (pred(node)) found.push(node);
    findAll(node.props.children, pred, found);
  }
  return found;
};
const buttons = (tree) => findAll(tree, (n) => n.type === 'button');
const expanded = (tree) => buttons(tree).map((b) => b.props['aria-expanded']);
const hiddenContent = (tree) => findAll(tree, (n) => n.props.className === 'joy-faq-item__content').map((n) => n.props.hidden);

test('F-039 L4: clicking a FAQ trigger toggles aria-expanded and hidden; single mode closes the others', () => {
  const app = mount(FAQSection, { items: ITEMS });
  assert.deepStrictEqual(expanded(app.render()), [true, false, false]);
  buttons(app.render())[1].props.onClick();
  let tree = app.render();
  assert.deepStrictEqual(expanded(tree), [false, true, false], 'opening one closes the default-open one');
  assert.deepStrictEqual(hiddenContent(tree), [true, false, true]);
  buttons(tree)[1].props.onClick();
  assert.deepStrictEqual(expanded(app.render()), [false, false, false], 'clicking the open one closes it');
  buttons(app.render())[0].props.onClick();
  tree = app.render();
  assert.deepStrictEqual(expanded(tree), [true, false, false]);
  assert.deepStrictEqual(hiddenContent(tree), [false, true, true]);
});

test('F-039 L4: allowMultiple keeps other items open and toggles each independently', () => {
  const app = mount(FAQSection, { items: ITEMS, allowMultiple: true });
  buttons(app.render())[2].props.onClick();
  assert.deepStrictEqual(expanded(app.render()), [true, false, true]);
  buttons(app.render())[0].props.onClick();
  assert.deepStrictEqual(expanded(app.render()), [false, false, true]);
});

test('F-039 L4: every trigger carries its own click handler (the wiring is on the button, per item)', () => {
  const tree = mount(FAQSection, { items: ITEMS }).render();
  const list = buttons(tree);
  assert.strictEqual(list.length, 3);
  for (const b of list) assert.strictEqual(typeof b.props.onClick, 'function');
  assert.strictEqual(new Set(list.map((b) => b.props.onClick)).size, 3, 'a separate closure per item');
});

// ---------------------------------------------------------------- shared contracts

test('F-039 L4: LogoCloud title ids are scoped per instance and each section points at its own title', () => {
  const both = renderToStaticMarkup(h('div', null, h(LogoCloud, { title: 'A', logos: [] }), h(LogoCloud, { title: 'B', logos: [] })));
  const titles = [...both.matchAll(/<section[^>]*aria-labelledby="([^"]+)"[^>]*><p class="joy-logo-cloud__title" id="([^"]+)">/g)];
  assert.strictEqual(titles.length, 2);
  for (const [, labelledby, id] of titles) assert.strictEqual(labelledby, id, 'the label points at its own title');
  assert.notStrictEqual(titles[0][2], titles[1][2], 'two clouds on one page do not share a title id');
});

test('F-039 L4: FAQ trigger and answer ids point at each other inside each of two instances', () => {
  const both = renderToStaticMarkup(h('div', null, h(FAQSection, { items: ITEMS }), h(FAQSection, { items: ITEMS })));
  const sections = both.split('<section').slice(1);
  assert.strictEqual(sections.length, 2);
  const seen = new Set();
  for (const section of sections) {
    for (const [, controls] of section.matchAll(/aria-controls="([^"]+)"/g)) {
      assert.ok(section.includes(`<div id="${controls}"`), 'aria-controls resolves inside its own section');
      assert.ok(!seen.has(controls), 'and no other section uses that id');
      seen.add(controls);
    }
  }
  assert.strictEqual(seen.size, 6);
});

test('F-039 L4: list keys are unique even when content repeats (index-composite, so not stable across reorders)', () => {
  const dupe = [{ question: 'Same?', answer: 'a' }, { question: 'Same?', answer: 'b' }];
  const keysOf = (tree, pred) => findAll(tree, pred).map((n) => n.key);
  const faqKeys = keysOf(mount(FAQSection, { items: dupe }).render(), (n) => typeof n.props.className === 'string' && n.props.className.startsWith('joy-faq-item'));
  const faqItems = faqKeys.filter((k) => k !== null);
  assert.strictEqual(faqItems.length, 2);
  assert.strictEqual(new Set(faqItems).size, 2, 'FAQ keys');
  const statKeys = keysOf(StatsSection.render({ stats: [{ label: 'X', value: 1 }, { label: 'X', value: 2 }] }, null), (n) => n.props.className === 'joy-stat-item');
  assert.strictEqual(new Set(statKeys).size, 2, 'stat keys');
  const logoKeys = keysOf(mount(LogoCloud, { logos: [{ name: 'Same', logo: LOGO }, { name: 'Same', logo: LOGO }] }).render(), (n) => n.props.className === 'joy-logo-cloud__item');
  assert.strictEqual(new Set(logoKeys).size, 2, 'logo keys');
});

// PINNED LIMITATION: the reader's open/closed choice is stored by index. Before any click the open items follow
// `defaultOpen` of the current items; after a click the same positions stay open even if `items` is reordered.
test('F-039 L4: FAQ open state follows defaultOpen until the first click, then is pinned by index', () => {
  const app = mount(FAQSection, { items: ITEMS });
  assert.deepStrictEqual(expanded(app.render()), [true, false, false]);
  app.setProps({ items: [{ ...ITEMS[1], defaultOpen: true }, { ...ITEMS[0], defaultOpen: false }, ITEMS[2]] });
  assert.deepStrictEqual(expanded(app.render()), [true, false, false], 'no click yet: it follows the new defaultOpen (position 0)');
  app.setProps({ items: [ITEMS[1], ITEMS[2], ITEMS[0]] });
  assert.deepStrictEqual(expanded(app.render()), [false, false, true], 'no click yet: it follows the new defaultOpen (position 2)');
  buttons(app.render())[1].props.onClick();
  app.setProps({ items: [ITEMS[2], ITEMS[1], ITEMS[0]] });
  assert.deepStrictEqual(expanded(app.render()), [false, true, false], 'after a click the same index stays open whatever now sits there');
});

test('F-039 L4: every twin forwards className and rest props to its root element', () => {
  const extra = { className: 'extra', 'data-testid': 'root', id: 'r1' };
  const cases = {
    LogoCloud: html(LogoCloud, { logos: LOGOS, ...extra }),
    StatsSection: html(StatsSection, { stats: STATS, ...extra }),
    TestimonialCard: testimonial(extra),
    FAQSection: faq(extra)
  };
  for (const [name, markup] of Object.entries(cases)) {
    const root = openTag(markup);
    assert.match(root, /class="[^"]*\bextra"/, `${name} class`);
    assert.match(root, /data-testid="root"/, `${name} rest`);
    assert.match(root, /id="r1"/, `${name} id`);
  }
});

test('F-039 L4: StatsSection accepts an accessible name from the caller (no fixed English label baked in)', () => {
  const root = openTag(html(StatsSection, { stats: STATS, 'aria-label': 'Key metrics' }));
  assert.match(root, /aria-label="Key metrics"/);
  assert.ok(!openTag(html(StatsSection, { stats: STATS })).includes('aria-label'), 'unnamed by default');
});

test('F-039 L4: the forwarded ref lands on the root element of every twin', () => {
  const ref = React.createRef();
  const cases = {
    LogoCloud: [mount(LogoCloud, { logos: [] }, ref).render(), 'section'],
    StatsSection: [StatsSection.render({ stats: [] }, ref), 'section'],
    TestimonialCard: [TestimonialCard.render({ quote: 'q', authorName: 'An' }, ref), 'div'],
    FAQSection: [mount(FAQSection, { items: [] }, ref).render(), 'section']
  };
  for (const [name, [el, tag]] of Object.entries(cases)) {
    assert.strictEqual(el.type, tag, `${name} root is the ${tag}`);
    assert.strictEqual(el.props.ref, ref, `${name} forwards ref to its root`);
  }
});

test('F-039 L4: no phantom colour token, hex literal or middle dot in any proof markup', () => {
  const markup = [
    html(LogoCloud, { title: 'T', logos: LOGOS }),
    html(StatsSection, { stats: STATS }),
    testimonial({ authorRole: 'CTO' }),
    faq()
  ].join('');
  assert.ok(!/#[0-9a-f]{3,8}\b|var\(--joy-color|&bull;|·/i.test(markup.replace(/<svg\b[^>]*>/g, '')));
});

// F-039 F1 (final review A): the default subtitle follows the same plain-copy rule as the other landing defaults.
test('F-039 F1: FAQSection default subtitle has no word over 12 characters', () => {
  const subtitle = faq().match(/<p class="joy-faq-section__subtitle">([^<]*)<\/p>/)[1];
  const long = subtitle.split(/\s+/).map((w) => w.replace(/[^a-z]/gi, '')).filter((w) => w.length > 12);
  assert.deepStrictEqual(long, [], `words over 12 characters in "${subtitle}"`);
});
