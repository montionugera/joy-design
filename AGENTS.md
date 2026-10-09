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
   - **Strict Semantic Color Reservation.** Green (`--joy-status-success-*`), amber/yellow (`--joy-status-warning-*`), red (`--joy-status-danger-*`), and blue (`--joy-status-info-*`) are strictly reserved for semantic work (system states, feedback, validation, and confirmation). They must NEVER be used for arbitrary decorative styling, generic container cards, or brand theme accents. Brand and theme expressions belong to neutrals (navy, cream, ink, warm neutral greys) and dedicated theme accents (`--joy-accent-*`).
   - **No colour literals outside `packages/tokens/src/tokens.json`, except the canvas fallbacks listed in `scripts/lint-colors.allow`.** No hex, `rgb()` or `hsl()` in components or the hub, and no `var(--joy-x, fallback)`. `scripts/lint-colors.sh` enforces this for every package and the hub in Gate 1.
   - **Dark is designed, not derived.** Both themes come from the semantic layer (`data-theme` wins over `prefers-color-scheme`). Never leave a hardcoded white card in a dark canvas.
   - **State matrix.** Every interactive component is styled for default, hover, focus-visible, active and disabled, plus loading, error and selected where they apply, at every size it ships. `DESIGN.md` lists the matrix per component.
   - **Touch and motion.** Touch targets are at least 44px on coarse pointers. Every animation has a `prefers-reduced-motion` branch.
   - **Svelte/React parity.** Twins share props, classes and ref forwarding (`scripts/parity-check.mjs`), and the shared `.ts` helpers stay byte-identical.
   - **AI-slop bans.** No side-stripe accents, gradient text, decorative glassmorphism, identical icon-card grids, tracked all-caps eyebrows on every section, fake 01/02/03 sequences, or arrow glyphs appended to link text. The full list is in `DESIGN.md` under Do's and Don'ts.
   - **Zero Emoji Policy**: Enterprise components must NEVER use raw OS emojis (`🟢`, `🔴`, `⏳`, `🌙`). Always use crisp, scalable vector SVG icons from `@montionugera/joy-icons`.
   - **Verification before done.** Check both themes, take screenshots at 375px and 1280px, and compute contrast (the tokens contrast test). Gate 1 (`scripts/precheck.sh`) must exit 0.
   - **Design skills.** For design judgement use `impeccable` and `frontend-design:frontend-design`, plus `design-taste-frontend` where it is installed.

4. **Release Lifecycle (Git / PSRW)**:
   - Always work within isolated `psrw` worktrees.
   - Follow: `psrw new-release` → `psrw idea` → `psrw refine` → `psrw claim` → implement & test → `psrw ship` → `psrw promote --babysit`.

5. **Package builds and type-check**:
   - `@montionugera/joy-react` and the `./react` entry of `@montionugera/joy-icons` resolve to a built, untracked `dist/` (`tsc -p tsconfig.build.json`). Run the type-check through turbo with `pnpm check`: in `turbo.json`, `check` depends on `^build`, so dependencies are built first. `pnpm --filter @montionugera/joy-react check` on a clean checkout fails until `pnpm --filter @montionugera/joy-icons build` has run.
   - Unit tests load `src/` through their helpers and never need `dist/`. The only check of the built output is the tarball test `scripts/test/consumer-smoke.sh`.
   - Publishing is done only by `.github/workflows/publish.yml` (a `packages-v*` tag on `main`, or a manual dry run). Never run `npm publish`, or `pnpm publish` without `--dry-run`, by hand.

<!-- graft:start -->
## Graft — repo context graph

This repo is indexed in `graft/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `graft map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `graft ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `graft grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `graft skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `graft callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `graft/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `graft ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `graft build` (deterministic,
no API key, $0).
<!-- graft:end -->
