# F-040 Wave 5 plan: Storybook hub (mobile layout, dark mode, hero, token-only colours, visual contracts)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. UI tasks also load `impeccable` and `frontend-design:frontend-design`.

**Goal (verbatim, epic E-001):** Audit joy-design's mobile + dark-mode design system for sloppiness and execute the fixes via ps-release-workflow. This slice: implement F-040 "Wave 5: Storybook hub — mobile layout, dark mode, hero, token-only colors, visual contracts".

**Architecture:** The hub is ONE generated page. `apps/storybook-hub/build.js` (7.3k lines) holds the hub stylesheet (the `<style>` block after `<style id="joy-theme-inline">`, ~lines 550-1634), the markup of all 38 manifest views, and the runtime `<script>` (~5625-7326); it writes `apps/storybook-hub/dist/index.html`. Three regions of `build.js` are **owned by `apps/storybook-hub/scripts/gen-landing-blocks.mjs`** (between `<!-- landing-blocks:generated:start/end -->`, `landing-simulator:generated`, `landing-simulator-footer:generated`) and must only change by editing the generator and running `node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write` (drift is checked by `packages/svelte/test/hub-landing-blocks.test.js`). The kinetic particle hero is inside the landing-blocks region (generator ~line 263). Every task edits `build.js`, so tasks run strictly one at a time.

**Tech Stack:** Node ESM build script, vanilla CSS on `packages/tokens/dist/theme.css` custom properties, vanilla JS, Playwright (`@playwright/test` 1.63) contracts in `apps/storybook-hub/tests/`.

**Spec:** `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/spec.md`. Evidence: `research/audit-hub.md` (HUB-001..070; its line numbers are stale, Waves 1-4 already fixed much of it, e.g. the strict colour lint on `build.js` is already 0 and no `linear-gradient`/`background-clip`/`glass` remain), `research/audit-standards.md`.

## Current state (measured 2026-09-24 at base 3ec91b2)

| Check | Now | Target |
| --- | --- | --- |
| `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js` | PASS 0 | PASS 0 (keep) |
| `grep -c "style\*=" apps/storybook-hub/build.js` | 3 (lines ~840, ~1154, ~1158) | 0 |
| `backdrop-filter` | 4 (topbar, sidebar-backdrop) | 0 in hub chrome |
| tracked uppercase (`text-transform: uppercase`) | 3 (.nav-section, ~850 hub-matrix h4, ~2861 inline) | 0 |
| `&rarr;` / `→` / `&bull;` in hub copy | 1 / 1 / 2 | 0 |
| raw `z-index` numbers | 10, 998, 999, 2 | `var(--joy-z-*)` only |
| `@media` breakpoints | 480, 479, 640, 899, 900 (ad hoc) | ladder 480 / 768 / 900 for chrome |
| theme boot | restored by end-of-body script, ignores `prefers-color-scheme` | inline `<head>` script, before first paint |
| kinetic canvas | fixed palette array, 300ms `setTimeout` poll under reduced motion, runs while hidden | token palette, stopped under reduced motion, static gradient on coarse pointer, rAF only while visible |
| overflow contract | `/#overview` only | all 38 manifest views x 375/1280 x light/dark |

## Global Constraints

- Work only in this worktree (branch `feat/F-040`, base `3ec91b2`). New commits only, never `git commit --amend`, never `git stash`. Never push, open a PR, merge, or run `psrw ship`/`promote`. Never touch `.release.json` or `.claude/refined_backlog/_catalog.json`. If the psrw guard blocks an edit: `psrw claim F-040 --resume`.
- Scratch and progress files live in `/tmp/f040-sdd/`, never in a `.superpowers/` dir inside the worktree (the Gate 1 emoji scan walks the tree).
- Colours: token-only. `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js` must stay 0; no hex, `rgb(`/`hsl(`, or `var(--joy-x, fallback)` anywhere in `build.js` or the generator output. Hub chrome uses semantic `--joy-*` tokens or `--hub-*` aliases that resolve to `--joy-*` tokens.
- Generated files only from generators: `packages/tokens/dist/theme.css` and `tokens.json` via `node packages/tokens/build.js`; landing regions via `node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write`. Never hand-edit them.
- Never weaken `scripts/parity-check.mjs`, `scripts/lint-colors.sh`, lint or test scripts; never edit budgets in `packages/react/test/chart-benchmark.test.js` (its failures under machine load > 20 in `uptime` are noise: re-run).
- Tests are behavioural (DOM, computed style, geometry, pixels), never source-string greps. `node --test` runs files in parallel: no test reads a build artifact another test rewrites.
- Playwright port for this worktree: `PLAYWRIGHT_PORT=6122`. Build first: `node apps/storybook-hub/build.js`.
- Touch targets: >= 44px, measured with a 0.5px sub-pixel tolerance (`>= 43.5`), the convention from F-037 commit d271622.
- Motion: 150-250ms (`var(--joy-duration-fast)` / `var(--joy-duration-normal)`), and none under `prefers-reduced-motion: reduce`.
- Copy: sentence case, no trailing arrows, no middle dots, no `01/02/03` markers, no emoji.
- Gate 1: `PLAYWRIGHT_PORT=6122 bash scripts/precheck.sh > /tmp/f040-pre.log 2>&1; echo $?` must print 0 from a clean committed tree; `node scripts/parity-check.mjs` bare = 0 violations.

## Decisions (stated assumptions, R2)

1. **"Landing view" = `#overview`**, the page visitors land on at design.joymify.com (brand register). It gets a real HeroSection + Button hero. The kinetic particle hero in `#landing-blocks` also becomes HeroSection markup rendered by the generator (`R('HeroSection', ...)`), keeping the canvas as a decorative backdrop. The screenshot named "landing" is `#overview`.
2. **Framework switcher on phones**: one switcher per location. The topbar keeps its `.framework-pill` at >= 768px; the drawer gets a second `.framework-pill` shown only below 768px. Buttons carry `data-framework="svelte|react"`; `setFramework()` toggles `.active` and `aria-pressed` on every `[data-framework]` button. The ids `btn-tab-svelte` / `btn-tab-react` stay on the topbar copy.
3. **Hub chrome** = `.topbar` and descendants, `.sidebar` and descendants, `.sidebar-backdrop`, `.mobile-menu-btn`, view headings (`.view-panel > h1`, `.view-panel > h2`, `.header-tagline`), `.playground-header`, `.component-header`, `.code-snippet`, `.tokens-table`, `.controls-table`, `.segmented-control`, `.icon-card`, `.hub-card`, `.kinetic-canvas-container`. Component markup inside demos (`.joy-*`) belongs to Waves 2-4 and is only measured for overflow and `background-clip: text`.
4. **Screenshots**: the matrix contract writes one viewport PNG per view/theme/viewport to Playwright's `test-results/` (gitignored). A separate gated spec (`F040_SCREENS=1`) writes the 16 acceptance shots (overview, primitives, forms, data-display-feedback x 375/1280 x light/dark) to `research/screens/`; the plan's "Screenshots" section links 8 representative ones and the folder README indexes all 16.

