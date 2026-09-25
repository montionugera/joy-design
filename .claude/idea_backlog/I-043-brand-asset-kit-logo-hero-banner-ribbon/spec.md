---
title: "Brand asset kit: logo, hero banner, ribbon, social cards aligned with joymify-portal"
id: I-043
status: idea
---

# Brand asset kit: logo, hero banner, ribbon, social cards aligned with joymify-portal

## Problem

joy-design is the design system for the whole Joymify family, but it ships **no brand assets**:

- The Storybook hub shows a text "J" placeholder where the logo belongs (`apps/storybook-hub/build.js`, `.brand-logo`).
- There is no favicon source, no Open Graph (social share) image, no logo component, no ribbon component.
- joy-design tokens have no display (serif) font token, although the navy/gold products (portal, zen-ui, user-fe, joy-coach-fe) use Cormorant Garamond for display.
- Each product has re-drawn the mark by hand, and they have drifted:
  - user-fe (SSO) and quant-fe use a gold **diamond** on a navy tile.
  - zen-ui ships a diamond + "Joymify" wordmark SVG.
  - joymify-portal uses a gold **square** on a navy tile.
  - joy-coach-fe uses a "JC" circle.
  - www-joymify and zen-ui still ship the **default Svelte favicon**.

## Why now

E-001 (production-grade design system) just finished. Brand identity is the last layer missing before products can consume joy-design as their single source of truth. Every week without it, another product hand-rolls a slightly different mark.

## Evidence (research, 2026-09-26)

