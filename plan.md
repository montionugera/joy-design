# Bauhaus Joy-Coach Integration & 5 Color Palette Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Bauhaus design language from `joy-coach` into Joymify Design System and provide 5 curated color palette presets with an interactive topbar switcher in Storybook Hub.

**Architecture:** Token layer extension in `@joymify/tokens` (`[data-palette="..."]` presets, Clay scale, court and result semantics, Cormorant Garamond display serif), first-class component twins in `@joymify/svelte` and `@joymify/react` (`VoiceCard`, `StatCard` editorial mode, `PerformanceFigure`, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, `Emblem`), and topbar interactive dropdown with swatch preview in Storybook Hub.

**Tech Stack:** Svelte 5 (Runes), React 19, TypeScript, Vanilla CSS Tokens, Playwright, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-02-bauhaus-presets-joy-coach-design.md`

## Global Constraints

- Semantic tokens only: no hardcoded hex/rgb outside `packages/tokens/src/tokens.json`.
- Strict zero-color-literal policy enforced by `scripts/lint-colors.sh`.
- Svelte and React parity: 0 violations reported by `scripts/parity-check.mjs`.
- WCAG AA contrast: ≥4.5:1 text, ≥3:1 UI components across all 5 presets in both Light and Dark modes.
- Zero raw emoji policy: enterprise vector SVGs only.

---

### Task 1: Token Layer Extension & 5 Palette Presets

**Files:**
- Modify: `packages/tokens/src/tokens.json`
- Modify: `packages/tokens/build.js`
- Test: `packages/tokens/test/tokens.test.js`

- [ ] **Step 1.1: Write failing token tests**
  Add test assertions in `packages/tokens/test/tokens.test.js` checking for Clay scale tokens (`--joy-color-clay-50`..`--joy-color-clay-600`), court surface semantics (`--joy-court`, `--joy-surface-clay-*`, etc.), sports results (`--joy-result-won`, etc.), display serif typography (`--joy-font-display`), and the 5 palette preset selectors (`[data-palette="classic"]`, `[data-palette="bauhaus-primary"]`, `[data-palette="clay-court"]`, `[data-palette="nordic-slate"]`, `[data-palette="verdant-lawn"]`).
- [ ] **Step 1.2: Run token tests to confirm red**
  Run `(cd packages/tokens && node --test test/tokens.test.js)` and verify failure.
- [ ] **Step 1.3: Add tokens and presets to tokens.json and build.js**
  - Add Clay primitive ramps and semantic tokens to `packages/tokens/src/tokens.json`.
  - Add the 5 curated palette presets (`classic`, `bauhaus-primary`, `clay-court`, `nordic-slate`, `verdant-lawn`) in `packages/tokens/build.js` outputting CSS variable overrides under `[data-palette="..."]` for both light and dark modes.
  - Add Cormorant Garamond display serif typography tokens.
- [ ] **Step 1.4: Rebuild tokens and verify green**
  Run `node packages/tokens/build.js` and `(cd packages/tokens && node --test test/tokens.test.js)`. Verify all tests pass.
- [ ] **Step 1.5: Commit Task 1**
  `git commit -am "feat(tokens): add clay scale, court/result semantics, and 5 palette presets (F-049)"`

---

### Task 2: Bauhaus Component Twins (`@joymify/svelte` & `@joymify/react`)

**Files:**
- Create: `packages/svelte/src/lib/VoiceCard.svelte`
- Create: `packages/svelte/src/lib/PerformanceFigure.svelte`
- Create: `packages/svelte/src/lib/PerformanceBars.svelte`
- Create: `packages/svelte/src/lib/DenseRow.svelte`
- Create: `packages/svelte/src/lib/MonoChip.svelte`
- Create: `packages/svelte/src/lib/TrendLine.svelte`
- Create: `packages/svelte/src/lib/Emblem.svelte`
- Modify: `packages/svelte/src/lib/StatCard.svelte`
- Modify: `packages/svelte/src/lib/index.ts`
- Create: `packages/react/src/VoiceCard.tsx`
- Create: `packages/react/src/PerformanceFigure.tsx`
- Create: `packages/react/src/PerformanceBars.tsx`
- Create: `packages/react/src/DenseRow.tsx`
- Create: `packages/react/src/MonoChip.tsx`
- Create: `packages/react/src/TrendLine.tsx`
- Create: `packages/react/src/Emblem.tsx`
- Modify: `packages/react/src/StatCard.tsx`
- Modify: `packages/react/src/index.ts`
- Test: `packages/svelte/test/components.test.js`
- Test: `packages/react/test/components.test.js`

- [ ] **Step 2.1: Write failing component tests**
  Add unit tests in `packages/svelte/test/components.test.js` and `packages/react/test/components.test.js` asserting render, props, classes, and behavior for `VoiceCard`, `StatCard` (editorial mode with serif figure and note), `PerformanceFigure`, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, and `Emblem`.
- [ ] **Step 2.2: Implement Svelte component twins**
  Implement Svelte 5 Runes components in `packages/svelte/src/lib/` using semantic tokens (`var(--joy-*)`) only.
- [ ] **Step 2.3: Implement React component twins**
  Implement React 19 twin components in `packages/react/src/` with exact prop parity and class matching.
- [ ] **Step 2.4: Export components and verify parity**
  Export all components from `packages/svelte/src/lib/index.ts` and `packages/react/src/index.ts`. Run `node scripts/parity-check.mjs` and verify 0 violations.
- [ ] **Step 2.5: Run tests and type check**
  Run `(cd packages/svelte && node --test test/components.test.js)`, `(cd packages/react && node --test test/components.test.js)`, and `pnpm check`.
- [ ] **Step 2.6: Commit Task 2**
  `git commit -am "feat(components): implement Bauhaus component twins with Svelte/React parity (F-049)"`

---

### Task 3: Storybook Hub Topbar Switcher & Bauhaus Showcase

**Files:**
- Modify: `apps/storybook-hub/build.js`
- Modify: `apps/storybook-hub/scripts/gen-nav-manifest.mjs` (if needed)

- [ ] **Step 3.1: Add Topbar Palette Selector UI & Logic**
  Add an interactive dropdown pill in `topbar__end` of `apps/storybook-hub/build.js` with live 3-dot color swatch preview pills and `localStorage.getItem('joy-palette')` persistence.
- [ ] **Step 3.2: Add Bauhaus Showcase View Panel**
  Add a dedicated "Bauhaus & Sports Analytics" view panel to Storybook Hub demonstrating `VoiceCard` (editorial paper ground vs performance deep ground), `StatCard` with Cormorant Garamond display serif, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, and `Emblem`.
- [ ] **Step 3.3: Rebuild Storybook Hub distribution**
  Run `node apps/storybook-hub/build.js` to regenerate `apps/storybook-hub/dist/index.html`.
- [ ] **Step 3.4: Verify interactive switching in Playwright**
  Add Playwright tests in `tests/` verifying palette switching sets `data-palette` on `document.documentElement` and persists.
- [ ] **Step 3.5: Commit Task 3**
  `git commit -am "feat(hub): add topbar palette preset switcher and Bauhaus showcase panel (F-049)"`

---

### Task 4: Documentation, Verification & Gate 1 Certification

**Files:**
- Modify: `DESIGN.md` (via `node scripts/gen-design-md.mjs`)
- Modify: `README.md`

- [ ] **Step 4.1: Update DESIGN.md and README.md**
  Run `node scripts/gen-design-md.mjs` and update `README.md` to document the 5 color presets, Bauhaus tokens, and new components.
- [ ] **Step 4.2: Strict Color Lint Verification**
  Run `scripts/lint-colors.sh` ensuring 0 violations.
- [ ] **Step 4.3: Gate 1 Integration Precheck**
  Run `./scripts/precheck.sh` ensuring all 589+ tests and Playwright visual checks pass.
- [ ] **Step 4.4: Commit Task 4**
  `git commit -am "docs: update DESIGN.md and README.md for Bauhaus presets (F-049)"`