---

## File map

- Modify `apps/storybook-hub/build.js`: stylesheet (chrome aliases, breakpoints, slop removal), `<head>` theme boot script, topbar/sidebar/overview markup, runtime JS (`toggleTheme`, `setFramework`, `toggleMobileMenu`, kinetic canvas).
- Modify `apps/storybook-hub/scripts/gen-landing-blocks.mjs`: kinetic hero rendered as HeroSection; then regenerate.
- Modify `apps/storybook-hub/tests/helpers.ts`: add `HUB_VIEWS`, `HUB_CHROME`, `measureHubOverflow`, `hitSize`.
- Modify `apps/storybook-hub/tests/contracts.spec.ts`: Contracts 6-10.
- Create `apps/storybook-hub/tests/screens-f040.spec.ts` (gated).
- Create `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens/*.png` + `README.md`, and `research/issue-coverage.md` (HUB-001..070 resolved/deferred ledger).
- Modify `README.md` (new "Storybook hub (Wave 5)" section).

---

### Task 1: Theme boot before paint, chrome aliases, designed dark mode (spec items 1 and 3)

**Files:** Modify `apps/storybook-hub/build.js` (head, stylesheet, overview cards markup, `toggleTheme` and the startup restore block ~5631-5657); Modify `apps/storybook-hub/tests/helpers.ts`; Modify `apps/storybook-hub/tests/contracts.spec.ts`.

**Interfaces:**
- Produces (helpers.ts): `export const HUB_VIEWS: string[]` (manifest view ids, in order); `export const HUB_CHROME: string` (CSS selector list of decision 3); `export async function hitSize(page: Page, selector: string): Promise<{ width: number; height: number }>`.
- Produces (page globals): `localStorage['joy-theme']` in `'light'|'dark'`; `#btn-theme-toggle` with `aria-label` "Switch to dark theme" / "Switch to light theme" and visible label "Dark theme" / "Light theme".
- Produces (CSS): `--hub-sidebar-bg`, `--hub-topbar-bg`, `--hub-code-bg`, `--hub-code-fg`, `--hub-chrome-border`, `--hub-drawer-edge` defined in exactly two places: `:root` and `[data-theme="dark"]`.

- [ ] **Step 1: Add the helpers.** Append to `apps/storybook-hub/tests/helpers.ts`:

```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const manifestFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/navigation.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")) as {
  categories: { views: { id: string }[] }[];
};
/** Every view id in the navigation manifest, in sidebar order (38 at the time of writing). */
export const HUB_VIEWS: string[] = manifest.categories.flatMap((c) => c.views.map((v) => v.id));

/** Hub chrome (F-040 decision 3). Component demo markup (.joy-*) is not chrome. */
export const HUB_CHROME = [
  ".topbar", ".topbar *", ".sidebar", ".sidebar *", ".sidebar-backdrop",
  ".view-panel.active > h1", ".view-panel.active > h2", ".view-panel.active > .header-tagline",
  ".view-panel.active .playground-header", ".view-panel.active .playground-header *",
  ".view-panel.active .component-header", ".view-panel.active .component-header *",
  ".view-panel.active .code-snippet", ".view-panel.active .tokens-table", ".view-panel.active .tokens-table *",
].join(", ");

/** Rendered size of the first element matching `selector`. */
export async function hitSize(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`hitSize: ${selector} is not rendered`);
  return { width: box.width, height: box.height };
}
```

(Keep the existing `import { expect, type Page }` line; merge imports at the top of the file.)

- [ ] **Step 2: Write the failing contract.** Append inside the `test.describe` in `contracts.spec.ts` (add `installContrastTools`, `installPageTools`, `setTheme`, `settle` to the helpers import):

```ts
  test('Contract 7: theme resolved before first paint, honours prefers-color-scheme, persists', async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop-chrome', 'context-level colour scheme; one project is enough');
    for (const scheme of ['light', 'dark'] as const) {
      const context = await browser.newContext({ colorScheme: scheme, baseURL: info.project.use.baseURL });
      const page = await context.newPage();
      // The first requestAnimationFrame callback runs before the first paint.
      await page.addInitScript(() => {
        requestAnimationFrame(() => {
          (window as any).__themeAtFirstFrame = document.documentElement.getAttribute('data-theme');
        });
      });
      await page.goto('/');
      await page.waitForFunction(() => (window as any).__themeAtFirstFrame !== undefined);
      expect(await page.evaluate(() => (window as any).__themeAtFirstFrame), `first frame, OS ${scheme}`).toBe(scheme);

      const toggle = page.locator('#btn-theme-toggle');
      const other = scheme === 'light' ? 'dark' : 'light';
      await expect(toggle).toHaveAttribute('aria-label', `Switch to ${other} theme`);
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', other);
      await page.reload();
      await page.waitForFunction(() => (window as any).__themeAtFirstFrame !== undefined);
      expect(await page.evaluate(() => (window as any).__themeAtFirstFrame), 'saved choice beats the OS').toBe(other);
      await expect(page.locator('#btn-theme-toggle')).toHaveAttribute('aria-label', `Switch to ${scheme} theme`);
      await context.close();
    }
  });

  test('Contract 8: topbar and sidebar text contrast >= 4.5 in both themes at 375 and 1280', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-chrome', 'viewports are set explicitly');
    for (const width of [375, 1280]) {
      await page.goto('about:blank'); // fresh document per viewport
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/#overview');
      await page.waitForLoadState('networkidle');
      await installPageTools(page);
      await installContrastTools(page);
      if (width < 900) await page.locator('#mobile-menu-toggle').click();
      await settle(page);
      for (const theme of ['light', 'dark'] as const) {
        await setTheme(page, theme);
        for (const root of ['.topbar', '.sidebar']) {
          const result = await page.evaluate(([sel]) => window.__lowContrast(document.querySelector(sel)!, 4.5), [root]);
          expect(result.checked, `${root} ${theme} ${width}: sweep found text`).toBeGreaterThan(0);
          expect(result.failures, `${root} ${theme} ${width}`).toEqual([]);
        }
      }
    }
  });
```


- [ ] **Step 3: Run and see it fail.** `node apps/storybook-hub/build.js && cd apps/storybook-hub && PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/contracts.spec.ts -g "Contract (7|8)" --project=desktop-chrome`. Expected: Contract 7 FAILS (first frame `null` for OS dark, no `aria-label`). Contract 8 may pass or fail; record which in `/tmp/f040-sdd/progress.md`.

