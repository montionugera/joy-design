# F-037 relay (written by the previous tab)

## A5 result (2026-09-22)
- Commit 65dffdf `feat(overlay): shared fixed-position overlay primitive with escape, outside-click, focus return and sheet mode`.
- Verified by orchestrator: `pnpm --filter @joymify/tokens test` 17/17; `pnpm --filter @joymify/svelte test` 16 pass 0 fail exit 0; `pnpm --filter @joymify/react test` 16 pass 0 fail exit 0. A5 checkboxes ticked in plan.md.
- Tree clean apart from research/dispatch-f037.sh (committed with this file). No agy worker is running for this worktree any more.
- NEXT: dispatch A6 (`bash <this folder>/dispatch-f037.sh A6 agy "A1-A5 committed (HEAD after this relay commit); tree clean"` with `< /dev/null`, background, 30-min budget), verify, then the Phase A quality gate, then fan out the eight lanes.

## 2026-09-23 relay: visual re-review verdicts (old tab -> D3 tab)
_Two impeccable re-reviews of the screens at 038fbea were still running at handoff; verdicts appended below as they land._

### Verdict 1/2 — forms screens (impeccable re-review at 038fbea): **FIX**
Landed: hub navy surfaces, input/select dark fills, prefix/suffix addon height, select error colour, 44px bump at max-width 640, dark container card surface.
Open (fix before ship):
- **P0 InputNumber error/success state is dead — ORCHESTRATOR-CONFIRMED.** `dist/theme.css:738` emits `.joy-input-number--error` BEFORE the base `.joy-input-number {` at `:3115`; equal specificity, the later `border` shorthand wins, so error/success borders never render. Fix in `packages/tokens/build.js`: emit the `--error`/`--success` modifier blocks AFTER the base block. Add a wave-2.test.js assertion that the modifier index > base index.
- **P0 375px: Dark Mode toggle spills out of the wrapped topbar onto the h1.** Add `flex-shrink: 0` to `.topbar` in `apps/storybook-hub/build.js` (~line 333; note there is a second `.topbar` block at ~982 inside a media query and a dark one at ~658).
- **P1 desktop select dropdown unanchored** (`.joy-overlay` is `position: fixed`, no JS positioning on the hub demo): add `.joy-select-wrapper--open .joy-select__listbox { position: absolute; top: calc(100% + 4px); left: 0; min-width: 100% }` outside the <=640 block; keep fixed/sheet behaviour inside it.
- **P2 dark disabled/readonly inputs indistinguishable from default** (`--joy-surface-sunken` too close to `--joy-surface-card` in dark): also switch text to `--joy-text-disabled` and border to `--joy-border-subtle` for `.joy-input:disabled` / `:read-only` in dark.
- **P3 `REACT 19` topbar badge is bright blue**, off the navy+gold system.
- Side effect of the 44px bump: sm and md controls are identical at <=640, so the mobile size demo shows two identically-rendered rows. Decide: accept (touch ergonomics) or differentiate.

### Verdict 2/2 — button screens (impeccable re-review at 038fbea): **FIX**
Button styling itself is production-grade. Landed (pixel-sampled): explicit disabled tokens (light 4.75:1, dark ~4.5:1), danger-solid identical in both themes, deeper gradient + inset highlight, ghost resting border, 44px hero button at 375px, navy dark surfaces, no purple.
Open (fix before ship):
- **P0 375px theme toggle overlaps the h1, BOTH themes** — same defect as verdict 1's P0, independently seen. `.topbar` at `apps/storybook-hub/build.js:333` is sticky + `flex-wrap: wrap` + `min-height: 60px`, and `.topbar > div { flex-wrap: wrap }` in the `max-width: 640px` block (~line 1130) pushes the toggle out. Suggested: `.topbar { flex-wrap: nowrap }` + hide `#theme-label` (icon-only) in that block, plus `flex-shrink: 0` per verdict 1.
- **P1 EVIDENCE GAP, read this before trusting the screenshots: the state matrix does not actually render hover or focus.** The `focus` and `hover` tiles are byte-identical to `default` because the CSS rules are `:focus-visible`/`:hover`-only and D1 renders static markup. So the new two-tone focus ring and the hover lift are UNVERIFIED by both the screenshots and the taste reviews. Fix: add `.joy-button--demo-focus` / `.joy-button--demo-hover` in `packages/tokens/build.js` mirroring the `:focus-visible` box-shadow and the `--solid:hover` lift, use them in the D1 matrix, re-shoot, and confirm the ring is visible on a solid button in both themes.
- **P1 dark canvas lost its dot grid**: `[data-theme="dark"] .component-canvas { background: var(--joy-surface-card) }` (build.js ~1124) — the `background` shorthand wipes `background-image`; use `background-color:`.
- **P2 Size segmented control wraps 2+1 at 375px**: `display: grid; grid-template-columns: repeat(3, 1fr)` in the `max-width: 640px` `.controls-table` block.
- **P2 doubled spaces in `Click Me! (Clicked:  0  )`** — NOTE: the earlier hub worker claimed this did not reproduce; a second reviewer now reports it from the rendered PNG. Check the template string directly.
- **P3 `REACT 19` pill is blue** (desktop-only, hidden <=640).

