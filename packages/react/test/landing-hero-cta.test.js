import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-039 L1: HeroSection + CTASection (React twin). The Svelte twin asserts the same expectations in
// packages/svelte/test/landing-hero-cta.test.js.

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { HeroSection } = loadComponent('HeroSection');
const { CTASection } = loadComponent('CTASection');
const hero = (props = {}) => renderToStaticMarkup(React.createElement(HeroSection, props));
const cta = (props = {}) => renderToStaticMarkup(React.createElement(CTASection, { title: 'Ready to start', ...props }));

const actionsOf = (html, block) => html.slice(html.indexOf(`class="${block}`));
const firstButton = (html) => html.match(/<button\b[\s\S]*?<\/button>/)[0];
const firstAnchor = (html) => html.match(/<a\b[\s\S]*?<\/a>/)[0];

test('F-039 L1: React landing twins are forwardRef components', () => {
  for (const C of [HeroSection, CTASection]) {
    assert.strictEqual(C.$$typeof, Symbol.for('react.forward_ref'), `${C.displayName} must be a forwardRef component`);
  }
});

test('F-039 L1: hero titleEmphasis renders a solid emphasis span, no gradient anywhere', () => {
  const html = hero({ title: 'Trade with', titleEmphasis: 'confidence' });
  assert.match(html, /<h1 class="joy-hero__title">Trade with <span class="joy-hero__title-emphasis">confidence<\/span><\/h1>/);
  assert.ok(!/gradient/i.test(html), 'no gradient substring in the markup');
  assert.ok(!hero({ title: 'Only title' }).includes('joy-hero__title-emphasis'), 'no emphasis span without titleEmphasis');
});

test('F-039 L1: hero badge icon is a decorative 14px svg and the copy has no bullet', () => {
  const html = hero({ badgeText: 'New release' });
  assert.match(html, /<div class="joy-hero__badge"><svg[^>]*width="14"[^>]*height="14"[^>]*aria-hidden="true"[^>]*focusable="false"/);
  assert.ok(!/&bull;|•|·/.test(html), 'no middle dot / bullet');
});

test('F-039 L1: hero actions carry no arrow svg, defaults are sentence case', () => {
  const html = hero();
  const ctas = actionsOf(html, 'joy-hero__ctas');
  assert.ok(!ctas.includes('<svg'), 'no svg (arrow) inside the actions');
  assert.match(html, /joy-button--solid[^>]*joy-button--lg|joy-button--lg[^>]*joy-button--solid/);
  assert.ok(html.includes('Get started free') && html.includes('Explore documentation'), 'sentence-case defaults');
  assert.match(html, /joy-button--outline[^"]*joy-hero__secondary-cta|joy-hero__secondary-cta[^"]*joy-button--outline/);
});

test('F-039 L1: primaryLoading sets aria-busy, disabled and the Button spinner (button case)', () => {
  const btn = firstButton(hero({ primaryLoading: true }));
  assert.match(btn, /aria-busy="true"/);
  assert.match(btn, /\sdisabled(=""|\s|>)/);
  assert.match(btn, /joy-button--loading/);
  assert.match(btn, /class="joy-button__spinner"/);
});

test('F-039 L1: primaryDisabled disables the button; secondaryDisabled disables only the secondary', () => {
  const buttons = hero({ primaryDisabled: true }).match(/<button\b[^>]*>/g);
  assert.match(buttons[0], /\sdisabled/);
  assert.ok(!/\sdisabled/.test(buttons[1]), 'secondary is not disabled');
  const b2 = hero({ secondaryDisabled: true }).match(/<button\b[^>]*>/g);
  assert.ok(!/\sdisabled/.test(b2[0]) && /\sdisabled/.test(b2[1]));
});

test('F-039 L1: primaryHref renders a link; disabled or loading link drops href and is aria-disabled', () => {
  const link = firstAnchor(hero({ primaryHref: '/start' }));
  assert.match(link, /^<a\b[^>]*href="\/start"/);
  assert.match(link, /joy-button--solid/);
  assert.ok(!/aria-disabled/.test(link));

  const off = firstAnchor(hero({ primaryHref: '/start', primaryDisabled: true }));
  assert.ok(!/\shref=/.test(off), 'disabled link has no href');
  assert.match(off, /aria-disabled="true"/);
  assert.match(off, /tabindex="-1"/);

  const busy = firstAnchor(hero({ primaryHref: '/start', primaryLoading: true }));
  assert.ok(!/\shref=/.test(busy));
  assert.match(busy, /aria-busy="true"/);
  assert.match(busy, /aria-disabled="true"/);
  assert.match(busy, /joy-button--loading/);
  assert.match(busy, /class="joy-button__spinner"/);

  const sec = hero({ secondaryHref: '/docs' });
  assert.match(sec, /<a\b[^>]*href="\/docs"[^>]*>/);
  assert.match(sec, /<a\b[^>]*joy-button--outline/);
});

test('F-039 L1: rest attributes land on the hero and CTA root, className merges', () => {
  const h = hero({ 'data-x': '1', 'aria-label': 'Landing hero', className: 'extra' });
  assert.match(h, /^<section\b[^>]*class="joy-hero extra"/);
  assert.match(h, /^<section\b[^>]*data-x="1"/);
  assert.match(h, /^<section\b[^>]*aria-label="Landing hero"/);
  assert.match(cta({ 'data-x': '1' }), /^<section\b[^>]*data-x="1"/);
});

test('F-039 L1: CTASection has no glass class, outline secondary, no arrow svg, sentence-case defaults', () => {
  const html = cta({ description: 'Join now' });
  assert.ok(!html.includes('joy-button--glass'), 'glass is gone');
  assert.match(html, /<button\b[^>]*joy-button--outline[^>]*>/);
  assert.ok(!html.includes('<svg'), 'no arrow svg');
  assert.ok(html.includes('Get started today') && html.includes('Contact sales'));
});

test('F-039 L1: CTASection labels the section by its title (unique id per instance) and takes action props', () => {
  const a = cta({ title: 'One', primaryLoading: true, secondaryHref: '/contact' });
  const id = a.match(/<section\b[^>]*aria-labelledby="([^"]+)"/)[1];
  assert.ok(a.includes(`<h2 class="joy-cta-section__title" id="${id}">One</h2>`), a);
  assert.match(a, /aria-busy="true"/);
  assert.match(a, /<a\b[^>]*href="\/contact"/);
  assert.ok(cta({ title: 'Two' }).includes('aria-labelledby='), 'second instance also labelled');
});