- [ ] **Step 4: Theme boot script.** In `build.js`, directly after `<meta name="viewport" ...>` and before any stylesheet, insert:

```html
  <script>
    (function () {
      var theme = null;
      try { theme = localStorage.getItem('joy-theme'); } catch (e) {}
      if (theme !== 'light' && theme !== 'dark') {
        theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
```

Delete the end-of-body "Restore saved theme on startup" block. Rewrite `toggleTheme()` so the icon, visible label and `aria-label` are set by one function `syncThemeToggle(theme)` that also runs once on `DOMContentLoaded`: label `theme === 'dark' ? 'Light theme' : 'Dark theme'`, `aria-label` `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`. The toggle markup starts with `aria-label="Switch to dark theme"` and label `Dark theme`.

- [ ] **Step 5: Chrome aliases and dark design.** At the top of the hub `<style>` block define:

```css
    :root {
      --sidebar-width: 280px;
      --hub-sidebar-bg: var(--joy-surface-card);
      --hub-topbar-bg: var(--joy-surface-card);
      --hub-chrome-border: var(--joy-border-default);
      --hub-code-bg: var(--joy-surface-sunken);
      --hub-code-fg: var(--joy-text-primary);
      --hub-drawer-edge: var(--joy-elevation-3);
    }
    [data-theme="dark"] {
      --hub-sidebar-bg: var(--joy-surface-card);
      --hub-topbar-bg: var(--joy-surface-card);
      --hub-chrome-border: var(--joy-border-strong);
      --hub-code-bg: var(--joy-surface-sunken);
      --hub-code-fg: var(--joy-text-primary);
      --hub-drawer-edge: 1px 0 0 var(--joy-border-strong);
    }
```

(Verify each `--joy-*` name exists in `packages/tokens/dist/theme.css` with `grep -c -- '--joy-elevation-3:' packages/tokens/dist/theme.css`; substitute the nearest existing token if not, never a literal.) Then: `.sidebar` uses `--hub-sidebar-bg`/`--hub-chrome-border`; `.topbar` uses `--hub-topbar-bg` and `border-bottom: 1px solid var(--hub-chrome-border)`; `.code-snippet` and `.joy-markdown__pre` (hub stylesheet) use `background: var(--hub-code-bg); color: var(--hub-code-fg); border: 1px solid var(--hub-chrome-border)`; `.sidebar.open` uses `box-shadow: var(--hub-drawer-edge)` (no black halo in dark). Delete every `[data-theme="dark"] .<chrome-class>` rule (~lines 894-1180, 1233-1250, 1339, 1575-1583) whose declarations now resolve through tokens/aliases; keep a dark rule only if it sets something tokens cannot express, and give it a one-line comment saying why. Replace `box-shadow: 0 2px 8px transparent` / `0 1px 4px transparent` placeholders with `none` or `var(--joy-elevation-1)`.

- [ ] **Step 6: Delete the `style*=` selectors.** (a) Overview cards (`#view-overview`, the three `<div style="background: var(--joy-surface-card); padding: 24px; ...">` and any other `div[style*=...]` targets): give them `class="hub-card"` and move the inline declarations into one `.hub-card` rule (`background: var(--joy-surface-card); border: 1px solid var(--hub-chrome-border); border-radius: var(--joy-radius-lg); padding: var(--joy-space-6);` plus a `:focus-visible` ring; make them `<button type="button">` or give them `role="link" tabindex="0"` with Enter/Space handling so they are keyboard reachable). Same for any element matched by the `surface-raised` selector. Delete both `[data-theme="dark"] .content-area div[style*=...]` rules. (b) Line ~840 `body:has([data-hub-dialog][style*="display: block"])`: replace with a class the dialog opener already toggles (add `document.body.classList.toggle('hub-dialog-open', open)` where `[data-hub-dialog]` is shown/hidden) and select `body.hub-dialog-open .joy-tooltip[data-static]`. Check `grep -c "style\*=" apps/storybook-hub/build.js` prints 0.

- [ ] **Step 7: Run.** Build, then `-g "Contract (7|8)"` passes on desktop-chrome; then the full hub suite `PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test --workers=3 2>&1 | tail -n 15` has no new failures versus base (record base failures, if any, in `/tmp/f040-sdd/progress.md` first). `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js` = PASS 0.

- [ ] **Step 8: Commit.** `git add apps/storybook-hub/build.js apps/storybook-hub/tests/helpers.ts apps/storybook-hub/tests/contracts.spec.ts && git commit -m "feat(hub): theme resolved before first paint, chrome on semantic aliases, style*= dark hacks removed"`.

- [ ] **Step 9: Phase gate.** Verify (Step 7 output) -> independent review (`code-reviewer` + `typescript-reviewer`, `model: sonnet` if diff < 200 lines) -> `/simplify` -> re-run Step 7 -> commit fixes as a new commit.

---

### Task 2: Phone tier chrome: topbar, drawer, hit areas (spec item 2, chrome half; HUB-001, 013, 036-038, 044 chrome part, 061, 064)

**Files:** Modify `apps/storybook-hub/build.js` (topbar + sidebar markup ~1636-1690, `.topbar`/`.sidebar`/`.mobile-menu-btn`/`.sidebar-close-btn`/`.framework-*` CSS and the `@media` blocks, `setFramework`, `toggleMobileMenu`); Modify `apps/storybook-hub/tests/contracts.spec.ts`.

**Interfaces:**
- Consumes: `hitSize`, `HUB_VIEWS` from Task 1.
- Produces: `.topbar` children at < 768px = `#mobile-menu-toggle`, `.topbar-brand` (logo mark + "Joymify Design"), `#btn-theme-toggle` (icon-only below 480px, `aria-label` kept); drawer copy `.framework-pill--drawer` inside `.sidebar`; `[data-framework]` buttons with `aria-pressed`; `#mobile-menu-toggle[aria-expanded]` and `aria-controls="hub-sidebar"`; `.sidebar#hub-sidebar`.

- [ ] **Step 1: Failing contract.** Append:

```ts
  test('Contract 9: phone chrome, 44px hit areas, framework switcher in the drawer', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-chrome', 'viewports are set explicitly');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#button');
    await page.waitForLoadState('networkidle');
    const menu = page.locator('#mobile-menu-toggle');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.topbar .framework-pill')).toBeHidden();
    for (const sel of ['#mobile-menu-toggle', '#btn-theme-toggle']) {
      const s = await hitSize(page, sel);
      expect(s.width, `${sel} width`).toBeGreaterThanOrEqual(43.5);
      expect(s.height, `${sel} height`).toBeGreaterThanOrEqual(43.5);
    }
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const tabs = page.locator('.sidebar [data-framework]');
    await expect(tabs).toHaveCount(2);
    for (const sel of ['.sidebar-close-btn', '.sidebar [data-framework="svelte"]', '.sidebar [data-framework="react"]']) {
      const s = await hitSize(page, sel);
      expect(s.width, `${sel} width`).toBeGreaterThanOrEqual(43.5);
      expect(s.height, `${sel} height`).toBeGreaterThanOrEqual(43.5);
    }
    await page.locator('.sidebar [data-framework="react"]').click();
    await expect(page.locator('.sidebar [data-framework="react"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#btn-tab-react')).toHaveClass(/active/);
    // Focus stays inside the open drawer.
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('.sidebar')), `tab ${i}`).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    // Desktop: switcher back in the topbar, drawer copy hidden.
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.topbar .framework-pill')).toBeVisible();
    await expect(page.locator('.framework-pill--drawer')).toBeHidden();
  });
```

