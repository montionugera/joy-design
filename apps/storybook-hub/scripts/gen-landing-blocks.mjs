// Generator for the hub's landing views (apps/storybook-hub/build.js): `#view-landing-blocks` and the body of the
// full-page simulator `#view-landing-preview`.
//
// The markup in those views is the SSR output of the real Svelte components, so it can drift when a component
// changes. This script owns three regions of build.js, each between a pair of markers, and is the only thing that should
// edit them. Do not edit a region by hand.
//   <!-- landing-blocks:generated:start -->           ... <!-- landing-blocks:generated:end -->            the blocks view
//   <!-- landing-simulator:generated:start -->        ... <!-- landing-simulator:generated:end -->         simulator <main> content
//   <!-- landing-simulator-footer:generated:start --> ... <!-- landing-simulator-footer:generated:end -->  simulator footer
// The simulator header (skip link, banner, drawer), the <main> wrapper and the toolbar stay hand-written (the drawer
// wiring lives in build.js; packages/{svelte,react}/test/landing-page.test.js proves the header class set).
// The simulator body is the real LandingPage render (default copy) plus three hub-only additions marked below: a features
// heading, a pricing section and matching anchors.
//
// Regenerate after changing a landing component (from the repo root):
//   node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write
// Check for drift (exit 1 with a summary when the region is stale; run by packages/svelte/test/hub-landing-blocks.test.js):
//   node apps/storybook-hub/scripts/gen-landing-blocks.mjs --check
// `--root <dir>` points both modes at another checkout layout (used by the test to prove the check turns red).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const rootIndex = args.indexOf('--root');
const root = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const mode = args.includes('--write') ? 'write' : args.includes('--check') ? 'check' : null;
if (!mode) {
  console.error('usage: node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write | --check [--root <dir>]');
  process.exit(2);
}
const buildFile = path.join(root, 'apps/storybook-hub/build.js');
const { createRawSnippet } = await import(pathToFileURL(path.join(root, 'packages/svelte/node_modules/svelte/src/index-server.js')).href);
const { renderSvelte } = await import(pathToFileURL(path.join(root, 'packages/svelte/test/helpers/render-svelte.js')).href);

const snip = (html) => createRawSnippet(() => ({ render: () => html }));
const icon = (name, size) => `@@ICON:${name}:${size}@@`;

// Drop SSR comments, empty class padding, and the icon package's inline style attribute.
function tidy(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/class="([^"]*)"/g, (_, c) => `class="${c.split(/\s+/).filter(Boolean).join(' ')}"`);
}
const R = async (name, props = {}, children) => tidy(await renderSvelte(name, props, { children }));
// Every component instance renders with the uid s1: rename it so ids stay unique on the page.
const uniq = (html, uid) => html.replace(/\bs1\b/g, uid);
const badge = (variant, text) => R('Badge', { variant, size: 'sm' }, text);

// ── indenter: line breaks and depth for block-level tags only (inline whitespace is left as the component rendered it)
const BLOCK = 'div|section|ul|li|footer|header|p|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|th|td|article|nav';
const BLOCK_TAG = new RegExp(`(<\\/?(?:${BLOCK})(?:\\s[^>]*)?>)`, 'g');
const CLOSE_TAG = new RegExp(`^<\\/(?:${BLOCK})>`);
const OPEN_TAG = new RegExp(`^<(?:${BLOCK})(?:\\s|>)`);
function pretty(html) {
  const parts = html.split(BLOCK_TAG).filter((p) => p.trim() !== '');
  let depth = 0;
  const out = [];
  for (const p of parts) {
    if (CLOSE_TAG.test(p)) depth -= 1;
    out.push('  '.repeat(Math.max(depth, 0)) + p.trim());
    if (OPEN_TAG.test(p)) depth += 1;
  }
  return out.join('\n');
}
const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

