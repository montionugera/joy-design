# F-043 Brand Asset Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a token-driven Joymify brand kit in joy-design: the diamond mark, the "Joymify" wordmark, favicon, social card, hero banner and ribbon, as static files (`@joymify/brand`) plus Svelte/React components and a Storybook "Brand" view, all aligned with joymify-portal / user-fe / zen-ui.

**Architecture:**
- Brand colours become semantic tokens (`--joy-brand-*`).
- `@joymify/brand` holds the shape geometry (diamond paths plus the outlined "Joymify" glyphs) and a build that renders static SVG/PNG assets from the resolved light-theme token values.
- Svelte/React components render the same geometry using CSS vars only.
- The hub imports the geometry by relative path, because the Docker image has no node_modules.

**Tech Stack:**
- Node 22 ESM, `node --test`
- Svelte 5 runes, React 19
- Style Dictionary-like custom `packages/tokens/build.js`
- `opentype.js` + `@fontsource/cormorant-garamond` (dev, outlining only), `@resvg/resvg-js` (dev, PNG raster)
- Playwright for the hub

**Spec:** `.claude/refined_backlog/F-043-brand-asset-kit-logo-hero-banner-ribbon/spec.md` (read it first; it holds the evidence table and the audit trail).

## Global Constraints

- Colour literals (hex/rgb/hsl) may appear ONLY in `packages/tokens/src/tokens.json` and in the generated `packages/brand/assets/*`. Everything else uses `var(--joy-…)` with **no fallback** (`scripts/lint-colors.sh`).
- Components reference semantic vars only (`--joy-brand-*`, `--joy-surface-*`, `--joy-text-*`, …), never `--joy-color-*` primitives (AGENTS.md).
- Zero emoji in any tracked file (`scripts/precheck.sh` scan).
- DESIGN.md Don'ts:
  - no gradient text, no glassmorphism, no side stripe > 1px;
  - no tracked all-caps eyebrows, no arrow glyphs in links;
  - sentence case copy.
- The wordmark is "Joymify", sentence case, Cormorant Garamond **500**, outlined to paths. The tagline is Cormorant Garamond **400 italic**: `Calm, considered tools for traders, builders, and gamers.`
- Canonical mark geometry (viewBox 0 0 32 32), from user-fe `favicon.svg`:
  - tile `rect 32×32 rx=6`;
  - outline `M16 4 28 16 16 28 4 16Z` (stroke 1.6, no fill);
  - inner `M16 9 23 16 16 23 9 16Z` (filled);
  - centre dot `circle cx=16 cy=16 r=1.6`.
- Font CSS var name is `--joy-font-family-display` (the tokens build emits `--joy-font-family-${name}`).
- The hub (`apps/storybook-hub/build.js`) must never `import '@joymify/brand'` by bare name. Use relative paths only.
- Every new Svelte component gets a React twin with identical props, and both are added to `COMPONENTS` in `scripts/parity-check.mjs`.
- Commit per task, never `--amend`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Work only in this worktree: `/Users/pasitnusso/workspace/repos/joy-design/.claude/worktrees/F-043-brand-asset-kit-logo-hero-banner-ribbon`.

---

### Task 1: Brand tokens + display font

**Files:**
- Modify: `packages/tokens/src/tokens.json` (add `brand` inside `semantic.light` and `semantic.dark`, which starts near line 527; add `font.family.display` near line 986)
- Modify: `packages/tokens/test/contrast.test.js` (add pairs to `testPairs`)
- Test: `packages/tokens/test/brand.test.js` (new)

**Interfaces:**
- Produces these CSS vars, emitted in light and all dark blocks of `packages/tokens/dist/theme.css`:
  - `--joy-brand-tile`
  - `--joy-brand-mark`
  - `--joy-brand-mark-on-tile`
  - `--joy-brand-mark-contrast`
  - `--joy-brand-ink`
  - `--joy-brand-ink-on-tile`
  - `--joy-font-family-display`
- First confirm how the build flattens semantic groups (build.js ~94-126). A semantic `brand.mark-on-tile` must emit `--joy-brand-mark-on-tile`.

Values:

