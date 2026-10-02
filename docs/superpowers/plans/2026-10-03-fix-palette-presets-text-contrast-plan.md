# Implementation Plan: Fix Palette Presets Text Contrast & Verification Matrix (F-050)

## Goal
Resolve unreadable button text in palette presets (`bauhaus-primary`, `clay-court`, `nordic-slate`, `verdant-lawn`) by defining `--joy-text-on-accent` across all 5 presets in both light and dark modes, tuning accent tones to achieve WCAG 2.2 AA compliance (≥ 4.5:1), expanding token contrast unit tests, and adding automated Playwright computed contrast assertions.

## Tasks

### Phase 1: Token Definitions & Generation
- [ ] **Task 1**: Update `packages/tokens/scripts/ramps.mjs` with explicit `text-on-accent` for all 5 presets:
  - `classic`: light `#14253e`, dark `#0a121f`
  - `bauhaus-primary`: light `#ffffff` (on `#b91c1c`, 6.47:1), dark `#ffffff` (on `#dc2626`, 4.83:1)
  - `clay-court`: light `#ffffff` (on `#a85a34`, 5.03:1), dark `#18110d` (on `#dfb093`, 9.57:1)
  - `nordic-slate`: light `#ffffff` (on `#0274b3`, 5.06:1), dark `#0b1120` (on `#38bdf8`, 8.79:1)
  - `verdant-lawn`: light `#ffffff` (on `#1b4332`, 11.08:1), dark `#091611` (on `#52b788`, 7.48:1)
- [ ] **Task 2**: Complete semantic tokens in `bauhaus-primary.light` for `text-secondary`, `text-muted`, and border tokens.
- [ ] **Task 3**: Generate tokens (`node packages/tokens/scripts/ramps.mjs` & `pnpm --filter @joymify/tokens build`) and verify `dist/theme.css`.

### Phase 2: Automated Token Contrast Gate
- [ ] **Task 4**: Extend `packages/tokens/test/contrast.test.js` to assert `contrastRatio(text-on-accent, accent-default) >= 4.5:1` across all 5 presets in both Light and Dark themes.
- [ ] **Task 5**: Run token tests (`pnpm --filter @joymify/tokens test`) and verify 100% pass rate.

### Phase 3: Live DOM Computed Contrast Verification in Storybook Hub
- [ ] **Task 6**: Add Playwright test in `apps/storybook-hub/tests/palette-switcher.spec.ts` evaluating computed styles (`color` and `background-color`) of solid buttons across all 5 palettes in light and dark modes, asserting WCAG AA contrast ratio ≥ 4.5:1.
- [ ] **Task 7**: Rebuild Storybook Hub (`node apps/storybook-hub/build.js`) and execute Playwright tests with visual screenshots.

### Phase 4: Gate 1 Precheck, Release Ship & Promote
- [ ] **Task 8**: Sync `DESIGN.md` via `node scripts/gen-design-md.mjs`.
- [ ] **Task 9**: Run full `./scripts/precheck.sh` (Gate 1 precheck).
- [ ] **Task 10**: Execute `psrw ship` and `psrw promote --babysit`.