- [ ] **Step 2: Run, expect FAIL** (`aria-expanded` missing, framework pill visible at 375). Command as Task 1 Step 3 with `-g "Contract 9"`.

- [ ] **Step 3: Implement.**
  - Breakpoint ladder, written once, in this order at the end of the stylesheet: `@media (max-width: 899px)` (drawer mode: sidebar off-canvas, `z-index: var(--joy-z-drawer)`, backdrop `z-index: var(--joy-z-backdrop)`, menu button shown), `@media (max-width: 767px)` (topbar = menu + brand + theme toggle; topbar framework pill `display: none`; `.framework-pill--drawer` shown; content padding `var(--joy-space-4)` i.e. 16px), `@media (max-width: 479px)` (theme toggle icon-only: hide `#theme-label` visually, keep `aria-label`). Move the existing 900/640 chrome rules into this ladder and delete the old blocks. Component-level ad hoc queries elsewhere (e.g. `.hub-sheet-demo`, `.landing-demo`) stay unless Task 3 needs them.
  - `.topbar`: `position: sticky; top: 0; z-index: var(--joy-z-sticky); background: var(--hub-topbar-bg);` no `backdrop-filter`; `flex-wrap: nowrap` is fine once the children fit; replace the inline-styled `<div style="display:flex...">` wrappers with classes `.topbar__start` / `.topbar__end`; remove the "Target Suite:" label and "Multi-Platform Enterprise" badge below 768px (hide) or delete them (they are decoration; deletion preferred, record in the coverage ledger).
  - `.mobile-menu-btn`, `.sidebar-close-btn`, `#btn-theme-toggle` (phone), `.framework-btn` (drawer copy): `min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;` with `:focus-visible` ring `outline: 2px solid var(--joy-border-focus); outline-offset: 2px;`.
  - Markup: `<aside class="sidebar" id="hub-sidebar">`; `#mobile-menu-toggle` gets `aria-controls="hub-sidebar" aria-expanded="false"`; insert `<div class="framework-pill framework-pill--drawer" role="group" aria-label="Code framework">` with two `<button type="button" class="framework-btn" data-framework="svelte|react" aria-pressed="...">` after `.brand` in the sidebar; topbar buttons gain `data-framework` and `aria-pressed`.
  - JS: `setFramework(fw)` sets `.active` + `aria-pressed` on `document.querySelectorAll('[data-framework]')`. `toggleMobileMenu(open)` sets `aria-expanded`, traps Tab/Shift+Tab inside `.sidebar` while open (keydown listener cycling between first and last focusable: `a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])` that are visible), and on close returns focus to `#mobile-menu-toggle` only when focus was inside the sidebar. Opening at >= 900px is a no-op.
- [ ] **Step 4: Run** Contract 9 + Contracts 1-8 on both projects: `PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/contracts.spec.ts tests/forms-contracts.spec.ts 2>&1 | tail -n 15`. Expected PASS.
- [ ] **Step 5: Commit** `feat(hub): phone tier topbar, framework switcher in the drawer, 44px chrome targets, drawer focus trap`.
- [ ] **Step 6: Phase gate** (as Task 1 Step 9).

---

### Task 3: Zero overflow on every manifest view (spec item 2, content half; spec item 7 overflow + background-clip; HUB-005, 006, 008, 009, 014, 015, 070)

**Files:** Modify `apps/storybook-hub/tests/helpers.ts`, `apps/storybook-hub/tests/contracts.spec.ts`, `apps/storybook-hub/build.js` (stylesheet + hand-written view markup only; generated regions via the generator).

**Interfaces:**
- Produces (helpers.ts): `export async function measureHubOverflow(page: Page): Promise<{ viewport: number; documentScrollWidth: number; mainScrollWidth: number; mainClientWidth: number; beyond: string[]; textClip: string[] }>`.
- Produces (CSS): `.hub-scroll-x` wrapper class (`overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch;`) used around every `.tokens-table`, `.joy-props-table`, `.controls-table` that can exceed 343px.

- [ ] **Step 1: Helper.** Append to helpers.ts:

```ts
/**
 * F-040 overflow sweep for the active hub view. `.main` is the scroller (body is overflow:hidden), so its own
 * scrollWidth is checked as well as the document. `beyond` lists laid-out elements whose right edge passes the
 * viewport outside an intentional scroll/clip region; `textClip` lists elements painted with background-clip: text.
 * Requires installPageTools (for __describe).
 */
export async function measureHubOverflow(page: Page) {
  const base = await measureOverflow(page, ".main");
  const extra = await page.evaluate(() => {
    const main = document.querySelector<HTMLElement>(".main")!;
    const textClip: string[] = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const s = getComputedStyle(el) as CSSStyleDeclaration & { webkitBackgroundClip?: string };
      if (s.backgroundClip === "text" || s.webkitBackgroundClip === "text") textClip.push(window.__describe(el));
    }
    return { mainScrollWidth: main.scrollWidth, mainClientWidth: main.clientWidth, textClip };
  });
  return { viewport: base.viewport, documentScrollWidth: base.documentScrollWidth, beyond: base.beyond, ...extra };
}
```

- [ ] **Step 2: Failing matrix contract.** Append to `contracts.spec.ts` (outside the existing describe, so each view is its own test and failures name the view):

