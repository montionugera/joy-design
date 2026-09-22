# F-036 relay: A6 review verdicts on edf98a0 + Phase B result

## typescript-reviewer (2026-09-22)
- HIGH | build.js reduced-motion block | `.joy-*, .joy-*::before, .joy-*::after` is not valid CSS (no wildcard class selector); the whole prefers-reduced-motion rule is dropped by parsers. Fix: `[class*="joy-"], [class*="joy-"]::before, [class*="joy-"]::after`.
- MEDIUM | index.d.ts generator | `JoyTokenName` union is dead: `JoyTokens` has a `[key: string]: string` index signature so any key passes; the single `@deprecated` sits on the index signature, not on the alias names.
- MEDIUM | scripts/ramps.mjs | `hexToOklch`/`oklchToHex` exported but never called; ramps are hand-picked hex, not OKLCH-derived as the commit claims.
- LOW | contrast.test.js + ramps.mjs `hexToRgb` | no 4/8-digit hex branch (latent; no such values today); function duplicated in both files.
- INFO | cascade order :root -> [data-theme=dark] -> media(:root:not([data-theme=light])) is correct.
- Tests: `pnpm --filter @joymify/tokens test` 3/3 pass; contrast gate assertion is fail-capable.

## code-reviewer (2026-09-22) — verdict BLOCK until fixed
- CRITICAL | build.js ~863-882 (theme.css ~1080-1097) | a legacy `[data-theme="dark"] { --joy-surface-canvas: #0d1829; --joy-surface-card: #14253e; --joy-border: #23354e ... }` block inside the old component CSS is emitted AFTER the new semantic dark block, so at runtime the dark theme resolves to old hex, not the navy ramp. Remove it (or make it reference semantic tokens only).
- HIGH | contrast.test.js:59-66 | `[data-theme="dark"]` regex lacks the `g` flag: only the first dark block is parsed, so the gate never sees the block that actually wins the cascade. Parse ALL dark blocks in source order and let later declarations override.
- HIGH | tokens.json navy ramp | not monotonic: luminance 500=0.0182, 600=0.0245, 700=0.0197, 800=0.0174, 900=0.0108, 950=0.0055. Re-anchor 600-800 so lightness strictly decreases 50->950 while keeping navy-500 #14253e fixed.
- MEDIUM | dark border.default = navy-400 #4c6e9f | 3.64:1 vs canvas, 3.32:1 vs card (passes) but ~10x luminance jump vs surfaces; reads heavy. Consider a darker step that still clears 3:1 on both canvas and card.
- LOW | contrast.test.js:22 | 0.04045 vs 0.03928 threshold; no outcome change.
- OK: resolveRef recursion, zero legacy var names dropped vs 9768557, Tailwind export category mapping.

## code-reviewer on edf98a0 — Verdict: FIX REQUIRED (apply as one fix commit before Phase C)
1. [CRITICAL] Reduced-motion block dead CSS (`build.js:3907-3909` → `dist/theme.css:320-322`): `.joy-*` is a parse error and voids the whole rule. Fix: `[class*="joy-"], [class*="joy-"]::before, [class*="joy-"]::after`; move `scroll-behavior` to an `html` rule.
2. [CRITICAL] Contrast test only parses the FIRST `:root` and FIRST `[data-theme="dark"]` block (`test/contrast.test.js:44,56`, non-global match). Cascade-final dark card is `#14253e`, so dark `--joy-border-default #4c6e9f` on card = 2.96:1 (fails 3:1) while the test reports 3.32 PASS. Fix: accumulate all matching blocks in document order (last wins), re-resolve, then fix the real failures.
3. [CRITICAL] Stale dark block at `build.js:863` (`theme.css:1081-1100`) re-declares `--joy-surface-canvas:#0d1829`, `--joy-surface-card:#14253e`, `--joy-border:#23354e`, `--joy-color-text-muted:#94a3b8` (slate-400) and wins by source order; same at `theme.css:1444-1450` (slate rgba). Fix: delete both blocks or repoint to semantic vars. (Phase B's sweep may or may not catch these — verify after it commits.)
4. [HIGH] Navy ramp non-monotonic: 500 Y=.0182, 600 Y=.0245 (lighter), 700 Y=.0197, 800 Y=.0174; dark `border-subtle` (navy-600) on `surface-raised` (navy-800) ≈ 1.06:1 invisible. Ink has the same cliff (400 okL .648 → 500 .227, 500–950 within .129–.227). `scripts/ramps.mjs:102-113` hardcodes 78 hex literals. Fix: generate 500–950 from evenly spaced okL at fixed okH via the existing OKLCH helpers; regenerate tokens.json + dist.
5. [HIGH] Status ramps are raw Tailwind/Bootstrap (`#fef2f2 #fca5a5 #dc2626 #b91c1c` red, `#6ee7b7` emerald-300, `#fcd34d #d97706 #b45309` amber, `#93c5fd` blue-300); warning hue swings 42° inside the ramp. Fix: re-derive each ramp at fixed okH with even okL steps (warm amber warning, deep green success, brick danger, navy-leaning info).
6. [MEDIUM] plan.md A5 cites `@joy-design/tokens` filter; package is `@joymify/tokens`. Fix the plan's verification command (and the spec's if present).
7. [LOW] neutral chroma 0.016–0.027, spec band 0.005–0.015; hue is warm ink (OK). Tighten if cheap.
Confirmed clean: all 62 legacy `--joy-*` names survive; Tailwind export correct per category; `prefers-color-scheme` guarded; dark card lighter than canvas; dark text-primary is cream; `[data-palette="joymify"]` gone; `:focus-visible` has no literal fallback; contrast math (sRGB linearization) correct — only the parsing is wrong.

