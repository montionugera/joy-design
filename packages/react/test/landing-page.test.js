import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L5b: LandingPage (React twin). The Svelte twin asserts the same expectations in
// packages/svelte/test/landing-page.test.js; the CSS contract is in packages/tokens/test/wave-4.test.js.
// Interaction in a real browser is proven by Playwright against the hub; here: SSR markup plus the click/open wiring read
// from the element tree, with the hooks driven by a tiny dispatcher (no DOM is available in this repo). The dispatcher
// only implements useState and useId and is pinned to the installed React (19.3.x): adding another hook to LandingPage
// or upgrading React may need it extended.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { LandingPage } = loadComponent('LandingPage');
const { Drawer } = loadComponent('Drawer');
const h = React.createElement;
const renderPage = (props = {}) => renderToStaticMarkup(h(LandingPage, props));
const tags = (markup, name) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const header = (markup) => markup.match(/<header\b[\s\S]*?<\/header>/)[0];
const visibleWords = (markup) =>
  markup
    .replace(/<svg\b[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ''))
    .filter(Boolean);

test('F-039 L5b: React LandingPage is a forwardRef component', () => {
  assert.strictEqual(LandingPage.$$typeof, Symbol.for('react.forward_ref'));
});

test('F-039 L5b: the header has the menu button (closed, labelled, controlling its panel) and every nav link', () => {
  const markup = renderPage();
  const head = header(markup);
  const menu = tags(head, 'button').find((t) => (attr(t, 'class') || '').includes('joy-landing-header__menu'));
  assert.ok(menu, 'a .joy-landing-header__menu button exists');
  assert.strictEqual(attr(menu, 'class'), 'joy-button joy-button--ghost joy-button--icon-only joy-landing-header__menu');
  assert.strictEqual(attr(menu, 'aria-label'), 'Open menu');
  assert.strictEqual(attr(menu, 'aria-expanded'), 'false');
  assert.match(attr(menu, 'aria-controls'), /-menu$/);
  assert.strictEqual(attr(menu, 'type'), 'button');
  const links = tags(head, 'a').filter((t) => attr(t, 'class') === 'joy-landing-header__link');
  assert.deepStrictEqual(links.map((t) => attr(t, 'href')), ['#features', '#telemetry', '#faq']);
  assert.match(head, /<nav class="joy-landing-header__nav" aria-label="Primary">/);
  assert.match(head, /class="joy-button joy-button--solid joy-button--sm">Launch Terminal<\/button>/);
  assert.ok(!markup.includes('joy-drawer'), 'a closed drawer renders nothing');
});

const NAV_CLASS = /^joy-landing-(skip|header|drawer)/;
const classSet = (markup) =>
  new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => NAV_CLASS.test(c)));

test('F-039 L5b: the header class vocabulary is exactly the five landing-header classes (the hub simulator must match)', () => {
  const head = header(renderPage());
  const classes = classSet(head);
  assert.deepStrictEqual([...classes].sort(), [
    'joy-landing-header',
    'joy-landing-header__brand',
    'joy-landing-header__link',
    'joy-landing-header__menu',
    'joy-landing-header__nav'
  ]);
  assert.ok(!/\sstyle=/.test(head.replace(/<svg\b[\s\S]*?<\/svg>/g, '')), 'no inline style outside the icon');
});

// F-039 C1a: the hub simulator (apps/storybook-hub/build.js) hand-writes the landing header, skip link and mobile drawer
// contents between two marker comments. The header/skip classes come from the SSR'd page; the drawer contents are
// closed (rendered by nothing) at SSR, so their classes are read from the component source. The two sets must be equal.
test('F-039 C1a: the hub simulator header uses exactly the landing component header, skip and drawer class set', () => {
  const hub = fs.readFileSync(new URL('../../../apps/storybook-hub/build.js', import.meta.url), 'utf8');
  assert.strictEqual(hub.split('<!-- landing-header:start -->').length, 2, 'exactly one start marker');
  assert.strictEqual(hub.split('<!-- landing-header:end -->').length, 2, 'exactly one end marker');
  const between = hub.slice(hub.indexOf('<!-- landing-header:start -->'), hub.indexOf('<!-- landing-header:end -->'));
  const hubClasses = classSet(between);
  const markup = renderPage();
  const skip = tags(markup, 'a').find((t) => attr(t, 'class') === 'joy-landing-skip');
  const componentClasses = classSet(skip + header(markup));
  const source = fs.readFileSync(new URL('../src/LandingPage.tsx', import.meta.url), 'utf8');
  for (const c of source.match(/joy-landing-drawer[\w-]*/g) || []) componentClasses.add(c);
  assert.ok(componentClasses.has('joy-landing-drawer__nav') && componentClasses.has('joy-landing-drawer__link'), 'the drawer classes were found in the React source');
  assert.deepStrictEqual([...hubClasses].sort(), [...componentClasses].sort());
});

