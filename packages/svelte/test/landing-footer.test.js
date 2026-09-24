import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import { createRawSnippet } from 'svelte';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L5a: SiteFooter (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/landing-footer.test.js; the CSS contract is in packages/tokens/test/wave-4.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (props, opts) => (await renderRaw('SiteFooter', props, opts)).replace(/<!--[\s\S]*?-->/g, '');
const snippet = (markup) => createRawSnippet(() => ({ render: () => markup }));
const tags = (markup, name) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

const COLUMNS = [
  { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Changelog', href: 'https://example.com/log', external: true }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }] }
];
const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com/example', icon: snippet('<svg class="gh" aria-hidden="true"></svg>') },
  { name: 'Mastodon', href: 'https://example.social/@joy', svgHtml: '<svg class="raw" aria-hidden="true"></svg>' }
];

test('F-039 L5a: SiteFooter compiles with zero warnings (the redundant contentinfo role is gone)', () => {
  assert.deepStrictEqual(compileSvelte('SiteFooter').warnings.map((w) => w.code), []);
});

test('F-039 L5a: the root is a plain <footer> with the component class, the caller class and rest props (and no explicit role)', async () => {
  const markup = await renderSvelte({ columns: COLUMNS, class: 'extra', id: 'f1', 'data-testid': 'footer', 'aria-label': 'Site' });
  const root = tags(markup, 'footer')[0];
  assert.match(root, /^<footer\b/);
  assert.match(root, /class="joy-site-footer extra"/);
  assert.match(root, /id="f1"/);
  assert.match(root, /data-testid="footer"/);
  assert.match(root, /aria-label="Site"/);
  assert.ok(!/\srole=/.test(root), 'a <footer> already exposes contentinfo; an explicit role is redundant');
});

test('F-039 L5a: default brand description is plain language, and an empty description renders no paragraph', async () => {
  const markup = await renderSvelte({ columns: COLUMNS });
  const desc = markup.match(/<p class="joy-site-footer__brand-desc">([^<]*)<\/p>/)[1];
  assert.strictEqual(desc, 'A design system for building clear, fast financial apps.');
  assert.ok(!/institutional|quantitative|high-velocity|infrastructure/i.test(markup), 'no buzzword copy');
  assert.ok(desc.split(/\s+/).every((w) => w.replace(/[^a-z]/gi, '').length <= 12), 'no word longer than 12 characters');
  assert.ok(!(await renderSvelte({ columns: COLUMNS, brandDescription: '' })).includes('joy-site-footer__brand-desc'));
  assert.match(await renderSvelte({ columns: COLUMNS, brandDescription: 'Custom words' }), />Custom words<\/p>/);
});

test('F-039 L5a: brand title, logo snippet, copyright and every column render; titles keep the caller casing', async () => {
  const markup = await renderSvelte({ columns: COLUMNS, brandTitle: 'Acme', brandLogo: snippet('<svg class="logo"></svg>'), copyright: '(c) Acme' });
  assert.match(markup, /<div class="joy-site-footer__brand-title"><svg class="logo"><\/svg>\s*<span>Acme<\/span><\/div>/);
  assert.match(markup, /<div>\(c\) Acme<\/div>/);
  assert.deepStrictEqual([...markup.matchAll(/<h4 class="joy-site-footer__col-title">([^<]*)<\/h4>/g)].map((m) => m[1]), ['Product', 'Company']);
  assert.strictEqual((markup.match(/class="joy-site-footer__column"/g) || []).length, 2);
  assert.match(await renderSvelte({ columns: [] }), new RegExp(`\\u00a9 ${new Date().getFullYear()} Joymify Inc\\.`), 'default copyright carries the current year');
});

test('F-039 L5a: an external column link opens in a new tab with rel and a disclosure label; internal links stay plain', async () => {
  const links = tags(await renderSvelte({ columns: COLUMNS }), 'a');
  const [pricing, changelog, about] = links;
  for (const internal of [pricing, about]) {
    assert.ok(!/target=|rel=|aria-label=/.test(internal), `internal link stays plain: ${internal}`);
  }
  assert.strictEqual(attr(changelog, 'target'), '_blank');
  assert.strictEqual(attr(changelog, 'rel'), 'noopener noreferrer');
  assert.strictEqual(attr(changelog, 'aria-label'), 'Changelog (opens in new tab)');
  assert.ok(attr(changelog, 'aria-label').startsWith('Changelog'), 'the accessible name starts with the visible text');
});

test('F-039 L5a: every social link carries the disclosure label, target and rel, and renders its icon or raw svg', async () => {
  const markup = await renderSvelte({ columns: COLUMNS, socialLinks: SOCIALS });
  const socials = tags(markup, 'a').filter((t) => attr(t, 'class') === 'joy-site-footer__social-link');
  assert.strictEqual(socials.length, 2);
  assert.deepStrictEqual(socials.map((t) => attr(t, 'aria-label')), ['GitHub (opens in new tab)', 'Mastodon (opens in new tab)']);
  for (const t of socials) {
    assert.strictEqual(attr(t, 'target'), '_blank');
    assert.strictEqual(attr(t, 'rel'), 'noopener noreferrer');
  }
  assert.match(markup, /<svg class="gh" aria-hidden="true"><\/svg><\/a>/);
  assert.match(markup, /<svg class="raw" aria-hidden="true"><\/svg><\/a>/);
  assert.ok(!(await renderSvelte({ columns: COLUMNS })).includes('joy-site-footer__socials'), 'no socials, no empty container');
});

test('F-039 L5a: no inline style, hex literal, phantom token or middle dot in the footer markup', async () => {
  const markup = await renderSvelte({ columns: COLUMNS, socialLinks: SOCIALS });
  assert.ok(!/style=|#[0-9a-f]{3,8}\b|var\(--joy-color|&bull;|·/i.test(markup), markup);
});

// Behaviour without a DOM: evaluate the compiled CLIENT component against a tiny stand-in for svelte/internal/client that
// hands out DISTINCT nodes, then read which node bind:this is attached to (created[0] is the root <footer>).
const libFile = fileURLToPath(new URL('../src/lib/SiteFooter.svelte', import.meta.url));
const clientCode = compile(fs.readFileSync(libFile, 'utf8'), { generate: 'client', filename: libFile }).js.code
  .replace(/^import .*$/gm, '')
  .replace('export default function', 'function');
function runClient(props) {
  const created = [];
  const binds = [];
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
        case 'prop': return (p, k, _flags, fallback) => (...args) => (args.length ? (p[k] = args[0]) : (p[k] === undefined ? (typeof fallback === 'function' ? fallback() : fallback) : p[k]));
        case 'rest_props': return () => ({});
        case 'get': return (d) => (d.fn ? d.fn() : d.v);
        case 'template_effect': return (fn) => fn();
        case 'attribute_effect': return (el, fn) => { el.spread = fn(); };
        case 'each': return (_node, _flags, items, _key, render) => { items().forEach((value, i) => render({}, { fn: () => value }, i)); };
        case 'if': return (_node, render) => render((branch) => branch({}));
        case 'bind_this': return (el, setter) => { binds.push({ el, setter }); };
        default: return noop;
      }
    }
  });
  new Function('$', 'props', `${clientCode}\nreturn SiteFooter({}, props);`)($, props);
  return { created, binds };
}

test('F-039 L5a: bind:this is on the root <footer> (not a descendant) and writes the element to the bindable ref', () => {
  const sentinel = { el: true };
  const props = { columns: COLUMNS, ref: null, 'data-testid': 'x' };
  const { binds, created } = runClient(props);
  assert.strictEqual(binds.length, 1, 'bind:this is called once');
  assert.strictEqual(binds[0].el, created[0], 'it binds the root element created from the template');
  assert.ok(created[0].html.startsWith('<footer'), 'and the root template node is the <footer>');
  binds[0].setter(sentinel);
  assert.strictEqual(props.ref, sentinel, 'the element is written back to ref');
});