// ── content ────────────────────────────────────────────────────────────────
const cards = [
  { badge: ['brand', 'Speed'], icon: icon('Cpu', 22), title: 'Fast order matching', description: 'Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.', linkText: 'Explore charts', linkHref: '#charts' },
  { badge: ['success', 'WCAG 2.2 AA'], icon: icon('Shield', 22), title: 'Dark mode that holds up', description: 'Every text and surface pair is checked for contrast in both themes, so no button turns white on white.', linkText: 'Inspect tokens', linkHref: '#tokens' },
  { badge: ['warning', 'Twin packages'], icon: icon('Layers', 22), title: 'Svelte 5 and React 19', description: 'Both packages share one token set, the same class names and the same keyboard behaviour.', linkText: 'See the overview', linkHref: '#overview' },
  { badge: ['neutral', 'Data'], icon: icon('Database', 22), title: 'Dense financial tables', description: 'Sticky headers, aligned numbers and a stacked layout for phones keep long ledgers readable.', linkText: 'Open the ledger', linkHref: '#financial-table' },
  { badge: ['brand', 'Security'], icon: icon('LockClose', 22), title: 'Safe by default', description: 'Forms, dialogs and drawers trap focus, restore it on close and label every control for screen readers.', linkText: 'See dialogs', linkHref: '#modal' },
  { badge: ['success', 'Charts'], icon: icon('CandlestickChart', 22), title: 'Live charts at 60 FPS', description: 'Canvas charts cull off-screen points and reuse buffers, so a busy tick stream stays smooth.', linkText: 'View charts', linkHref: '#charts' },
];

async function featureCard(c) {
  return R('FeatureCard', { ...c, icon: snip(c.icon), badge: snip(await badge(...c.badge)) });
}
async function featureGrid(n, layout, id, columns) {
  const inner = (await Promise.all(cards.slice(0, n).map(featureCard))).join('');
  return R('FeatureGrid', { layout, id, ...(columns ? { columns } : {}) }, inner);
}

// BentoCard: spans below 3 columns suit decorative tiles only.
const DECORATIVE_BELOW = 3;
const spanLabel = (n) => (n >= DECORATIVE_BELOW ? `${n} of 12` : undefined);
async function bentoTile(n, alias) {
  const html = await R('BentoCard', { colSpan: n, title: spanLabel(n), 'aria-hidden': n < DECORATIVE_BELOW ? 'true' : undefined });
  return alias ? html.replace(`joy-bento-card--col-${n}`, `joy-bento-card--col-span-${n}`) : html;
}
const spanRows = [[12], [1, 11], [2, 10], [3, 9], [4, 8], [5, 7], [6, 6]];
async function bentoSpans(alias, id) {
  const tiles = [];
  for (const row of spanRows) for (const n of row) tiles.push(await bentoTile(n, alias));
  return R('BentoGrid', { id }, tiles.join(''));
}

async function chips(items) {
  const inner = (await Promise.all(items.map(([v, t]) => badge(v, t)))).join('');
  return `<div class="landing-demo__chips">${inner}</div>`;
}
async function showcaseBento() {
  const spec = [
    [6, 'Latency', 'Fast order routing', 'A co-located gateway keeps the path from click to book short and steady.', [['success', '0.42 ms'], ['brand', 'DPDK']]],
    [6, 'Liquidity', 'One view of every venue', 'Quotes from 14 settlement layers merge into one book with automatic route splits.', [['brand', '14 chains'], ['neutral', 'No slippage']]],
    [8, 'Analytics', 'Risk and telemetry in real time', 'Greeks, value at risk and distance to liquidation stream to the screen at 60 FPS.', [['warning', 'VAR 99.9%'], ['brand', '60 FPS']]],
    [4, 'Security', 'Split-key vaults', 'Keys are shared across separate devices, so no single failure exposes funds.', [['success', 'FIPS 140-3']]],
    [12, 'Audit', 'Tamper-proof audit trail', 'Every action lands in a write-once log with proofs you can check and export in seconds.', [['brand', 'Write once'], ['success', 'SOC 2 Type II'], ['neutral', 'Live attestation']]],
  ];
  const out = [];
  for (const [colSpan, b, title, description, chipItems] of spec) {
    out.push(await R('BentoCard', { colSpan, badge: b, title, description }, await chips(chipItems)));
  }
  return R('BentoGrid', { id: 'blocks-bento-showcase' }, out.join(''));
}