| token | light | dark |
|---|---|---|
| brand.tile | `{color.navy.500}` | `{color.navy.500}` |
| brand.mark | `{color.gold.600}` | `{color.gold.300}` |
| brand.mark-on-tile | `{color.gold.400}` | `{color.gold.400}` |
| brand.mark-contrast | `{color.cream.50}` | `{color.cream.50}` |
| brand.ink | `{color.navy.500}` | `{color.cream.100}` |
| brand.ink-on-tile | `{color.cream.100}` | `{color.cream.100}` |

`font.family.display` = `"Cormorant Garamond", "Noto Serif", Georgia, serif`

- [ ] **Step 1: Write the failing test**: `packages/tokens/test/brand.test.js`

```js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCssTokens } from './helpers/css-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
const BRAND = ['tile', 'mark', 'mark-on-tile', 'mark-contrast', 'ink', 'ink-on-tile'].map((k) => `--joy-brand-${k}`);

test('F-043: brand vars are emitted for light and dark', () => {
  const { light, dark } = parseCssTokens(css);
  for (const v of BRAND) {
    assert.match(light[v] ?? '', /^#[0-9a-f]{6}$/i, `${v} light`);
    assert.match(dark[v] ?? '', /^#[0-9a-f]{6}$/i, `${v} dark`);
  }
});

test('F-043: display font family var is emitted', () => {
  assert.match(css, /--joy-font-family-display:\s*"Cormorant Garamond"/);
});
```

- [ ] **Step 2:** Run `cd packages/tokens && node build.js && node --test test/brand.test.js`. Expected: FAIL (vars missing).
- [ ] **Step 3:** Add the tokens (table above) to `tokens.json`.
- [ ] **Step 4:** Add contrast pairs to `testPairs` in `contrast.test.js` (copy the existing object shape):