```ts
test.describe('Contract 6: every manifest view at 375 and 1280, light and dark', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop-chrome', 'viewports are set explicitly'); });
  for (const view of HUB_VIEWS) {
    test(view, async ({ page }, info) => {
      for (const vp of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
        await page.goto('about:blank'); // fresh document per viewport: a same-URL hash goto would not reload
        await page.setViewportSize(vp);
        await page.goto(`/#${view}`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
        await installPageTools(page);
        for (const theme of ['light', 'dark'] as const) {
          await setTheme(page, theme);
          const m = await measureHubOverflow(page);
          const where = `${view} ${theme} ${vp.width}`;
          expect(m.documentScrollWidth, `${where}: document`).toBeLessThanOrEqual(m.viewport);
          expect(m.mainScrollWidth, `${where}: .main`).toBeLessThanOrEqual(m.mainClientWidth + 1);
          expect(m.beyond, `${where}: elements past the viewport`).toEqual([]);
          expect(m.textClip, `${where}: background-clip text`).toEqual([]);
          await page.screenshot({ path: info.outputPath(`${view}-${theme}-${vp.width}.png`), animations: 'disabled' });
        }
      }
    });
  }
});
```

Delete old Contract 3 only if Contract 6 covers all of its widths; it does not (320/768/899/900), so keep Contract 3 and change its loop to iterate `['overview', 'button', 'forms', 'table']` so the in-between widths are sampled on more than one view.

- [ ] **Step 3: Run, list failures.** `PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/contracts.spec.ts -g "Contract 6" --project=desktop-chrome --workers=4 2>&1 | grep -E "✘|failed|beyond|document|\.main" | head -n 60` and write the failing views + offending selectors to `/tmp/f040-sdd/overflow.txt`.

- [ ] **Step 4: Fix each failure at its source**, one view family at a time, re-running only that view (`-g "Contract 6.* <view>$"`):
  - Tables: wrap every `.tokens-table`, `.joy-props-table`, `.controls-table` in `<div class="hub-scroll-x">` (hand-written views); inside wrappers the table keeps its natural width.
  - Code: `.code-snippet`, `.joy-markdown__pre` get `overflow-x: auto; max-width: 100%;` and scroll inside their card.
  - Cards: `.component-card`, `.hub-matrix`, `.form-showcase-grid` and other grids single column below 768px (`grid-template-columns: minmax(0, 1fr)`), 16px gutters (`var(--joy-space-4)`).
  - Playground headers: `.playground-header` wraps (`flex-wrap: wrap`) and its controls (`.segmented-control`) may scroll horizontally in a `.hub-scroll-x`.
  - Horizontal form demo (HUB-008): below 768px the hub's horizontal form demo stacks labels above fields (hub CSS scoped to the demo container, not the component).
  - Market search input (HUB-009): `font-size: var(--joy-font-size-md)` (16px) below 768px.
  - Anything inside a generated region is fixed in `gen-landing-blocks.mjs` or, if the defect is in the component itself, recorded as deferred with the component name (Waves 2-4 own component internals) and the contract gets NO exemption: if a component defect blocks the contract, stop and report it as a blocker in `/tmp/f040-sdd/progress.md`.
- [ ] **Step 5: Run** full Contract 6 on desktop-chrome (all 38 pass) and `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js`.
- [ ] **Step 6: Commit** (one commit per view family if the diff is large; message prefix `fix(hub):`), then the test commit `test(hub): overflow and background-clip contract over every manifest view`.
- [ ] **Step 7: Phase gate** (as Task 1 Step 9).

---

### Task 4: Kinetic canvas on tokens + HeroSection heroes (spec items 4 and 5; HUB-004, 007, 039, 040, 043)

**Files:** Modify `apps/storybook-hub/scripts/gen-landing-blocks.mjs` (kinetic block ~line 263), regenerate `build.js` regions; Modify `apps/storybook-hub/build.js` (kinetic JS ~7000-7130, `.kinetic-*` CSS ~1254-1340 and ~1382-1390, `#view-overview` header); Modify `apps/storybook-hub/tests/contracts.spec.ts` (replace Contract 5).

**Interfaces:**
- Produces (page global): `window.hubKineticPalette(): { accents: string[]; muted: string }` returning the computed values of `--joy-accent-default`, `--joy-accent-hover`, `--joy-accent-active` and `--joy-text-muted` read with `getComputedStyle(document.documentElement)` at call time (it is what the canvas draws with; re-read on theme change).
- Produces (markup): `#kinetic-hero-container.kinetic-canvas-container` containing `<canvas id="kinetic-particle-canvas" aria-hidden="true">` and a HeroSection render (`<section class="joy-hero">`), no `.kinetic-title|subtitle|badge|actions|hint|overlay` classes. `#view-overview` starts with a HeroSection render whose CTAs are Wave 2 `joy-button--solid` / `joy-button--outline` buttons ("Browse components" -> `switchView('button')`, "Read the tokens" -> `switchView('tokens')`).

- [ ] **Step 1: Failing contract** (replace Contract 5):

```ts
  test('Contract 5: kinetic hero uses HeroSection, token palette, honours motion and pointer', async ({ browser }, info) => {
    test.skip(info.project.name !== 'desktop-chrome', 'context options set explicitly');
    const baseURL = info.project.use.baseURL;
    const frames = async (opts: Parameters<typeof browser.newContext>[0]) => {
      const context = await browser.newContext({ baseURL, viewport: { width: 1280, height: 800 }, ...opts });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/#landing-blocks');
      await page.waitForLoadState('networkidle');
      return { context, page, errors };
    };
    const snapshot = (page: import('@playwright/test').Page) =>
      page.evaluate(() => (document.getElementById('kinetic-particle-canvas') as HTMLCanvasElement).toDataURL());

    // Default: animates, palette follows the theme, hero is the real component.
    const normal = await frames({});
    const { page } = normal;
    await expect(page.locator('#kinetic-hero-container .joy-hero .joy-hero__title')).toBeVisible();
    await expect(page.locator('#kinetic-hero-container .joy-hero__ctas .joy-button--solid')).toHaveCount(1);
    expect(await page.locator('[class*="kinetic-title"], [class*="kinetic-overlay"]').count()).toBe(0);
    for (const theme of ['light', 'dark'] as const) {
      await setTheme(page, theme);
      const [palette, tokens] = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        const v = (n: string) => cs.getPropertyValue(n).trim();
        return [window.hubKineticPalette!(), { accents: [v('--joy-accent-default'), v('--joy-accent-hover'), v('--joy-accent-active')], muted: v('--joy-text-muted') }];
      });
      expect(palette, `palette ${theme}`).toEqual(tokens);
    }
    const a = await snapshot(page);
    await page.waitForTimeout(300);
    expect(await snapshot(page), 'animates by default').not.toBe(a);
    // Hidden view: no animation frames scheduled for the canvas.
    await page.evaluate(() => {
      (window as any).__rafCount = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => { (window as any).__rafCount++; return raf(cb); };
    });
    await page.goto('/#button');
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => (window as any).__rafCount);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).__rafCount) - before, 'no rAF loop while hidden').toBeLessThanOrEqual(1);
    expect(normal.errors).toEqual([]);
    await normal.context.close();

    // Reduced motion: nothing moves.
    const still = await frames({ reducedMotion: 'reduce' });
    const s1 = await snapshot(still.page);
    await still.page.waitForTimeout(400);
    expect(await snapshot(still.page), 'static under reduced motion').toBe(s1);
    await still.context.close();

    // Coarse pointer: static gradient of the same hue instead of the canvas.
    const touch = await frames({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
    const bg = await touch.page.locator('#kinetic-hero-container').evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg, 'coarse pointer gets a gradient').toContain('gradient(');
    await expect(touch.page.locator('#kinetic-particle-canvas')).toBeHidden();
    await touch.context.close();
  });
```