const heroSubtitle = 'Ready-made sections that share tokens, states and keyboard behaviour with the rest of the system.';

// ── assemble ───────────────────────────────────────────────────────────────
function box(title, note, body, { flush = false } = {}) {
  return `<div class="playground-box">
  <div class="playground-header">
    <h4>${title}</h4>
  </div>
  <div class="landing-demo${flush ? ' landing-demo--flush' : ''}">
    ${note ? `<p class="landing-demo__note">${note}</p>` : ''}
    ${body}
  </div>
</div>`;
}
const group = (label, body) => `<div class="landing-demo__group">
  <h5 class="landing-demo__label">${label}</h5>
  ${body}
</div>`;
const frame = (body) => `<div class="landing-demo__frame">${body}</div>`;

const heroDefault = await R('HeroSection', {
  badgeText: 'New: landing blocks',
  title: 'Launch pages that feel',
  titleEmphasis: 'finished',
  subtitle: heroSubtitle,
  primaryCtaText: 'Get started free',
  secondaryCtaText: 'Read the docs',
});
const heroLoading = await R('HeroSection', {
  title: 'Primary action while loading',
  subtitle: 'The button shows a spinner, ignores clicks and reports aria-busy.',
  primaryCtaText: 'Creating account',
  secondaryCtaText: 'Read the docs',
  primaryLoading: true,
});
const heroDisabled = await R('HeroSection', {
  title: 'Primary action disabled',
  subtitle: 'The button is dimmed and skipped by the keyboard until the form is ready.',
  primaryCtaText: 'Get started free',
  secondaryCtaText: 'Read the docs',
  primaryDisabled: true,
});
const heroLink = await R('HeroSection', {
  title: 'Primary action as a link',
  subtitle: 'With an href both buttons render as anchors and keep the same look.',
  primaryCtaText: 'Open the docs',
  secondaryCtaText: 'See pricing',
  primaryHref: '#',
  secondaryHref: '#',
});

const pricingCards = [
  await R('PricingCard', { title: 'Developer', description: 'Core tokens, icons and the base components.', price: '$0', features: ['138 vector icons', 'Svelte 5 and React 19 packages', 'Community chat support'], ctaText: 'Start free' }),
  await R('PricingCard', { title: 'Professional', description: 'The full financial suite and every landing block.', price: '$149', features: ['Everything in Developer', 'Dense financial tables', 'Landing block library', 'Priority support, 24/7'], ctaText: 'Upgrade to Pro', featured: true, badge: 'Most popular' }),
  await R('PricingCard', { title: 'Team', description: 'Shared themes and seats for a whole desk.', price: '$899', features: ['Unlimited seats', 'Custom theme export', 'Named account manager'], ctaText: 'Contact sales' }),
];
const pricingStates = [
  await R('PricingCard', { title: 'Loading', description: 'The button is busy and ignores clicks.', price: '$149', features: ['Spinner in the button', 'aria-busy is set'], ctaText: 'Upgrade to Pro', featured: true, loading: true }),
  await R('PricingCard', { title: 'Disabled', description: 'The plan cannot be picked right now.', price: '$0', features: ['Button is dimmed', 'Skipped by the keyboard'], ctaText: 'Start free', disabled: true }),
];
const matrixSpec = {
  columns: ['Developer', 'Professional', 'Team', 'Enterprise'],
  rows: [
    { label: 'Vector icons', values: ['138', '138', '138', '138'] },
    { label: 'Financial tables', values: [false, true, true, true] },
    { label: 'Landing block library', values: [false, true, true, true] },
    { label: 'Custom theme export', values: [false, false, true, true] },
    { label: 'Seats included', values: ['1', '5', 'Unlimited', 'Unlimited'] },
    { label: 'Priority support', values: [false, true, true, true] },
    { label: 'Dedicated manager', values: [false, false, false, true] },
  ],
};
const matrix = await R('PricingMatrix', { id: 'blocks-matrix', label: 'Compare plans', rowHeaderLabel: 'Feature', ...matrixSpec });

