# F-037 lanes B/C review (2026-09-23)

Lanes ran in 8 isolated worktrees (agy), merged 0921205..421b850. Per-lane verify: package tests, tokens tests, lint-colors, parity --side, owned-file scope.

- Integration fixes by orchestrator: literal glyphs in lane no-emoji assertions escaped (all lanes); union merge interleaved appended test blocks, components.test.js rebuilt as base + lane blocks (a99b6f1, 421b850).
- Svelte review (code-reviewer): HIGH Mentions static dropdown id; HIGH Rate readonly used native disabled; MEDIUM Select missing aria-activedescendant; MEDIUM Mentions textarea missing joy-mentions__textarea.
- React review (typescript-reviewer): HIGH Input `type` widened to string; HIGH Segmented uncontrolled auto-selected first option. Note: repo has no tsc typecheck.
- Fixed in 9a7dd50 (plus parity-check twin mode no longer counts HTML-inherited props as react-only). Re-verify: svelte 21/21, react 21/21, tokens 18/18, lint 0, parity --side svelte/react 0, hub build 0.
- Carried to D3.3 (planned): twin-mode parity 29 rows (defaultValue/style gaps, joy-form, joy-overlay, Upload button classes).