test('F-039 L5b: the skip link targets its own <main>', () => {
  const markup = renderPage();
  const skip = tags(markup, 'a').find((t) => attr(t, 'class') === 'joy-landing-skip');
  const main = tags(markup, 'main')[0];
  assert.strictEqual(attr(skip, 'href'), `#${attr(main, 'id')}`, 'skip link points at <main id>');
  assert.match(attr(skip, 'href'), /^#.+-main$/);
});

test('F-039 L5b: two pages on one screen get their own menu and main ids', () => {
  const markup = renderToStaticMarkup(h('div', null, h(LandingPage), h(LandingPage)));
  const controls = [...markup.matchAll(/aria-controls="([^"]+-menu)"/g)].map((m) => m[1]);
  const mains = [...markup.matchAll(/<main id="([^"]+)"/g)].map((m) => m[1]);
  const skips = [...markup.matchAll(/class="joy-landing-skip" href="#([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(controls.length, 2);
  assert.notStrictEqual(controls[0], controls[1], 'menu ids differ (a constant id would pass a single-instance test)');
  assert.notStrictEqual(mains[0], mains[1], 'main ids differ');
  assert.deepStrictEqual(skips, mains, 'each skip link points at its own main');
});

test('F-039 L5b: no bullet separator, no phantom or foreign token, no var() fallback and no inline style outside icons', () => {
  const markup = renderPage({ interactiveSlot: h('p', null, 'slot') });
  assert.ok(!/&bull;|\u2022|\u00b7/.test(markup), 'no bullet or middle dot');
  assert.ok(!/--joy-color-|--gold-|--navy-|--cream-|--ink-/.test(markup), 'no phantom or foreign tokens');
  const styles = [...markup.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(styles.every((s) => !s.includes('var(')), `no style with var() fallback: ${styles.join(' | ')}`);
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(markup.replace(/href="#[^"]*"/g, '')), 'no hex colour');
});

test('F-039 L5b: default copy has no word over 12 characters and no buzzword filler', () => {
  const words = visibleWords(renderPage());
  const long = words.filter((w) => w.length > 12);
  assert.deepStrictEqual(long, [], `words over 12 characters: ${long.join(', ')}`);
  assert.ok(words.length > 150, 'the whole page was scanned');
  assert.ok(!/institutional|deterministic|quantitative/i.test(words.join(' ')), 'the hero jargon is gone');
});

test('F-039 L5b: hero uses plain badge copy and a solid titleEmphasis span (no gradient title)', () => {
  const markup = renderPage();
  assert.match(markup, /<div class="joy-hero__badge">[\s\S]*?Sub-5μs execution engine<\/div>/);
  assert.match(markup, /<span class="joy-hero__title-emphasis">fast trading screens<\/span>/);
  assert.ok(!markup.includes('title-gradient'));
  assert.strictEqual((markup.match(/<h1\b/g) || []).length, 1, 'one h1');
});

test('F-039 L5b: feature cards carry distinct icons in the icon slot, distinct link labels and the shared badge classes', () => {
  const markup = renderPage();
  const cards = markup.split('<div class="joy-feature-card ').slice(1);
  assert.strictEqual(cards.length, 3);
  const icons = cards.map((c) => c.match(/<div class="joy-feature-card__icon">(<svg[\s\S]*?<\/svg>)/)?.[1]);
  assert.ok(icons.every(Boolean), 'each card has an svg icon');
  assert.strictEqual(new Set(icons).size, 3, 'no identical icon-card grid');
  const labels = cards.map((c) => c.match(/class="joy-feature-card__link"[^>]*>([^<]*)</)[1]);
  assert.strictEqual(new Set(labels).size, 3, `link labels differ: ${labels.join(', ')}`);
  assert.deepStrictEqual(
    cards.map((c) => c.match(/joy-badge joy-badge--(\w+)/)[1]),
    ['brand', 'success', 'warning']
  );
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(markup), 'no emoji');
});

test('F-039 L5b: the source file holds no emoji or other non-ASCII pictograph (RXF-029 verify)', () => {
  const src = fs.readFileSync(new URL('../src/LandingPage.tsx', import.meta.url), 'utf8');
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(src));
});

test('F-039 L5b: palette is a plain data attribute, the component never sets a theme, and a caller class and rest props reach the root', () => {
  assert.match(renderPage(), /^<div data-palette="joymify" class="joy-landing-page\s*">/);
  const custom = renderPage({ palette: 'obsidian', className: 'extra', id: 'lp', 'data-testid': 'page', 'aria-label': 'Landing' });
  const root = tags(custom, 'div')[0];
  assert.strictEqual(attr(root, 'data-palette'), 'obsidian');
  assert.match(root, /class="joy-landing-page extra"/);
  assert.strictEqual(attr(root, 'id'), 'lp');
  assert.strictEqual(attr(root, 'data-testid'), 'page');
  assert.strictEqual(attr(root, 'aria-label'), 'Landing');
  assert.ok(!custom.includes('data-theme'), 'data-theme alone decides the theme; the component never writes it');
});

test('F-039 L5b: the interactive slot renders inside the page slot container, and only when given', () => {
  assert.match(renderPage({ interactiveSlot: h('p', { className: 'probe' }, 'live') }), /<div class="joy-landing-page__slot"><p class="probe">live<\/p><\/div>/);
  assert.ok(!renderPage().includes('joy-landing-page__slot'));
});

test('F-039 L5b: landmarks: skip link first, then header, one <main> holding the sections, footer outside it', () => {
  const markup = renderPage();
  const order = ['joy-landing-skip', '<header', '<main', 'joy-hero', 'id="faq"', 'joy-cta-section', '</main>', '<footer'].map((n) => markup.indexOf(n));
  assert.ok(order.every((i) => i >= 0), order.join(','));
  assert.deepStrictEqual(order, [...order].sort((x, y) => x - y));
});

// Behaviour without a DOM: React hooks are driven by a tiny dispatcher that keeps state between renders, and the test
// clicks the real handlers found in the element tree.
const internals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
function mount(C, props, ref = null) {
  const slots = [];
  return {
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
const menuButtonOf = (tree) => findAll(tree, (n) => n.type === 'button' && n.props['aria-label'] === 'Open menu')[0];
const drawerOf = (tree) => findAll(tree, (n) => n.type === Drawer)[0];
const withClass = (tree, cls) => findAll(tree, (n) => n.props.className === cls);

test('F-039 L5b: the root element carries the ref, palette and rest props (ref goes to the root <div>)', () => {
  const ref = { current: null };
  const tree = mount(LandingPage, { palette: 'quantum', className: 'extra', id: 'lp' }, ref).render();
  assert.strictEqual(tree.type, 'div');
  assert.strictEqual(tree.ref, ref, 'ref is on the root element');
  assert.strictEqual(tree.props['data-palette'], 'quantum');
  assert.strictEqual(tree.props.className, 'joy-landing-page extra');
  assert.strictEqual(tree.props.id, 'lp');
});

test('F-039 L5b: the menu button opens the drawer (aria-expanded and Drawer open follow the state)', () => {
  const app = mount(LandingPage, {});
  let tree = app.render();
  const button = menuButtonOf(tree);
  assert.strictEqual(button.props['aria-expanded'], false);
  assert.strictEqual(drawerOf(tree).props.open, false);
  assert.strictEqual(drawerOf(tree).props.title, 'Menu');
  assert.strictEqual(button.props['aria-controls'], drawerOf(tree).props.id, 'aria-controls names the drawer panel');
  assert.strictEqual(typeof button.props.onClick, 'function', 'the menu button has a click handler');
  button.props.onClick();
  tree = app.render();
  assert.strictEqual(menuButtonOf(tree).props['aria-expanded'], true, 'the button reports the open state');
  assert.strictEqual(drawerOf(tree).props.open, true, 'the Drawer open prop reads the same state');
});

test('F-039 L5b: closing paths: Drawer onClose, a nav link and the drawer launch button all close it (drawer launch also calls onDeployClick)', () => {
  let deployed = 0;
  const app = mount(LandingPage, { onDeployClick: () => { deployed++; } });
  const open = () => {
    menuButtonOf(app.render()).props.onClick();
    assert.strictEqual(drawerOf(app.render()).props.open, true);
  };
  const isOpen = () => drawerOf(app.render()).props.open;

  open();
  assert.strictEqual(typeof drawerOf(app.render()).props.onClose, 'function', 'Drawer gets an onClose');
  drawerOf(app.render()).props.onClose();
  assert.strictEqual(isOpen(), false, 'Escape, the close button and the backdrop all end in onClose');

  const links = withClass(drawerOf(app.render()), 'joy-landing-drawer__link');
  assert.strictEqual(links.length, 3, 'three nav links inside the drawer');
  for (let i = 0; i < 3; i++) {
    open();
    const link = withClass(drawerOf(app.render()), 'joy-landing-drawer__link')[i];
    assert.strictEqual(typeof link.props.onClick, 'function', 'each drawer link has a click handler');
    link.props.onClick();
    assert.strictEqual(isOpen(), false, 'selecting a link closes the drawer');
  }

  open();
  const launch = drawerOf(app.render()).props.footer;
  assert.match(launch.props.className, /joy-button--lg/);
  launch.props.onClick();
  assert.strictEqual(isOpen(), false, 'the drawer launch button closes it');
  assert.strictEqual(deployed, 1, 'and still launches');
});

test('F-039 L5b: the header launch button and both section CTAs are wired to onDeployClick / onDocsClick', () => {
  let deployed = 0;
  const onDeployClick = () => { deployed++; };
  const onDocsClick = () => {};
  const tree = mount(LandingPage, { onDeployClick, onDocsClick }).render();
  const launch = findAll(tree, (n) => n.type === 'button' && n.props.className === 'joy-button joy-button--solid joy-button--sm');
  assert.strictEqual(launch.length, 1, 'one header Launch Terminal button');
  launch[0].props.onClick();
  assert.strictEqual(deployed, 1);
  const byName = (name) => findAll(tree, (n) => n.type && n.type.displayName === name)[0];
  const hero = byName('HeroSection');
  const cta = byName('CTASection');
  assert.strictEqual(hero.props.onPrimaryClick, onDeployClick);
  assert.strictEqual(hero.props.onSecondaryClick, onDocsClick);
  assert.strictEqual(cta.props.onPrimaryClick, onDeployClick);
  assert.strictEqual(cta.props.onSecondaryClick, onDocsClick);
  assert.strictEqual(hero.props.titleEmphasis, 'fast trading screens', 'titleEmphasis, not titleGradient');
  assert.ok(!('titleGradient' in hero.props));
});

test('F-039 L5b fix: <main> is programmatically focusable so the skip link moves focus, and the copy makes no false palette claim', () => {
  const markup = renderPage();
  assert.match(tags(markup, 'main')[0], /^<main id="[^"]+" tabindex="-1">$/);
  assert.match(markup, /Tested light and dark themes/);
  assert.ok(!/Five tested|five .*themes|recalibrat/i.test(markup), 'palette is a plain attribute; the copy must not promise palette themes');
});

test('F-039 L5b fix: nav link keys are index-composite (content-only keys break the lane convention)', () => {
  const tree = mount(LandingPage, {}).render();
  const keys = (cls) => withClass(tree, cls).map((n) => n.key);
  assert.deepStrictEqual(keys('joy-landing-header__link'), ['0-#features', '1-#telemetry', '2-#faq']);
  const drawerLinks = withClass(drawerOf(tree), 'joy-landing-drawer__link').map((n) => n.key);
  assert.deepStrictEqual(drawerLinks, ['0-#features', '1-#telemetry', '2-#faq']);
});