const stats = await R('StatsSection', {
  stats: [
    { label: 'P99 order latency', value: '4.2 \u00b5s', description: 'Measured inside the colocation window', change: '14% faster vs L1', trend: 'up' },
    { label: 'Gateway uptime', value: '99.999%', description: 'Two-site failover', change: 'Zero downtime', trend: 'up' },
    { label: 'Monthly volume', value: '$48.2B', description: 'Routed across all venues', change: '3% lower', trend: 'down' },
    { label: 'Settlement networks', value: '14 chains', description: 'Bridged through one API', change: 'No change', trend: 'neutral' },
  ],
});

const testimonials = [
  await R('TestimonialCard', { quote: 'The switch from a generic kit was quick. Dense financial views and Svelte 5 runes cut our portal re-render cost by 40%.', authorName: 'Alex Kim', authorRole: 'Lead engineer, Quant Fund', avatarInitials: 'AK', rating: 5 }),
  await R('TestimonialCard', { quote: 'Dark mode just works. No stray white panels, and the icon set matches the rest of our product.', authorName: 'Maya Lin', authorRole: 'Design lead, JoyPortal', avatarInitials: 'ML', rating: 4 }),
];

const faq = await R('FAQSection', {
  title: 'Questions we hear most',
  subtitle: 'Short answers about charts, themes and tables.',
  items: [
    { question: 'How do charts stay at 60 FPS with 100k candles?', answer: 'Two stacked canvases split static and live drawing, points outside the view are skipped, and ring buffers avoid garbage collection pauses.', defaultOpen: true },
    { question: 'Can we switch themes without a re-render?', answer: 'Yes. Colour comes from CSS custom properties, so changing the theme attribute restyles the page at once with no layout shift.' },
    { question: 'How do tables behave on a phone?', answer: 'With the stacked layout on, each row becomes a small card under 768px and every value keeps its column label.' },
  ],
})  .then((h) => uniq(h, 'blocks-faq').replace(/class="joy-faq-item__trigger"/g, 'class="joy-faq-item__trigger" onclick="toggleFaq(this)"'));

const logoSvg = (mark, label, w) => `<svg width="${w}" height="32" viewBox="0 0 ${w} 32" fill="none" aria-hidden="true" focusable="false">${mark}<text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">${label}</text></svg>`;
const logoCloud = uniq(await R('LogoCloud', {
  title: 'Trusted by trading desks and liquidity providers',
  logos: [
    { name: 'Quantum', svgHtml: logoSvg('<rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', 'QUANTUM', 120) },
    { name: 'Citadel', svgHtml: logoSvg('<polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/>', 'CITADEL', 110) },
    { name: 'Nexus Capital', svgHtml: logoSvg('<circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="currentColor"/>', 'NEXUS CAP', 120) },
    { name: 'Flow Desk', svgHtml: logoSvg('<rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', 'FLOW DESK', 115) },
    { name: 'Apex Alpha', href: 'https://github.com/montionugera/joy-design', svgHtml: logoSvg('<path d="M4 22L12 8L20 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>', 'APEX ALPHA', 125) },
  ],
}), 'blocks-logos');

const ctaDefault = uniq(await R('CTASection', {
  title: 'Ready to ship a clearer interface?',
  description: 'Join the desks building on Joymify tokens and its low-latency chart suite.',
  primaryCtaText: 'Deploy now',
  secondaryCtaText: 'Book a demo',
}), 'blocks-cta-default');
const ctaStates = uniq(await R('CTASection', {
  title: 'Busy and unavailable states',
  description: 'The primary button spins while a request runs; the secondary button can be disabled on its own.',
  primaryCtaText: 'Deploying',
  secondaryCtaText: 'Book a demo',
  primaryLoading: true,
  secondaryDisabled: true,
}), 'blocks-cta-states');

const githubSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>';
const footer = await R('SiteFooter', {
  brandTitle: 'Joymify Design',
  brandDescription: 'A design system for building clear, fast financial apps.',
  copyright: '© 2026 Joymify Inc. All rights reserved.',
  columns: [
    { title: 'Explore', links: [{ label: 'Financial charts', href: '#charts' }, { label: 'Adaptive tables', href: '#table' }, { label: 'Landing blocks', href: '#landing-blocks' }, { label: 'Design tokens', href: '#tokens' }] },
    { title: 'Frameworks', links: [{ label: 'React 19 hooks', href: '#' }, { label: 'Svelte 5 runes', href: '#' }, { label: 'Token theming', href: '#tokens' }] },
    { title: 'Trust', links: [{ label: 'WCAG 2.2 AA', href: '#' }, { label: 'Audit logs', href: '#' }, { label: 'SOC 2 Type II', href: '#' }] },
  ],
  socialLinks: [{ name: 'GitHub', href: 'https://github.com/montionugera/joy-design', svgHtml: githubSvg }],
});

const sections = [];
sections.push(`<h2 class="landing-demo-title">Landing Blocks</h2>
<p class="header-tagline">Every landing block in the states it can be in: hero (default, loading, disabled), feature grid with 3 to 6 cards, bento spans 1 to 12, pricing cards and comparison table, stats, testimonials, FAQ, logo cloud, call to action and footer. The markup is what the components render.</p>`);

sections.push(`<!-- Interactive 3D Kinetic Particle Hero Showcase -->
<div class="kinetic-canvas-container" id="kinetic-hero-container">
  <canvas class="kinetic-canvas" id="kinetic-particle-canvas"></canvas>
  <div class="kinetic-overlay">
    <div class="kinetic-badge">
      <span class="kinetic-badge-dot"></span>
      <span>Interactive particle field, 60 FPS</span>
    </div>
    <h1 class="kinetic-title">Fast, clear <span class="kinetic-title-emphasis">order screens</span> for busy desks</h1>
    <p class="kinetic-subtitle">Order routing, dark-mode telemetry and steady UI parts built for dense, accessible screens.</p>
    <div class="kinetic-actions">
      <button type="button" class="joy-button joy-button--solid joy-button--md" onclick="triggerCanvasBurst(event); showDemoToast('Primary CTA triggered: Deploying pipeline', 'success')">Deploy solution</button>
      <button type="button" class="joy-button joy-button--outline joy-button--md" onclick="showDemoToast('Viewing API Documentation', 'info')">Read the guide</button>
    </div>
    <div class="kinetic-hint">Move the cursor or touch to nudge the particles. Click to send a pulse.</div>
  </div>
</div>`);

sections.push(box('Hero states (HeroSection)', 'Default with a title emphasis, then the primary button loading, disabled, and both buttons as links. The secondary button stays available in every state.',
  `<div class="landing-demo__stack">
${group('Default with title emphasis', frame(heroDefault))}
${group('Primary loading', frame(heroLoading))}
${group('Primary disabled', frame(heroDisabled))}
${group('Both as links', frame(heroLink))}
</div>`));

const leadHtml = [];
for (const n of [3, 4, 5, 6]) leadHtml.push(group(`${n} cards, lead layout`, await featureGrid(n, 'lead', `blocks-feature-lead-${n}`)));
sections.push(box('Feature grid (FeatureGrid)', 'The lead layout is the default: from 900px the first card spans two of three columns and the last card fills its row, so any number of cards leaves no empty cell. Below 900px it is one column.',
  `<div class="landing-demo__stack">
${leadHtml.join('\n')}
${group('Uniform layout, up to 3 columns', await featureGrid(6, 'uniform', 'blocks-feature-uniform', 3))}
</div>`));

sections.push(box('Bento grid (BentoGrid, BentoCard)', 'A 12-column grid. Under 900px every card is full width.', await showcaseBento()));
sections.push(box('Bento spans 1 to 12', 'Every span in use. Tiles narrower than 3 columns are decorative only. The first grid uses the classes BentoCard emits, the second uses the documented aliases.',
  `<div class="landing-demo__stack">
${group('Spans from BentoCard colSpan', await bentoSpans(false, 'blocks-bento-cols'))}
${group('Spans from the col-span-N alias', await bentoSpans(true, 'blocks-bento-spans'))}
</div>`));