| Fact | Source |
|---|---|
| Shared anchors: navy-500 `#14253E`, gold-400 `#C49A3A`, cream-100 `#F8F3E8`, ink `#1F1C13`. The ramps differ slightly at the ends (joy-design cream-50 `#fdfaf3` vs portal/user-fe `#FDFBF6`); **joy-design tokens are the source of truth** for generated assets | joymify-portal `src/lib/styles/colors_and_type.css`, user-fe `joymify-tokens.css`, zen-ui `themes.css`, joy-design `packages/tokens/src/tokens.json` |
| Diamond mark geometry: outline `M16 4 28 16 16 28 4 16Z`, inner filled `M16 9 23 16 16 23 9 16Z`, cream dot r=1.6, on a 32×32 navy tile rx=6 | user-svc `user-fe/src/lib/assets/favicon.svg` |
| Display font Cormorant Garamond (quant-fe uses Newsreader); body Noto Sans (portal) / Inter (joy-design); mono JetBrains Mono | portal, zen-ui, user-fe, joy-coach-fe |
| Voice: "Calm, considered tools for traders, builders, and gamers." / "A quiet family of consumer products. Built in Bangkok." | joymify-portal `messages/en.json`, `src/routes/+layout.svelte:18` |
| Personality: "composed, exact, warm", "Quiet authority", "Gold is a signature, not a wash" | joy-design `PRODUCT.md` |
| Constraints: colour literals only in `tokens.json` (`scripts/lint-colors.sh`), zero emoji (`scripts/precheck.sh`), no gradient text / glassmorphism / tracked all-caps eyebrows (`DESIGN.md` Don'ts), WCAG AA both themes (`packages/tokens/test/contrast.test.js`) | joy-design |

## Decisions (batched round, 2026-09-26)

1. **Canonical mark = the gold diamond** (user-fe geometry). The portal's gold square becomes the outlier; migrating it is a follow-up.
2. **Wordmark = "Joymify", sentence case**, Cormorant Garamond, converted to vector outlines. No tracked caps (consistent with DESIGN.md).
3. **Delivery = a `@joymify/brand` package plus Svelte and React components.**
4. **www-joymify ("Joymify Universe" zinc/electric look) is out of scope.** A follow-up idea decides whether it converges.

## Design

### 1. Tokens (packages/tokens)

- Add a `semantic.<theme>.brand` group, light and dark:
  - `brand.tile`: the tile/panel behind the mark (light: navy-500, dark: navy-500).
  - `brand.mark-on-tile`: the gold signature on the tile (light and dark: gold-400; 5.89:1 on navy-500).
  - `brand.mark`: the bare mark on the page canvas (light: gold-600, because gold-400 on cream-100 is only 2.36:1; dark: `{color.gold.300}`).
  - `brand.mark-contrast`: the centre dot and inner detail (cream-50 in both themes).
  - `brand.ink`: wordmark colour on a light surface (light: navy-500, dark: cream-100).
  - `brand.ink-on-tile`: wordmark colour on the tile (cream-100 in both themes).
- These emit as `--joy-brand-*` CSS variables through the existing build.
- Add `font.family.display` = `"Cormorant Garamond", "Noto Serif", Georgia, serif`, emitted as `--joy-font-family-display`. joy-design does not load the font; consumers do (as portal already does).
- Contrast tests cover the new pairs:
  - `mark-on-tile` on `tile` must reach ≥ 3:1 (non-text graphic, WCAG 1.4.11).
  - `mark` on `surface.canvas` must reach ≥ 3:1 in both themes.
  - `ink-on-tile` on `tile` must reach ≥ 4.5:1.
  - `ink` on `surface.canvas` must reach ≥ 4.5:1.

### 2. `@joymify/brand` package (packages/brand, new)

Laid out like `@joymify/icons`: `src/`, `test/*.test.js`, `PROVENANCE.md`, `node --test`.

- `src/geometry.js`: the single source of shape data.
  - `MARK`: the diamond paths, viewBox 32.
  - `WORDMARK`: outlined "Joymify" glyph paths, their advance width and viewBox.
  - `TAGLINE`: outlined path for "Calm, considered tools for traders, builders, and gamers.", used only by the social card.
- `scripts/outline-text.mjs` (dev-only, run by hand): converts Cormorant Garamond (SIL OFL 1.1) glyphs to path data with `opentype.js`, then writes `src/outlines.generated.js`. The font file is not committed. PROVENANCE.md records the font version, licence, source URL and the exact command.
- `src/render.js`: pure functions `markSvg({tile, palette})`, `wordmarkSvg({tone, palette})`, `lockupSvg(...)`, `ogCardSvg(...)`, `heroBannerSvg(...)`. Each returns an SVG string and takes a palette as an argument.
- `build.js` builds the palette by parsing the light-theme `--joy-brand-*` values from `packages/tokens/dist/theme.css`, by relative path. The light block is enough, because every static asset targets either a light surface or the tile. Hex is never typed by hand. It runs the tokens build first if `dist/` is missing.
- `build.js` writes the committed static assets into `assets/`:

  | File | Size | Use |
  |---|---|---|
  | `mark.svg` | 32 viewBox | diamond on navy tile, for app icons |
  | `mark-bare.svg` | 32 viewBox | gold diamond, transparent, for inline use |
  | `favicon.svg` | 32 | same as mark.svg, with `<title>Joymify</title>` |
  | `favicon-32.png`, `apple-touch-icon.png` | 32, 180 | raster fallbacks |
  | `wordmark-deep.svg`, `wordmark-cream.svg` | mark + "Joymify" lockup | on light and dark surfaces |
  | `og-card.svg`, `og-card.png` | 1200×630 | social share card: navy field, diamond, wordmark, tagline, thin gold rule |
  | `hero-banner.svg` | 1600×560 | decorative navy banner with a fine gold diamond lattice fading to one side, no text |

  PNGs are rasterized with `@resvg/resvg-js` (dev dependency, prebuilt binaries for darwin-arm64 and linux-x64, no browser). PNG bytes can differ across platforms, so the drift test compares SVGs byte-for-byte and checks PNGs by dimensions only.
- `package.json` exports: `"."` (geometry + render), `"./assets/*"`. `@joymify/svelte` and `@joymify/react` add `"@joymify/brand": "workspace:*"` (the same pattern as `@joymify/icons`). The lockfile is regenerated, because CI uses `--frozen-lockfile`.
- Static assets contain literal hex **by design**; they are generated from tokens and a test proves it. `packages/brand/assets/` stays outside `lint-colors.sh` targets. `packages/brand/src` and `packages/brand/build.js` are added to the lint targets and must contain no hex. The `scripts/test-lint-colors.sh` sandbox is updated to create the new target folder.

### 3. Components (Svelte in packages/svelte, React twins in packages/react)

Every component uses `--joy-brand-*` and semantic vars only, so the colour lint stays clean. Each ships Svelte + React twins with the same props.

- **`BrandMark`**: props `size` (default 32), `variant: 'tile' | 'bare'`, `title` (accessible name; when absent the svg is `aria-hidden`). Renders `MARK` paths from `@joymify/brand`.
- **`Wordmark`**: props `tone: 'deep' | 'cream'`, `height`, `withMark` (default true), `title` (default "Joymify"). Outlined paths, `role="img"`.
- **`Ribbon`**: a small brand ribbon for "New", "Beta", "Coming soon" labels.
  - `variant: 'corner' | 'inline'`: a diagonal corner band on a positioned parent, or an inline flag with a notched tail.
  - `tone: 'gold' | 'navy'`, `label` (required text).
  - Sentence case, no icons, no emoji, and no side stripe > 1px.
  - The corner variant is `aria-hidden` only when `decorative` is set; otherwise its label is readable.
- **`BrandBanner`**: a hero banner.
  - The deep navy field with the diamond lattice from `heroBannerSvg`, drawn inline and tinted by CSS vars.
  - Props `eyebrow`, `title`, `lede`, and optional CTA via the existing `LandingAction`. A default slot/children covers custom content.
  - The title uses `--joy-font-family-display`. Solid colours only, no gradient text.
  - It complements `HeroSection` (which stays the product-UI hero); BrandBanner is the brand/marketing band. `LandingAction` stays internal and is imported by relative path, as HeroSection does.
- All four are added to `COMPONENTS` in `scripts/parity-check.mjs`, so twin parity is enforced.

### 4. Storybook hub

- The hub is one `build.js` that emits a single hash-routed `index.html`. It runs in the Docker image **without `pnpm install`** (Dockerfile:9-11), so it imports brand geometry by **relative path** (`../../packages/brand/src/...`), never by bare package name.
- Replace the "J" `.brand-logo` placeholder with the inline BrandMark (CSS vars, no hex).
- Add `favicon.svg` to the hub output, and a `<link rel="icon">` pointing at it.
- Add a **Brand** hash view (following the existing view pattern in build.js):
  - Mark and wordmark in both themes, minimum size and clear-space rules.
  - Download links to every file in `packages/brand/assets/`.
  - Ribbon variants and a BrandBanner.
  - Do/Don't usage notes: do not recolour, do not stretch, do not use the square mark, gold stays a signature.
- The hub copies `packages/brand/assets/` into its build output, so the downloads work in the deployed hub.

### 5. Docs

- README (hand edits stay outside the regions `gen-design-md.mjs` rewrites): new `packages/brand` entry, a table of the asset files, and an adoption snippet (favicon + og:image tags).
- DESIGN.md is generated: extend `scripts/gen-design-md.mjs` with a "Brand" section (mark, wordmark, colours, font, don'ts), then regenerate.

### Out of scope (logged as follow-up ideas)

- Swapping favicons/logos in joymify-portal (square to diamond), zen-ui, www-joymify (default Svelte favicon), quant-fe, joy-coach-fe.
- Deciding whether www-joymify's "Universe" look converges with the navy/gold family.
- Per-product sub-marks (JoyCoach, Algo Trading) and per-product OG cards.

## Error handling / edge cases

- `outline-text.mjs` fails loudly if the font file is missing or a glyph is absent (`.notdef`). It never emits empty paths.
- `build.js` fails if any palette value resolves to something other than a 6-digit hex.
- BrandMark rejects `size <= 0` by falling back to the default of 32 (documented).

## Testing

- **packages/brand** (`node --test`):
  - Each geometry path is non-empty and parses as path data.
  - Running `build.js` into a temp dir produces bytes identical to the committed `assets/` (drift check).
  - Every hex in `assets/*.svg` is in the resolved light `--joy-brand-*` token set.
  - Committed SVGs are byte-identical to fresh output. PNGs are checked by dimensions only.
  - PNG dimensions are 32, 180 and 1200×630.
  - `og-card` viewBox is 1200 630; every SVG has `<title>`.
  - No text nodes (all text outlined), so there is no font dependency.
- **packages/tokens**: contrast pairs above (both themes), plus the `--joy-brand-*` and `--joy-font-family-display` vars present in `dist/theme.css`.
- **Components** (Svelte + React twin tests, existing SSR helpers):
  - Compile without warnings.
  - `title` gives `role="img"` + `<title>`, and no title gives `aria-hidden`.
  - Ribbon label is rendered and in sentence case.
  - BrandBanner has no `gradient` substring in its text styling and renders `LandingAction` when a CTA is given.
- **Hub** (Playwright):
  - The Brand page loads in light and dark with no console errors.
  - `.brand-logo` contains an svg.
  - Asset download links return 200 with an `image/svg+xml` or `image/png` content type (nginx `try_files` falls back to index.html, so status alone proves nothing).
- **Gates**: `lint-colors.sh` clean with the brand src added, the zero-emoji scan clean, and `precheck.sh` green.

## Acceptance criteria

- [ ] `packages/brand` exists as `@joymify/brand`, and `pnpm --filter @joymify/brand test` passes, including the asset drift check.
- [ ] `packages/brand/assets/` contains mark.svg, mark-bare.svg, favicon.svg, favicon-32.png, apple-touch-icon.png, wordmark-deep.svg, wordmark-cream.svg, og-card.svg, og-card.png and hero-banner.svg, all colours traced to tokens.
- [ ] `--joy-brand-tile|mark|mark-on-tile|mark-contrast|ink|ink-on-tile` and `--joy-font-family-display` are emitted for light and dark, and the contrast tests pass.
- [ ] BrandMark, Wordmark, Ribbon and BrandBanner exist as Svelte + React twins with passing twin tests, are listed in `scripts/parity-check.mjs`, and `svelte-check` / `tsc` are clean.
- [ ] The Docker image build (`docker build .`) still succeeds, the hub serves a favicon, the header shows the diamond mark (no "J" placeholder), and a Brand view renders in both themes with working asset downloads (Playwright).
- [ ] `scripts/lint-colors.sh` passes with `packages/brand/src` in its targets, and `scripts/precheck.sh` passes.
- [ ] README and the generated DESIGN.md document the brand kit and adoption steps.
- [ ] Follow-up ideas are captured for portal/zen-ui/www/quant/joy-coach favicon adoption and the www-joymify convergence decision.

## Audit trail

- 2026-09-26 self-grill-audit: verdict safe-with-fixes. Corrected:
  - font var is `--joy-font-family-display` (build.js:89);
  - added `mark-on-tile` and made the bare `mark` gold-600 on light (gold-400 on cream-100 is 2.36:1);
  - the hub imports brand by relative path (the Docker image has no node_modules);
  - palette comes from theme.css, since dist/index.js has no dark values;
  - PNG drift check is by dimensions only;
  - download test asserts content type;
  - added parity-check, lint self-test and lockfile steps;
  - corrected the ramp/Cormorant/tagline-source claims.
  - Open: none. Accepted (untested): the dark tile edge on navy-900 (1.18:1) and the centre-dot contrast are decorative details, not information-bearing.
