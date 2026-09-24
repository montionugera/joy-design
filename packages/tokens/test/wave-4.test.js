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

test('Wave 4 A1 SVELTE_REF_REST is exported, starts empty and the checker is a function', () => {
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

test('F-039 L1 CSS: the CTA band is an inverse surface and every text on it is the inverse text token', () => {
  assert.match(rule(ctaBlock, '.joy-cta-section__container'), /background:\s*var\(--joy-surface-inverse\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__title'), /color:\s*var\(--joy-text-inverse\)/);
  assert.match(rule(ctaBlock, '.joy-cta-section__desc'), /color:\s*var\(--joy-text-inverse\)/);
  const outline = rule(ctaBlock, '.joy-cta-section .joy-button--outline');
  assert.match(outline, /color:\s*var\(--joy-text-inverse\)/);
  assert.match(outline, /border-color:\s*var\(--joy-text-inverse\)/);
  assert.ok(!/--joy-text-primary/.test(ctaBlock), 'text-primary is 1.11:1 on the inverse band, never used inside it');
  assert.match(ctaBlock, /@media \(max-width: 479px\) \{\s*\.joy-cta-section \{\s*padding: 32px 16px;[\s\S]*?padding: 40px 20px;/);
});

test('F-039 L1 CSS: a link-based action that is disabled or loading looks and behaves disabled', () => {
  assert.match(themeCss, /\.joy-button\[aria-disabled="true"\],\n\.joy-button:disabled \{[^}]*pointer-events:\s*none/);
});

test('F-039 L1 contrast: hero and CTA token pairs pass WCAG AA in both themes (computed)', () => {
  const pairs = [
    // [foreground, background, minimum, why]
    ['text-primary', 'surface-raised', 4.5, 'hero outline button text'],
    ['accent-text', 'surface-canvas', 4.5, 'title emphasis on the hero canvas'],
    ['accent-text', 'accent-subtle', 4.5, 'hero badge text'],
    ['text-inverse', 'surface-inverse', 4.5, 'CTA band title, description and outline button text'],
    ['text-on-accent', 'accent-default', 4.5, 'solid button label, gradient start'],
    ['text-on-accent', 'accent-gradient-end', 4.5, 'solid button label, gradient end'],
    ['border-strong', 'surface-raised', 3, 'hero outline button border'],
    ['border-strong', 'surface-canvas', 3, 'CTA band border against the page'],
    ['text-inverse', 'surface-inverse', 3, 'CTA outline button border on the band']
  ];
  for (const theme of ['light', 'dark']) {
    for (const [fg, bg, min, why] of pairs) {
      const ratio = contrastRatio(tokenMaps[theme][`--joy-${fg}`], tokenMaps[theme][`--joy-${bg}`]);
      assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min} (${why})`);
    }
  }
});
