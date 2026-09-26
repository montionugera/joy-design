import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { render } from 'svelte/server';
import { compile } from 'svelte/compiler';
import { compileSvelte, renderSvelte as renderRaw } from './helpers/render-svelte.js';

// F-039 L1: HeroSection + CTASection (Svelte twin). The React twin asserts the same expectations in
// packages/react/test/landing-hero-cta.test.js.

// Svelte SSR wraps blocks in <!--[--> hydration markers; strip them so the markup reads like the React twin's.
const renderSvelte = async (name, props) => (await renderRaw(name, props)).replace(/<!--[\s\S]*?-->/g, '');

const actionsOf = (html, block) => html.slice(html.indexOf(`class="${block}`));
const firstButton = (html) => html.match(/<button\b[\s\S]*?<\/button>/)[0];
const firstAnchor = (html) => html.match(/<a\b[\s\S]*?<\/a>/)[0];

test('F-039 L1: Svelte landing files compile with zero warnings', () => {
  for (const name of ['HeroSection', 'CTASection', 'LandingAction']) {
    assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), [], `${name} compiles without warnings`);
  }
});

test('F-039 L1: hero titleEmphasis renders a solid emphasis span, no gradient anywhere', async () => {
  const html = await renderSvelte('HeroSection', { title: 'Trade with', titleEmphasis: 'confidence' });
  assert.match(html, /<h1 class="joy-hero__title">Trade with <span class="joy-hero__title-emphasis">confidence<\/span><\/h1>/);
  assert.ok(!/gradient/i.test(html), 'no gradient substring in the markup');
  const plain = await renderSvelte('HeroSection', { title: 'Only title' });
  assert.ok(!plain.includes('joy-hero__title-emphasis'), 'no emphasis span without titleEmphasis');
});

test('F-039 L1: hero badge icon is a decorative 14px svg and the copy has no bullet', async () => {
  const html = await renderSvelte('HeroSection', { badgeText: 'New release' });
  assert.match(html, /<div class="joy-hero__badge"><svg[^>]*width="14"[^>]*height="14"[^>]*aria-hidden="true"[^>]*focusable="false"/);
  assert.ok(!/&bull;|•|·/.test(html), 'no middle dot / bullet');
});

test('F-039 L1: hero actions carry no arrow svg, defaults are sentence case', async () => {
  const html = await renderSvelte('HeroSection', {});
  const ctas = actionsOf(html, 'joy-hero__ctas');
  assert.ok(!ctas.includes('<svg'), 'no svg (arrow) inside the actions');
  assert.match(html, /joy-button--solid[^>]*joy-button--lg|joy-button--lg[^>]*joy-button--solid/);
  assert.ok(html.includes('Get started free') && html.includes('Explore documentation'), 'sentence-case defaults');
  assert.match(html, /joy-button--outline[^"]*joy-hero__secondary-cta|joy-hero__secondary-cta[^"]*joy-button--outline/);
});

test('F-039 L1: primaryLoading sets aria-busy, disabled and the Button spinner (button case)', async () => {
  const html = await renderSvelte('HeroSection', { primaryLoading: true });
  const btn = firstButton(html);
  assert.match(btn, /aria-busy="true"/);
  assert.match(btn, /\sdisabled(=""|\s|>)/);
  assert.match(btn, /joy-button--loading/);
  assert.match(btn, /class="joy-button__spinner"/);
});

test('F-039 L1: primaryDisabled disables the button; secondaryDisabled disables only the secondary', async () => {
  const html = await renderSvelte('HeroSection', { primaryDisabled: true });
  const buttons = html.match(/<button\b[^>]*>/g);
  assert.match(buttons[0], /\sdisabled/);
  assert.ok(!/\sdisabled/.test(buttons[1]), 'secondary is not disabled');
  const html2 = await renderSvelte('HeroSection', { secondaryDisabled: true });
  const b2 = html2.match(/<button\b[^>]*>/g);
  assert.ok(!/\sdisabled/.test(b2[0]) && /\sdisabled/.test(b2[1]));
});