Declare `hubKineticPalette?(): { accents: string[]; muted: string };` in the `Window` interface in helpers.ts.

- [ ] **Step 2: Run, expect FAIL** (`hubKineticPalette` undefined, `.kinetic-title` present).
- [ ] **Step 3: Generator.** In `gen-landing-blocks.mjs` replace the hand-written kinetic overlay with a HeroSection render, reusing the existing `R('HeroSection', {...})` helper and props used for `heroDefault` (badge "Interactive particle field", title "Fast, clear order screens for busy desks" with emphasis "order screens" if the component supports an emphasis prop; primary CTA "Deploy solution", secondary "Read the guide"). Keep `<canvas class="kinetic-canvas" id="kinetic-particle-canvas" aria-hidden="true">` as the first child of `#kinetic-hero-container`. **Move the kinetic block after the "Hero states" box** (generator ~line 280) so `landing-blocks-states.spec.ts`, which indexes `#view-landing-blocks .joy-hero` `nth(0..2)` as default/loading/disabled, keeps passing unchanged. The hint sentence ("Move the cursor or touch to nudge the particles. Click to send a pulse.") becomes the HeroSection subtitle's second sentence or is dropped. The existing `onclick` wiring (burst + toast) moves to a delegated listener in `build.js` on `#kinetic-hero-container .joy-hero__ctas` (generator output must stay SSR-pure). Run `node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write` then `--check` (exit 0).
- [ ] **Step 4: CSS.** Delete `.kinetic-overlay`, `.kinetic-overlay *`, `.kinetic-badge`, `.kinetic-badge-dot`, `.kinetic-title`, `.kinetic-title-emphasis`, `.kinetic-subtitle`, `.kinetic-actions`, `.kinetic-hint` and their media-query copies. Keep only layout glue: `.kinetic-canvas-container { position: relative; overflow: hidden; border-radius: var(--joy-radius-lg); border: 1px solid var(--hub-chrome-border); background: var(--joy-surface-card); }`, `.kinetic-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }`, `.kinetic-canvas-container > .joy-hero { position: relative; z-index: var(--joy-z-base); }`, and `@media (pointer: coarse), (prefers-reduced-motion: reduce) { .kinetic-canvas-container { background-image: radial-gradient(circle at 30% 20%, var(--joy-accent-subtle), transparent 60%), radial-gradient(circle at 80% 80%, var(--joy-accent-subtle), transparent 55%); } }` and `@media (pointer: coarse) { .kinetic-canvas { display: none; } }`. (`transparent` is a keyword, not a colour literal; confirm with lint-colors.)
- [ ] **Step 5: JS.** Rewrite the kinetic module (~7000-7130):
  - `function hubKineticPalette()` reads the four tokens at call time; expose `window.hubKineticPalette = hubKineticPalette`. Particles store a palette index, not a colour; draw with `palette.accents[i]`, links with `palette.muted` at `globalAlpha` 0.25 (no `rgba(` literals). Re-read the palette in `toggleTheme()` (call `refreshKineticPalette()`), and on `matchMedia('(prefers-color-scheme: dark)')` change.
  - Motion gate: `const reduce = matchMedia('(prefers-reduced-motion: reduce)')`, `const coarse = matchMedia('(pointer: coarse)')`. If `reduce.matches`: draw ONE static frame (particles at rest) and schedule nothing. If `coarse.matches`: draw nothing, schedule nothing (CSS shows the gradient). Listen to `change` on both to start/stop. Delete the 300ms `setTimeout` poll.
  - Visibility: an `IntersectionObserver` on `#kinetic-hero-container` starts the loop when intersecting and cancels `kineticAnimId` when not (a `display: none` view reports not intersecting). Also stop on `document.visibilitychange` hidden.
  - 60fps cap: in the rAF callback skip the update when `now - lastFrame < 1000 / 60 - 1`.