```js
    // F-043 brand
    { fg: '--joy-brand-mark-on-tile', bg: '--joy-brand-tile', theme: 'Light', role: 'Brand mark / Tile', min: 3.0 },
    { fg: '--joy-brand-mark', bg: '--joy-surface-canvas', theme: 'Light', role: 'Brand mark / Canvas', min: 3.0 },
    { fg: '--joy-brand-ink', bg: '--joy-surface-canvas', theme: 'Light', role: 'Brand ink / Canvas', min: 4.5 },
    { fg: '--joy-brand-ink-on-tile', bg: '--joy-brand-tile', theme: 'Light', role: 'Brand ink / Tile', min: 4.5 },
    { fg: '--joy-brand-mark-on-tile', bg: '--joy-brand-tile', theme: 'Dark', role: 'Brand mark / Tile', min: 3.0 },
    { fg: '--joy-brand-mark', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Brand mark / Canvas', min: 3.0 },
    { fg: '--joy-brand-ink', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Brand ink / Canvas', min: 4.5 },
    { fg: '--joy-brand-ink-on-tile', bg: '--joy-brand-tile', theme: 'Dark', role: 'Brand ink / Tile', min: 4.5 },
```

  (Use whatever the existing theme label for dark is. Read the file's dark pairs first.)
- [ ] **Step 5:** Run `cd packages/tokens && node build.js && node --test test/*.test.js`. Expected: all PASS. Pre-computed ratios:
  - gold-600 on cream-100: 4.9
  - gold-400 on navy-500: 5.89
  - cream-100 on navy-500: 13.91
  - gold-300 on navy-900: 9.16
- [ ] **Step 6:** Commit `feat(F-043): brand tokens and display font family`.

### Task 2: `@joymify/brand` package: geometry, outlines, renderers, generated assets

**Files:**
- Create:
  - `packages/brand/package.json`
  - `packages/brand/PROVENANCE.md`
  - `packages/brand/scripts/outline-text.mjs`
  - `packages/brand/src/outlines.generated.js` (output of the script, committed)
  - `packages/brand/src/geometry.js`
  - `packages/brand/src/render.js`
  - `packages/brand/src/index.js`
  - `packages/brand/build.js`
  - `packages/brand/assets/*` (generated, committed)
  - `packages/brand/test/brand.test.js`
- Modify:
  - `scripts/lint-colors.sh`: add `packages/brand/src` and `packages/brand/build.js` to the default targets
  - `scripts/test-lint-colors.sh` (~line 115): its sandbox must create `packages/brand/src`
  - `pnpm-lock.yaml`: via `pnpm install`

**Interfaces:**
- Produces from `packages/brand/src/index.js`:
  - `MARK`: `{ viewBox: '0 0 32 32', tileRx: 6, outline: 'M16 4 28 16 16 28 4 16Z', outlineWidth: 1.6, inner: 'M16 9 23 16 16 23 9 16Z', dot: { cx: 16, cy: 16, r: 1.6 } }`
  - `WORDMARK`: `{ d: string, width: number, height: number, baseline: number }`, the outlined "Joymify" at font size 100 (units px), with `d` translated so the bbox starts at x=0
  - `TAGLINE`: same shape, for the tagline at font size 100
  - `markSvg({ palette, tile = true, size = 32, title = 'Joymify' }) => string`
  - `wordmarkSvg({ palette, tone = 'deep' }) => string`, where 'deep' = ink on a transparent light surface with the bare `mark`, and 'cream' = ink-on-tile on a tile background with `mark-on-tile`
  - `ogCardSvg({ palette }) => string` (1200×630)
  - `heroBannerSvg({ palette }) => string` (1600×560)
  - `palette` is `{ tile, mark, markOnTile, markContrast, ink, inkOnTile }`, each a `#rrggbb` string
- `package.json` fields:
  - `"name": "@joymify/brand", "version": "0.1.0", "type": "module"`
  - `"exports": { ".": "./src/index.js", "./assets/*": "./assets/*" }`
  - `"scripts": { "build": "node build.js", "test": "node --test test/*.test.js", "outline": "node scripts/outline-text.mjs" }`
  - devDependencies: `opentype.js`, `@fontsource/cormorant-garamond` (a version that still ships `.woff`), `@resvg/resvg-js`

Steps:

- [ ] **Step 1:** Create `package.json`, then run `pnpm install` from the repo root (updates the lockfile).
- [ ] **Step 2: outline script** `scripts/outline-text.mjs`:
  - Load `@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff` (wordmark) and `...-latin-400-italic.woff` (tagline) with `opentype.parse(fs.readFileSync(...).buffer)`.
  - Throw if any glyph maps to index 0 (`.notdef`).
  - `font.getPath(text, 0, 0, 100)`, get its `getBoundingBox()`, and translate by `-x1` so x starts at 0.
  - `toPathData(2)` (2 decimals).
  - Write `src/outlines.generated.js` exporting `WORDMARK` and `TAGLINE` with `d`, `width = x2-x1`, `height = y2-y1`, `baseline = -y1`.
  - Header comment: generated, do not edit, regenerate with `pnpm --filter @joymify/brand outline`.
  - Run it and commit the output.
- [ ] **Step 3: failing test**: `packages/brand/test/brand.test.js`

```js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MARK, WORDMARK, TAGLINE, markSvg, ogCardSvg } from '../src/index.js';
import { readPalette } from '../build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = ['mark.svg', 'mark-bare.svg', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png',
  'wordmark-deep.svg', 'wordmark-cream.svg', 'og-card.svg', 'og-card.png', 'hero-banner.svg'];

test('F-043: geometry is non-empty path data', () => {
  for (const d of [MARK.outline, MARK.inner, WORDMARK.d, TAGLINE.d]) assert.match(d, /^M[\d.\s,MLHVCSQTAZmlhvcsqtaz-]+$/);
  assert.ok(WORDMARK.width > 0 && WORDMARK.height > 0);
});

test('F-043: every asset exists and committed SVGs match a fresh build', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'));
  execFileSync(process.execPath, [path.join(root, 'build.js'), '--out', tmp]);
  for (const f of ASSETS) {
    assert.ok(fs.existsSync(path.join(root, 'assets', f)), `${f} committed`);
    if (f.endsWith('.svg')) assert.strictEqual(fs.readFileSync(path.join(tmp, f), 'utf8'), fs.readFileSync(path.join(root, 'assets', f), 'utf8'), `${f} drift`);
  }
});

test('F-043: asset colours all trace to brand tokens; text is outlined', () => {
  const allowed = new Set(Object.values(readPalette()).map((h) => h.toLowerCase()));
  for (const f of ASSETS.filter((a) => a.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(root, 'assets', f), 'utf8');
    for (const hex of svg.match(/#[0-9a-f]{6}\b/gi) ?? []) assert.ok(allowed.has(hex.toLowerCase()), `${f}: ${hex} not a brand token`);
    assert.ok(!/<text\b/.test(svg), `${f} has no <text>`);
    assert.match(svg, /<title>[^<]+<\/title>/, `${f} has a title`);
  }
});

test('F-043: PNG and card dimensions', () => {
  const dims = (f) => { const b = fs.readFileSync(path.join(root, 'assets', f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  assert.deepStrictEqual(dims('favicon-32.png'), [32, 32]);
  assert.deepStrictEqual(dims('apple-touch-icon.png'), [180, 180]);
  assert.deepStrictEqual(dims('og-card.png'), [1200, 630]);
  assert.match(fs.readFileSync(path.join(root, 'assets/og-card.svg'), 'utf8'), /viewBox="0 0 1200 630"/);
});

test('F-043: markSvg honours tile flag and title', () => {
  const p = readPalette();
  assert.match(markSvg({ palette: p }), /<rect[^>]*rx="6"/);
  assert.ok(!/<rect/.test(markSvg({ palette: p, tile: false })));
  assert.match(ogCardSvg({ palette: p }), /<title>Joymify<\/title>/);
});
```

- [ ] **Step 4:** Run `pnpm --filter @joymify/brand test`. Expected: FAIL (modules missing).
- [ ] **Step 5: implement** `src/geometry.js` (`MARK`, and re-export `WORDMARK`/`TAGLINE` from the generated file), `src/render.js`, and `src/index.js`. Render rules:
  - **markSvg**:
    - `<svg xmlns viewBox="0 0 32 32" width=size height=size role="img"><title>…</title>`
    - with the tile: `<rect width="32" height="32" rx="6" fill=tile/>`, outline stroke = `markOnTile`, inner fill = `markOnTile`, dot fill = `markContrast`
    - without the tile: outline and inner use `mark`, and the dot uses `markContrast` only if a tile is present; omit the dot when bare
  - **wordmarkSvg**:
    - lockup height 80: the mark scaled to 48px at x=16, y=16, then the wordmark scaled to cap-height ~40px, starting 16px after the mark, vertically centred on the mark
    - width is computed from `WORDMARK.width * scale + 96`
    - 'cream' adds a full-bleed tile `<rect>` and uses `inkOnTile`/`markOnTile`
    - 'deep' has a transparent background and uses `ink`/`mark`
  - **ogCardSvg**:
    - tile background, a 1px `markOnTile` rule inset 48px from the bottom
    - the mark (with tile colours) at 96px, the wordmark in `inkOnTile` ~96px tall, centred
    - the tagline in `inkOnTile` at `fill-opacity="0.8"`, ~36px tall, below
  - **heroBannerSvg**:
    - tile background, then a lattice of diamond outlines (`markOnTile`, stroke 1) on a 64px grid
    - opacity falls from 0.35 at the right edge to 0 at 55% width, done via per-diamond `stroke-opacity` (no gradient elements needed)
    - `<title>Joymify brand banner</title>`, no text
  - All numbers are rounded to 2 decimals, and the output is deterministic.
- [ ] **Step 6: implement** `build.js`:
  - `export function readPalette()`: read `../tokens/dist/theme.css`; if it is missing, run `node ../tokens/build.js` first. Take the FIRST (light, `:root`) declaration of each `--joy-brand-*` and return the camel-cased palette. Throw if any value is not `#rrggbb`.
  - The main block (only when run directly, `import.meta.url === pathToFileURL(process.argv[1]).href`):
    - parse `--out <dir>` (default `assets/`);
    - write `mark.svg` (tile), `mark-bare.svg` (tile:false), `favicon.svg` (= mark.svg);
    - write `wordmark-deep.svg`, `wordmark-cream.svg`, `og-card.svg`, `hero-banner.svg`;
    - rasterize `favicon-32.png` (32), `apple-touch-icon.png` (180, from mark.svg) and `og-card.png` (1200) with `new Resvg(svg, { fitTo: { mode: 'width', value: N } }).render().asPng()`.
  - `build.js` itself must contain no hex literal. The regex `/^#[0-9a-f]{6}$/i` is fine only if lint-colors allows it. Otherwise validate with `value.length === 7 && value.startsWith('#') && /^[0-9a-f]+$/i.test(value.slice(1))`.
- [ ] **Step 7:** Run `node packages/brand/build.js`, then `pnpm --filter @joymify/brand test`. Expected: PASS.
- [ ] **Step 8:** Add `packages/brand/src` and `packages/brand/build.js` to the default targets in `scripts/lint-colors.sh`, and make the sandbox in `scripts/test-lint-colors.sh` create the folder. Run `bash scripts/lint-colors.sh && bash scripts/test-lint-colors.sh`. Expected: both exit 0.
- [ ] **Step 9:** Write `PROVENANCE.md`:
  - the font name, weight/style, `@fontsource/cormorant-garamond` version, licence SIL OFL 1.1 and upstream URL https://github.com/CatharsisFonts/Cormorant;
  - the mark geometry origin (user-svc `user-fe/src/lib/assets/favicon.svg`);
  - the regenerate commands.
- [ ] **Step 10:** Open `assets/og-card.png` and `assets/wordmark-cream.svg` (rendered via resvg to PNG in a scratch dir) and eyeball them. Letters must be upright (the opentype y-axis is already SVG-down with `getPath`), centred, and not clipped. Fix the layout numbers if not.
- [ ] **Step 11:** Commit `feat(F-043): @joymify/brand package with generated brand assets`.

### Task 3: BrandMark + Wordmark components (Svelte + React twins)

**Files:**
- Create:
  - `packages/svelte/src/lib/BrandMark.svelte`, `packages/svelte/src/lib/Wordmark.svelte`
  - `packages/react/src/BrandMark.tsx`, `packages/react/src/Wordmark.tsx`
  - Tests: `packages/svelte/test/brand-components.test.js`, `packages/react/test/brand-components.test.js`
- Modify:
  - `packages/svelte/src/lib/index.ts`, `packages/react/src/index.ts` (exports)
  - `packages/svelte/package.json`, `packages/react/package.json` (`"@joymify/brand": "workspace:*"`)
  - `scripts/parity-check.mjs` (`COMPONENTS` += `'BrandMark', 'Wordmark'`)

**Interfaces:**
- Consumes `MARK` and `WORDMARK` from `@joymify/brand`.
- `BrandMark` props:
  - `size?: number = 32` (<=0 or NaN falls back to 32)
  - `variant?: 'tile' | 'bare' = 'tile'`
  - `title?: string`
  - `class?: string`
- `Wordmark` props:
  - `tone?: 'deep' | 'cream' = 'deep'`
  - `height?: number = 32`
  - `withMark?: boolean = true`
  - `title?: string = 'Joymify'`
  - `class?: string`
- Colours go through inline `style` / CSS classes using `var(--joy-brand-*)`:
  - tile variant: tile `--joy-brand-tile`, strokes/fills `--joy-brand-mark-on-tile`, dot `--joy-brand-mark-contrast`
  - bare variant: `--joy-brand-mark`, and no dot
  - Wordmark deep: glyph fill `--joy-brand-ink`, mark bare
  - Wordmark cream: glyph fill `--joy-brand-ink-on-tile`, mark bare using `--joy-brand-mark-on-tile`. The component itself has no background; the consumer places it on a tile.
- Accessibility:
  - When `title` is set: `role="img"`, `aria-label={title}`, `<title>{title}</title>`.
  - Otherwise: `aria-hidden="true" focusable="false"`.
  - Wordmark always has a title (it is the brand name).

Steps:

- [ ] **Step 1: failing tests.** Copy the render/compile helper usage from `packages/svelte/test/landing-hero-cta.test.js` (Svelte) and the React twin test for landing-hero-cta (React). Assertions, identical in both twins:

```js
test('F-043: BrandMark/Wordmark compile with zero warnings', () => {
  for (const name of ['BrandMark', 'Wordmark']) assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), []);
});
test('F-043: BrandMark tile variant draws the tile and no hex', async () => {
  const html = await renderSvelte('BrandMark', {});
  assert.match(html, /<rect[^>]*rx="6"/);
  assert.match(html, /var\(--joy-brand-tile\)/);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(html), 'no colour literals');
  assert.match(html, /aria-hidden="true"/);
});
test('F-043: BrandMark bare + title is an accessible image without tile or dot', async () => {
  const html = await renderSvelte('BrandMark', { variant: 'bare', title: 'Joymify' });
  assert.ok(!/<rect/.test(html) && !/<circle/.test(html));
  assert.match(html, /role="img"/); assert.match(html, /<title>Joymify<\/title>/);
  assert.match(html, /var\(--joy-brand-mark\)/);
});
test('F-043: BrandMark invalid size falls back to 32', async () => {
  assert.match(await renderSvelte('BrandMark', { size: 0 }), /width="32"/);
});
test('F-043: Wordmark renders outlined glyphs, labelled, tone-aware', async () => {
  const deep = await renderSvelte('Wordmark', {});
  assert.match(deep, /role="img"/); assert.match(deep, /aria-label="Joymify"/);
  assert.ok(!/<text\b/.test(deep)); assert.match(deep, /var\(--joy-brand-ink\)/);
  assert.match(await renderSvelte('Wordmark', { tone: 'cream' }), /var\(--joy-brand-ink-on-tile\)/);
  assert.ok(!/<svg[\s\S]*<svg/.test(await renderSvelte('Wordmark', { withMark: false })) );
});
```

  (The React twin uses its own `renderReact` helper, with the same assertions.) The last assertion checks that `withMark:false` renders no nested mark. Render the wordmark as ONE `<svg>` containing a `<g>` for the mark and a `<path>` for the glyphs, so "no mark" means no `MARK.outline` path: assert `!html.includes(MARK.outline)`.
- [ ] **Step 2:** Run both test files. Expected: FAIL.
- [ ] **Step 3:** Implement the Svelte components (runes: `let { size = 32, variant = 'tile', title, class: className = '' } = $props();`, `const px = $derived(Number.isFinite(size) && size > 0 ? size : 32);`), then the React twins.
- [ ] **Step 4:** Add the exports and the `workspace:*` deps, run `pnpm install`, and add both names to parity-check `COMPONENTS`.
- [ ] **Step 5:** Run:
  - `pnpm --filter @joymify/svelte test`
  - `pnpm --filter @joymify/react test`
  - `pnpm --filter @joymify/svelte check`
  - `node scripts/parity-check.mjs`
  - `bash scripts/lint-colors.sh`

  Expected: all exit 0.
- [ ] **Step 6:** Commit `feat(F-043): BrandMark and Wordmark twins`.

### Task 4: Ribbon + BrandBanner components (Svelte + React twins)

**Files:**
- Create:
  - `packages/svelte/src/lib/Ribbon.svelte`, `packages/svelte/src/lib/BrandBanner.svelte`
  - `packages/react/src/Ribbon.tsx`, `packages/react/src/BrandBanner.tsx`
  - Tests: `packages/svelte/test/brand-ribbon-banner.test.js`, `packages/react/test/brand-ribbon-banner.test.js`
- Modify: both `index.ts`, and `scripts/parity-check.mjs` (`'Ribbon', 'BrandBanner'`)

**Interfaces:**
- Consumes `MARK` from `@joymify/brand`, and `LandingAction` from its sibling file (relative import, exactly as `HeroSection` does).
- `Ribbon` props:
  - `label: string` (required)
  - `variant?: 'corner' | 'inline' = 'inline'`
  - `tone?: 'gold' | 'navy' = 'gold'`
  - `decorative?: boolean = false`
  - `class?: string`
- `Ribbon` markup: `<span class="joy-ribbon joy-ribbon--{variant} joy-ribbon--{tone}">{label}</span>`
  - `aria-hidden="true"` only when `decorative`.
  - corner: absolutely positioned top-right, rotated 45deg, band width 160px; the parent must be `position: relative; overflow: hidden` (document it in a comment).
  - inline: `inline-flex`, with the notched tail done with `clip-path: polygon(...)` on the right edge.
  - gold: `background: var(--joy-accent-default); color: var(--joy-text-on-accent)`.
  - navy: `background: var(--joy-brand-tile); color: var(--joy-brand-ink-on-tile)`.
  - font-size `var(--joy-font-size-xs)` (check the token name exists first), weight 600, letter-spacing normal, sentence case (no `text-transform`).
- `BrandBanner` props:
  - `eyebrow?: string`, `title: string`, `lede?: string`
  - `primaryCtaText?: string`, `primaryCtaHref?: string`
  - `secondaryCtaText?: string`, `secondaryCtaHref?: string`
  - `align?: 'start' | 'center' = 'start'`
  - children / snippet (`children` in Svelte 5, `children` in React)
- `BrandBanner` markup:
  - `<section class="joy-brand-banner">` with `background: var(--joy-brand-tile); color: var(--joy-brand-ink-on-tile)`.
  - An inline decorative `<svg aria-hidden="true">` lattice (same algorithm as `heroBannerSvg`, but with `stroke="var(--joy-brand-mark-on-tile)"`; generate the diamonds in script, not by hand).
  - Eyebrow in sentence case, `<h2>` title in `font-family: var(--joy-font-family-display)`, weight 500, solid colour.
  - Lede, then the CTAs rendered through `LandingAction` when text is given.

Steps:

- [ ] **Step 1: failing tests** (the same assertions in both twins):

```js
test('F-043: Ribbon/BrandBanner compile with zero warnings', () => {
  for (const n of ['Ribbon', 'BrandBanner']) assert.deepStrictEqual(compileSvelte(n).warnings.map((w) => w.code), []);
});
test('F-043: Ribbon renders label, variant and tone classes, readable by default', async () => {
  const html = await renderSvelte('Ribbon', { label: 'New', variant: 'corner', tone: 'navy' });
  assert.match(html, /class="joy-ribbon joy-ribbon--corner joy-ribbon--navy[^"]*"[^>]*>New</);
  assert.ok(!/aria-hidden/.test(html));
  assert.match(await renderSvelte('Ribbon', { label: 'Beta', decorative: true }), /aria-hidden="true"/);
});
test('F-043: BrandBanner renders title in a heading, decorative lattice, no gradient, CTA via LandingAction', async () => {
  const html = await renderSvelte('BrandBanner', { title: 'One quiet product.', lede: 'Built deliberately.', primaryCtaText: 'Try Algo Trading', primaryCtaHref: '/algo' });
  assert.match(html, /<h2[^>]*>One quiet product\.<\/h2>/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/);
  assert.ok(!/gradient/i.test(html));
  assert.match(html, /href="\/algo"/);
  assert.ok(!/#[0-9a-f]{3,6}\b/i.test(html));
});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement Svelte, then React. Put component CSS in the same place the sibling components do (check where `HeroSection` styles live in each package and follow that).
- [ ] **Step 4:** Add the exports and parity entries. Run the same five commands as Task 3, Step 5. Expected: all exit 0.
- [ ] **Step 5:** Commit `feat(F-043): Ribbon and BrandBanner twins`.

**Phase gate for Tasks 3–4 (one shared gate, same subsystem):**
1. Independent `code-reviewer` + `typescript-reviewer` on the diff from the Task 3 start.
2. `/simplify`.
3. Re-run the Task 3, Step 5 commands.

### Task 5: Storybook hub: real logo, favicon, Brand view, downloadable assets

**Files:**
- Modify: `apps/storybook-hub/build.js`:
  - the `.brand-logo` sites around lines 623, 1560, 1585
  - the view registry / hash routing (find the existing view pattern near line 5698)
  - the output copy near lines 5134-5137
- Test: `apps/storybook-hub/tests/brand.spec.ts` (match the existing Playwright spec folder; check `playwright.config.ts` `testDir`)

**Interfaces:**
- Consumes (RELATIVE imports only):
  - `import { MARK, WORDMARK } from '../../packages/brand/src/index.js'`
  - files in `../../packages/brand/assets/`

Steps:

- [ ] **Step 1: failing Playwright spec:**

```ts
import { test, expect } from '@playwright/test';

test('F-043: header shows the diamond mark and the page has a favicon', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.brand-logo svg').first()).toBeVisible();
  await expect(page.locator('.brand-logo')).not.toHaveText('J');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', /favicon\.svg$/);
});

