import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { contrastRatio } from '../scripts/color.mjs';
import { parseCssTokens } from './helpers/css-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../../scripts/parity-check.mjs');
const mod = await import(pathToFileURL(scriptPath).href);
const repoRoot = path.resolve(__dirname, '../../..');

// runParityCheck needs the real theme.css; mirror it into a temp tree.
function mirrorThemeCss(tmp) {
  fs.mkdirSync(path.join(tmp, 'packages/tokens/dist'), { recursive: true });
  fs.copyFileSync(path.join(repoRoot, 'packages/tokens/dist/theme.css'), path.join(tmp, 'packages/tokens/dist/theme.css'));
}

function withTempSvelteDir(files, fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-svelte-ref-'));
  try {
    fs.mkdirSync(path.join(root, 'packages/svelte/src/lib'), { recursive: true });
    for (const [name, src] of Object.entries(files)) {
      fs.writeFileSync(path.join(root, `packages/svelte/src/lib/${name}.svelte`), src);
    }
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const OK = `<script lang="ts">
  let { title = '', ref = $bindable(null), ...rest }: { title?: string; ref?: HTMLElement | null } = $props();
</script>

<section bind:this={ref} class="joy-ok" {...rest}>{title}</section>
`;

const BAD = `<script lang="ts">
  let { title = '' }: { title?: string } = $props();
</script>

<section class="joy-bad">{title}</section>
`;

test('Wave 4 A1 SVELTE_REF_REST is exported and the checker is a function', () => {
  assert.ok(Array.isArray(mod.SVELTE_REF_REST), 'SVELTE_REF_REST must be exported as an array');
  assert.strictEqual(typeof mod.checkSvelteRefRest, 'function', 'checkSvelteRefRest must be exported');
  assert.deepStrictEqual(mod.checkSvelteRefRest(repoRoot), [], 'the shipped tree has no ref/rest failures');
});

test('Wave 4 A1 checkSvelteRefRest reports exactly the non-compliant file with the right missing entries', () => {
  withTempSvelteDir({ Ok: OK, Bad: BAD }, (root) => {
    assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Ok', 'Bad']), [
      { component: 'Bad', missing: ['ref', 'restSpread', 'bindThis'] }
    ]);
    assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Ok']), []);
  });
});

test('Wave 4 A1 checkSvelteRefRest reports each missing piece independently and a missing file', () => {
  withTempSvelteDir(
    {
      NoBind: OK.replace(' bind:this={ref}', ''),
      NoRest: OK.replace(', ...rest', '').replace(' {...rest}', ''),
      NoRef: OK.replace('ref = $bindable(null), ', '').replace(' bind:this={ref}', ' bind:this={el}'),
      // Comments must not satisfy the check.
      Commented: `<script>\n  let { title } = $props();\n  // ref = $bindable(null), ...rest\n</script>\n<!-- bind:this={ref} {...rest} -->\n<p>{title}</p>\n`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['NoBind', 'NoRest', 'NoRef', 'Commented', 'Gone']).map((f) => [f.component, f.missing])
      );
      assert.deepStrictEqual(byName.NoBind, ['bindThis']);
      assert.deepStrictEqual(byName.NoRest, ['restSpread']);
      assert.deepStrictEqual(byName.NoRef, ['ref', 'bindThis']);
      assert.deepStrictEqual(byName.Commented, ['ref', 'restSpread', 'bindThis']);
      assert.deepStrictEqual(byName.Gone, ['file']);
    }
  );
});

test('Wave 4 A1 runParityCheck turns a Svelte ref/rest failure into a FAIL row in twin and svelte mode but not react mode', () => {
  const original = mod.SVELTE_REF_REST.slice();
  try {
    withTempSvelteDir({ Bad: BAD }, (tmp) => {
      mirrorThemeCss(tmp);
      mod.SVELTE_REF_REST.push('Bad');
      for (const side of [null, 'svelte']) {
        const result = mod.runParityCheck({ rootDir: tmp, side });
        const row = result.checks.find((c) => c.component === 'Bad' && /ref\/rest/.test(c.check));
        assert.ok(row, `side=${side}: a ref/rest row must be reported`);
        assert.strictEqual(row.status, 'FAIL');
        assert.strictEqual(result.passed, false);
        assert.deepStrictEqual(
          result.checks.filter((c) => c.component === 'Bad'),
          [{ component: 'Bad', check: 'Svelte ref/rest (ref, restSpread, bindThis)', status: 'FAIL' }],
          `side=${side}: exactly one Bad row with the exact missing list`
        );
        assert.match(mod.formatMarkdownTable(result), /\| Bad \| Svelte ref\/rest \(ref, restSpread, bindThis\) \| FAIL \|/);
      }
      const reactOnly = mod.runParityCheck({ rootDir: tmp, side: 'react' });
      assert.ok(!reactOnly.checks.some((c) => /ref\/rest/.test(c.check)), 'react mode must not run the Svelte check');
    });
  } finally {
    mod.SVELTE_REF_REST.length = 0;
    mod.SVELTE_REF_REST.push(...original);
  }
});

