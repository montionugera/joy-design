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

test('F-039 T1 CSS: the CTA band is a raised panel in both themes, never the inverse surface (cream in dark)', () => {
  const band = rule(ctaBlock, '.joy-cta-section__container');
  assert.match(band, /background:\s*var\(--joy-surface-raised\)/);
  assert.match(band, /border:\s*1px solid var\(--joy-border-strong\)/);
  assert.ok(!/surface-inverse/.test(ctaBlock), 'nothing in the CTA block reads --joy-surface-inverse (it is cream in dark)');
  assert.ok(!/text-inverse/.test(ctaBlock), 'no inverse text token: the band is not an inverse surface');
  assert.ok(!/light-dark\(|\[data-theme/.test(ctaBlock), 'no light-dark() (theme sets no color-scheme) and no [data-theme] component selector');
  assert.match(rule(ctaBlock, '.joy-cta-section__title'), /color:\s*var\(--joy-text-primary\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__desc'), /color:\s*var\(--joy-text-secondary\)/);
  const outline = rule(ctaBlock, '.joy-cta-section__container .joy-button--outline');
  assert.match(outline, /background:\s*transparent/);
  assert.match(outline, /color:\s*var\(--joy-text-primary\)/);
  assert.match(outline, /border-color:\s*var\(--joy-border-strong\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__container .joy-button--solid'), /border-color:\s*var\(--joy-text-on-accent\)/);
  assert.ok(!/\.joy-cta-section \.joy-button--outline\s*\{/.test(ctaBlock), 'no unscoped outline rule');
  assert.match(ctaBlock, /@media \(max-width: 479px\) \{\s*\.joy-cta-section \{\s*padding: 32px 16px;[\s\S]*?padding: 40px 20px;/);
});

test('F-039 L1 CSS: the CTA outline hover and press never remove the keyboard focus ring', () => {
  const shadowRule = rule(
    ctaBlock,
    '.joy-cta-section__container .joy-button--outline:hover:not(:disabled):not(:focus-visible),\n.joy-cta-section__container .joy-button--outline:active:not(:disabled):not(:focus-visible)'
  );
  assert.match(shadowRule, /box-shadow:\s*inset 0 0 0 1px var\(--joy-border-strong\)/);
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
    ['text-primary', 'surface-raised', 4.5, 'CTA band title and outline button label (raised panel, both themes)'],
    ['text-secondary', 'surface-raised', 4.5, 'CTA band description (secondary, never muted, on a raised surface in dark)'],
    ['border-strong', 'surface-raised', 3, 'CTA band outline button border and the band border against the raised panel'],
    ['border-focus', 'surface-raised', 3, 'focus ring against the band'],
    // the band's radial wash starts at --joy-accent-subtle (top centre, behind the title): the text sits on that colour too
    ['text-primary', 'accent-subtle', 4.5, 'CTA band title and outline label over the top of the wash'],
    ['text-secondary', 'accent-subtle', 4.5, 'CTA band description over the wash'],
    ['border-strong', 'accent-subtle', 3, 'CTA band outline button border over the wash'],
    // a disabled label is exempt from 4.5 (WCAG 1.4.3 inactive controls, ruled): it only has to stay legible. 4.23:1 in dark.
    ['text-disabled', 'surface-raised', 3, 'disabled label on the raised band and pricing card'],
    ['text-primary', 'surface-canvas', 4.5, 'CTA title fallback when rendered without the band'],
    ['text-secondary', 'surface-canvas', 4.5, 'CTA description fallback when rendered without the band'],
    ['text-disabled', 'surface-disabled', 4.5, 'disabled hero button chip'],
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

test('F-039 T1 contrast: the gold solid button stays visible on the band in both themes', () => {
  const on = (theme, fg, bg) => contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
  // light: the navy edge separates the gold fill (only ~2.4:1 against white) from the band; dark: the gold fill itself
  // is the boundary (the near-black rim is invisible on navy, and that is fine).
  assert.ok(on('light', 'text-on-accent', 'surface-raised') >= 3, 'light: navy edge vs white band');
  assert.ok(on('dark', 'accent-default', 'surface-raised') >= 3, 'dark: gold fill vs navy band');
  assert.ok(on('light', 'accent-default', 'surface-raised') < 3, 'why the light edge override must stay');
});

test('F-039 T1 contrast: the dark CTA band is not the brightest slab on the page (band is darker than the page text and no lighter than the canvas + one step)', () => {
  const lum = (hex) => contrastRatio(hex, '#000000');
  const dark = tokenMaps.dark;
  assert.ok(lum(dark['--joy-surface-raised']) < lum(dark['--joy-text-primary']) / 4, 'dark: raised band is far darker than page text');
  assert.ok(lum(dark['--joy-surface-raised']) < lum(dark['--joy-surface-inverse']) / 4, 'dark: the old inverse (cream) band was the brightest slab; the raised one is not');
});

// ── F-039 T1: busy and unavailable buttons in the landing containers ──
const busyBlock = block('/* ── Landing containers: busy and unavailable buttons ── */', '/* ── Landing Page Suite: FAQSection ── */');

test('F-039 T1 CSS: busy and unavailable overrides are scoped to the hero, the CTA band and the pricing card', () => {
  assert.ok(busyBlock.length > 500, 'the block exists');
  const selectors = busyBlock
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('{')
    .slice(0, -1)
    .map((chunk) => chunk.split('}').pop().trim())
    .flatMap((group) => group.split(','))
    .map((sel) => sel.trim())
    .filter(Boolean);
  for (const container of ['.joy-hero ', '.joy-cta-section ', '.joy-pricing-card ']) {
    assert.ok(selectors.some((sel) => sel.startsWith(container) && sel.includes(':disabled')), `${container.trim()} has a disabled rule`);
    assert.ok(selectors.some((sel) => sel.startsWith(container) && sel.includes('--loading')), `${container.trim()} has a busy rule`);
  }
  for (const sel of selectors) assert.match(sel, /^\.joy-(hero|cta-section|cta-section__container|pricing-card) /, `scoped selector: ${sel}`);
  // the shared base rule is untouched (a library-wide change was rejected in an earlier review)
  assert.match(themeCss, /\.joy-button\[aria-disabled="true"\],\n\.joy-button:disabled \{\n  background-color: var\(--joy-surface-disabled\);\n  background-image: none;/);
});

test('F-039 T1 CSS: a busy solid button keeps its gold gradient and dark label; a busy outline keeps its outline', () => {
  const solid = rule(busyBlock, '.joy-hero .joy-button--solid.joy-button--loading,\n.joy-cta-section .joy-button--solid.joy-button--loading,\n.joy-pricing-card .joy-button--solid.joy-button--loading');
  assert.match(solid, /background-image:\s*linear-gradient\(180deg, var\(--joy-accent-default\), var\(--joy-accent-gradient-end\)\)/);
  assert.match(solid, /(^|[\s;])color:\s*var\(--joy-text-on-accent\)/, 'the spinner inherits the on-accent colour');
  assert.match(solid, /cursor:\s*progress/);
  assert.match(rule(busyBlock, '.joy-hero .joy-button--outline.joy-button--loading'), /background:\s*var\(--joy-surface-raised\)/, 'the hero outline sits on a raised fill');
  assert.match(rule(busyBlock, '.joy-cta-section .joy-button--outline.joy-button--loading,\n.joy-pricing-card .joy-button--outline.joy-button--loading'), /background:\s*transparent/);
});

test('F-039 T1 CSS: a disabled landing button is an outline-weight chip with a visible 1px border, never a heavier fill', () => {
  const hero = rule(busyBlock, '.joy-hero .joy-button:disabled,\n.joy-hero .joy-button[aria-disabled="true"]');
  assert.match(hero, /background:\s*var\(--joy-surface-disabled\)/);
  assert.match(hero, /border-color:\s*var\(--joy-border-default\)/, 'a visible border keeps the shape on a dark page');
  const raised = rule(busyBlock, '.joy-cta-section .joy-button:disabled,\n.joy-cta-section .joy-button[aria-disabled="true"],\n.joy-pricing-card .joy-button:disabled,\n.joy-pricing-card .joy-button[aria-disabled="true"]');
  assert.match(raised, /background:\s*transparent/, 'on a raised panel the disabled button is transparent, not a solid slab');
  assert.match(raised, /border-color:\s*var\(--joy-border-default\)/);
  assert.match(raised, /(^|[\s;])color:\s*var\(--joy-text-disabled\)/);
  assert.ok(!/border-disabled/.test(busyBlock), 'border-disabled is the invisible tone the review rejected');
});

test('F-039 T1 CSS: bento content starts at the card text edge, the hero keeps no margin below its last actions, and the footer pairs its groups from 480px', () => {
  const content = rule(bentoBlock, '.joy-bento-card__content');
  assert.match(content, /justify-content:\s*flex-start/, 'chips start where the card text starts');
  assert.match(content, /align-items:\s*flex-end/, 'chips rest at the bottom of the card, not the middle');
  assert.match(rule(heroBlock, '.joy-hero__ctas:last-child'), /margin-bottom:\s*0/, 'no 36px margin stacked on the hero padding when nothing follows the actions');
  const pair = footerBlock.match(/@media \(min-width: 480px\) and \(max-width: 767px\) \{([\s\S]*?\n)\}/)[1];
  assert.match(pair, /\.joy-site-footer__inner \{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(pair, /\.joy-site-footer__column:last-child:nth-child\(even\) \{\s*grid-column:\s*1 \/ -1/, 'a last group that would sit alone takes the row');
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

test('F-039 L2 + T2 CSS: plan cards wrap by their own width and fill their row (no empty cell), and the table variant scrolls with a sticky first column', () => {
  // T2 fix round 1 replaced the auto-fit grid (three cards in an 886px column left one alone, 5 or 7 cards left empty cells)
  // and its 900px stack with a wrapping flex row whose items grow: one column when narrow, a short last row stretches.
  const grid = rule(pricingBlock, '.joy-pricing-matrix');
  assert.match(grid, /display:\s*flex/);
  assert.match(grid, /flex-wrap:\s*wrap/);
  assert.ok(!/grid-template-columns/.test(grid), 'the card branch is no longer a fixed-track grid');
  const cards = rule(pricingBlock, '.joy-pricing-matrix:not(.joy-pricing-matrix--table) > \\*');
  assert.match(cards, /flex:\s*1 1 min\(100%, 16rem\)/, 'cards grow to fill the row and go one column when narrow');
  assert.match(cards, /box-sizing:\s*border-box/, 'the basis counts the card padding');
  assert.match(cards, /min-width:\s*0/);
  assert.match(rule(pricingBlock, '.joy-pricing-matrix:not(.joy-pricing-matrix--table):has(> :nth-child(4):last-child) > \\*'), /flex-basis:\s*min\(100%, 24rem\)/, 'four cards read as 2 by 2');
  assert.ok(!/@container|@media/.test(pricingBlock.slice(pricingBlock.indexOf('.joy-pricing-matrix {'), pricingBlock.indexOf('/* Data variant'))), 'no viewport or container query: it holds in a narrow hub frame');
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
  assert.match(title, /font-size:\s*var\(--joy-font-size-xl\)/, 'a card title is on the step scale, not the section display clamp (mid-word breaks in narrow cards)');
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

test('F-039 L3 CSS: feature title is on the card scale, only the lead card steps up to display; description is text-secondary', () => {
  const title = rule(featureBlock, '.joy-feature-card__title');
  assert.match(title, /font-size:\s*var\(--joy-font-size-2xl\)/, 'a card title is on the step scale, not the section display clamp');
  assert.match(featureBlock, /@media \(min-width: 900px\) \{[\s\S]*\.joy-feature-grid--lead > :first-child \.joy-feature-card__title \{\s*font-size: var\(--joy-font-size-display-sm\);/, 'the 2-column lead card keeps the display size');
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

test('F-039 L3 CSS: lead layout is 3 columns from 900px with general last-card spans, one column below, uniform untouched', () => {
  const desktop = featureBlock.match(/@media \(min-width: 900px\) \{([\s\S]*?\n\})\n/);
  assert.ok(desktop, 'a min-width: 900px lead block exists');
  assert.match(desktop[1], /\.joy-feature-grid--lead \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
  assert.match(desktop[1], /\.joy-feature-grid--lead > :first-child \{\s*grid-column: span 2;/);
  assert.match(desktop[1], /> :nth-child\(3n\):last-child \{\s*grid-column: span 3;/);
  assert.match(desktop[1], /> :nth-child\(3n\+1\):last-child \{\s*grid-column: span 2;/);
  const at = (needle) => desktop[1].indexOf(needle);
  assert.ok(at('> :first-child:last-child') > at('> :nth-child(3n+1):last-child'), 'the single-card rule is declared after the 3n+1 rule so it wins');
  assert.match(desktop[1], /> :first-child:last-child \{\s*grid-column: span 3;/);
  assert.match(featureBlock, /@media \(max-width: 899px\) \{\s*\.joy-feature-grid--lead \{\s*grid-template-columns: minmax\(0, 1fr\);/);
  assert.ok(!/joy-feature-grid--uniform/.test(featureBlock), 'uniform has no class of its own: it is the plain cols-N grid');
  for (const n of [2, 3, 4]) assert.match(featureBlock, new RegExp(`\\.joy-feature-grid--cols-${n} \\{\\s*grid-template-columns: repeat\\(auto-fit, minmax\\(min\\(\\d+px, 100%\\), 1fr\\)\\);`));
});

test('F-039 L3 CSS: the feature badge is in normal flow, so it can never cover a wrapped title', () => {
  const badge = rule(featureBlock, '.joy-feature-card__badge');
  assert.ok(!/position:\s*(absolute|fixed)/.test(badge), badge);
  assert.match(badge, /align-self:\s*flex-start/);
  assert.match(badge, /margin-bottom:/);
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

// ── F-039 L4: logo cloud, stats, testimonial and FAQ CSS contract ──
const logoBlock = block('/* ── Landing Page Suite: LogoCloud ── */', '/* ── Landing Page Suite: StatsSection ── */');
const statsBlock = block('/* ── Landing Page Suite: StatsSection ── */', '/* ── Landing Page Suite: CTASection ── */');
const faqBlock = block('/* ── Landing Page Suite: FAQSection ── */', '/* ── Landing Page Suite: SiteFooter ── */');
const testimonialBlock = block('/* Testimonial Card */', '/* Steps (Ant Design Parity) */');
// body of the container query `@container <name> (<query>) { ... }` (top-level rule, closes at the next line-start brace)
const step = (name, query) => {
  const m = statsBlock.match(new RegExp('@container ' + name + ' \\(' + query.replace(/[()]/g, '\\$&') + '\\) \\{([\\s\\S]*?)\n\\}\n'));
  assert.ok(m, `@container ${name} (${query}) exists`);
  return m[1];
};
const mediaBody = (css, query) => {
  const m = css.match(new RegExp(`@media \\(${query}\\) \\{([\\s\\S]*?\\n)\\}`));
  assert.ok(m, `@media (${query}) exists`);
  return m[1];
};

test('F-039 L4 CSS: logo cloud wraps and centres, draws in currentColor at muted, and has no tracked caps', () => {
  const logos = rule(logoBlock, '.joy-logo-cloud__logos');
  assert.match(logos, /flex-wrap:\s*wrap/);
  assert.match(logos, /justify-content:\s*center/);
  assert.match(logos, /gap:\s*36px 48px/);
  const item = rule(logoBlock, '.joy-logo-cloud__item');
  assert.match(item, /(^|[\s;])color:\s*var\(--joy-text-muted\)/, 'inline svg logos use currentColor, which is muted');
  assert.ok(!/opacity/.test(logoBlock), 'no opacity: it would push muted logos further below contrast');
  assert.match(rule(logoBlock, 'a.joy-logo-cloud__item:hover'), /color:\s*var\(--joy-text-primary\)/, 'only links recolour on hover');
  assert.ok(!/(^|\n)\.joy-logo-cloud__item:hover/.test(logoBlock), 'a non-interactive logo has no hover affordance');
  const title = rule(logoBlock, '.joy-logo-cloud__title');
  assert.match(title, /color:\s*var\(--joy-text-secondary\)/);
  assert.ok(!/text-transform|letter-spacing/.test(title), 'sentence case, normal tracking');
  assert.match(mediaBody(logoBlock, 'max-width: 480px'), /gap:\s*24px 28px/);
});

test('F-039 L4 CSS: linked logos are 44px touch targets with a focus ring', () => {
  assert.match(rule(logoBlock, 'a.joy-logo-cloud__item'), /min-height:\s*44px/);
  assert.match(rule(logoBlock, 'a.joy-logo-cloud__item:focus-visible'), /outline:\s*var\(--joy-focus-ring\)/);
});

test('F-039 L4 CSS: stats card is raised, values are accent-text, text is secondary, tones are status tokens', () => {
  const item = rule(statsBlock, '.joy-stat-item');
  assert.match(item, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(item, /border:\s*1px solid var\(--joy-border-default\)/);
  const value = rule(statsBlock, '.joy-stat-item__value');
  assert.match(value, /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  assert.match(value, /font-size:\s*var\(--joy-font-size-xl\)/, 'compact by default, on the step scale');
  assert.match(step('joy-stats', 'min-width: 30rem'), /\.joy-stat-item__value \{\s*font-size:\s*var\(--joy-font-size-3xl\)/, 'a stat is on the step scale (3xl), not a section display size');
  assert.match(rule(statsBlock, '.joy-stat-item__desc'), /color:\s*var\(--joy-text-secondary\)/);
  assert.match(rule(statsBlock, '.joy-stat-item__label'), /color:\s*var\(--joy-text-primary\)/);
  assert.match(rule(statsBlock, '.joy-stat-item__change--positive'), /color:\s*var\(--joy-status-success-fg\)/);
  assert.match(rule(statsBlock, '.joy-stat-item__change--negative'), /color:\s*var\(--joy-status-danger-fg\)/);
  assert.ok(!/10b981|ef4444|accent-default/i.test(statsBlock), 'no raw tone hexes, no gold-on-white value colour');
});

test('F-039 L4 CSS: the stats are a compact 2x2 grid with smaller values by default, and type follows the container', () => {
  assert.match(mediaBody(statsBlock, 'max-width: 480px'), /\.joy-stats-section \{\s*padding: 32px 16px;/, 'only the section padding stays a media query');
  assert.ok(!/@media[^{]*\{[^@]*\.joy-stat-item__value/.test(statsBlock), 'no value font size follows the window: columns and type follow the same box');
  assert.match(step('joy-stats', 'width < 19.5rem'), /\.joy-stat-item__value \{[^}]*font-size:\s*var\(--joy-font-size-lg\)/, 'a 9 character value fits the ~114px cell at 320px');
  assert.match(step('joy-stats', 'width < 17rem'), /\.joy-stat-item__value \{[^}]*font-size:\s*var\(--joy-font-size-md\)/);
  const value = rule(statsBlock, '.joy-stat-item__value');
  // `anywhere` breaks only a token that cannot fit its cell (a fitting number stays whole: the 9 character case is asserted
  // in Chromium by apps/storybook-hub/tests/landing-stats-overflow.spec.ts and landing-stats-grid.spec.ts, which also cover 14 and 20 character tokens).
  assert.match(value, /overflow-wrap:\s*anywhere/, 'an extreme token breaks inside its cell instead of overflowing the page');
  assert.ok(!/word-break:\s*(break-all|break-word)/.test(value), 'never force-break tokens that fit');
  assert.match(rule(statsBlock, '.joy-stat-item'), /min-width:\s*0/, 'the grid item can shrink to its track');
  // F-039 T1 (taste review P1-1/P1-6): the compact grid is the default and it is the container, not the window, that widens it.
  const grid = rule(statsBlock, '.joy-stats-grid');
  assert.match(grid, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, 'two compact columns by default');
  assert.match(grid, /gap:\s*12px/);
  const section = rule(statsBlock, '.joy-stats-section');
  assert.match(section, /container-type:\s*inline-size/, 'columns follow the width the section gets (hub frames, sidebars)');
  assert.match(section, /contain-intrinsic-inline-size:\s*20rem/, 'containment must not collapse the section inside a shrink-to-fit parent');
  assert.match(statsBlock, /\.joy-stats-grid > \.joy-stat-item:last-child:nth-child\(odd\) \{\s*grid-column:\s*1 \/ -1;/, 'an odd last card takes the whole row instead of sitting alone');
});

test('F-039 T1 CSS: the stats grid widens by stat count in container steps, never by a fixed 3-column rule', () => {
  // each step is sized so a 9 character 3xl value ("14 Chains", ~179px) fits its column: 3 x 221 + 2 x 24 <= 45rem,
  // 4 x 221 + 3 x 24 <= 60rem, 5 x 205 + 4 x 16 <= 69rem
  assert.match(step('joy-stats', 'min-width: 45rem'), /:nth-child\(3\):last-child\),\s*\.joy-stats-grid:has\(> :nth-child\(6\):last-child\) \{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/, '3 and 6 stats: three columns');
  assert.match(step('joy-stats', 'min-width: 60rem'), /:nth-child\(4\):last-child\) \{\s*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/, '4 stats: four columns, 3 + 1 never');
  assert.match(step('joy-stats', 'min-width: 69rem'), /:nth-child\(5\):last-child\) \{\s*grid-template-columns:\s*repeat\(5, minmax\(0, 1fr\)\)/, '5 stats: five columns');
  assert.match(step('joy-stats', 'min-width: 45rem'), /:nth-child\(7\)\) \{\s*grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(224px, 100%\), 1fr\)\)/, 'a long list keeps the auto-fit grid');
  assert.ok(!/repeat\(3, minmax\(0, 1fr\)\)/.test(rule(statsBlock, '.joy-stats-grid')), 'no unconditional 3 column grid');
});

test('F-039 T1 CSS: a trend pill is one line and its caret follows the pill type step', () => {
  const pill = rule(statsBlock, '.joy-stat-item__change');
  assert.match(pill, /white-space:\s*nowrap/, 'no multi-line pill blobs');
  assert.match(pill, /max-width:\s*100%/);
  assert.match(pill, /font-size:\s*var\(--joy-font-size-xs\)/);
  assert.ok(!/text-overflow/.test(pill), 'text-overflow has no effect on the inline-flex pill itself; it lives on the inner text span');
  const text = rule(statsBlock, '.joy-stat-item__change-text');
  assert.match(text, /text-overflow:\s*ellipsis/);
  assert.match(text, /overflow:\s*hidden/);
  assert.match(text, /white-space:\s*nowrap/);
  assert.match(text, /min-width:\s*0/, 'the flex item can shrink below its text');
  const caret = rule(statsBlock, '.joy-stat-item__change svg');
  assert.match(caret, /width:\s*1em/);
  assert.match(caret, /height:\s*1em/);
});

test('F-039 L4 CSS: testimonial stars are warning-fg, the avatar fallback is accent-subtle on accent-text, no purple, no stripe', () => {
  assert.match(rule(testimonialBlock, '.joy-testimonial-card__stars'), /color:\s*var\(--joy-status-warning-fg\)/);
  const avatar = rule(testimonialBlock, '.joy-testimonial-card .joy-avatar');
  assert.match(avatar, /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.match(avatar, /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  const card = rule(testimonialBlock, '.joy-testimonial-card');
  assert.match(card, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(card, /border:\s*1px solid var\(--joy-border-default\)/);
  assert.match(rule(testimonialBlock, '.joy-testimonial-card__quote'), /font-size:\s*var\(--joy-font-size-md\)/, 'body scale');
  assert.match(rule(testimonialBlock, '.joy-testimonial-card__author-info p'), /color:\s*var\(--joy-text-secondary\)/);
  assert.ok(!/purple|7c3aed|eab308|border-(left|inline-start)|\[data-theme|gradient/i.test(testimonialBlock));
});

test('F-039 L4 CSS: FAQ title is fluid, wraps long words and balances lines', () => {
  const title = rule(faqBlock, '.joy-faq-section__title');
  assert.match(title, /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(title, /overflow-wrap:\s*anywhere/);
  assert.match(title, /text-wrap:\s*balance/);
  assert.ok(!/font-size:\s*2rem/.test(faqBlock), 'no fixed 2rem title');
  assert.match(tokenMaps.light['--joy-font-size-display-sm'], /^clamp\(/, 'display-sm is a clamp token');
});

test('F-039 L4 CSS: FAQ trigger is 44px, keeps ink text on hover over an accent-subtle tint, and keeps its focus ring', () => {
  const trigger = rule(faqBlock, '.joy-faq-item__trigger');
  assert.match(trigger, /min-height:\s*44px/);
  assert.match(trigger, /(^|[\s;])color:\s*var\(--joy-text-primary\)/);
  const hover = rule(faqBlock, '.joy-faq-item__trigger:hover');
  assert.match(hover, /background-color:\s*var\(--joy-accent-subtle\)/);
  assert.ok(!/(^|[\s;])color:/.test(hover), 'hover does not recolour the text (gold text fails contrast)');
  assert.match(rule(faqBlock, '.joy-faq-item__trigger:focus-visible'), /outline:\s*var\(--joy-focus-ring\)/);
});

test('F-039 L4 CSS: FAQ item is raised with a default border, the open item takes the strong border', () => {
  const item = rule(faqBlock, '.joy-faq-item');
  assert.match(item, /background-color:\s*var\(--joy-surface-raised\)/);
  assert.match(item, /border:\s*1px solid var\(--joy-border-default\)/);
  assert.match(rule(faqBlock, '.joy-faq-item--open'), /border-color:\s*var\(--joy-border-strong\)/);
  assert.match(rule(faqBlock, '.joy-faq-item__content'), /color:\s*var\(--joy-text-secondary\)/);
  assert.match(rule(faqBlock, '.joy-faq-section__subtitle'), /color:\s*var\(--joy-text-secondary\)/);
});

test('F-039 L4 CSS: FAQ chevron rotates on open through a token transition, and hidden is left to the UA', () => {
  const icon = rule(faqBlock, '.joy-faq-item__icon');
  assert.match(icon, /transition:\s*transform var\(--joy-duration-normal\) var\(--joy-ease-out\)/);
  assert.match(icon, /(^|[\s;])color:\s*var\(--joy-accent-text\)/);
  assert.match(rule(faqBlock, '.joy-faq-item--open .joy-faq-item__icon'), /transform:\s*rotate\(180deg\)/);
  // The UA rule already hides [hidden]. No author rule may force display on/off, or hidden="until-found" (find-in-page reveal, SVL-061 backlog) could not be adopted later.
  assert.ok(!/display:/.test(rule(faqBlock, '.joy-faq-item__content')), 'the answer sets no display');
  assert.ok(!/\[hidden\]/.test(faqBlock), 'no [hidden] override');
});

test('F-039 L4 CSS: the four blocks have no purple, glass, stripe, [data-theme], phantom token, fallback or transition: all', () => {
  for (const [name, css] of [['logo', logoBlock], ['stats', statsBlock], ['faq', faqBlock], ['testimonial', testimonialBlock]]) {
    assert.ok(!/gradient|purple|7c3aed|backdrop-filter|border-(left|inline-start)|\[data-theme|var\(--joy-color-|transition:\s*all|var\([^)]*,\s*[^)]+\)/i.test(css), `${name} block is clean`);
  }
});

test('F-039 L4 contrast: proof token pairs pass WCAG AA in both themes (computed)', () => {
  const pairs = [
    ['text-secondary', 'surface-canvas', 4.5, 'logo cloud title'],
    ['text-muted', 'surface-canvas', 4.5, 'logo cloud logos on the page canvas'],
    ['text-primary', 'surface-canvas', 4.5, 'logo hover'],
    ['accent-text', 'surface-raised', 4.5, 'stat value, faq chevron'],
    ['text-primary', 'surface-raised', 4.5, 'stat label, faq question, testimonial quote'],
    ['text-secondary', 'surface-raised', 4.5, 'stat description, faq answer, author role'],
    ['status-success-fg', 'status-success-bg', 4.5, 'positive change chip'],
    ['status-danger-fg', 'status-danger-bg', 4.5, 'negative change chip'],
    ['status-warning-fg', 'surface-raised', 3, 'star graphic'],
    ['accent-text', 'accent-subtle', 4.5, 'avatar initials, faq chevron on hover'],
    ['text-primary', 'accent-subtle', 4.5, 'faq question on hover'],
    ['border-strong', 'surface-raised', 3, 'open faq item border']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min, why] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min} (${why})`);
    }
  }
});

// RULING (F-039 L4): the card, stat, testimonial and FAQ item borders (--joy-border-default on --joy-surface-raised) are
// decorative containment, not the identity of a control: the FAQ control is the button (text + chevron, both >= 4.5:1),
// and every card is identified by its text and fill. Light measures >= 3:1; dark measures 2.79:1, the same pair the
// F-039 L3 feature and bento cards already ship. The open FAQ item, the one state a border does signal, uses
// --joy-border-strong (>= 3:1 above). Pinned so a token change cannot silently make it worse.
test('F-039 L4 contrast RULING: decorative card borders measure >= 3:1 light and >= 2.7:1 dark (pinned)', () => {
  const ratio = (theme) => contrastRatio(tokenMaps[theme]['--joy-border-default'], tokenMaps[theme]['--joy-surface-raised']);
  assert.ok(ratio('light') >= 3, `light ${ratio('light').toFixed(2)}`);
  assert.ok(ratio('dark') >= 2.7, `dark ${ratio('dark').toFixed(2)}`);
});

test('F-039 L4 CSS: the dark-gap components (feature card, stats, faq, logo cloud) read only tokens that have a dark value', () => {
  const blocks = {
    'joy-feature-card': featureBlock,
    'joy-stats-section': statsBlock,
    'joy-faq-section': faqBlock,
    'joy-logo-cloud': logoBlock,
    'joy-testimonial-card': testimonialBlock
  };
  for (const [name, css] of Object.entries(blocks)) {
    const used = [...css.matchAll(/var\((--joy-[a-z0-9-]+)\)/g)].map((m) => m[1]);
    const colourTokens = [...new Set(used)].filter((t) => /^--joy-(surface|text|border|accent|status)-/.test(t));
    assert.ok(colourTokens.length >= 3, `sanity: ${name} reads colour tokens (${colourTokens.join(', ')})`);
    for (const token of colourTokens) {
      assert.ok(tokenMaps.light[token] !== undefined, `${name}: light defines ${token}`);
      assert.ok(tokenMaps.dark[token] !== undefined, `${name}: dark defines ${token}`);
    }
  }
});

// A full-width section with padding overflows the page by its padding unless it sizes its own box (found by the L4
// Chromium probe at 375px: the section was 100% + 48px wide on a page with no global reset).
test('F-039 L4 CSS: full-width sections and cards size their own border box', () => {
  for (const [css, sel] of [[logoBlock, '.joy-logo-cloud'], [statsBlock, '.joy-stats-section'], [statsBlock, '.joy-stat-item'], [faqBlock, '.joy-faq-section'], [testimonialBlock, '.joy-testimonial-card']]) {
    assert.match(rule(css, sel), /box-sizing:\s*border-box/, `${sel} sets box-sizing`);
  }
});

// ── F-039 L5a: SiteFooter CSS contract ──
// Bounded at the next top-level comment header (a comment at the start of a line), so CSS a later lane appends after the
// footer (LandingPage) is never policed by the footer checks. A later block must start with such a header.
const blockToNextHeader = (header) => {
  const start = themeCss.indexOf(header);
  const endRel = themeCss.slice(start + 10).search(/\n\/\*/);
  return themeCss.slice(start, endRel === -1 ? undefined : start + 10 + endRel);
};
const footerBlock = blockToNextHeader('/* ── Landing Page Suite: SiteFooter ── */');
// Every colour token a block reads must resolve in both themes (dark comes from the token remap, never a literal).
const assertColourTokensInBothThemes = (cssBlock) => {
  const used = [...new Set([...cssBlock.matchAll(/var\((--joy-[a-z0-9-]+)\)/g)].map((m) => m[1]))].filter((t) => /^--joy-(surface|text|border|accent|status)-/.test(t));
  assert.ok(used.length >= 4, `sanity: ${used.join(', ')}`);
  for (const token of used) {
    assert.ok(tokenMaps.light[token] !== undefined && tokenMaps.dark[token] !== undefined, `${token} has both themes`);
  }
};
// selector lists may span lines, so match "any text without braces or @" up to the declaration block
const footerRules = [...footerBlock.matchAll(/(?:^|[{}]\s*|\n)([^@{}\n][^{}@]*)\{([^}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));

test('F-039 L5a CSS: every class the footer twins render has a rule (RXF-112: brand and column were missing)', () => {
  for (const cls of ['joy-site-footer', 'joy-site-footer__inner', 'joy-site-footer__brand', 'joy-site-footer__brand-title', 'joy-site-footer__brand-desc', 'joy-site-footer__column', 'joy-site-footer__col-title', 'joy-site-footer__links', 'joy-site-footer__link', 'joy-site-footer__bottom', 'joy-site-footer__socials', 'joy-site-footer__social-link']) {
    assert.ok(footerRules.some((r) => r.selector.split(',').map((s) => s.trim()).includes(`.${cls}`)), `.${cls} has a rule`);
  }
});

test('F-039 L5a CSS: no footer rule pairs text-transform: uppercase with letter-spacing, and column titles are sentence case', () => {
  assert.ok(footerRules.length >= 12, 'sanity: parsed the footer rules');
  for (const { selector, body } of footerRules) {
    assert.ok(!(/text-transform:\s*uppercase/.test(body) && /letter-spacing/.test(body)), `${selector} is a tracked ALL-CAPS eyebrow`);
  }
  const title = rule(footerBlock, '.joy-site-footer__col-title');
  assert.ok(!/text-transform|letter-spacing/.test(title), 'sentence case, normal tracking');
  assert.match(title, /overflow-wrap:\s*anywhere/);
});

test('F-039 L5a CSS: the footer reads tokens only: secondary text, default borders, focus ring, no hex, no theme selector, no blur', () => {
  assert.match(rule(footerBlock, '.joy-site-footer'), /(^|[\s;])color:\s*var\(--joy-text-secondary\)/);
  assert.match(rule(footerBlock, '.joy-site-footer'), /border-top:\s*1px solid var\(--joy-border-default\)/);
  assert.match(rule(footerBlock, '.joy-site-footer__bottom'), /border-top:\s*1px solid var\(--joy-border-default\)/);
  for (const sel of ['.joy-site-footer__link', '.joy-site-footer__brand-desc', '.joy-site-footer__bottom', '.joy-site-footer__social-link']) {
    assert.match(rule(footerBlock, sel), /(^|[\s;])color:\s*var\(--joy-text-secondary\)/, `${sel} uses secondary text (muted fails contrast on raised surfaces in dark)`);
  }
  assert.match(rule(footerBlock, '.joy-site-footer__link:hover'), /color:\s*var\(--joy-text-primary\)/, 'hover is primary text (gold text fails contrast on the light card)');
  assert.match(rule(footerBlock, '.joy-site-footer__link:focus-visible,\n.joy-site-footer__social-link:focus-visible'), /outline:\s*var\(--joy-focus-ring\)/);
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(|var\(--joy-[a-z0-9-]+,|\[data-theme|backdrop-filter|accent-default|--joy-color-/i.test(footerBlock), 'tokens only, dark comes from the token remap');
  assert.ok(!/text-muted/.test(footerBlock), 'no muted text anywhere in the footer');
});

test('F-039 L5a CSS: footer links and social links are at least 44px tall, and the columns can shrink to their track', () => {
  assert.match(rule(footerBlock, '.joy-site-footer__link'), /min-height:\s*44px/);
  const social = rule(footerBlock, '.joy-site-footer__social-link');
  assert.match(social, /min-height:\s*44px/);
  assert.match(social, /min-width:\s*44px/);
  assert.match(rule(footerBlock, '.joy-site-footer__brand'), /min-width:\s*0/);
  assert.match(rule(footerBlock, '.joy-site-footer__column'), /min-width:\s*100px/, 'a column can shrink to 100px before it wraps');
});

test('F-039 L5a CSS: below 768px the columns collapse to one, and below 640px the bottom bar stacks', () => {
  const tablet = mediaBody(footerBlock, 'max-width: 767px');
  assert.match(tablet, /\.joy-site-footer__inner \{[^}]*grid-template-columns:\s*1fr;/);
  assert.match(tablet, /\.joy-site-footer__inner \{[^}]*display:\s*grid/);
  assert.match(tablet, /\.joy-site-footer__inner \{[^}]*gap:\s*32px/);
  const phone = mediaBody(footerBlock, 'max-width: 639px');
  assert.match(phone, /\.joy-site-footer__bottom \{[^}]*flex-direction:\s*column-reverse/);
  assert.match(phone, /\.joy-site-footer__bottom \{[^}]*align-items:\s*flex-start/);
});

// The layout is a wrapping flex row whose items grow, so every row is full whatever the column count (2 to 5): an
// auto-fit grid next to a fixed brand span left empty cells at 768 to ~1183px, and `2fr repeat(auto-fit, ...)` is an
// invalid track list that Chromium drops (the desktop footer was ONE column). Chromium proves the rows in the L5a probe.
test('F-039 L5a CSS: from 768px the footer is a wrapping flex row (brand on its own row, then from 1024px beside the columns)', () => {
  const inner = rule(footerBlock, '.joy-site-footer__inner');
  assert.match(inner, /display:\s*flex/);
  assert.match(inner, /flex-wrap:\s*wrap/);
  assert.match(rule(footerBlock, '.joy-site-footer__brand'), /flex:\s*1 1 100%/, 'the brand takes its own row below 1024px');
  assert.match(rule(footerBlock, '.joy-site-footer__column'), /flex:\s*1 1 0/, 'columns grow, so their row is always full');
  const wide = mediaBody(footerBlock, 'min-width: 1024px');
  assert.match(wide, /\.joy-site-footer__brand \{[^}]*flex:\s*2 1 0/);
  assert.match(wide, /\.joy-site-footer__brand \{[^}]*min-width:\s*240px/);
  assert.ok(!/grid-template-columns:[^;]*(\d+fr repeat\(auto-|repeat\(auto-)/.test(footerBlock), 'no auto-fit track list next to a fixed brand (empty cells / invalid list)');
  // the only grid spans live in the 480-767px pairing rule below (a flex row from 768px has none)
  assert.ok(!/grid-column/.test(footerBlock.replace(/@media \(min-width: 480px\) and \(max-width: 767px\) \{[\s\S]*?\n\}\n/, '')), 'no grid span outside the phone/tablet pairing rule');
});

test('F-039 L5a contrast: footer text pairs pass WCAG AA in both themes on the card surface, and the divider is >= 3:1 (computed)', () => {
  const pairs = [['text-primary', 'surface-card', 4.5], ['text-secondary', 'surface-card', 4.5]];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}`);
    }
    const divider = contrastRatio(tokenMaps[theme]['--joy-border-default'], tokenMaps[theme]['--joy-surface-card']);
    assert.ok(divider >= 3, `${theme}: border-default on surface-card is ${divider.toFixed(2)}:1`);
  }
});

test('F-039 L5a CSS: every colour token the footer reads has a light and a dark value', () => {
  assertColourTokensInBothThemes(footerBlock);
});

// ── F-039 L5b: LandingPage header / mobile menu CSS contract ──
const pageBlock = blockToNextHeader('/* ── Landing Page Suite: LandingPage ── */');

test('F-039 L5b CSS: the LandingPage block exists, is tokens-only and has no blur, gradient text or tracked caps', () => {
  assert.ok(pageBlock.startsWith('/* ── Landing Page Suite: LandingPage ── */'), 'the block opens with a top-level comment header');
  for (const sel of ['.joy-landing-page', '.joy-landing-header', '.joy-landing-header__brand', '.joy-landing-header__nav', '.joy-landing-header__link', '.joy-landing-drawer__link', '.joy-landing-skip']) {
    assert.ok(pageBlock.includes(sel), `${sel} is defined`);
  }
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i.test(pageBlock), 'no colour literal');
  assert.ok(!/var\([^)]*,/.test(pageBlock), 'no var() fallback');
  assert.ok(!/backdrop-filter|background-clip|text-transform:\s*uppercase|letter-spacing/.test(pageBlock));
  assert.ok(!/--joy-color-|--gold-|--navy-/.test(pageBlock), 'no phantom or foreign tokens');
  assert.ok(!/\[data-theme|\[data-palette/.test(pageBlock), 'dark treatment is token-driven; nothing keys off data-theme or data-palette');
  assert.ok(!/@container/.test(pageBlock), 'a container-query root would contain the fixed drawer');
});

test('F-039 L5b CSS: the header is a centred flex row on space tokens, links and menu button are 44px targets', () => {
  const head = rule(pageBlock, '.joy-landing-header');
  assert.match(head, /display:\s*flex/);
  assert.match(head, /justify-content:\s*space-between/);
  assert.match(head, /max-width:\s*1200px/);
  assert.match(head, /padding:\s*var\(--joy-space-4\) var\(--joy-space-6\)/);
  assert.match(pageBlock, /\.joy-landing-header__link,\n\.joy-landing-drawer__link \{[^}]*min-height:\s*44px/, 'nav links (inline and in the drawer) are 44px tall');
  const menu = rule(pageBlock, '.joy-landing-header .joy-landing-header__menu');
  assert.match(menu, /display:\s*none/, 'hidden from 768px up');
  assert.match(menu, /min-width:\s*44px/, 'icon-only has no width without a size class');
  assert.match(menu, /min-height:\s*44px/, 'the medium control is 40px on fine pointers');
});

test('F-039 L5b CSS: below 768px (media query, not container) the inline nav is hidden and the menu button is shown', () => {
  const phone = mediaBody(pageBlock, 'max-width: 767px');
  assert.match(phone, /\.joy-landing-header__nav \{[^}]*display:\s*none/);
  assert.match(phone, /\.joy-landing-header \.joy-landing-header__menu \{[^}]*display:\s*inline-flex/);
  assert.ok(!/\.joy-landing-header__nav \{[^}]*display:\s*none/.test(pageBlock.replace(/@media[\s\S]*$/, '')), 'the nav is visible outside the media query');
});

test('F-039 L5b CSS: the page guards against sideways scroll and the skip link is off-screen until focused', () => {
  assert.match(rule(pageBlock, '.joy-landing-page'), /overflow-x:\s*clip/);
  assert.match(rule(pageBlock, '.joy-landing-skip'), /transform:\s*translateY\(-200%\)/);
  assert.match(rule(pageBlock, '.joy-landing-skip:focus-visible'), /transform:\s*none/);
  assert.match(rule(pageBlock, '.joy-landing-skip:focus-visible'), /outline:\s*var\(--joy-focus-ring\)/);
});

test('F-039 L5b contrast: header, drawer and skip-link text pass WCAG AA in both themes (computed)', () => {
  const pairs = [
    ['text-secondary', 'surface-canvas'],
    ['text-primary', 'surface-canvas'],
    ['accent-text', 'surface-canvas'],
    ['text-primary', 'surface-card'],
    ['text-inverse', 'surface-inverse']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= 4.5, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('F-039 L5b CSS: every colour token the LandingPage block reads has a light and a dark value', () => {
  assertColourTokensInBothThemes(pageBlock);
});

// ── F-039 L5b fix round 1 ──
// theme.css ships no global reset, so a landing rule that sets `width: 100%` next to padding or a border must set
// `box-sizing: border-box` itself, or the page is wider than its container (the CTA band overflowed 24-48px until the
// overflow guard on .joy-landing-page hid it). Chromium probe of the whole composed page: /tmp/f039-sdd/l5b/page-probe.mjs.
test('F-039 L5b fix CSS: every landing rule with width 100% plus padding or border sets box-sizing border-box', () => {
  const landing = /joy-(hero|cta|logo|stats|feature|faq|site-footer|pricing|bento|landing|testimonial)/;
  const rules = [...themeCss.matchAll(/(?:^|\n)([^@{}\n/][^{}@]*)\{([^}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const risky = rules.filter((r) => landing.test(r.selector) && /(^|[\s;])width:\s*100%/.test(r.body) && /(^|[\s;])(padding|border)[a-z-]*:/.test(r.body));
  assert.ok(risky.length >= 3, `sanity: the scan finds the rules (${risky.map((r) => r.selector).join(', ')})`);
  for (const r of risky) assert.match(r.body, /box-sizing:\s*border-box/, `${r.selector} needs box-sizing: border-box`);
  assert.match(rule(themeCss, '.joy-cta-section'), /box-sizing:\s*border-box/);
});

test('F-039 L5b fix CSS: the page root paints canvas surface and primary text, and the skip link is fixed to the viewport', () => {
  const root = rule(pageBlock, '.joy-landing-page');
  assert.match(root, /background-color:\s*var\(--joy-surface-canvas\)/);
  assert.match(root, /color:\s*var\(--joy-text-primary\)/);
  assert.match(rule(pageBlock, '.joy-landing-skip'), /position:\s*fixed/);
  assert.match(rule(pageBlock, '.joy-landing-page > main:focus'), /outline:\s*none/);
});

// ── F-039 T2: landing section heading and pricing layout ──
const sectionsBlock = blockToNextHeader('/* ── Landing sections: section heading and pricing layout ── */');

test('F-039 T2 CSS: the section heading uses the display scale like the FAQ title, on tokens only', () => {
  assert.match(rule(sectionsBlock, '.joy-landing-page__section-title'), /font-size:\s*var\(--joy-font-size-display-sm\)/);
  assert.match(rule(sectionsBlock, '.joy-landing-page__section-subtitle'), /color:\s*var\(--joy-text-secondary\)/);
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|var\([^)]*,/i.test(sectionsBlock), 'no colour literal and no var() fallback');
  for (const token of ['--joy-text-primary', '--joy-text-secondary']) assert.ok(tokenMaps.light[token] !== undefined && tokenMaps.dark[token] !== undefined, `${token} has both themes`);
});

test('F-039 T2 CSS: the pricing section wrapper only pads and spaces; the card layout lives in the component rule', () => {
  assert.ok(!/container-type|@container|@media|:has\(/.test(sectionsBlock), 'no container, no query: PricingMatrix lays itself out');
  assert.match(rule(sectionsBlock, '.joy-landing-page__pricing'), /padding:\s*0 24px/);
  assert.ok(!themeCss.includes('.joy-pricing-fit'), 'no hub-only utility class ships in theme.css');
});