for (const theme of ['light', 'dark'] as const) {
  test(`F-043: Brand view renders in ${theme} with no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/#/brand');
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await expect(page.getByRole('heading', { name: /brand/i }).first()).toBeVisible();
    await expect(page.locator('.joy-ribbon').first()).toBeVisible();
    await expect(page.locator('.joy-brand-banner')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('F-043: brand asset downloads are real images', async ({ page, request }) => {
  await page.goto('/#/brand');
  const hrefs = await page.locator('a[download]').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
  expect(hrefs.length).toBeGreaterThanOrEqual(10);
  for (const href of hrefs) {
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/image\/(svg\+xml|png)/);
  }
});
```

  Adapt the route format (`/#/brand` vs `#brand`) and the theme-toggle mechanism to whatever the hub already uses. Read the existing specs first.
- [ ] **Step 2:** Run `cd apps/storybook-hub && node build.js && npx playwright test tests/brand.spec.ts`. Expected: FAIL.
- [ ] **Step 3: implement:**
  - `brandMarkSvg(size)`: a helper in build.js that returns an inline `<svg>` built from `MARK` with `var(--joy-brand-*)` fills. Replace the "J" text in all `.brand-logo` sites with it.
  - Copy every file of `packages/brand/assets/` into `dist/brand/`, and copy `favicon.svg` to `dist/favicon.svg`. Add `<link rel="icon" href="favicon.svg" type="image/svg+xml">` to the head.
  - Add a "Brand" nav entry and hash view. The view contains:
    - the mark at 16/32/64/128 on canvas and on the tile;
    - the wordmark in deep and cream;
    - clear-space rule text ("keep one diamond-width of space around the lockup; minimum 16px mark, 96px wordmark");
    - the colour swatches, listed by token var name only (no hex in build.js: show the value via JS `getComputedStyle` at runtime);
    - the ribbon variants (static markup using the same classes as the components, with the CSS copied into the hub stylesheet via vars);
    - a BrandBanner example;
    - a Do/Don't list;
    - a download list of `<a download href="brand/<file>">` for all 10 assets.
- [ ] **Step 4:** Run `bash scripts/lint-colors.sh` (build.js is a target, so no hex), then the Playwright spec and the full hub suite: `npx playwright test`. Expected: all pass.
- [ ] **Step 5:** Run `docker build -t joy-design-hub-f043 .` from the worktree root. Expected: success; this proves the relative imports work without node_modules. If Docker is unavailable, say so explicitly in the task report.
- [ ] **Step 6:** Commit `feat(F-043): hub brand view, real logo, favicon and asset downloads`.
- [ ] **Step 7: phase gate:**
  1. `code-reviewer` + `typescript-reviewer` on the Task 5 diff;
  2. `/simplify`;
  3. re-run Step 4.
  4. A visual check by subagent: screenshot `/#/brand` in light and dark, and return a text verdict only.

### Task 6: Docs, DESIGN.md generator, follow-up ideas, full Gate 1

**Files:**
- Modify:
  - `scripts/gen-design-md.mjs`: add a "Brand" section: mark geometry, wordmark rules, `--joy-brand-*` table, display font, Don'ts (no recolouring, no stretching, no square mark, gold is a signature)
  - regenerated `DESIGN.md`
  - `README.md`: a `packages/brand` bullet under Architecture, an assets table, and an adoption snippet. Keep it outside the `gen-design-md` generated regions.

Steps:

- [ ] **Step 1:** Extend the generator and run it (`node scripts/gen-design-md.mjs`). Check that its own test/check mode passes, if it has one (`grep -n "check" scripts/gen-design-md.mjs`).
- [ ] **Step 2:** README adoption snippet:

```html
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<meta property="og:image" content="https://<your-host>/brand/og-card.png">
```

  Also add the component usage: `import { BrandMark, Wordmark, Ribbon, BrandBanner } from '@joymify/svelte'` (and the React equivalent).
- [ ] **Step 3:** Capture the follow-up ideas (they commit via the `_release` worktree):
  - `psrw idea "Adopt @joymify/brand diamond favicon + og-card in joymify-portal (replace gold square)"`
  - `psrw idea "Replace default Svelte favicons in www-joymify and zen-ui with @joymify/brand"`
  - `psrw idea "Align quant-fe and joy-coach-fe marks with @joymify/brand (sub-marks decision)"`
  - `psrw idea "Decide whether www-joymify Universe look converges with navy/gold brand"`
- [ ] **Step 4:** Run the full Gate 1: `bash scripts/precheck.sh`. Expected: exit 0 ("Gate 1 Precheck passed successfully!").
- [ ] **Step 5:** Commit `docs(F-043): brand section in DESIGN.md and README adoption guide`.
- [ ] **Step 6: final phase gate:**
  1. `code-reviewer` on the whole feature diff (`git diff <release-base>..HEAD`);
  2. fix findings;
  3. re-run `precheck.sh`.

## Self-review (writer)

- Spec coverage:
  - tokens: T1
  - package, assets, lint: T2
  - components: T3, T4
  - hub, favicon, Docker: T5
  - README, DESIGN.md, follow-ups, precheck: T6
  - Every acceptance criterion maps to a task.
- Names are consistent: `--joy-font-family-display`, the `--joy-brand-mark-on-tile` palette key `markOnTile`, `readPalette`, `MARK`, `WORDMARK`, `TAGLINE`.