## Suggested fix dispatch (after Phase B commits)
`AI_AGENT_AUTO_DISPATCH_TIMEOUT=1800 dispatch-worker --task "F-036 fix commit: apply every item in research/handoff-relay.md sections 'typescript-reviewer' and 'code-reviewer' (items 1–7). Regenerate ramps with OKLCH in scripts/ramps.mjs and write tokens.json from it; fix contrast.test.js parsing to accumulate all blocks; fix reduced-motion selectors; add cycle/unknown-ref throw in resolveRef; type tokens as Record<JoyTokenName,string>; delete stale dark blocks; rebuild dist; pnpm --filter @joymify/tokens test and node apps/storybook-hub/build.js must exit 0; NEW commit." --context <F>/spec.md <F>/plan.md <F>/research/handoff-relay.md --cwd <W>`

## Phase B result (13d7805, verified by orchestrator 2026-09-22)
- build.js -1738/+... lines; sweep script packages/tokens/scripts/sweep-literals.mjs; new test phase-b.test.js.
- `pnpm --filter @joymify/tokens test`: 4 tests, 4 pass, 0 fail. `node apps/storybook-hub/build.js` exit 0.
- dist/theme.css now has exactly one `[data-theme="dark"]` block and zero `#0d1829` -> code-reviewer CRITICAL item is already resolved by Phase B; the fix worker only needs to confirm it.

## Phase B worker result (relayed)
- Commits after edf98a0: a3c234f docs(F-036): A6 review verdicts and Phase B verification relay;13d7805 refactor(tokens): component css reads semantic tokens only; drop per-component dark overrides and banned patterns;
- My verification: tokens test exit + counts below (run at 2026-09-22T08:47:36+07:00)
```
ℹ pass 4
ℹ fail 0
purple=0 hex-literals-in-build.js=4 dark-joy-selectors=0 background-clip-text=0 slate-94a3b8=0
```
- Next: dispatch the fix commit (recipe above), then Phase C.

## Wave-level reviews on 9768557..72ee718 (2026-09-22)
- code-reviewer: SHIP. All 5 spec acceptance criteria PASS (8/8 token tests, lint --strict exit 0, tailwind export names, hub build + 10/10 Playwright contracts, 4 screenshots). lint-colors.allow has no active lines.
- visual taste (impeccable lens): FIX. Dark navy ramp compressed against black (navy-950 #03050a, sunken #020408) -> inset surfaces read as black holes. Light mode production-grade; gold button and cream text on dark pass. Fixed in the follow-up commit.

## typescript-reviewer (wave-level)
- MEDIUM | packages/tokens/build.js:34-36 | `resolveRef` silently returns the raw `{ref}` string when a ref resolves to a group/non-value node. Fix: throw an Error naming the ref and the token path so a malformed ref fails the build.
- MEDIUM | apps/storybook-hub/playwright.config.ts:6 | default PLAYWRIGHT_PORT 6006 collides with the zen-ui Storybook dev port and `reuseExistingServer: !CI` can attach to an unrelated server. Fix: default to an uncommon port (6116) in the config, keep the env override, and have scripts/precheck.sh and scripts/epic-check.sh export PLAYWRIGHT_PORT=6116 explicitly.
- LOW | packages/tokens/scripts/sweep-literals.mjs:511-516 | catch-all rgba -> elevation-1 remap is property-blind. One-shot migration script; add a header comment stating it is not re-runnable and leave the logic.
- LOW | screens-f036.spec.ts skips without F036_SCREENS=1 by design (plan C3). No change.
- OK: OKLCH round-trip exact for #14253e; contrast gate last-wins parsing; index.d.ts passes `tsc --noEmit --strict`.
