# AGENTS.md — Joymify Design System (`joy-design`)

## Non-Negotiable Autonomous Execution Rules

1. **Keep Going, Zero Permission Checkpoints**:
   - Once a plan/spec is approved or a directive is given, work through ALL tasks to completion without pausing to ask "Shall I proceed?", "Want me to keep going?", or "Should I do the next step?".
   - NEVER ask permission mid-turn unless facing an irreversible R0 destruction (e.g. deleting production databases or branches with unmerged user work).
   - For any reversible choice: pick the standard default, state the assumption concisely in one line, and keep executing.

2. **Visual Verification Before Done (No Blind Claims)**:
   - "HTTP 200" or "unit test passed" is NOT visual verification.
   - For UI / design changes: actually verify the rendered DOM, check contrast in both Light AND Dark modes, verify that semantic tokens are used rather than hardcoded hex, and ensure zero unstyled FOUC defects.

3. **Token Contract** (values in `DESIGN.md`, generated from `packages/tokens/src/tokens.json`; product context in `PRODUCT.md`):
   - **Semantic tokens only.** Components read the semantic layer: `--joy-surface-*` (e.g. `--joy-surface-canvas`, `--joy-surface-card`), `--joy-text-*` (e.g. `--joy-text-primary`), `--joy-border-*` (e.g. `--joy-border-default`), `--joy-accent-*` (e.g. `--joy-accent-default`), `--joy-status-*`, `--joy-focus-ring`, `--joy-elevation-*`, plus the scale tokens `--joy-space-*`, `--joy-radius-*`, `--joy-font-size-*`, `--joy-duration-*`, `--joy-ease-*`, `--joy-z-*`. The primitive ramps (`--joy-color-*`) exist only to feed that layer. The brand anchors (navy surface anchor, gold as the single accent, cream canvas, ink text) are primitives too; reach them through their semantic roles.
   - **No colour literals outside `packages/tokens/src/tokens.json`.** No hex, `rgb()` or `hsl()` in components or the hub, and no `var(--joy-x, fallback)`. `scripts/lint-colors.sh` enforces this for every package and the hub in Gate 1.
   - **Dark is designed, not derived.** Both themes come from the semantic layer (`data-theme` wins over `prefers-color-scheme`). Never leave a hardcoded white card in a dark canvas.
   - **State matrix.** Every interactive component is styled for default, hover, focus-visible, active and disabled, plus loading, error and selected where they apply, at every size it ships. `DESIGN.md` lists the matrix per component.
   - **Touch and motion.** Touch targets are at least 44px on coarse pointers. Every animation has a `prefers-reduced-motion` branch.
   - **Svelte/React parity.** Twins share props, classes and ref forwarding (`scripts/parity-check.mjs`), and the shared `.ts` helpers stay byte-identical.
   - **AI-slop bans.** No side-stripe accents, gradient text, decorative glassmorphism, identical icon-card grids, tracked all-caps eyebrows on every section, fake 01/02/03 sequences, or arrow glyphs appended to link text. The full list is in `DESIGN.md` under Do's and Don'ts.
   - **Zero Emoji Policy**: Enterprise components must NEVER use raw OS emojis (`🟢`, `🔴`, `⏳`, `🌙`). Always use crisp, scalable vector SVG icons from `@joymify/icons`.
   - **Verification before done.** Check both themes, take screenshots at 375px and 1280px, and compute contrast (the tokens contrast test). Gate 1 (`scripts/precheck.sh`) must exit 0.
   - **Design skills.** For design judgement use `impeccable` and `frontend-design:frontend-design`, plus `design-taste-frontend` where it is installed.

4. **Release Lifecycle (Git / PSRW)**:
   - Always work within isolated `psrw` worktrees.
   - Follow: `psrw new-release` → `psrw idea` → `psrw refine` → `psrw claim` → implement & test → `psrw ship` → `psrw promote --babysit`.
