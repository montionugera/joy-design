import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { createRawSnippet } from 'svelte';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L5b: LandingPage (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/landing-page.test.js; the CSS contract is in packages/tokens/test/wave-4.test.js.
// Interaction in a real browser is proven by Playwright against the hub; here: SSR markup plus the click/open wiring of
// the compiled client component (no DOM is available in this repo).
// The wiring tests below evaluate the compiled client output against a stand-in for svelte/internal/client, so they are
// pinned to the installed Svelte (5.57.x): an upgrade that renames those internals fails them loudly, not silently.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderPage = async (props = {}) => (await renderRaw('LandingPage', props)).replace(/<!--[\s\S]*?-->/g, '');
const tags = (markup, name) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const header = (markup) => markup.match(/<header\b[\s\S]*?<\/header>/)[0];
const visibleWords = (markup) =>
  markup
    .replace(/<svg\b[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .split(/\s+/)
    .map((w) => w.replace(/^[^\w]+|[^\w]+$/g, ''))
    .filter(Boolean);

test('F-039 L5b: LandingPage compiles with zero warnings (the {/* Header */} parse error is gone)', () => {
  assert.deepStrictEqual(compileSvelte('LandingPage').warnings.map((w) => w.code), []);
});

test('F-039 L5b: the header has the menu button (closed, labelled, controlling its panel) and every nav link', async () => {
  const markup = await renderPage();
  const head = header(markup);
  const menu = tags(head, 'button').find((t) => attr(t, 'class').includes('joy-landing-header__menu'));
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

test('F-039 L5b: the header class vocabulary is exactly the five landing-header classes (the hub simulator must match)', async () => {
  const head = header(await renderPage());
  const classes = new Set([...head.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => c.startsWith('joy-landing-header')));
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
const NAV_CLASS = /^joy-landing-(skip|header|drawer)/;
const classSet = (markup) =>
  new Set([...markup.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter((c) => NAV_CLASS.test(c)));

test('F-039 C1a: the hub simulator header uses exactly the landing component header, skip and drawer class set', async () => {
  const hub = fs.readFileSync(new URL('../../../apps/storybook-hub/build.js', import.meta.url), 'utf8');
  assert.strictEqual(hub.split('<!-- landing-header:start -->').length, 2, 'exactly one start marker');
  assert.strictEqual(hub.split('<!-- landing-header:end -->').length, 2, 'exactly one end marker');
  const between = hub.slice(hub.indexOf('<!-- landing-header:start -->'), hub.indexOf('<!-- landing-header:end -->'));
  const hubClasses = classSet(between);
  const markup = await renderPage();
  const skip = markup.match(/<a\b[^>]*joy-landing-skip[^>]*>/)[0];
  const componentClasses = classSet(skip + header(markup));
  const source = fs.readFileSync(new URL('../src/lib/LandingPage.svelte', import.meta.url), 'utf8');
  for (const c of source.match(/joy-landing-drawer[\w-]*/g) || []) componentClasses.add(c);
  assert.ok(componentClasses.has('joy-landing-drawer__nav') && componentClasses.has('joy-landing-drawer__link'), 'the drawer classes were found in the Svelte source');
  assert.deepStrictEqual([...hubClasses].sort(), [...componentClasses].sort());
});

test('F-039 L5b: the skip link targets its own <main>', async () => {
  const markup = await renderPage();
  const skip = tags(markup, 'a').find((t) => attr(t, 'class') === 'joy-landing-skip');
  const main = tags(markup, 'main')[0];
  assert.strictEqual(attr(skip, 'href'), `#${attr(main, 'id')}`, 'skip link points at <main id>');
  assert.match(attr(skip, 'href'), /^#.+-main$/);
});

// Two pages in ONE render pass (a constant id would pass a single-instance test): a throwaway wrapper component next to
// the test, removed in finally.
test('F-039 L5b: two pages on one screen get their own menu and main ids', async () => {
  const dir = new URL('./.tmp-two-landing-pages/', import.meta.url);
  fs.mkdirSync(dir, { recursive: true });
  try {
    fs.writeFileSync(new URL('Two.svelte', dir), `<script lang="ts">\n  import LandingPage from '../../src/lib/LandingPage.svelte';\n</script>\n<LandingPage />\n<LandingPage />\n`);
    const { render } = await import('svelte/server');
    const { default: Two } = await import(new URL('Two.svelte', dir).href);
    const markup = render(Two, { props: {} }).body.replace(/<!--[\s\S]*?-->/g, '');
    const controls = [...markup.matchAll(/aria-controls="([^"]+-menu)"/g)].map((m) => m[1]);
    const mains = [...markup.matchAll(/<main id="([^"]+)"/g)].map((m) => m[1]);
    const skips = [...markup.matchAll(/class="joy-landing-skip" href="#([^"]+)"/g)].map((m) => m[1]);
    assert.strictEqual(controls.length, 2);
    assert.notStrictEqual(controls[0], controls[1], 'menu ids differ');
    assert.notStrictEqual(mains[0], mains[1], 'main ids differ');
    assert.deepStrictEqual(skips, mains, 'each skip link points at its own main');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('F-039 L5b: no bullet separator, no phantom or foreign token, no var() fallback and no inline style outside icons', async () => {
  const markup = await renderPage({ interactiveSlot: createRawSnippet(() => ({ render: () => '<p>slot</p>' })) });
  assert.ok(!/&bull;|\u2022|\u00b7/.test(markup), 'no bullet or middle dot');
  assert.ok(!/--joy-color-|--gold-|--navy-|--cream-|--ink-/.test(markup), 'no phantom or foreign tokens');
  const styles = [...markup.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]);
  assert.ok(styles.every((s) => !s.includes('var(')), `no style with var() fallback: ${styles.join(' | ')}`);
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(markup.replace(/href="#[^"]*"/g, '')), 'no hex colour');
});

test('F-039 L5b: default copy has no word over 12 characters and no buzzword filler', async () => {
  const words = visibleWords(await renderPage());
  const long = words.filter((w) => w.length > 12);
  assert.deepStrictEqual(long, [], `words over 12 characters: ${long.join(', ')}`);
  assert.ok(words.length > 150, 'the whole page was scanned');
  assert.ok(!/institutional|deterministic|quantitative/i.test(words.join(' ')), 'the hero jargon is gone');
});

test('F-039 L5b: hero uses plain badge copy and a solid titleEmphasis span (no gradient title)', async () => {
  const markup = await renderPage();
  assert.match(markup, /<div class="joy-hero__badge">[\s\S]*?Sub-5μs execution engine<\/div>/);
  assert.match(markup, /<span class="joy-hero__title-emphasis">fast trading screens<\/span>/);
  assert.ok(!markup.includes('title-gradient'));
  assert.strictEqual((markup.match(/<h1\b/g) || []).length, 1, 'one h1');
});

test('F-039 L5b: feature cards carry distinct icons in the icon slot, distinct link labels and the shared badge classes', async () => {
  const markup = await renderPage();
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

test('F-039 L5b: palette is a plain data attribute, the component never sets a theme, and a caller class and rest props reach the root', async () => {
  const dflt = await renderPage();
  assert.match(dflt, /^<div data-palette="joymify" class="joy-landing-page\s*">/);
  const custom = await renderPage({ palette: 'obsidian', class: 'extra', id: 'lp', 'data-testid': 'page', 'aria-label': 'Landing' });
  const root = tags(custom, 'div')[0];
  assert.strictEqual(attr(root, 'data-palette'), 'obsidian');
  assert.match(root, /class="joy-landing-page extra"/);
  assert.strictEqual(attr(root, 'id'), 'lp');
  assert.strictEqual(attr(root, 'data-testid'), 'page');
  assert.strictEqual(attr(root, 'aria-label'), 'Landing');
  assert.ok(!custom.includes('data-theme'), 'data-theme alone decides the theme; the component never writes it');
});

test('F-039 L5b: the interactive slot renders inside the page slot container, and only when given', async () => {
  const withSlot = await renderPage({ interactiveSlot: createRawSnippet(() => ({ render: () => '<p class="probe">live</p>' })) });
  assert.match(withSlot, /<div class="joy-landing-page__slot"><p class="probe">live<\/p><\/div>/);
  assert.ok(!(await renderPage()).includes('joy-landing-page__slot'));
});

test('F-039 L5b: landmarks: skip link first, then header, one <main> holding the sections, footer outside it', async () => {
  const markup = await renderPage();
  const order = ['joy-landing-skip', '<header', '<main', 'joy-hero', 'id="faq"', 'joy-cta-section', '</main>', '<footer'].map((n) => markup.indexOf(n));
  assert.ok(order.every((i) => i >= 0), order.join(','));
  assert.deepStrictEqual(order, [...order].sort((x, y) => x - y));
});

// Behaviour without a DOM: evaluate the compiled CLIENT component against a tiny stand-in for svelte/internal/client that
// hands out DISTINCT nodes and records handlers per node, with recording stubs for Drawer, the sections and the icons.
const libFile = fileURLToPath(new URL('../src/lib/LandingPage.svelte', import.meta.url));
// Compiled lazily so a compile regression fails the named compile test, not the whole file at load.
let clientCodeCache;
const clientCode = () => (clientCodeCache ??= compile(fs.readFileSync(libFile, 'utf8'), { generate: 'client', filename: libFile }).js.code
  .replace(/^import .*$/gm, '')
  .replace('export default function', 'function'));
const names = ['Cpu', 'Layers', 'Menu', 'Smartphone', 'Drawer', 'HeroSection', 'LogoCloud', 'FeatureGrid', 'FeatureCard', 'StatsSection', 'CTASection', 'FAQSection', 'SiteFooter'];
// Parsed once; the `$` stand-in and the stubs stay per call, so each run is still isolated.
let clientFactoryCache;
const clientFactory = () => (clientFactoryCache ??= new Function('$', 'props', ...names, `${clientCode()}\nreturn LandingPage({}, props);`));
function runClient(props) {
  const created = [];
  const binds = [];
  const propFlags = {};
  const effects = [];
  const stubs = {};
  const calls = {};
  const all = [];
  const node = (extra = {}) => { const n = { attrs: {}, handlers: [], ...extra }; all.push(n); return n; };
  const stub = (name) => (stubs[name] ??= (anchor, p) => { (calls[name] ??= []).push(p); });
  const noop = () => noop;
  const $ = new Proxy({}, {
    get: (_, key) => {
      switch (key) {
        case 'from_html': return (html) => () => { const n = node({ html }); created.push(n); return n; };
        case 'child':
        case 'sibling':
        case 'first_child':
        case 'only_child': return () => node({ derived: true });
        case 'props_id': return () => 'uid';
        case 'state': return (v) => ({ v });
        case 'set': return (s, v) => { s.v = v; };
        case 'prop': return (p, k, flags, fallback) => { propFlags[k] = flags; return (...args) => (args.length ? (p[k] = args[0]) : (p[k] === undefined ? (typeof fallback === 'function' ? fallback() : fallback) : p[k])); };
        case 'rest_props': return (p, excludes) => Object.fromEntries(Object.entries(p).filter(([k]) => !excludes.has(k)));
        case 'get': return (d) => (d.fn ? d.fn() : d.v);
        case 'template_effect': return (fn) => { effects.push(fn); fn(); };
        case 'set_attribute': return (el, name, value) => { el.attrs[name] = value; };
        case 'delegated': return (name, el, handler) => { el.handlers.push({ name, handler }); };
        case 'attribute_effect': return (el, fn) => { el.spread = fn(); };
        case 'each': return (_node, _flags, items, _key, render) => { items().forEach((value, i) => render({}, { fn: () => value }, i)); };
        case 'if': return (_node, render) => render((branch) => branch({}));
        case 'bind_this': return (el, setter) => { binds.push({ el, setter }); };
        default: return noop;
      }
    }
  });
  clientFactory()($, props, ...names.map(stub));
  const flush = () => effects.forEach((fn) => fn());
  return { created, all, binds, propFlags, calls, flush };
}
const clickOf = (node) => node.handlers.filter((h) => h.name === 'click').map((h) => h.handler);

test('F-039 L5b: bind:this is on the root <div> (not a descendant), ref is bindable, palette and rest reach the root', () => {
  const sentinel = { el: true };
  const props = { ref: null, palette: 'quantum', class: 'extra', id: 'lp', 'data-testid': 'x' };
  const { binds, created, propFlags } = runClient(props);
  assert.ok(propFlags.ref & 8, 'ref is declared with $bindable');
  assert.ok(!(propFlags.palette & 8), 'an ordinary prop is not bindable (the flag check can tell them apart)');
  assert.strictEqual(binds.length, 1);
  assert.strictEqual(binds[0].el, created[0], 'it binds the root element created from the template');
  assert.ok(created[0].html.startsWith('<div'), 'and the root template node is the <div>');
  assert.deepStrictEqual(
    { palette: created[0].spread['data-palette'], cls: created[0].spread.class, id: created[0].spread.id, testid: created[0].spread['data-testid'] },
    { palette: 'quantum', cls: 'joy-landing-page extra', id: 'lp', testid: 'x' }
  );
  binds[0].setter(sentinel);
  assert.strictEqual(props.ref, sentinel);
});

test('F-039 L5b: the menu button opens the drawer (aria-expanded and Drawer open follow the state)', () => {
  const { all, calls, flush } = runClient({});
  const [drawer] = calls.Drawer;
  const menuButton = findByAttr(all, 'aria-expanded');
  assert.ok(menuButton, 'the menu button receives aria-expanded');
  assert.strictEqual(menuButton.attrs['aria-expanded'], false);
  assert.strictEqual(drawer.open, false);
  assert.strictEqual(drawer.title, 'Menu');
  assert.strictEqual(menuButton.attrs['aria-controls'], drawer.id, 'aria-controls names the drawer panel');
  assert.strictEqual(drawer.id, 'uid-menu');
  const [click] = clickOf(menuButton);
  assert.strictEqual(typeof click, 'function', 'the menu button has a click handler');
  click();
  flush();
  assert.strictEqual(menuButton.attrs['aria-expanded'], true, 'the button reports the open state');
  assert.strictEqual(drawer.open, true, 'the Drawer open binding reads the same state');
});

test('F-039 L5b: closing paths: Drawer onclose, a nav link and the drawer launch button all close it (drawer launch also calls ondeployclick)', () => {
  let deployed = 0;
  const { created, all, calls, flush } = runClient({ ondeployclick: () => { deployed++; } });
  const [drawer] = calls.Drawer;
  const menuButton = findByAttr(all, 'aria-expanded');
  const open = () => { clickOf(menuButton)[0](); flush(); assert.strictEqual(drawer.open, true); };

  open();
  assert.strictEqual(typeof drawer.onclose, 'function', 'Drawer gets an onclose');
  drawer.onclose();
  assert.strictEqual(drawer.open, false, 'Escape, the close button and the backdrop all end in onclose');

  const before = created.length;
  drawer.children({}, {});
  const drawerLinks = created.slice(before).filter((n) => n.html.startsWith('<a class="joy-landing-drawer__link"'));
  assert.strictEqual(drawerLinks.length, 3, 'three nav links inside the drawer');
  for (const link of drawerLinks) {
    open();
    const handlers = clickOf(link);
    assert.strictEqual(handlers.length, 1, 'each drawer link has its own click handler');
    handlers[0]();
    assert.strictEqual(drawer.open, false, 'selecting a link closes the drawer');
  }

  const beforeFooter = created.length;
  drawer.footer({});
  const launch = created.slice(beforeFooter).find((n) => n.html.includes('joy-button--lg'));
  open();
  clickOf(launch)[0]();
  assert.strictEqual(drawer.open, false, 'the drawer launch button closes it');
  assert.strictEqual(deployed, 1, 'and still launches');
});

test('F-039 L5b: the header launch button and both section CTAs are wired to ondeployclick / ondocsclick', () => {
  let deployed = 0;
  let docs = 0;
  const onDeploy = () => { deployed++; };
  const onDocs = () => { docs++; };
  const { all, calls } = runClient({ ondeployclick: onDeploy, ondocsclick: onDocs });
  const menuButton = findByAttr(all, 'aria-expanded');
  const topLevel = all.filter((n) => n.handlers.length).filter((n) => n !== menuButton);
  assert.strictEqual(topLevel.length, 1, 'exactly one other node in the header handles clicks: the Launch Terminal button');
  clickOf(topLevel[0])[0]({});
  assert.strictEqual(deployed, 1);
  const [hero] = calls.HeroSection;
  const [cta] = calls.CTASection;
  assert.strictEqual(hero.onprimaryclick, onDeploy);
  assert.strictEqual(hero.onsecondaryclick, onDocs);
  assert.strictEqual(cta.onprimaryclick, onDeploy);
  assert.strictEqual(cta.onsecondaryclick, onDocs);
  assert.strictEqual(hero.titleEmphasis, 'fast trading screens', 'titleEmphasis, not titleGradient');
  assert.ok(!('titleGradient' in hero));
});

test('F-039 L5b: feature cards receive real icon snippets (three different icons) through the icon slot', () => {
  const { calls } = runClient({});
  const [grid] = calls.FeatureGrid;
  grid.children({}, {});
  const cards = calls.FeatureCard;
  assert.strictEqual(cards.length, 3);
  assert.ok(cards.every((c) => typeof c.icon === 'function'), 'each card passes an icon snippet');
});

const findByAttr = (all, name) => all.find((n) => name in n.attrs);

test('F-039 L5b fix: <main> is programmatically focusable so the skip link moves focus, and the copy makes no false palette claim', async () => {
  const markup = await renderPage();
  assert.match(tags(markup, 'main')[0], /^<main id="[^"]+" tabindex="-1">$/);
  assert.match(markup, /Tested light and dark themes/);
  assert.ok(!/Five tested|five .*themes|recalibrat/i.test(markup), 'palette is a plain attribute; the copy must not promise palette themes');
});