### Orchestrator note
Both verdicts agree the remaining blockers are hub-chrome + demo-fidelity, not component CSS. Suggested order for the D3 tab: (1) the two P0s + the InputNumber ordering P0, (2) the demo-focus/demo-hover fidelity fix then re-shoot and re-review, (3) D3.1-D3.6, (4) wave review, (5) ship.

## 2026-09-23 relay: D3.7 wave-level acceptance verdict (D3/D3.7 tab -> shipping tab)

`code-reviewer` reviewed `git diff release/2.24...feat/F-037` (91 files, 49 commits) against `spec.md`'s Acceptance section, independent of plan.md's ticked boxes. Verdict: **WARNING** (0 CRITICAL/HIGH, 2 MEDIUM, not blocking).

- **Criterion 1 (lint-colors --strict + parity-check zero divergence): MET.** Both re-run directly, exit 0.
- **Criterion 2 (`pnpm -r test` incl. overlay primitive tests): MET.** 0 failures across all three packages; overlay-utils tests confirmed present and passing in both twins.
- **Criterion 3 (Playwright: 44px hit areas, no overflow, bottom sheets at 375px): MET, with a flake caveat.** Full serialized suite (`epic-check.sh`) green, 34/0/26. One isolated 7-parallel-worker run hairline-failed `.joy-input` at 43.99993896484375px (sub-pixel rounding under CPU contention, not a real regression — `--joy-control-height-md: 44px` token itself is correct). 3 repeats + the full suite all passed. CI pins `workers: 1` so unlikely to surface there. **MEDIUM, non-blocking**, optional follow-up: add ~0.5px tolerance or await `fonts.ready` before measuring in `apps/storybook-hub/tests/forms-contracts.spec.ts:70-97`.
- **Criterion 4 (screenshots attached + Button matrix taste-reviewed): PARTIALLY MET — real gap.** The 8 PNGs exist and two independent `impeccable` reviews did happen (see verdicts above) — but both returned **FIX**, and although those findings were folded into the D3.6 fix + re-shoot (commit `791a969`), **no reviewer has passed judgment on the final post-fix screenshots**. `research/screens/README.md:12` still says the taste verdict is "deferred to the orchestrator," a note written before the fix/re-shoot cycle and never updated. **MEDIUM, non-blocking per the reviewer, but closes the loop this feature has been chasing all session** — recommend one more `impeccable` pass on the current 4 `button-*.png` files before shipping, verdict recorded in `research/screens/README.md`.
- Dist staleness spot-check: **not stale** — `packages/tokens/build.js` rebuilt output is byte-identical to the committed `dist/` files.

**D3.7 is otherwise done** (see the D3.7 section in `research/review-D.md` for the code-reviewer/typescript-reviewer diff review and its fixes, commit `5e73df2`). This wave-acceptance pass is the second half of D3.7's requirement ("wave-level review of `git diff release/2.24...feat/F-037` against the spec's Acceptance list").

**Recommendation for the shipping tab:** dispatch one more `impeccable` review on `research/screens/button-{light,dark}-{375x812,1280x800}.png` at current HEAD, record the verdict in `research/screens/README.md`, then tick D3.7 in plan.md and proceed to `psrw ship --no-deploy`. If you judge the two MEDIUM findings acceptable to ship without that extra pass, that's a legitimate call too — they're both explicitly non-blocking per the reviewer.