test('Wave 4 A1 checkSvelteRefRest reads the markup only for the rest spread and bind:this', () => {
  withTempSvelteDir(
    {
      // {...rest} only inside <script> is not a spread on an element.
      ScriptOnlyRest: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const merged = { ...rest };
</script>
<section bind:this={ref}>x</section>
`,
      // bind:this={ref} only inside a script string is not a binding.
      ScriptOnlyBind: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const note = 'bind:this={ref}';
</script>
<section {...rest}>x</section>
`,
      // ref = $bindable(null) only in markup is not a destructure.
      MarkupOnlyRef: `<script lang="ts">
  let { ...rest } = $props();
</script>
<section bind:this={ref} {...rest}>ref = $bindable(null)</section>
`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['ScriptOnlyRest', 'ScriptOnlyBind', 'MarkupOnlyRef']).map((f) => [f.component, f.missing])
      );
      assert.deepStrictEqual(byName.ScriptOnlyRest, ['restSpread']);
      assert.deepStrictEqual(byName.ScriptOnlyBind, ['bindThis']);
      assert.deepStrictEqual(byName.MarkupOnlyRef, ['ref']);
    }
  );
});

test('Wave 4 A1 checkSvelteRefRest accepts the generic $bindable<T>(null) form', () => {
  withTempSvelteDir(
    {
      Generic: OK.replace('$bindable(null)', '$bindable<HTMLElement | null>(null)'),
      Nested: OK.replace('$bindable(null)', '$bindable<Array<HTMLElement> | null>(null)'),
      // A non-null default is still not the contract.
      NotNull: OK.replace('$bindable(null)', '$bindable<HTMLElement | null>(undefined)')
    },
    (root) => {
      assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Generic', 'Nested', 'NotNull']), [
        { component: 'NotNull', missing: ['ref'] }
      ]);
    }
  );
});

test('Wave 4 A1 checkSvelteRefRest strips JS comments only in script and HTML comments only in markup', () => {
  withTempSvelteDir(
    {
      // An unbalanced "<!--" string in the script must not hide the markup that follows.
      HtmlInScript: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const open = '<!--';
</script>
<section bind:this={ref} {...rest}>x</section>
<!-- closing -->
`,
      // A commented-out markup binding must not count.
      HtmlCommented: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
</script>
<!-- <section bind:this={ref} {...rest}> -->
<section>x</section>
`,
      // A // comment inside the script must not count as a destructure.
      JsCommented: `<script lang="ts">
  // let { ref = $bindable(null), ...rest } = $props();
  let { title } = $props();
</script>
<section bind:this={ref} {...rest}>{title}</section>
`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['HtmlInScript', 'HtmlCommented', 'JsCommented']).map((f) => [f.component, f.missing])
      );
      assert.strictEqual(byName.HtmlInScript, undefined, 'a "<!--" string in the script must not hide markup');
      assert.deepStrictEqual(byName.HtmlCommented, ['restSpread', 'bindThis']);
      assert.deepStrictEqual(byName.JsCommented, ['ref']);
    }
  );
});

