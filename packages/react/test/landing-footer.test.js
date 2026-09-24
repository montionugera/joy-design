import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L5a: SiteFooter (React twin). The Svelte twin asserts the same expectations in
// packages/svelte/test/landing-footer.test.js; the CSS contract is in packages/tokens/test/wave-4.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { SiteFooter } = loadComponent('SiteFooter');
const h = React.createElement;
const render = (props) => renderToStaticMarkup(h(SiteFooter, props));
const tags = (markup, name) => [...markup.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map((m) => m[0]);
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

const COLUMNS = [
  { title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }, { label: 'Changelog', href: 'https://example.com/log', external: true }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }] }
];
const SOCIALS = [
  { name: 'GitHub', href: 'https://github.com/example', icon: h('svg', { className: 'gh', 'aria-hidden': 'true' }) },
  { name: 'Mastodon', href: 'https://example.social/@joy', icon: h('svg', { className: 'raw', 'aria-hidden': 'true' }) }
];

test('F-039 L5a: SiteFooter is a forwardRef component', () => {
  assert.strictEqual(SiteFooter.$$typeof, Symbol.for('react.forward_ref'));
});

test('F-039 L5a: the root is a plain <footer> with the component class, the caller className and rest props (and no explicit role)', () => {
  const markup = render({ columns: COLUMNS, className: 'extra', id: 'f1', 'data-testid': 'footer', 'aria-label': 'Site' });
  const root = tags(markup, 'footer')[0];
  assert.match(root, /^<footer\b/);
  assert.match(root, /class="joy-site-footer extra"/);
  assert.match(root, /id="f1"/);
  assert.match(root, /data-testid="footer"/);
  assert.match(root, /aria-label="Site"/);
  assert.ok(!/\srole=/.test(root), 'a <footer> already exposes contentinfo; an explicit role is redundant');
});

test('F-039 L5a: default brand description is plain language, and an empty description renders no paragraph', () => {
  const markup = render({ columns: COLUMNS });
  const desc = markup.match(/<p class="joy-site-footer__brand-desc">([^<]*)<\/p>/)[1];
  assert.strictEqual(desc, 'A design system for building clear, fast financial apps.');
  assert.ok(!/institutional|quantitative|high-velocity|infrastructure/i.test(markup), 'no buzzword copy');
  assert.ok(desc.split(/\s+/).every((w) => w.replace(/[^a-z]/gi, '').length <= 12), 'no word longer than 12 characters');
  assert.ok(!render({ columns: COLUMNS, brandDescription: '' }).includes('joy-site-footer__brand-desc'));
  assert.match(render({ columns: COLUMNS, brandDescription: 'Custom words' }), />Custom words<\/p>/);
});

test('F-039 L5a: brand title, logo, copyright and every column render; titles keep the caller casing', () => {
  const markup = render({ columns: COLUMNS, brandTitle: 'Acme', brandLogo: h('svg', { className: 'logo' }), copyright: '(c) Acme' });
  assert.match(markup, /<div class="joy-site-footer__brand-title"><svg class="logo"><\/svg><span>Acme<\/span><\/div>/);
  assert.match(markup, /<div>\(c\) Acme<\/div>/);
  assert.deepStrictEqual([...markup.matchAll(/<h4 class="joy-site-footer__col-title">([^<]*)<\/h4>/g)].map((m) => m[1]), ['Product', 'Company']);
  assert.strictEqual((markup.match(/class="joy-site-footer__column"/g) || []).length, 2);
  assert.match(render({ columns: [] }), new RegExp(`\\u00a9 ${new Date().getFullYear()} Joymify Inc\\.`), 'default copyright carries the current year');
});

test('F-039 L5a: an external column link opens in a new tab with rel and a disclosure label; internal links stay plain', () => {
  const [pricing, changelog, about] = tags(render({ columns: COLUMNS }), 'a');
  for (const internal of [pricing, about]) {
    assert.ok(!/target=|rel=|aria-label=/.test(internal), `internal link stays plain: ${internal}`);
  }
  assert.strictEqual(attr(changelog, 'target'), '_blank');
  assert.strictEqual(attr(changelog, 'rel'), 'noopener noreferrer');
  assert.strictEqual(attr(changelog, 'aria-label'), 'Changelog (opens in new tab)');
  assert.ok(attr(changelog, 'aria-label').startsWith('Changelog'), 'the accessible name starts with the visible text');
});

test('F-039 L5a: every social link carries the disclosure label, target and rel, and renders its icon', () => {
  const markup = render({ columns: COLUMNS, socialLinks: SOCIALS });
  const socials = tags(markup, 'a').filter((t) => attr(t, 'class') === 'joy-site-footer__social-link');
  assert.strictEqual(socials.length, 2);
  assert.deepStrictEqual(socials.map((t) => attr(t, 'aria-label')), ['GitHub (opens in new tab)', 'Mastodon (opens in new tab)']);
  for (const t of socials) {
    assert.strictEqual(attr(t, 'target'), '_blank');
    assert.strictEqual(attr(t, 'rel'), 'noopener noreferrer');
  }
  assert.match(markup, /<svg class="gh" aria-hidden="true"><\/svg><\/a>/);
  assert.match(markup, /<svg class="raw" aria-hidden="true"><\/svg><\/a>/);
  assert.ok(!render({ columns: COLUMNS }).includes('joy-site-footer__socials'), 'no socials, no empty container');
});

test('F-039 L5a: no inline style, hex literal, phantom token or middle dot in the footer markup', () => {
  const markup = render({ columns: COLUMNS, socialLinks: SOCIALS });
  assert.ok(!/style=|#[0-9a-f]{3,8}\b|var\(--joy-color|&bull;|·/i.test(markup), markup);
});

test('F-039 L5a: list keys are unique even when titles, labels and names repeat (index-composite)', () => {
  const dupColumns = [
    { title: 'Same', links: [{ label: 'Dup', href: '/a' }, { label: 'Dup', href: '/b' }] },
    { title: 'Same', links: [{ label: 'Dup', href: '/c' }] }
  ];
  const dupSocials = [{ name: 'X', href: '/x', icon: null }, { name: 'X', href: '/y', icon: null }];
  const tree = SiteFooter.render({ columns: dupColumns, socialLinks: dupSocials }, null);
  const keys = (node, pred, out = []) => {
    if (Array.isArray(node)) node.forEach((n) => keys(n, pred, out));
    else if (node && typeof node === 'object' && node.props) {
      if (pred(node)) out.push(node.key);
      keys(node.props.children, pred, out);
    }
    return out;
  };
  const columnKeys = keys(tree, (n) => n.props.className === 'joy-site-footer__column');
  assert.strictEqual(new Set(columnKeys).size, 2, 'column keys');
  const linkKeys = keys(tree, (n) => n.type === 'li');
  assert.strictEqual(linkKeys.length, 3);
  const socialKeys = keys(tree, (n) => n.props.className === 'joy-site-footer__social-link');
  assert.strictEqual(new Set(socialKeys).size, 2, 'social keys');
  // links of one column share a parent: their keys must differ within that parent
  const firstColumnLinks = keys(tree, (n) => n.type === 'li').slice(0, 2);
  assert.strictEqual(new Set(firstColumnLinks).size, 2, 'link keys within a column');
});

test('F-039 L5a: the forwarded ref lands on the root <footer>, not a descendant', () => {
  const ref = React.createRef();
  const el = SiteFooter.render({ columns: [] }, ref);
  assert.strictEqual(el.type, 'footer');
  assert.strictEqual(el.props.ref, ref);
});
