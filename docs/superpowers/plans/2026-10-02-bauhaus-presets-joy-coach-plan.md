# Bauhaus Joy-Coach Integration & 5 Color Palette Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Bauhaus design language from `joy-coach` into Joymify Design System and provide 5 curated color palette presets with an interactive topbar switcher in Storybook Hub, resolving dark mode contrast defects.

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

### Task 1: Token Layer Extension & 5 Palette Presets (Completed)

**Files:**
- Modify: `packages/tokens/src/tokens.json`
- Modify: `packages/tokens/build.js`
- Modify: `packages/tokens/scripts/ramps.mjs`
- Test: `packages/tokens/test/tokens.test.js`
- Test: `packages/tokens/test/ramps.test.js`

- [x] **Step 1.1: Write failing token tests**
  Added test assertions in `packages/tokens/test/tokens.test.js` checking for Clay scale tokens (`--joy-color-clay-50`..`--joy-color-clay-600`), court surface semantics (`--joy-court`, `--joy-surface-clay-*`, etc.), sports results (`--joy-result-won`, etc.), display serif typography (`--joy-font-display`), and the 5 palette preset selectors (`[data-palette="classic"]`, `[data-palette="bauhaus-primary"]`, `[data-palette="clay-court"]`, `[data-palette="nordic-slate"]`, `[data-palette="verdant-lawn"]`).
- [x] **Step 1.2: Run token tests to confirm red**
  Verified failure before adding tokens.
- [x] **Step 1.3: Add tokens and presets to tokens.json, ramps.mjs and build.js**
  - Added Clay primitive ramps and semantic tokens to `packages/tokens/src/tokens.json` and generator `packages/tokens/scripts/ramps.mjs`.
  - Added the 5 curated palette presets (`classic`, `bauhaus-primary`, `clay-court`, `nordic-slate`, `verdant-lawn`) in `packages/tokens/build.js` outputting CSS variable overrides under `[data-palette="..."]` for both light and dark modes.
  - Added Cormorant Garamond display serif typography tokens.
- [x] **Step 1.4: Rebuild tokens and verify green**
  Ran `node packages/tokens/build.js` and `(cd packages/tokens && node --test test/tokens.test.js && node --test test/ramps.test.js)`. 166/166 tests passed.
- [x] **Step 1.5: Commit Task 1**
  Committed in `f362c5f` & `68db459`.

---

### Task 2: Bauhaus Component Twins (`@joymify/svelte` & `@joymify/react`) (Completed)

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

- [x] **Step 2.1: Write failing component tests**
  Added unit tests in `packages/svelte/test/components.test.js` and `packages/react/test/components.test.js` asserting render, props, classes, and behavior for `VoiceCard`, `StatCard` (editorial mode with serif figure and note), `PerformanceFigure`, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, and `Emblem`.
- [x] **Step 2.2: Implement Svelte component twins**
  Implemented Svelte 5 Runes components in `packages/svelte/src/lib/` using semantic tokens (`var(--joy-*)`) only.
- [x] **Step 2.3: Implement React component twins**
  Implemented React 19 twin components in `packages/react/src/` with exact prop parity and class matching.
- [x] **Step 2.4: Export components and verify parity**
  Exported all components from `packages/svelte/src/lib/index.ts` and `packages/react/src/index.ts`. Ran `node scripts/parity-check.mjs` and verified 0 violations.
- [x] **Step 2.5: Run tests and type check**
  Ran `(cd packages/svelte && node --test test/components.test.js)`, `(cd packages/react && node --test test/components.test.js)`, and `pnpm check`. All 88 tests pass, 0 type errors.
- [x] **Step 2.6: Commit Task 2**
  Committed in `769f930`.

---

### Task 3: Storybook Hub Topbar Switcher & Bauhaus Showcase (Completed)

**Files:**
- Modify: `apps/storybook-hub/build.js`
- Modify: `apps/storybook-hub/src/navigation.manifest.json`
- Test: `apps/storybook-hub/tests/palette-switcher.spec.ts`

- [x] **Step 3.1: Add Topbar Palette Selector UI & Logic**
  Added interactive dropdown pill in `topbar__end` of `apps/storybook-hub/build.js` with live 3-dot color swatch preview pills and `localStorage.getItem('joy-palette')` persistence.
- [x] **Step 3.2: Add Bauhaus Showcase View Panel**
  Added dedicated "Bauhaus & Sports Analytics" view panel to Storybook Hub demonstrating `VoiceCard` (editorial paper ground vs performance deep ground), `StatCard` with Cormorant Garamond display serif, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, and `Emblem`.
- [x] **Step 3.3: Rebuild Storybook Hub distribution**
  Ran `node apps/storybook-hub/build.js` to regenerate `apps/storybook-hub/dist/index.html`.
- [x] **Step 3.4: Verify interactive switching in Playwright**
  Added Playwright tests in `apps/storybook-hub/tests/palette-switcher.spec.ts` verifying palette switching sets `data-palette` on `document.documentElement` and persists. 10/10 tests pass on desktop-chrome and mobile-chrome.
- [x] **Step 3.5: Commit Task 3**
  Committed in `a36d87b`.

---

### Task 4: Documentation, Verification & Gate 1 Certification (In Progress)

**Files:**
- Modify: `DESIGN.md` (via `node scripts/gen-design-md.mjs`)
- Modify: `README.md`
- Modify: `packages/tokens/scripts/ramps.mjs`
- Test: `scripts/precheck.sh`

- [x] **Step 4.1: Synchronize Token Generator & Ramps Test**
  Synchronized `packages/tokens/scripts/ramps.mjs` with `packages/tokens/src/tokens.json` (Clay ramp, court/result semantics, 5 presets). Verified `(cd packages/tokens && node --test test/ramps.test.js)` passes with 0 drift.
- [x] **Step 4.2: Update DESIGN.md and README.md**
  Ran `node scripts/gen-design-md.mjs` and updated `README.md` to document the 5 color presets, Bauhaus tokens, and new components. Verified `node scripts/gen-design-md.mjs --check` exits 0.
- [x] **Step 4.3: Strict Color Lint Verification**
  Ran `scripts/lint-colors.sh` ensuring 0 violations.
- [ ] **Step 4.4: Gate 1 Integration Precheck**
  Run `./scripts/precheck.sh` ensuring all precheck phases exit 0.
- [ ] **Step 4.5: Commit Task 4**
  `git commit -am "docs: update DESIGN.md, README.md, and token generator for Bauhaus presets (F-049)"`