test('Wave 4 A1 runParityCheck does not double-report a missing Svelte file that COMPONENTS already reports, but does report one that it does not', () => {
  const original = mod.SVELTE_REF_REST.slice();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-svelte-dedupe-'));
  try {
    mirrorThemeCss(tmp);
    const inComponents = mod.COMPONENTS[0];
    mod.SVELTE_REF_REST.push(inComponents, 'NotInComponentsGone');
    const { checks } = mod.runParityCheck({ rootDir: tmp, side: 'svelte' });
    assert.deepStrictEqual(
      checks.filter((c) => c.component === inComponents),
      [{ component: inComponents, check: 'svelte file exists', status: 'FAIL' }],
      'the COMPONENTS file-exists row is the only row for a listed component'
    );
    assert.deepStrictEqual(
      checks.filter((c) => c.component === 'NotInComponentsGone'),
      [{ component: 'NotInComponentsGone', check: 'Svelte ref/rest (file)', status: 'FAIL' }]
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    mod.SVELTE_REF_REST.length = 0;
    mod.SVELTE_REF_REST.push(...original);
  }
});

// ── F-039 L1: hero + CTA CSS contract (reads the committed dist/theme.css, never runs the build) ──
const themeCss = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
const tokenMaps = parseCssTokens(themeCss);
const block = (from, to) => themeCss.slice(themeCss.indexOf(from), themeCss.indexOf(to));
const heroBlock = block('/* Hero Section */', '/* Pricing Matrix */');
const ctaBlock = block('/* ── Landing Page Suite: CTASection ── */', '/* ── Landing Page Suite: FAQSection ── */');
const rule = (css, selector) => {
  const m = css.match(new RegExp(`(?:^|\\n)${selector.replace(/[.[\]"=()]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `${selector} rule exists`);
  return m[1];
};

test('F-039 L1 CSS: glass button, gradient title and decorative blur are gone', () => {
  assert.ok(!themeCss.includes('joy-button--glass'), 'no .joy-button--glass in theme.css');
  assert.ok(!themeCss.includes('title-gradient'), 'no title-gradient class in theme.css');
  assert.ok(!/backdrop-filter/.test(heroBlock), 'no backdrop-filter in the hero block');
  assert.ok(!/backdrop-filter/.test(ctaBlock), 'no backdrop-filter in the CTA block');
  assert.ok(!/background-clip/.test(heroBlock + ctaBlock), 'no gradient text clip');
});

test('F-039 L1 CSS: hero and CTA titles are fluid, wrap long words and balance lines', () => {
  const display = (name) => themeCss.match(new RegExp(`--joy-font-size-display-${name}:\\s*([^;]+);`))[1];
  assert.match(display('md'), /^clamp\(/);
  assert.match(display('sm'), /^clamp\(/);
  const hero = rule(heroBlock, '.joy-hero__title');
  assert.match(hero, /font-size:\s*var\(--joy-font-size-display-md\)/);
  assert.match(hero, /overflow-wrap:\s*anywhere/);
  assert.match(hero, /text-wrap:\s*balance/);
  const cta = rule(ctaBlock, '.joy-cta-section__title');
  assert.match(cta, /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(cta, /overflow-wrap:\s*anywhere/);
  assert.match(cta, /text-wrap:\s*balance/);
  assert.match(rule(heroBlock, '.joy-hero__title-emphasis'), /^\s*color:\s*var\(--joy-accent-text\);\s*$/);
});

test('F-039 L1 CSS: badge uses accent-text on accent-subtle; hero outline reads strong border and primary text', () => {
  const badge = rule(heroBlock, '.joy-hero__badge');
  assert.match(badge, /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.match(badge, /color:\s*var\(--joy-accent-text\)/);
  assert.match(badge, /border:\s*1px solid var\(--joy-border-default\)/);
  assert.ok(!/text-transform|letter-spacing/.test(badge), 'no tracked caps eyebrow');
  assert.ok(themeCss.includes('.kinetic-overlay .joy-button--outline'), 'the hub hero overlay selector is kept in the shared rule');
  const outline = rule(heroBlock, '.joy-hero .joy-button--outline,\n.joy-hero__secondary-cta,\n.kinetic-overlay .joy-button--outline');
  assert.match(outline, /border-color:\s*var\(--joy-border-strong\)/);
  assert.match(outline, /color:\s*var\(--joy-text-primary\)/);
});

test('F-039 L1 CSS: hero and CTA solid buttons lift 1px on hover and settle on active; actions stack under 480px', () => {
  assert.match(
    rule(heroBlock, '.joy-hero .joy-button--solid:hover:not(:disabled),\n.joy-cta-section .joy-button--solid:hover:not(:disabled)'),
    /transform:\s*translateY\(-1px\)/
  );
  assert.match(
    rule(heroBlock, '.joy-hero .joy-button--solid:active:not(:disabled),\n.joy-cta-section .joy-button--solid:active:not(:disabled)'),
    /transform:\s*none/
  );
  assert.match(heroBlock, /@media \(max-width: 479px\) \{[\s\S]*?\.joy-hero__ctas,\n\s*\.joy-cta-section__actions \{\s*flex-direction: column;\s*align-items: stretch;[\s\S]*?width: 100%;/);
});

test('F-039 L1 CSS: the CTA band is an inverse surface and inverse text is scoped to it', () => {
  assert.match(rule(ctaBlock, '.joy-cta-section__container'), /background:\s*var\(--joy-surface-inverse\)/);
  // A CTA rendered without the band falls back to readable page text, never to inverse text on the canvas.
  assert.match(rule(ctaBlock, '.joy-cta-section__title'), /color:\s*var\(--joy-text-primary\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__desc'), /color:\s*var\(--joy-text-secondary\)/);
  const inverse = rule(ctaBlock, '.joy-cta-section__container .joy-cta-section__title,\n.joy-cta-section__container .joy-cta-section__desc');
  assert.match(inverse, /color:\s*var\(--joy-text-inverse\)/);
  const outline = rule(ctaBlock, '.joy-cta-section__container .joy-button--outline');
  assert.match(outline, /color:\s*var\(--joy-text-inverse\)/);
  assert.match(outline, /border-color:\s*var\(--joy-text-inverse\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__container .joy-button--solid'), /border-color:\s*var\(--joy-text-on-accent\)/);
  assert.ok(!/\.joy-cta-section \.joy-button--outline\s*\{/.test(ctaBlock), 'no unscoped inverse outline rule');
  assert.match(ctaBlock, /@media \(max-width: 479px\) \{\s*\.joy-cta-section \{\s*padding: 32px 16px;[\s\S]*?padding: 40px 20px;/);
});

test('F-039 L1 CSS: the CTA outline hover and press never remove the keyboard focus ring', () => {
  const shadowRule = rule(
    ctaBlock,
    '.joy-cta-section__container .joy-button--outline:hover:not(:disabled):not(:focus-visible),\n.joy-cta-section__container .joy-button--outline:active:not(:disabled):not(:focus-visible)'
  );
  assert.match(shadowRule, /box-shadow:\s*inset 0 0 0 1px var\(--joy-text-inverse\)/);
  const plain = rule(ctaBlock, '.joy-cta-section__container .joy-button--outline:hover:not(:disabled),\n.joy-cta-section__container .joy-button--outline:active:not(:disabled)');
  assert.ok(!/box-shadow/.test(plain), 'the unconditional hover/press rule must not set box-shadow (it would replace the focus ring)');
});

test('F-039 L1 hub: every CTA in the hub markup uses the band container and only defined classes', () => {
  const hub = fs.readFileSync(path.resolve(__dirname, '../../../apps/storybook-hub/build.js'), 'utf8');
  const sections = hub.split(/<(?:section|div) class="joy-cta-section"/).slice(1);
  assert.ok(sections.length >= 2, 'the hub renders at least two CTA blocks');
  for (const chunk of sections) {
    assert.ok(chunk.slice(0, 400).includes('joy-cta-section__container'), 'a hub CTA must wrap its content in .joy-cta-section__container');
  }
  assert.ok(!hub.includes('joy-cta-section__description'), 'undefined class joy-cta-section__description');
});

test('F-039 L1 CSS: a link-based action that is disabled or loading looks and behaves disabled', () => {
  assert.match(themeCss, /\.joy-button\[aria-disabled="true"\],\n\.joy-button:disabled \{/);
  assert.match(themeCss, /\.joy-button\[aria-disabled="true"\] \{ pointer-events: none; \}/);
  // pointer-events on the shared disabled rule would kill cursor:not-allowed for every disabled Button.
  assert.ok(!/pointer-events/.test(rule(themeCss, '.joy-button[aria-disabled="true"],\n.joy-button:disabled')), 'the shared disabled rule must not set pointer-events');
});

test('F-039 L1 contrast: hero and CTA token pairs pass WCAG AA in both themes (computed)', () => {
  const pairs = [
    // [foreground, background, minimum, why]
    ['text-primary', 'surface-raised', 4.5, 'hero outline button text'],
    ['accent-text', 'surface-canvas', 4.5, 'title emphasis on the hero canvas'],
    ['accent-text', 'accent-subtle', 4.5, 'hero badge text'],
    ['text-inverse', 'surface-inverse', 4.5, 'CTA band title, description and outline button text (and its 1px border)'],
    ['text-primary', 'surface-canvas', 4.5, 'CTA title fallback when rendered without the band'],
    ['text-secondary', 'surface-canvas', 4.5, 'CTA description fallback when rendered without the band'],
    ['text-disabled', 'surface-disabled', 4.5, 'disabled button chip on the band'],
    ['surface-canvas', 'surface-inverse', 3, 'focus halo inner ring against the band'],
    ['text-on-accent', 'accent-default', 4.5, 'solid button label, gradient start'],
    ['text-on-accent', 'accent-gradient-end', 4.5, 'solid button label, gradient end'],
    ['border-strong', 'surface-raised', 3, 'hero outline button border'],
    ['border-strong', 'surface-canvas', 3, 'CTA band border against the page']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min, why] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min} (${why})`);
    }
  }
});