- [ ] **Step 6: Overview hero.** Replace the `#view-overview` badge + `<h1 style=...>` + tagline with a NEW generator-owned region `<!-- overview-hero:generated:start -->` ... `<!-- overview-hero:generated:end -->` rendered by `R('HeroSection', { badgeText: 'Design system', title: 'Joymify Design System', subtitle: <existing tagline text>, primary CTA 'Browse components', secondary CTA 'Read the tokens' })` (prop names: read the existing `heroDefault` call ~line 140 and reuse them exactly; `titleEmphasis` and `badgeText` exist). Extend the generator's `--write`/`--check` to own this region so the drift test covers it. CTA wiring (`switchView('button')`, `switchView('tokens')`) is a delegated listener in `build.js`. The only hub rule touching `.joy-hero` is the Step 4 positioning glue (`position: relative; z-index`); nothing restyles its visuals.
- [ ] **Step 7: Run** Contract 5, Contract 6 for `overview` and `landing-blocks`, all `landing-*.spec.ts`, and `pnpm --filter @joymify/svelte test 2>&1 | tail -n 5` (generator drift test). Expected PASS.
- [ ] **Step 8: Commit** `feat(hub): kinetic hero is HeroSection over a token-palette canvas that respects motion, pointer and visibility; overview hero uses HeroSection`.
- [ ] **Step 9: Phase gate** (as Task 1 Step 9, plus an `impeccable` critique of the overview and landing-blocks screenshots from Contract 6's output folder in both themes).

---

### Task 5: Slop removal across hub chrome (spec item 6; HUB-016..035, 041, 042, 044-046, 062, 063, 065-068)

**Files:** Modify `apps/storybook-hub/build.js`, `apps/storybook-hub/tests/contracts.spec.ts`.

**Interfaces:**
- Consumes: `HUB_CHROME`, `HUB_VIEWS`, `installPageTools`.
- Produces: none new.

- [ ] **Step 1: Failing contract.** Append:

```ts
test.describe('Contract 10: hub chrome carries no slop', () => {
  test.beforeEach(({}, info) => { test.skip(info.project.name !== 'desktop-chrome', 'one project is enough'); });
  const sweep = (page: import('@playwright/test').Page) => page.evaluate((chrome) => {
    const root = getComputedStyle(document.documentElement);
    const tokens = (prefix: string) => new Set(
      Array.from(document.styleSheets).flatMap((sheet) => { try { return Array.from(sheet.cssRules); } catch { return []; } })
        .flatMap((rule) => (rule instanceof CSSStyleRule ? Array.from(rule.style) : []))
        .filter((name) => name.startsWith(prefix))
        .map((name) => root.getPropertyValue(name).trim()),
    );
    const zTokens = tokens('--joy-z-');
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const sizes = new Set(Array.from(tokens('--joy-font-size-')).map((v) => { probe.style.fontSize = v; return getComputedStyle(probe).fontSize; }));
    probe.remove();
    const issues: string[] = [];
    for (const el of Array.from(document.querySelectorAll(chrome))) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const d = window.__describe(el);
      if (s.backdropFilter !== 'none' && s.backdropFilter !== '') issues.push(`${d}: backdrop-filter ${s.backdropFilter}`);
      if (s.textTransform === 'uppercase' && parseFloat(s.letterSpacing) > 0) issues.push(`${d}: tracked uppercase`);
      if (s.zIndex !== 'auto' && !zTokens.has(s.zIndex)) issues.push(`${d}: z-index ${s.zIndex} not a --joy-z-* token`);
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? '').join('').trim();
      if (own && !sizes.has(s.fontSize)) issues.push(`${d}: font-size ${s.fontSize} not a --joy-font-size-* token`);
      for (const dur of s.transitionDuration.split(',').map((x) => parseFloat(x) * (x.includes('ms') ? 1 : 1000))) {
        if (dur !== 0 && (dur < 150 || dur > 250)) issues.push(`${d}: transition ${dur}ms`);
      }
    }
    // Chrome text only: demo data (e.g. the TimePicker's "09 10 30 45") is component content, not a decorative marker.
    const text = Array.from(document.querySelectorAll(chrome)).map((el) => (el as HTMLElement).innerText ?? '').join('\n')
      + '\n' + (document.querySelector('.main') as HTMLElement).innerText.replace(/[^\u2192\u2022]/g, '');
    if (/→|→/.test(text)) issues.push('arrow glyph in visible copy');
    if (/•|&bull;/.test(text)) issues.push('middle dot in visible copy');
    if (/(^|\s)0[1-9](\s|$)/m.test(text.split('\n').filter((l) => !/[\u2192\u2022]/.test(l)).join('\n'))) issues.push('01/02 marker in hub chrome');
    return issues;
  }, HUB_CHROME);

  for (const view of HUB_VIEWS) {
    test(view, async ({ page }) => {
      for (const width of [375, 1280]) {
        await page.goto('about:blank'); // fresh document per viewport
        await page.setViewportSize({ width, height: 800 });
        await page.goto(`/#${view}`);
        await page.waitForLoadState('networkidle');
        await installPageTools(page);
        if (width < 900) await page.locator('#mobile-menu-toggle').click();
        expect(await sweep(page), `${view} ${width}`).toEqual([]);
      }
    });
  }

  test('reduced motion removes chrome transitions and view animations', async ({ browser }, info) => {
    const context = await browser.newContext({ baseURL: info.project.use.baseURL, reducedMotion: 'reduce', viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.goto('/#button');
    await page.waitForLoadState('networkidle');
    const moving = await page.evaluate(() => ['.sidebar', '.view-panel.active', '.nav-item', '.framework-btn'].flatMap((sel) =>
      Array.from(document.querySelectorAll(sel)).map((el) => getComputedStyle(el))
        .filter((s) => s.transitionDuration.split(',').some((d) => parseFloat(d) > 0.01) || (s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.01))
        .map(() => sel)));
    expect(moving).toEqual([]);
    await context.close();
  });
});
```

(Arrow and middle-dot checks cover all of `.main` (a stripped copy keeping only those glyphs); the `01/02` marker check reads hub chrome text only, per audit 2026-09-24.)

- [ ] **Step 2: Run, expect FAIL**; capture the issue list per view to `/tmp/f040-sdd/slop.txt`.
- [ ] **Step 3: Fix.** `.topbar` and `.sidebar-backdrop`: delete `backdrop-filter`/`-webkit-backdrop-filter`; backdrop uses `background: color-mix(in srgb, var(--joy-surface-inverse) 55%, transparent)` (no scrim token exists and `--joy-surface-overlay` is opaque; `color-mix` with `transparent` is not a colour literal for lint-colors). `.nav-section` (drop `text-transform`/tracking only; the manifest labels and Contract 4 stay as they are), the `hub-matrix__cell > h4` rule (~850) and the inline AvatarGroup `<h5 style="...text-transform: uppercase...">` (~2861, copy to sentence case): `letter-spacing: normal`, `font-size: var(--joy-font-size-xs)`, `font-weight: 600`, `color: var(--joy-text-secondary)`; the inline one becomes a class. Copy: DateRange separator `&rarr;` -> `<span class="joy-date-range-picker__sep" aria-hidden="true">to</span>` (what `DateRangePicker.svelte:76` renders), toast `' → '` -> `' to '`, the two `&bull;` headings become "Icon system (138 vector assets for Svelte 5 and React 19)" and "Splitter (drag the divider or use the arrow keys)". z-index: topbar `var(--joy-z-sticky)`, backdrop `var(--joy-z-backdrop)`, drawer `var(--joy-z-drawer)`, kinetic hero `var(--joy-z-base)`. Font sizes: every chrome `font-size` literal (0.6875rem, 0.8125rem, 0.9375rem, 1.1rem, 2rem ...) maps to the nearest `var(--joy-font-size-*)`; do the same for inline `font-size:` in hand-written view headings/taglines. Motion: chrome transitions use `var(--joy-duration-fast)` (150ms) or `var(--joy-duration-normal)` (verify it is <= 250ms in theme.css) and name properties (`transition: background-color var(--joy-duration-fast), color var(--joy-duration-fast)`) instead of `all`; sidebar slide `transform var(--joy-duration-normal) var(--joy-motion-easing-decelerate)`; add once:

```css
    @media (prefers-reduced-motion: reduce) {
      .sidebar, .sidebar-backdrop, .nav-item, .framework-btn, .segment-btn, .icon-card, .hub-card, .view-panel.active {
        transition: none;
        animation: none;
      }
    }