sections.push(box('Pricing cards (PricingCard)', 'Three plans with the featured card marked, then the loading and disabled button states.',
  `<div class="landing-demo__stack">
${group('Default and featured', `<div class="joy-pricing-fit">${await R('PricingMatrix', { label: 'Pricing plans' }, pricingCards.join(''))}</div>`)}
${group('Loading and disabled', `<div class="joy-pricing-fit">${await R('PricingMatrix', { label: 'Pricing plan states' }, pricingStates.join(''))}</div>`)}
</div>`));

sections.push(box('Plan comparison table', 'A real table in a scroll region. The first column stays pinned when the table scrolls sideways.', matrix));
sections.push(box('Key metrics (StatsSection)', 'Up, down and neutral trends. The trend arrow is decoration and the change text carries the meaning.', stats));
sections.push(box('Testimonials', 'Five-star and four-star ratings.', `<div class="landing-demo__columns">${testimonials.join('')}</div>`));
sections.push(box('FAQ accordion (FAQSection)', 'Each question is a button that reports whether its answer is open. The answer stays in the page and is hidden while closed.', faq));
sections.push(box('Partner cloud (LogoCloud)', 'Static logos and one linked logo (the last one).', logoCloud));
sections.push(box('Call to action (CTASection)', 'Default band, then the loading and disabled button states on the inverse surface.',
  `<div class="landing-demo__stack">
${group('Default', ctaDefault)}
${group('Primary loading, secondary disabled', ctaStates)}
</div>`));
sections.push(box('Footer (SiteFooter)', null, footer, { flush: true }));

let body = sections.map(pretty).join('\n\n');

// Escape for a JS template literal, then restore the intended icon expressions.
const toTemplate = (text) => text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
body = toTemplate(body);
body = body.replace(/@@ICON:([A-Za-z0-9]+):([0-9a-z%]+)@@/g, (_, n, s) => '${simIcon("' + n + '", "' + s + '")}');

// ── simulator body: the real LandingPage render, plus the hub-only additions ──────────────────────────────────────────
// Anchors: the page ids are prefixed (`sim-`) so they never collide with the hub's own ids. The header block in build.js
// (hand-written) links to #sim-features, #sim-pricing, #sim-telemetry and #sim-faq.
const page = tidy(await renderSvelte('LandingPage'));
const mainOpen = page.match(/<main id="[^"]*" tabindex="-1">/);
const mainStart = mainOpen ? page.indexOf(mainOpen[0]) + mainOpen[0].length : -1;
const mainEnd = page.indexOf('</main>');
const footerStart = page.indexOf('<footer class="joy-site-footer">');
const footerEnd = page.indexOf('</footer>') + '</footer>'.length;
if (mainStart < 0 || mainEnd < mainStart || footerStart < mainEnd || footerEnd < footerStart) {
  console.error('LandingPage render has no <main tabindex="-1">...</main> followed by <footer class="joy-site-footer">');
  process.exit(2);
}
const simIds = (html) =>
  html
    .replace(/\bs(\d+)\b/g, 'sim$1')
    .replace(/(id|href)="#?(features|telemetry|faq)"/g, (m, attr, name) => `${attr}="${attr === 'href' ? '#' : ''}sim-${name}"`)
    .replace(/class="joy-faq-item__trigger"/g, 'class="joy-faq-item__trigger" onclick="toggleFaq(this)"');
let simMain = simIds(page.slice(mainStart, mainEnd));
const simFooter = simIds(page.slice(footerStart, footerEnd));