test('F-039 L1: primaryHref renders a link; disabled or loading link drops href and is aria-disabled', async () => {
  const link = firstAnchor(await renderSvelte('HeroSection', { primaryHref: '/start' }));
  assert.match(link, /<a\b[^>]*href="\/start"/);
  assert.match(link, /joy-button--solid/);
  assert.ok(!/aria-disabled/.test(link) && !/role=/.test(link), 'an enabled link keeps its native role');

  const off = firstAnchor(await renderSvelte('HeroSection', { primaryHref: '/start', primaryDisabled: true }));
  assert.ok(!/\shref=/.test(off), 'disabled link has no href');
  assert.match(off, /role="link"/);
  assert.match(off, /aria-disabled="true"/);
  assert.match(off, /tabindex="-1"/);

  const busy = firstAnchor(await renderSvelte('HeroSection', { primaryHref: '/start', primaryLoading: true }));
  assert.ok(!/\shref=/.test(busy));
  assert.match(busy, /aria-busy="true"/);
  assert.match(busy, /aria-disabled="true"/);
  assert.match(busy, /joy-button--loading/);
  assert.match(busy, /class="joy-button__spinner"/);

  const sec = await renderSvelte('HeroSection', { secondaryHref: '/docs' });
  assert.match(sec, /<a\b[^>]*href="\/docs"[^>]*>/);
  assert.match(sec, /<a\b[^>]*joy-button--outline/);
});

test('F-039 L1: rest attributes land on the hero and CTA root (ref binding is gated by SVELTE_REF_REST in parity-check)', async () => {
  const hero = await renderSvelte('HeroSection', { 'data-x': '1', 'aria-label': 'Landing hero', class: 'extra' });
  assert.match(hero, /<section\b[^>]*class="joy-hero extra"[^>]*/);
  assert.match(hero, /<section\b[^>]*data-x="1"/);
  assert.match(hero, /<section\b[^>]*aria-label="Landing hero"/);
  const cta = await renderSvelte('CTASection', { title: 'Ready', 'data-x': '1' });
  assert.match(cta, /<section\b[^>]*data-x="1"/);
});

test('F-039 L1: CTASection has no glass class, outline secondary, no arrow svg, sentence-case defaults', async () => {
  const html = await renderSvelte('CTASection', { title: 'Ready to start', description: 'Join now' });
  assert.ok(!html.includes('joy-button--glass'), 'glass is gone');
  assert.match(html, /<button\b[^>]*joy-button--outline[^>]*>/);
  assert.ok(!html.includes('<svg'), 'no arrow svg');
  assert.ok(html.includes('Get started today') && html.includes('Contact sales'));
});

test('F-039 L1: CTASection labels the section by its title and takes action props', async () => {
  const a = await renderSvelte('CTASection', { title: 'One', primaryLoading: true, secondaryHref: '/contact' });
  const id = a.match(/<section\b[^>]*aria-labelledby="([^"]+)"/)[1];
  assert.match(a, new RegExp(`<h2 class="joy-cta-section__title" id="${id}">One</h2>`));
  assert.match(a, /aria-busy="true"/);
  assert.match(a, /<a\b[^>]*href="\/contact"/);
});