```

  Theme toggle copy is already sentence case from Task 1 (HUB-066). `.framework-btn:focus-visible` ring (HUB-068) is from Task 2; confirm.
- [ ] **Step 4: Run** Contract 10 (all views) + Contracts 1-9 + Contract 6. Expected PASS.
- [ ] **Step 5: Commit** `fix(hub): remove glass, tracked caps, arrows, middle dots; chrome type, z-index and motion on tokens` and `test(hub): chrome slop contract over every manifest view`.
- [ ] **Step 6: Phase gate** (as Task 1 Step 9).

---

### Task 6: Screenshots, HUB issue ledger, README, final Gate 1 (spec item 7 screenshots; acceptance criteria 1-3)

**Files:** Create `apps/storybook-hub/tests/screens-f040.spec.ts`; Create `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens/*.png` + `README.md`; Create `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/issue-coverage.md`; Modify `README.md`; Modify this plan (Screenshots section + ticks).

- [ ] **Step 1: Gated screenshot spec.**

```ts
import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTheme, settle } from "./helpers";

// F-040 acceptance screenshots. Gated by F040_SCREENS=1 so a normal run never rewrites the committed PNGs.
// Output: {name}-{light|dark}-{375|1280}.png (viewport-sized, not full page) in the F-040 research/screens folder.
const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens",
);
const shots = [
  { name: "landing", view: "overview" },
  { name: "primitives", view: "primitives" },
  { name: "forms", view: "forms" },
  { name: "data-display", view: "data-display-feedback" },
];

test.describe("F-040 screenshots", () => {
  test.beforeEach(({}, info) => { test.skip(!process.env.F040_SCREENS || info.project.name !== "desktop-chrome", "set F040_SCREENS=1"); });
  for (const shot of shots) {
    for (const width of [375, 1280]) {
      for (const theme of ["light", "dark"] as const) {
        test(`${shot.name} ${theme} ${width}`, async ({ page }) => {
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.setViewportSize({ width, height: width < 900 ? 812 : 800 });
          await page.goto(`/#${shot.view}`);
          await page.waitForLoadState("networkidle");
          await setTheme(page, theme);
          await settle(page);
          await page.screenshot({ path: path.join(dir, `${shot.name}-${theme}-${width}.png`), animations: "disabled" });
        });
      }
    }
  }
});
```

- [ ] **Step 2: Generate** `F040_SCREENS=1 PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/screens-f040.spec.ts --project=desktop-chrome` -> 16 PNGs. A subagent reviews them (text verdict only, rule 12 image budget) with `impeccable` critique: dark mode designed (visible borders, no halos, code blocks sunken), phone topbar = menu + brand + theme toggle, no slop. Findings fixed in `build.js` (new commit) and shots regenerated. Write `research/screens/README.md` indexing all 16 files (one line each: file, view, theme, width).
- [ ] **Step 3: Issue ledger.** `research/issue-coverage.md`: one row per HUB-001..070: `| ID | status (resolved-F040 / resolved-earlier / deferred) | evidence (contract name, commit sha, or file:line) | reason if deferred |`. Every ID is re-checked against the current code, not the audit's stale line numbers. Known deferrals to confirm: HUB-069 (icon size/colour parity test belongs to the icons package, Wave 6 docs/parity owner). Anything else deferred needs a reason.
- [ ] **Step 4: README.** Add a "## Storybook hub (Wave 5)" section to `README.md` after the Wave 4 section: breakpoint ladder (480/768/900) and what changes at each; theme boot (inline head script, `localStorage['joy-theme']`, falls back to `prefers-color-scheme`); `--hub-*` chrome aliases and the rule that the hub uses tokens only; kinetic canvas behaviour (token palette, reduced motion, coarse pointer, visibility); Contracts 5-10 and how to run them (`PLAYWRIGHT_PORT=6122 pnpm --filter storybook-hub exec playwright test tests/contracts.spec.ts --project=desktop-chrome`), where per-view screenshots land (`apps/storybook-hub/test-results/`), and the gated `F040_SCREENS=1` command; known deviations/deferrals with a link to `issue-coverage.md`.
- [ ] **Step 5: Plan screenshots section.** Append to this plan a "## Screenshots" section linking 8 representative PNGs (landing light 375, landing dark 1280, primitives dark 375, primitives light 1280, forms light 375, forms dark 1280, data-display dark 375, data-display light 1280) with relative links `research/screens/<file>`.
- [ ] **Step 6: Acceptance checks.**

```bash
bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js; echo "lint=$?"   # 0
grep -c "style\*=" apps/storybook-hub/build.js                                   # 0
node scripts/parity-check.mjs | tail -n 3                                         # 0 violations
node apps/storybook-hub/scripts/gen-landing-blocks.mjs --check; echo "gen=$?"     # 0
```

- [ ] **Step 7: Commit** everything (`docs(F-040): screenshots, HUB issue ledger, README hub section`), confirm `git status --short` is empty, then Gate 1 from the clean tree: `PLAYWRIGHT_PORT=6122 bash scripts/precheck.sh > /tmp/f040-pre.log 2>&1; echo $?` = 0; record passed/skipped counts from `tail -n 20 /tmp/f040-pre.log`. If `chart-benchmark.test.js` fails and `uptime` load > 20, re-run.
- [ ] **Step 8: Phase gate** (final): independent `code-reviewer` over `git diff 3ec91b2..HEAD -- apps/storybook-hub` plus `typescript-reviewer` over the specs; fix, re-run Gate 1.

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| 1 tokens-only stylesheet, no `style*=`, chrome aliases once per theme | 1 (aliases, `style*=`), 5 (remaining literals) |
| 2 phone tier (480/768/900, topbar, drawer, 44px, single column, wrap, code/table scroll, zero overflow at 375) | 2 (chrome), 3 (content) |
| 3 dark mode designed, persisted toggle, pre-paint `data-theme`, `prefers-color-scheme` | 1 |
| 4 kinetic canvas (token palette, reduced motion, coarse pointer, 60fps, visible-only) | 4 |
| 5 HeroSection + Button hero, no bespoke hero CSS | 4 |
| 6 slop removal, font-size / z-index / motion tokens, reduced motion | 5 |
| 7 contracts (every view x 375/1280 x light/dark overflow, 44px, pre-paint, contrast, no clip text) + screenshots | 1 (7, 8), 2 (9), 3 (6), 4 (5), 5 (10), 6 (screens) |
| Every HUB- issue resolved or deferred with reason | 6 Step 3 |
| README | 6 Step 4 |

## Appendix: audit trail

- 2026-09-24 self-grill-audit: verdict safe-with-fixes. Corrected: (CRITICAL) describe-level `test.skip(({}, info) => ...)` gets fixtures only, so every project gate now uses `test.beforeEach(({}, info) => test.skip(...))`; (HIGH) Playwright binary is `apps/storybook-hub/node_modules/.bin/playwright` (`./node_modules/.bin/playwright` from the app dir), not the root; (HIGH) kinetic block moves after the "Hero states" box so `landing-blocks-states.spec.ts` nth() indexing is unchanged; (HIGH) the `01/02` marker check reads hub chrome text only (TimePicker data "09 10 30 45" false-positived); (HIGH) each viewport pass starts from `about:blank` because a same-URL hash `goto` does not reload. MEDIUM applied: backdrop via `color-mix(... transparent)` (no scrim token, overlay is opaque); `.nav-section` keeps its Title Case labels (Contract 4); overview hero becomes a generator-owned region covered by the drift check; `.joy-hero` gets positioning glue only; DateRange separator keeps `aria-hidden` like the component; particle palette uses `--joy-accent-active` instead of `--joy-accent-highlight` (pale gold in both themes). Open: none.
