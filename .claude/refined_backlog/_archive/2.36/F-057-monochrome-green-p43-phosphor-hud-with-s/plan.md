# F-057 Implementation Plan: Monochrome Green P43 Phosphor HUD with Symbolic State Matrix

## Phase 1: Architectural UI Guideline & Specification Update
- [x] Task 1.1: Update `docs/superpowers/specs/glasses-hud-design.md` detailing:
  - Optical physics of single-color monochromatic MicroLED (P43 phosphor 530nm, peak human photopic sensitivity at 555nm).
  - Why HUD background is deep black in all cases (0-emission additive light = transparent optical glass).
  - The Single-Color Symbolic State & Selection Matrix: mapping state, audio, selection, and actions to high-contrast geometric symbols (`▶`, `[x]`, `[ ]`, `×`, `⏸`, `●`, `▲`, `▼`, `◄`, `►`) and reverse-video typography.
- [x] Task 1.2: Render updated spec to HTML via `~/.claude/scripts/render-spec-md.sh` and verify.

## Phase 2: Hub Eyebox Visor Styling & Monochromatic Phosphor Modes
- [x] Task 2.1: Enforce dark optical background on `#hud-visor-frame` in all cases (override light theme inheritance).
- [x] Task 2.2: Add Phosphor Color Switcher:
  - `P43 Phosphor Green (530nm Mono)` [Default]
  - `Gold Phosphor (Amber Mono)`
  - `Additive Polychrome (Dual RGB)`
- [x] Task 2.3: Implement P43 Monochrome Green styling rules (`.hud-visor-frame[data-phosphor="green"]`):
  - Pure phosphor green typography, borders, and waveforms via `--joy-status-success-fg` / `--joy-color-green-400` / `--joy-color-green-600`.
  - Reverse-video selection highlight on active items: solid green fill with dark black text (`color: var(--joy-color-navy-950); background: var(--joy-status-success-fg);`).

## Phase 3: Symbolic Selection & Interactive State Machine
- [x] Task 3.1: Update selection pointers to geometric symbols: `▶` cursor arrow.
- [x] Task 3.2: Update checklist symbols: `[x]` (done), `[ ]` (pending), `×` (delete).
- [x] Task 3.3: Update communication states with symbols:
  - Talking: `▶ TALKING` with animated phosphor meter.
  - Listening: `[~ LISTEN]`
  - Paused: `⏸ PAUSED`
  - Recording: `● REC`
- [x] Task 3.4: Temple touchbar buttons updated with directional indicators: `▲ PREV`, `▼ NEXT`, `◄ BACK`.

## Phase 4: Token Discipline & Quality Gates
- [x] Task 4.1: Zero Emoji verification (all symbols are valid non-emoji geometric unicode or `@joymify/icons`).
- [x] Task 4.2: Pure semantic token check: `bash scripts/lint-colors.sh` exits 0.

## Phase 5: Automated Testing & Visual Verification
- [x] Task 5.1: Extend Playwright test `apps/storybook-hub/tests/glasses-hud.spec.ts` for monochrome green mode, darkbg in light theme, and symbolic state toggling.
- [x] Task 5.2: Capture screenshots of monochrome green HUD and copy to artifacts directory.
- [x] Task 5.3: Run `bash scripts/precheck.sh` and ensure 100% pass.

## Phase 6: Documentation & Promotion
- [x] Task 6.1: Update `README.md` to document the P43 Monochrome Green Phosphor HUD and Symbolic State Matrix.
- [ ] Task 6.2: Ship via `psrw ship`.
- [ ] Task 6.3: Promote release 2.36 via `psrw promote --babysit`.