test('F-039 L1: two CTASections in one tree get different title ids', async () => {
  const dir = fs.mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '.tmp-cta-pair-'));
  try {
    const target = pathToFileURL(path.resolve(fileURLToPath(import.meta.url), '../../src/lib/CTASection.svelte')).href;
    const file = path.join(dir, 'Pair.svelte');
    fs.writeFileSync(file, `<script>import CTASection from '${target}';</script><CTASection title="One" /><CTASection title="Two" />`);
    await renderRaw('Badge', {}); // registers the .svelte load hook
    const { default: Pair } = await import(pathToFileURL(file).href);
    const html = render(Pair, { props: {} }).body;
    const ids = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map((m) => m[1]);
    assert.strictEqual(ids.length, 2);
    assert.notStrictEqual(ids[0], ids[1], 'each instance owns its title id');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('F-039 L1: a consumer aria-label names the CTA section instead of being hidden by aria-labelledby', async () => {
  const html = await renderSvelte('CTASection', { title: 'One', 'aria-label': 'Sign up band' });
  assert.match(html, /<section\b[^>]*aria-label="Sign up band"/);
  assert.ok(!/<section\b[^>]*aria-labelledby/.test(html));
  const own = await renderSvelte('CTASection', { title: 'One', 'aria-labelledby': 'mine' });
  assert.match(own, /<section\b[^>]*aria-labelledby="mine"/);
});

// F-039 F1 (final review I-1): ref placement and event wiring, without a DOM. The compiled CLIENT component runs against a
// stand-in for svelte/internal/client that hands out DISTINCT nodes (created[0] is the root template node) and records
// which node each bind:this and each delegated handler is attached to. Child components are recording stubs, so a click
// handler is checked where it really lands: on the LandingAction it is handed to, or on the anchor it is delegated from.
const libFile = (name) => fileURLToPath(new URL(`../src/lib/${name}.svelte`, import.meta.url));
function runClient(name, props, childNames = []) {
  const code = compile(fs.readFileSync(libFile(name), 'utf8'), { generate: 'client', filename: libFile(name) }).js.code
    .replace(/^import .*$/gm, '')
    .replace('export default function', 'function');
  const created = [];
  const delegated = [];
  const binds = [];
  const calls = {};
  const noop = () => noop;
  const $ = new Proxy({}, {
    get: (_, key) => {
      switch (key) {
        case 'from_html': return (html) => () => { const node = { html }; created.push(node); return node; };
        case 'child':
        case 'sibling':
        case 'first_child':
        case 'only_child': return () => ({ derived: true });
        case 'props_id': return () => 'uid';
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
  const stubs = childNames.map((child) => (_anchor, p) => { (calls[child] ??= []).push(p); });
  new Function('$', 'props', ...childNames, `${code}\nreturn ${name}({}, props);`)($, props, ...stubs);
  return { created, delegated, binds, calls };
}

test('F-039 F1: bind:this is on the root <section> of HeroSection and CTASection and writes the element to ref', () => {
  const sentinel = { el: true };
  for (const [name, extra] of [['HeroSection', {}], ['CTASection', { title: 'T' }]]) {
    const props = { ...extra, ref: null };
    const { binds, created } = runClient(name, props, ['LandingAction']);
    assert.strictEqual(binds.length, 1, `${name} calls bind_this once`);
    assert.strictEqual(binds[0].el, created[0], `${name} binds the root element, not a descendant`);
    assert.ok(/^<section\b/.test(created[0].html), `${name} root template node is the <section> (${created[0].html})`);
    binds[0].setter(sentinel);
    assert.strictEqual(props.ref, sentinel, `${name} writes the element to ref`);
  }
});

test('F-039 F1: onprimaryclick and onsecondaryclick reach the matching LandingAction, with its variant', () => {
  const primary = () => {};
  const secondary = () => {};
  for (const [name, extra] of [['HeroSection', {}], ['CTASection', { title: 'T' }]]) {
    const { calls } = runClient(name, { ...extra, onprimaryclick: primary, onsecondaryclick: secondary }, ['LandingAction']);
    const [first, second] = calls.LandingAction;
    assert.strictEqual(calls.LandingAction.length, 2, `${name} renders two actions`);
    assert.strictEqual(first.onclick, primary, `${name} primary`);
    assert.strictEqual(first.variant, 'solid');
    assert.strictEqual(second.onclick, secondary, `${name} secondary`);
    assert.strictEqual(second.variant, 'outline');
  }
});

test('F-039 F1: LandingAction hands the handler to Button when there is no href, and delegates the click on the anchor when there is', () => {
  let calls = 0;
  const handler = () => { calls += 1; };
  const asButton = runClient('LandingAction', { onclick: handler }, ['Button']);
  assert.strictEqual(asButton.calls.Button[0].onclick, handler, 'Button gets the handler');
  assert.strictEqual(asButton.delegated.length, 0, 'no anchor handler without an href');

  const link = runClient('LandingAction', { href: '/x', onclick: handler });
  assert.strictEqual(link.delegated.length, 1);
  const { event, el, handler: run } = link.delegated[0];
  assert.strictEqual(event, 'click');
  assert.ok(!el.derived && /^<a\b/.test(el.html), `the click is delegated from the anchor itself (${el.html})`);
  const click = { prevented: 0, preventDefault() { this.prevented += 1; } };
  run(click);
  assert.deepStrictEqual([calls, click.prevented], [1, 0], 'an enabled link runs the handler and leaves navigation to the browser');
  const modified = { metaKey: true, prevented: 0, preventDefault() { this.prevented += 1; } };
  run(modified);
  assert.strictEqual(modified.prevented, 0, 'a modified click is never cancelled by the component');
});

test('F-039 F1: a disabled or loading LandingAction link swallows the click and never calls the handler', () => {
  let calls = 0;
  const handler = () => { calls += 1; };
  for (const state of [{ disabled: true }, { loading: true }]) {
    const { delegated } = runClient('LandingAction', { href: '/x', onclick: handler, ...state });
    const click = { prevented: 0, preventDefault() { this.prevented += 1; } };
    delegated[0].handler(click);
    assert.deepStrictEqual([calls, click.prevented], [0, 1], `${JSON.stringify(state)}: preventDefault called, handler not called`);
  }
});