test('F-039 L1 contrast: the CTA solid button edge is a dark edge on the cream band in dark and invisible (band colour) in light', () => {
  const on = (theme, fg, bg) => contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
  assert.ok(on('dark', 'text-on-accent', 'surface-inverse') >= 3, 'dark: edge vs cream band');
  assert.strictEqual(tokenMaps.light['--joy-text-on-accent'], tokenMaps.light['--joy-surface-inverse'], 'light: edge equals the navy band, so nothing changes visually');
});

// ── F-039 L2: pricing CSS contract ──
const pricingBlock = block('/* Pricing Matrix */', '/* Testimonial Card */');

test('F-039 L2 CSS: featured card is a full accent border with elevation-2, no purple, no scale, no side stripe', () => {
  const featured = rule(pricingBlock, '.joy-pricing-card--featured');
  assert.match(featured, /border-color:\s*var\(--joy-accent-default\)/);
  assert.match(featured, /box-shadow:\s*var\(--joy-elevation-2\)/);
  assert.ok(!/scale\(/.test(pricingBlock), 'no scale transform anywhere in the pricing block (it clipped the card at 375px)');
  assert.ok(!/border-(left|inline-start)/.test(pricingBlock), 'no side-stripe border');
  assert.ok(!/gradient|purple|7c3aed|8b5cf6/i.test(pricingBlock), 'no gradient or purple');
  assert.ok(!/backdrop-filter/.test(pricingBlock));
});

test('F-039 L2 CSS: card is raised surface with default border, dark comes from the token remap only', () => {
  const card = rule(pricingBlock, '.joy-pricing-card');
  assert.match(card, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(card, /border:\s*1px solid var\(--joy-border-default\)/);
  assert.ok(!/\[data-theme/.test(pricingBlock), 'no [data-theme] selector in the pricing block');
  assert.ok(!/var\(--joy-color-/.test(pricingBlock), 'no phantom var(--joy-color-*)');
  assert.ok(!/transition:\s*all/.test(pricingBlock), 'no transition: all');
});

test('F-039 L2 CSS: badge is solid accent-subtle with accent-text, sentence case, no tracking', () => {
  const badge = rule(pricingBlock, '.joy-pricing-card__badge');
  assert.match(badge, /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.match(badge, /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  assert.ok(!/text-transform/.test(pricingBlock), 'no uppercase transform anywhere in the pricing block');
  for (const [, value] of pricingBlock.matchAll(/letter-spacing:\s*([^;]+);/g)) {
    assert.match(value, /^(-|normal)/, `no positive tracking (found ${value})`);
  }
});

test('F-039 L2 CSS: price uses the display scale and wraps; period and description read text-secondary', () => {
  const price = rule(pricingBlock, '.joy-pricing-card__price');
  assert.match(price, /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(price, /overflow-wrap:\s*anywhere/);
  assert.match(rule(pricingBlock, '.joy-pricing-card__period'), /color:\s*var\(--joy-text-secondary\)/);
  assert.match(rule(pricingBlock, '.joy-pricing-card__desc'), /color:\s*var\(--joy-text-secondary\)/);
  const title = rule(pricingBlock, '.joy-pricing-card__title');
  assert.match(title, /overflow-wrap:\s*anywhere/);
  assert.match(title, /text-wrap:\s*balance/);
});

test('F-039 L2 CSS: check icons use status-success-fg and the CTA keeps a 44px touch target', () => {
  assert.match(rule(pricingBlock, '.joy-pricing-card__check'), /color:\s*var\(--joy-status-success-fg\)/);
  assert.match(rule(pricingBlock, '.joy-pricing-card__cta'), /min-height:\s*max\(44px,\s*var\(--joy-control-height-md\)\)/);
});

test('F-039 L2 CSS: matrix stacks to one column under 900px and the table variant scrolls with a sticky first column', () => {
  assert.match(pricingBlock, /@media \(max-width: 899px\) \{\s*\.joy-pricing-matrix \{\s*grid-template-columns: 1fr;/);
  assert.match(rule(pricingBlock, '.joy-pricing-matrix--table'), /display:\s*block/);
  const scroll = rule(pricingBlock, '.joy-pricing-matrix__scroll');
  assert.match(scroll, /overflow-x:\s*auto/);
  assert.match(pricingBlock, /\.joy-pricing-matrix__scroll:focus-visible \{[^}]*outline:\s*var\(--joy-focus-ring\)/);
  const first = rule(pricingBlock, '.joy-pricing-matrix__table th:first-child');
  assert.match(first, /inset-inline-start:\s*0/);
  assert.match(first, /left:\s*auto/);
  assert.match(rule(pricingBlock, '.joy-pricing-matrix__table tbody th'), /background:\s*var\(--joy-surface-card\)/);
  // the Wave 3 scroll-table rules (position sticky, opaque first column) still exist for the table to reuse
  assert.match(rule(themeCss, '.joy-table--scroll th:first-child,\n.joy-table--scroll td:first-child'), /position:\s*sticky/);
});

test('F-039 L2 contrast: pricing token pairs pass in both themes (computed)', () => {
  const pairs = [
    ['text-primary', 'surface-raised', 4.5, 'card title and price'],
    ['text-secondary', 'surface-raised', 4.5, 'description, period and feature text'],
    ['accent-text', 'accent-subtle', 4.5, 'badge text'],
    ['status-success-fg', 'surface-raised', 3, 'feature check icon'],
    ['status-success-fg', 'surface-card', 3, 'matrix check icon'],
    ['text-secondary', 'surface-card', 3, 'matrix minus icon'],
    ['text-primary', 'surface-card', 4.5, 'matrix cells and pinned row headers'],
    ['text-primary', 'accent-subtle', 4.5, 'matrix row header on hover'],
    ['text-secondary', 'accent-subtle', 4.5, 'matrix minus icon on hover'],
    ['status-success-fg', 'accent-subtle', 3, 'matrix check icon on hover']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min, why] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min} (${why})`);
    }
  }
});

test('F-039 L2 CSS: every token a pricing rule reads has a dark value (light+dark maps both define it)', () => {
  const used = new Set([...pricingBlock.matchAll(/var\((--joy-[a-z0-9-]+)\)/g)].map((m) => m[1]));
  const colourTokens = [...used].filter((t) => /^--joy-(surface|text|border|accent|status)-/.test(t));
  assert.ok(colourTokens.length >= 8, 'sanity: the block reads colour tokens');
  for (const token of colourTokens) {
    assert.ok(tokenMaps.light[token] !== undefined, `light defines ${token}`);
    assert.ok(tokenMaps.dark[token] !== undefined, `dark defines ${token}`);
  }
});

// RULING (F-039 L2, code review minor 1): the featured card keeps a 1px --joy-accent-default border even though it
// measures 2.62:1 on --joy-surface-raised in light (7.78:1 in dark). WCAG 1.4.11 does not bind: the card is not an
// interactive control and "featured" is never conveyed by the border alone. It is also carried by the badge text, the
// solid (not outline) CTA and --joy-elevation-2, so the border is redundant, decorative emphasis. Alternatives are
// worse (border-strong loses the gold identity, accent-text is a muddy frame, accent-hover borrows a state token).
// Cost if wrong: the featured edge reads faint in light; the cheap fix is a gold-tinted --joy-elevation-accent-1 ring.
// The floor below only guards against token drift, it is not a claim that 2.6:1 meets the 3:1 UI bar.
test('F-039 L2 contrast RULING: featured border is decorative emphasis, measured and pinned, dark passes 3:1', () => {
  const on = (theme) => contrastRatio(tokenMaps[theme]['--joy-accent-default'], tokenMaps[theme]['--joy-surface-raised']);
  assert.ok(on('dark') >= 3, `dark: ${on('dark').toFixed(2)}:1`);
  assert.ok(on('light') >= 2.5 && on('light') < 3, `light drifted from the ruled 2.62:1: ${on('light').toFixed(2)}`);
  assert.match(rule(pricingBlock, '.joy-pricing-card--featured'), /border-color:\s*var\(--joy-accent-default\)/);
});

test('F-039 L2 CSS: the pinned first column is capped so a long row label cannot take most of the scroller', () => {
  const first = rule(pricingBlock, '.joy-pricing-matrix__table th:first-child');
  assert.match(first, /box-sizing:\s*border-box/);
  assert.match(first, /max-inline-size:\s*min\(40vw,\s*14rem\)/);
  assert.match(first, /overflow-wrap:\s*anywhere/);
});

// ── F-039 L3: feature grid/card + bento CSS contract ──
const bentoBlock = block('/* Bento Grid & Card', '/* Hero Section */');
const featureBlock = block('/* ── Landing Page Suite: FeatureGrid ── */', '/* ── Landing Page Suite: LogoCloud ── */');

test('F-039 L3 CSS: every bento span 1..12 exists as --col-N and --col-span-N, and 1..11 collapse to full width under 900px', () => {
  for (let n = 1; n <= 12; n += 1) {
    assert.match(bentoBlock, new RegExp(`\\.joy-bento-card--col-${n}, \\.joy-bento-card--col-span-${n} \\{ grid-column: span ${n}; \\}`), `span rule for ${n}`);
  }
  const collapse = bentoBlock.match(/@media \(max-width: 899px\) \{([\s\S]*?\})\s*\}/);
  assert.ok(collapse, 'a max-width: 899px collapse block exists');
  assert.match(collapse[1], /grid-column: span 12;/);
  for (let n = 1; n <= 11; n += 1) {
    assert.match(collapse[1], new RegExp(`\\.joy-bento-card--col-${n}[,\\s]`), `--col-${n} collapses`);
    assert.match(collapse[1], new RegExp(`\\.joy-bento-card--col-span-${n}[,\\s]`), `--col-span-${n} collapses`);
  }
  assert.strictEqual((bentoBlock.match(/@media \(max-width: \d{3}px\)/g) || []).length, 1, 'one collapse block, not two (no leftover 900px block)');
});

test('F-039 L3 CSS: bento card is a raised surface with default border, accent-subtle hover, no purple, no glass, no stripe, no data-theme', () => {
  const card = rule(bentoBlock, '.joy-bento-card');
  assert.match(card, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(card, /border:\s*1px solid var\(--joy-border-default\)/);
  assert.match(rule(bentoBlock, '.joy-bento-card:hover'), /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.match(rule(bentoBlock, '.joy-bento-card__badge'), /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  assert.match(rule(bentoBlock, '.joy-bento-card__desc'), /color:\s*var\(--joy-text-secondary\)/);
  assert.ok(!/gradient|purple|7c3aed|a855f7|8b5cf6|backdrop-filter|border-(left|inline-start)|\[data-theme|var\(--joy-color-|transition:\s*all/i.test(bentoBlock), 'no gradient/purple/glass/stripe/[data-theme]/phantom token/transition: all');
  const title = rule(bentoBlock, '.joy-bento-card__title');
  assert.match(title, /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(title, /overflow-wrap:\s*anywhere/);
  assert.match(title, /text-wrap:\s*balance/);
});

test('F-039 L3 CSS: feature card is a raised surface; the icon is a 40px accent disc with a 20px glyph', () => {
  const card = rule(featureBlock, '.joy-feature-card');
  assert.match(card, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(card, /border:\s*1px solid var\(--joy-border-default\)/);
  const icon = rule(featureBlock, '.joy-feature-card__icon');
  assert.match(icon, /width:\s*40px/);
  assert.match(icon, /height:\s*40px/);
  assert.match(icon, /border-radius:\s*var\(--joy-radius-pill\)/);
  assert.match(icon, /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.match(icon, /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  const glyph = rule(featureBlock, '.joy-feature-card__icon svg');
  assert.match(glyph, /width:\s*20px/);
  assert.match(glyph, /height:\s*20px/);
});

test('F-039 L3 CSS: feature title uses the display scale; description is text-secondary', () => {
  const title = rule(featureBlock, '.joy-feature-card__title');
  assert.match(title, /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(title, /overflow-wrap:\s*anywhere/);
  assert.match(title, /text-wrap:\s*balance/);
  assert.match(rule(featureBlock, '.joy-feature-card__desc'), /color:\s*var\(--joy-text-secondary\)/);
});

test('F-039 L3 CSS: feature link is text-link, 44px tall, underlined on hover, keeps a focus ring, no arrow pseudo-element', () => {
  const link = rule(featureBlock, '.joy-feature-card__link');
  assert.match(link, /color:\s*var\(--joy-text-link\)/);
  assert.match(link, /min-height:\s*44px/);
  assert.match(rule(featureBlock, '.joy-feature-card__link:hover'), /text-decoration:\s*underline/);
  assert.match(rule(featureBlock, '.joy-feature-card__link:focus-visible'), /outline:\s*var\(--joy-focus-ring\)/);
  assert.ok(!/__link::?(after|before)|(?<![-\w])content:/.test(featureBlock), 'no generated arrow content');
});

test('F-039 L3 CSS: feature block has no purple, glass, stripe, [data-theme], phantom token or transition: all', () => {
  assert.ok(!/gradient|purple|7c3aed|a855f7|8b5cf6|backdrop-filter|border-(left|inline-start)|\[data-theme|var\(--joy-color-|transition:\s*all/i.test(featureBlock));
});

test('F-039 L3 CSS: lead layout is 3 columns from 900px with explicit last-card spans, one column below, uniform untouched', () => {
  const desktop = featureBlock.match(/@media \(min-width: 900px\) \{([\s\S]*?\n\})\n/);
  assert.ok(desktop, 'a min-width: 900px lead block exists');
  assert.match(desktop[1], /\.joy-feature-grid--lead \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(desktop[1], /\.joy-feature-grid--lead > :first-child \{\s*grid-column: span 2;/);
  assert.match(desktop[1], /:first-child:last-child,\s*\.joy-feature-grid--lead > :nth-child\(3\):last-child,\s*\.joy-feature-grid--lead > :nth-child\(6\):last-child \{\s*grid-column: span 3;/);
  assert.match(desktop[1], /:nth-child\(4\):last-child \{\s*grid-column: span 2;/);
  assert.match(featureBlock, /@media \(max-width: 899px\) \{\s*\.joy-feature-grid--lead \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  assert.ok(!/joy-feature-grid--uniform/.test(featureBlock), 'uniform has no class of its own: it is the plain cols-N grid');
  for (const n of [2, 3, 4]) assert.match(featureBlock, new RegExp(`\\.joy-feature-grid--cols-${n} \\{\\s*grid-template-columns: repeat\\(auto-fit, minmax\\(min\\(\\d+px, 100%\\), 1fr\\)\\);`));
});

test('F-039 L3 contrast: feature and bento token pairs pass WCAG AA in both themes (computed)', () => {
  const pairs = [
    ['text-primary', 'surface-raised', 4.5, 'titles'],
    ['text-secondary', 'surface-raised', 4.5, 'descriptions'],
    ['text-link', 'surface-raised', 4.5, 'feature link'],
    ['accent-text', 'surface-raised', 4.5, 'bento badge'],
    ['accent-text', 'accent-subtle', 4.5, 'icon glyph, and the bento badge on hover'],
    ['text-primary', 'accent-subtle', 4.5, 'bento title on hover'],
    ['text-secondary', 'accent-subtle', 4.5, 'bento description on hover'],
    ['accent-text', 'surface-raised', 3, 'feature card hover border']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min, why] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min} (${why})`);
    }
  }
});

test('F-039 L3 CSS: every colour token the feature and bento rules read has a light and a dark value', () => {
  const used = new Set([...(featureBlock + bentoBlock).matchAll(/var\((--joy-[a-z0-9-]+)\)/g)].map((m) => m[1]));
  const colourTokens = [...used].filter((t) => /^--joy-(surface|text|border|accent|status)-/.test(t));
  assert.ok(colourTokens.length >= 7, `sanity: the blocks read colour tokens (${colourTokens.join(', ')})`);
  for (const token of colourTokens) {
    assert.ok(tokenMaps.light[token] !== undefined, `light defines ${token}`);
    assert.ok(tokenMaps.dark[token] !== undefined, `dark defines ${token}`);
  }
});

// RECORD (F-039 L3.4): the dark --joy-accent-text is gold-300, so the dark accent text on these cards needs no literal.
test('F-039 L3 dark: --joy-accent-text in dark is gold-300 (token-driven, no literal added)', () => {
  assert.strictEqual(tokenMaps.dark['--joy-accent-text'].toLowerCase(), tokenMaps.light['--joy-color-gold-300'].toLowerCase());
});