// Hub-only 1: a section heading above the feature grid (LandingPage has none).
const sectionHeader = (title, subtitle) => `<div class="joy-landing-page__section-header"><h2 class="joy-landing-page__section-title">${title}</h2><p class="joy-landing-page__section-subtitle">${subtitle}</p></div>`;
const featuresOpen = '<div id="sim-features" class="joy-landing-page__features">';
if (!simMain.includes(featuresOpen)) {
  console.error(`the LandingPage render has no ${featuresOpen}`);
  process.exit(2);
}
simMain = simMain.replace(featuresOpen, featuresOpen + sectionHeader('Built for busy trading desks', 'Fast screens, clear tables and themes that stay readable in light and dark.'));

// Hub-only 2: the pricing section (3 plan cards and the comparison table) before the FAQ.
const faqOpen = '<div id="sim-faq">';
if (!simMain.includes(faqOpen)) {
  console.error(`the LandingPage render has no ${faqOpen}`);
  process.exit(2);
}
const simMatrix = uniq(await R('PricingMatrix', {
  id: 'sim-matrix', label: 'Compare plans', rowHeaderLabel: 'Feature', columns: matrixSpec.columns, rows: matrixSpec.rows,
}), 'sim-matrix');
const pricingSection = `<div id="sim-pricing" class="joy-landing-page__pricing">${sectionHeader('Simple plans for every desk', 'Start free, then add seats and tools as your team grows.')}${await R('PricingMatrix', { label: 'Pricing plans' }, pricingCards.join(''))}${simMatrix}</div>`;
simMain = simMain.replace(faqOpen, pricingSection + faqOpen);

const simBody = (html, depth) => indent(toTemplate(pretty(html)), depth);

// ── regions ────────────────────────────────────────────────────────────────
// `text` is everything from the start marker to the end marker inclusive; the first line sits after the indent that
// precedes the marker in build.js.
const regions = [
  {
    name: 'landing-blocks',
    text: (start, end) => `${start}
      <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the Svelte components: do not edit by hand. -->
      <section id="view-landing-blocks" class="view-panel">
${indent(body, 8)}
      </section>
      ${end}`,
  },
  {
    name: 'landing-simulator',
    text: (start, end) => `${start}
                <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the real LandingPage render (default copy), plus a features heading and a pricing section that only the hub adds. Do not edit by hand. -->
${simBody(simMain, 16)}
                ${end}`,
  },
  {
    name: 'landing-simulator-footer',
    text: (start, end) => `${start}
              <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the real LandingPage render: do not edit by hand. -->
${simBody(simFooter, 14)}
              ${end}`,
  },
];

let src = fs.readFileSync(buildFile, 'utf8');
const drifted = [];
for (const region of regions) {
  const start = `<!-- ${region.name}:generated:start -->`;
  const end = `<!-- ${region.name}:generated:end -->`;
  const from = src.indexOf(start);
  const to = src.indexOf(end);
  if (from < 0 || to < from) {
    console.error(`markers ${start} / ${end} not found in ${buildFile}`);
    process.exit(2);
  }
  const current = src.slice(from, to + end.length);
  const generated = region.text(start, end);
  if (mode === 'write') {
    src = src.slice(0, from) + generated + src.slice(to + end.length);
    console.log(`wrote ${generated.split('\n').length} lines of ${region.name} to ${path.relative(root, buildFile)}`);
  } else if (current !== generated) {
    drifted.push({ name: region.name, current, generated });
  }
}

if (mode === 'write') {
  fs.writeFileSync(buildFile, src);
} else if (drifted.length === 0) {
  console.log('landing blocks and simulator in build.js match the components');
} else {
  for (const { name, current, generated } of drifted) {
    const a = current.split('\n');
    const b = generated.split('\n');
    const diffs = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) diffs.push(i);
    console.error(`landing blocks drift in ${name}: build.js differs from the components on ${diffs.length} of ${b.length} lines (committed ${a.length}, generated ${b.length}).`);
    for (const i of diffs.slice(0, 8)) {
      console.error(`  line ${i + 1}\n    build.js  : ${(a[i] ?? '<missing>').trim().slice(0, 160)}\n    generated : ${(b[i] ?? '<missing>').trim().slice(0, 160)}`);
    }
  }
  console.error('Regenerate with: node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write');
  process.exit(1);
}
