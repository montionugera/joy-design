# Wave 6: design rules, DESIGN.md and PRODUCT.md, README, AGENTS.md and enforcement gates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal (epic E-001, verbatim):** Audit joy-design's mobile + dark-mode design system for sloppiness, list all issues, create a full fix plan, update project rules + README, then execute the fixes via ps-release-workflow. **This slice:** implement F-041 "Wave 6: design rules, DESIGN.md and product docs" (the final wave).

**Architecture:** Documentation is generated where it can drift (DESIGN.md, the README component inventory and the deprecated-alias table come from `scripts/gen-design-md.mjs`, which reads `packages/tokens/src/tokens.json`, the generated `packages/tokens/dist/theme.css` + `dist/index.d.ts`, and `scripts/parity-check.mjs`'s `COMPONENTS`). Hand-written docs (PRODUCT.md, AGENTS.md, README prose) are held to the code by small contract tests. Every new rule is enforced by a step `scripts/precheck.sh` (Gate 1) runs.

**Tech Stack:** Node 22+ ESM scripts, `node --test`, bash, pnpm 10 + turbo, TypeScript 5.9 (`tsc --noEmit`), `svelte-check` 4, Playwright (unchanged).

**Spec:** `.claude/refined_backlog/F-041-wave-6-design-rules-design-md-and-produc/spec.md` (inputs: `research/PRODUCT.draft.md`, `research/audit-standards.md`).

## Global Constraints

- Work only in this worktree (branch `feat/F-041`). One commit per task; never `--amend`, never `git stash`. No push / PR / ship / promote.
- Generated files (`packages/tokens/dist/*`, `DESIGN.md`, the README generated regions) change only by running their generator.
- Gate 1: `PLAYWRIGHT_PORT=6124 bash scripts/precheck.sh > /tmp/f041-pre.log 2>&1; echo $?` must be 0 from a clean committed tree. Never edit Playwright timeouts or chart-benchmark budgets. `node scripts/parity-check.mjs` must report 0 violations.
- Known side effects (audit): `packages/tokens/test/wave-fix.test.js` imports `build.js`, which rewrites `dist/*` atomically, and `contrast.test.js` rewrites F-036's `research/contrast-table-after.md`. Both are deterministic, so the tree stays clean; new tests only read.
- Never weaken `parity-check.mjs`, `lint-colors.sh`, or any existing test. Behavioural tests, not source greps, except where the rule is itself about source text (docs contracts, CI file, lint).
- `node --test` runs files in parallel: no new test may read a file another test rewrites (tokens `dist/*` is rewritten only by `packages/tokens/build.js`, which no test invokes; read-only use is fine).
- DESIGN.md follows the Google Stitch DESIGN.md format as documented in `~/.claude/skills/impeccable/reference/document.md`: YAML frontmatter (`name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`) and exactly six body sections in order: `## Overview`, `## Colors`, `## Typography`, `## Elevation`, `## Components`, `## Do's and Don'ts`. Spacing, z-index, motion, mobile rules fold into those sections as `###` subsections.
- Scratch files go in `/tmp/f041-sdd/`, never a `.superpowers/` dir in the worktree. Rendered `.html` next to `.md` docs are never committed.
- Assumption (stated): the spec's `design-taste-frontend` skill is not installed here (only `impeccable`, `frontend-design:frontend-design` exist); AGENTS.md names it as optional.

## File map

| File | Responsibility | Task |
| --- | --- | --- |
| `packages/react/tsconfig.json`, `packages/svelte/tsconfig.json` | type-check config | 1 |
| `packages/react/package.json`, `packages/svelte/package.json`, `pnpm-lock.yaml` | `check` scripts, devDeps (`@types/react`, `@types/react-dom`, `svelte-check`, `typescript`) | 1 |
| `packages/*/src/overlay-utils.ts` (both, byte-identical), `packages/react/src/{BarChart,LineChart,CandlestickChart,Cascader,Tag,Transfer,Upload,FormItem,useOverlay}.tsx/ts` | type-error fixes | 1 |
| `scripts/lint-colors.sh`, `scripts/test-lint-colors.sh` | strict everywhere | 2 |
| `scripts/precheck.sh`, `scripts/epic-check.sh`, `.github/workflows/ci.yml` | gate wiring | 2 |
| `packages/icons/test/icon-parity.test.js` | HUB-069 icon size/colour parity | 3 |
| `scripts/gen-design-md.mjs`, `scripts/design-md/*.mjs`, `DESIGN.md`, `scripts/test/gen-design-md.test.mjs` | generated DESIGN.md + README regions | 4 |
| `PRODUCT.md`, `AGENTS.md`, `scripts/test/docs-contract.test.mjs` | product + rules docs, held by tests | 5 |
| `README.md`, `plan.md` (deleted) | README rewrite of architecture/gates/checklist | 6 |

---

### Task 1: Type-check gate (`pnpm check`) and the type errors it surfaces

Measured on base b5411fe: strict `tsc --noEmit` on `packages/react/src` gives 10 errors; `svelte-check` on `packages/svelte/src` gives 14 errors (all `OverlayNode`), 21 warnings. Three React errors are real runtime bugs: `BarChart.tsx:44`, `LineChart.tsx:44`, `CandlestickChart.tsx:40` pass `{ theme, ... }` where no `theme` binding exists (ReferenceError when the effect runs).

**Files:**
- Create: `packages/react/tsconfig.json`, `packages/svelte/tsconfig.json`
- Modify: `packages/react/package.json`, `packages/svelte/package.json`, `pnpm-lock.yaml`, the source files listed in the file map.

**Interfaces:**
- Produces: `pnpm --filter @joymify/react check` = `tsc -p tsconfig.json`; `pnpm --filter @joymify/svelte check` = `svelte-check --tsconfig ./tsconfig.json --threshold error`; root `pnpm check` (turbo `check`) runs both. Task 2 wires `pnpm check` into Gate 1 and CI.

- [ ] **Step 1: Configs + scripts.** React tsconfig: `target ES2022, module ESNext, moduleResolution Bundler, jsx react-jsx, strict, noEmit, skipLibCheck, allowImportingTsExtensions, isolatedModules, lib [ES2022, DOM, DOM.Iterable], types []`, `include ["src"]`. Svelte tsconfig: same minus `jsx`, plus `verbatimModuleSyntax`, `include ["src/**/*.ts","src/**/*.svelte"]`. Add devDeps with `pnpm add -D --prefer-offline` (`@types/react@^19 @types/react-dom@^19` in react; `svelte-check@^4 typescript@^5.9.3` in svelte). Add `"check"` scripts as above.
- [ ] **Step 2: Run to see the failures.** `pnpm --filter @joymify/react check; pnpm --filter @joymify/svelte check` - expect 10 and 14 errors.
- [ ] **Step 3: Fix.**
  - Charts: look at how the Svelte twin chooses the theme (read `packages/svelte/src/lib/BarChart.svelte` and `chart-core.ts`'s options type); pass the same value in React (if Svelte omits `theme` and the core reads it from the DOM, delete the shorthand). Keep behaviour identical to Svelte.
  - `OverlayNode` (overlay-utils.ts, both packages, must stay byte-identical: `cmp packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts`): widen the `style` member so a real `HTMLElement` is assignable (e.g. `style: Partial<Record<string, string>> | CSSStyleDeclaration` or type it as the subset used). Do not cast at call sites.
  - `CascaderProps`/`TagProps`/`TransferProps`/`UploadProps`: `extends Omit<HTMLAttributes<...>, 'onChange' | ...conflicting keys>`; do not change public prop names (parity CONTRACT).
  - `FormItem.tsx:75`: coerce the conditional to a `string | false` (e.g. `!!error && 'joy-form-item--error'`).
- [ ] **Step 4: Verify.** Both `check` scripts exit 0; `pnpm check` at root exits 0; `pnpm -r test` exit 0; `node scripts/parity-check.mjs` 0 violations.
- [ ] **Step 5: README note** deferred to Task 6 (gates section lists `pnpm check`).
- [ ] **Step 6: Commit** `feat(F-041): add pnpm check (tsc + svelte-check) and fix the type errors it found`.
- [ ] **Step 7: Phase gate:** verify -> `code-reviewer` + `typescript-reviewer` on the diff -> `/simplify` -> re-verify.

### Task 2: Enforcement - strict colour lint everywhere, Gate 1 and CI wiring

**Files:** `scripts/lint-colors.sh`, `scripts/test-lint-colors.sh`, `scripts/precheck.sh`, `scripts/epic-check.sh`, `.github/workflows/ci.yml`.

**Interfaces:**
- Consumes: `pnpm check` (Task 1).
- Produces: Gate 1 steps named, in order: emoji policy; colour lint (strict); lint self-tests (`bash scripts/test-lint-colors.sh`, `bash scripts/test-epic-check.sh`); type check (`pnpm check`); workspace tests (`pnpm -r test`); parity; script/doc tests (`node --test 'scripts/test/*.test.mjs'` - directory created by Task 4, so add this step in Task 4); DESIGN.md drift check (Task 4); hub build; Playwright. Task 5's docs-contract test asserts README lists each of these scripts.

- [ ] **Step 1: Failing test.** In `scripts/test-lint-colors.sh`, change the "non-listed name in the same directory must stay a warning" case to expect a hard failure in default mode, and add a case that a literal in `packages/icons/src/*.svelte` fails default mode. Run `bash scripts/test-lint-colors.sh` - expect FAIL.
- [ ] **Step 2: Implement.** In `lint-colors.sh`, default mode becomes strict for every target (delete `strict_file_pattern` and the WARN branch, keep the `--strict <paths>` flag working for ad-hoc paths), and add `packages/icons/src` to the default targets. Keep the allowlist. Update the final PASS line. Run `bash scripts/lint-colors.sh` - must exit 0 (base has 0 warnings). If icons contain literals, fix them to `currentColor`.
- [ ] **Step 3:** `bash scripts/test-lint-colors.sh` and `bash scripts/test-epic-check.sh` pass (fix test-epic-check only if it asserted the old behaviour; do not weaken).
- [ ] **Step 4: Gate wiring.** `precheck.sh`: add the lint self-tests, explicit contrast step, and `pnpm check` step with `echo` labels. `epic-check.sh`: add `run_step "type check" pnpm check`. `ci.yml` build job: add a `Type check` step (`pnpm check`) before the existing integration step, and rename that step to `Gate 1 (scripts/precheck.sh via scripts/integration.sh)` with a comment naming the gates it runs. `scripts/integration.sh` keeps calling `./scripts/precheck.sh` (it is the local Gate 2 entry point too), so precheck runs exactly once in CI.
- [ ] **Step 5: Verify.** `bash scripts/lint-colors.sh` exit 0; both self-tests exit 0; `bash -n scripts/*.sh`; `node -e "require('fs').readFileSync('.github/workflows/ci.yml','utf8')"` plus `npx --yes js-yaml`-free check: `python3 -c "import yaml,sys;yaml.safe_load(open('.github/workflows/ci.yml'))"`.
- [ ] **Step 6: Commit** `feat(F-041): strict colour lint for all packages and hub; wire contrast, type check and lint self-tests into Gate 1 and CI`.
- [ ] **Step 7: Phase gate** (shared with Task 3 if both < 50 lines).

### Task 3: HUB-069 - icon size and colour parity test (deferred from F-040)

**Files:** Create `packages/icons/test/icon-parity.test.js`; modify icon sources only if the test finds a divergence.

- [ ] **Step 1: Write the test.** For every icon name exported from `packages/icons/src/index.ts` (Svelte) and `packages/icons/src/react.ts` (React): both exports exist; read the Svelte component and the React component source for that icon and assert both accept `size` and `color` (or the package's actual prop names - read two icons first) with the same defaults, the SVG uses `width/height = size`, `stroke`/`fill` driven by `currentColor` or the color prop (no literal colours), and the same `viewBox`. Prefer rendering: if React icons render with `react-dom/server` `renderToStaticMarkup` in node, assert rendered `width`, `height`, `viewBox` and colour attributes for `size=20, color='currentColor'` and defaults; for Svelte use `svelte/server` `render` if the package tests already do so (check `packages/svelte/test/helpers`), else parse the source.
- [ ] **Step 2: Run** `cd packages/icons && node --test test/icon-parity.test.js`; fix any real divergence in the icon source (keep both frameworks identical).
- [ ] **Step 3: Record** HUB-069 closed: append a line under "Deferred items" in this feature's `research.md` (not F-040's file): `HUB-069 closed by F-041 Task 3 (<sha>)`.
- [ ] **Step 4: Commit** `test(F-041): icon size and colour parity across Svelte and React (HUB-069)`.
- [ ] **Step 5: Phase gate** (with Task 2).

### Task 4: `scripts/gen-design-md.mjs` -> DESIGN.md and README generated regions

**Files:** Create `scripts/gen-design-md.mjs` (CLI), `scripts/design-md/model.mjs` (pure data extraction), `scripts/design-md/render.mjs` (pure markdown rendering), `scripts/test/gen-design-md.test.mjs`, `DESIGN.md`; modify `README.md` (insert two marker pairs), `scripts/precheck.sh`.

**Interfaces:**
- `buildModel({ tokens, themeCss, dts, components }) -> { name, colors: {primitive: {ramp: {step: hex}}, semantic: {light: {role: hex|string}, dark: {...}}}, contrast: [{theme, fg, bg, ratio, min, pass}], typography, space, radius, elevation: {light, dark}, z, motion: {duration, ease}, controlHeight, componentMatrix: [{component, cls, sizes: string[], states: string[], variants: string[]}], deprecatedAliases: [{alias, target}] }` in `model.mjs`. Semantic `{color.x.y}` refs resolve to hex through `tokens.color`.
- `renderDesignMd(model) -> string`, `renderInventory(model, parity) -> string`, `renderAliases(model) -> string` in `render.mjs`; `replaceRegion(text, name, body) -> string` replaces between `<!-- BEGIN GENERATED:<name> -->` and `<!-- END GENERATED:<name> -->` (throws if markers missing).
- CLI: `node scripts/gen-design-md.mjs` writes `DESIGN.md` and README regions `component-inventory`, `deprecated-aliases`; `--check` writes nothing, exits 1 listing drifted files. Output is deterministic (sorted keys, no dates, no timestamps).

- [ ] **Step 1: Failing tests** (`scripts/test/gen-design-md.test.mjs`, reading `tokens.json`, `dist/theme.css`, `dist/index.d.ts` read-only):
  - resolves `semantic.light.surface.canvas` to `tokens.color.cream[100].value`;
  - contrast rows exist for the text roles primary, secondary, muted and link on canvas and card in both themes (disabled, inverse and on-accent are not body text on those surfaces and are listed without a minimum), each `ratio` equals `contrastRatio()` from `packages/tokens/scripts/color.mjs` to 2 dp, and every row with `min` passes;
  - `componentMatrix` has one row per `COMPONENTS` entry; Button has sizes `sm, md, lg`, variants include `solid, outline, ghost, danger, link`, states include `hover, focus-visible, active, disabled, loading`; a component whose block class is not in theme.css throws a named error (feed a fake name);
  - state detection maps selectors: `:hover`->hover, `:focus-visible`->focus-visible, `:active`/`--active`/`[aria-pressed`->active, `:disabled`/`--disabled`/`[aria-disabled`->disabled, `--loading`/`[aria-busy`->loading, `--error`/`[aria-invalid`->error, `--selected`/`[aria-selected`/`:checked`/`[aria-checked`->selected, `--open`/`[aria-expanded`->open; `demo-*` classes are ignored (hub-only);
  - deprecated aliases equal the `@deprecated` entries in `index.d.ts` (64 on base: 55 name a target with `Use 'X' instead`, 9 say `Legacy alias token` and get `target: null`);
  - `renderDesignMd` output starts with `---\n`, parses the frontmatter keys `name, description, colors, typography, rounded, spacing, components`, and has the six headers in order;
  - `renderDesignMd(model) === renderDesignMd(model)` and contains no ISO date;
  - `replaceRegion` replaces only between markers and throws without them;
  - the CLI `--check` on the committed tree exits 0 (spawn `node scripts/gen-design-md.mjs --check`), and on a temp copy of README with a mutated region exits 1 (pass `--readme <path> --design <path>` overrides so the test never writes repo files).
  Run `node --test 'scripts/test/*.test.mjs'` - FAIL (module missing).
- [ ] **Step 2: Implement `model.mjs`.** Component block class = `joy-` + kebab(Name) (`InputNumber` -> `joy-input-number`); an explicit `CLASS_OVERRIDES` map only for names whose real class differs (discover by grepping theme.css; list each override with a comment). Selector scan: collect every selector in theme.css that begins with `.joy-<block>` (including `.joy-<block>__el` and `--mod`); sizes from `--(xs|sm|md|lg|xl)` modifiers on the block; variants = other block modifiers excluding sizes, states, `demo-*`.
- [ ] **Step 3: Implement `render.mjs`** with this DESIGN.md content (all numbers from the model, prose fixed in the renderer):
  - Frontmatter: `name: Joymify Design System`, description from PRODUCT.md purpose line (inline constant), `colors` = semantic light roles as `<group>-<role>` plus dark as `<group>-<role>-dark` (hex only; rgba roles go to prose), `typography` scale entries from `font-size` x line-height/weight, `rounded` from `radius`, `spacing` from `space`, `components` = `button-primary`, `button-primary-hover`, `input`, `card` referencing `{colors.*}`/`{rounded.*}` with sizes from `control-height`.
  - `## Overview`: register + personality (from PRODUCT.md), theme contract (`data-theme="light|dark"` beats `prefers-color-scheme`), `### Spacing`, `### Z-index scale` (ordered table), `### Motion` (durations, easings, reduced-motion rule), `### Mobile rules` (375px first viewport, 44px targets, 16px gutters, no horizontal scroll, 16px input text, sheets on small screens).
  - `## Colors`: `### Primitive ramps` (table per ramp), `### Semantic layer` (role | light | dark), `### Measured contrast` (theme | fg | bg | ratio | min | pass).
  - `## Typography`: scale table, weights, families.
  - `## Elevation`: shadows light vs dark, dark rule (borders/tints, not grey shadows), radius roles (control/card/overlay/pill).
  - `## Components`: control heights, then the state matrix table (component | sizes | variants | states).
  - `## Do's and Don'ts`: the token contract and the ban list from `research/audit-standards.md` "Absolute bans" + anti-references.
  - Header comment line: `<!-- Generated by scripts/gen-design-md.mjs from packages/tokens. Do not edit by hand. -->` directly after the frontmatter.
  - Inventory region: table component | Svelte | React | parity (`gated` if in `COMPONENTS` and both files exist, else `svelte only` / `react only` / `both, not gated`), built from the exports of `packages/svelte/src/lib/index.ts` and `packages/react/src/index.ts`.
- [ ] **Step 4: CLI + markers.** Add the two marker pairs to README (empty bodies; Task 6 places them in the final sections - put them at the end for now), run `node scripts/gen-design-md.mjs`, then `node scripts/gen-design-md.mjs --check` exits 0; run twice and `git diff --stat` shows no change on second run (byte-identical).
- [ ] **Step 5: Gate wiring.** Also update `scripts/test-epic-check.sh` expected step lists for the new epic-check step. `precheck.sh`: after parity, `node --test 'scripts/test/*.test.mjs'` and `node scripts/gen-design-md.mjs --check` (after hub build is not needed: dist/theme.css is committed). Also `epic-check.sh` gets the `--check` step.
- [ ] **Step 6: Design review.** Load `impeccable` (document reference) and check the rendered DESIGN.md reads as a usable spec (not a dump): fix the renderer, never the output.
- [ ] **Step 7: Commit** `feat(F-041): generate DESIGN.md and README inventory from tokens with a drift gate`.
- [ ] **Step 8: Phase gate:** `code-reviewer` + `typescript-reviewer` (JS) -> `/simplify` -> re-verify (`node --test 'scripts/test/*.test.mjs'`, `--check`).

### Task 5: PRODUCT.md, AGENTS.md token contract, docs-contract tests

**Files:** Create `PRODUCT.md`, `scripts/test/docs-contract.test.mjs`; modify `AGENTS.md`.

- [ ] **Step 1: Failing tests** (`docs-contract.test.mjs`, source-text rules by design):
  - `AGENTS.md` contains no primitive variable used as contract: regex `/--(?:joy-color-)?(navy|gold|cream|ink|neutral)-\d{2,3}\b/` has 0 matches; it names `--joy-surface-canvas`, `--joy-text-primary`, `--joy-accent-default`, `--joy-border-default`; mentions `44px`, `prefers-reduced-motion`, `375px`, `1280px`, `DESIGN.md`, `impeccable`, `frontend-design`.
  - `PRODUCT.md` has headings Register, Users, Product Purpose, Brand Personality, Anti-references, Design Principles, Accessibility & Inclusion; package names it cites (`@joymify/...`) all exist as `packages/*/package.json` names (the draft's `@joy-design/*` is wrong).
  - README: every script invoked in `scripts/precheck.sh` (`scripts/*.sh`, `scripts/*.mjs`, `pnpm check`, `contrast.test.js`) appears in README; README contains `data-theme`, `prefers-color-scheme`, `@joymify/tokens/tailwind`, `What production-grade means here`.
  - `.github/workflows/ci.yml` contains `pnpm check` and `precheck.sh` (directly or via `integration.sh`, which the test asserts calls `precheck.sh`).
  - Root `plan.md` does not exist.
  Run - FAIL.
- [ ] **Step 2: PRODUCT.md** from the draft, corrected to what shipped: `@joymify/{tokens,icons,svelte,react}`; component count from `COMPONENTS`; sizes as shipped (choice controls are sm/md, not sm/md/lg - see README Wave 2 table); overlays use a bottom-sheet on small screens for Select-family controls; keep the principles and accessibility bar. Load `impeccable` for the voice pass.
- [ ] **Step 3: AGENTS.md** - keep sections 1, 2, 4; replace "3. Domain & Palette Invariants" with "3. Token contract": semantic tokens only (list the role groups surface/text/border/accent/status/focus-ring/elevation and point to DESIGN.md for values); primitives (`--joy-color-*`) exist only to feed the semantic layer and are never referenced in components; no hex/rgb/hsl outside `packages/tokens/src/tokens.json` (enforced by `scripts/lint-colors.sh`); no `var(--joy-x, fallback)`; every interactive component ships the state matrix (default, hover, focus-visible, active, disabled, loading, error, selected where applicable) at its sizes; 44px touch targets; `prefers-reduced-motion`; Svelte/React parity (`scripts/parity-check.mjs`); the AI-slop ban list; zero emoji; verification = both themes, screenshots at 375px and 1280px, contrast computed (tokens contrast test), Gate 1 exit 0. Add "Design skills: `impeccable`, `frontend-design:frontend-design`, and `design-taste-frontend` when installed." Brand anchors described by name and role, values via DESIGN.md.
- [ ] **Step 4: Run** `node --test 'scripts/test/*.test.mjs'` - the README/CI/plan.md cases may still fail until Task 6; the AGENTS/PRODUCT cases pass.
- [ ] **Step 5: Commit** `docs(F-041): PRODUCT.md and AGENTS.md token contract with docs-contract tests`.

### Task 6: README rewrite and stale plan.md removal

**Files:** `README.md`, delete `plan.md`.

- [ ] **Step 1:** Rewrite `## Architecture`: packages with real names; the semantic token layer (primitives -> semantic light/dark -> component CSS in `dist/theme.css`); theme switching contract (`[data-theme="dark"]`/`[data-theme="light"]` on `<html>` wins; otherwise `prefers-color-scheme`); Tailwind v4: `@import "@joymify/tokens/tailwind";` (verify export path in `packages/tokens/package.json`: `./tailwind` -> `dist/tailwind-theme.css`); consumer migration notes + the generated `deprecated-aliases` region; link to DESIGN.md and PRODUCT.md; "Plans and specs live in `.claude/refined_backlog/`".
- [ ] **Step 2:** `## Quality gates`: table of every Gate 1 step with the command and what it enforces (emoji, `scripts/lint-colors.sh`, lint self-tests, contrast test, `pnpm check`, `pnpm -r test`, `scripts/parity-check.mjs`, `node --test 'scripts/test/*.test.mjs'`, `scripts/gen-design-md.mjs --check`, hub build, Playwright contracts) plus `scripts/epic-check.sh` and `scripts/integration.sh`. Remove or point the per-wave "Gates" subsections at this table to avoid contradictions (keep wave sections' content otherwise).
- [ ] **Step 3:** `## Component inventory` holding the generated `component-inventory` region; `## What production-grade means here` checklist (tokens only, both themes designed, AA contrast measured, every state x size, 44px targets, 375px no overflow, reduced motion, keyboard + focus-visible, parity, no slop, Gate 1 green).
- [ ] **Step 4:** `git rm plan.md`. Run `node scripts/gen-design-md.mjs` (regions moved), `--check`, `node --test 'scripts/test/*.test.mjs'` - all pass.
- [ ] **Step 5: Commit** `docs(F-041): README architecture, token contract, gates, inventory and production-grade checklist; drop stale plan.md`.
- [ ] **Step 6: Phase gate for Tasks 5-6:** `self-grill-audit`-style independent doc review (`code-reviewer`, `model: sonnet`) checking every factual claim against code -> fix -> re-verify.

### Task 7: Final Gate 1

- [ ] Delete untracked rendered `.html` next to `.md` (`git status --porcelain` must be empty).
- [ ] `node scripts/parity-check.mjs` -> 0 violations.
- [ ] `PLAYWRIGHT_PORT=6124 bash scripts/precheck.sh > /tmp/f041-pre.log 2>&1; echo $?` -> 0 (if only `page.goto` timeouts and `uptime` load > 20, wait for load < 20 and re-run).
- [ ] Tick the spec's acceptance criteria in `spec.md`; commit `docs(F-041): tick acceptance criteria`.

## Acceptance criteria -> tasks

| Criterion | Task |
| --- | --- |
| precheck passes with strict colour lint; `pnpm check` passes | 1, 2, 7 |
| DESIGN.md regenerates byte-identically | 4 |
| README renders gate list and token contract; AGENTS.md no primitive-as-contract | 5, 6 |
| CI references the new gates | 2, 5 |

## Follow-ups (not in this wave)

- `packages/icons` and `packages/tokens` have no `check` script (icons is `.ts` + `.svelte`; tokens is JS). File as an idea.
- F-040 follow-up: ~20 inline `font-size: 0.___rem` in `apps/storybook-hub/build.js`.
- F-038 deferrals SVD-032, SVD-097; F-039 deferrals SVL-061, SVL-062 remain open (component work, outside Wave 6 scope).
- `svelte-check` 21 warnings (not errors) left; gate uses `--threshold error`.

## Appendix - audit trail

- 2026-09-26 self-grill-audit: verdict safe-with-fixes. Corrected: `node --test <dir>` fails (Node treats it as a module) so every call uses the `'scripts/test/*.test.mjs'` glob; Task 4 also updates `test-epic-check.sh`; the explicit contrast step was dropped from precheck (it already runs in `pnpm -r test` and rewrites a tracked F-036 research file on each run); deprecated-alias count split into 55 with a target and 9 without; the contrast minimum applies only to body-text roles; `CLASS_OVERRIDES` must cover TreeSelect (`joy-treeselect`), the charts (`joy-chart`), HeroSection (`joy-hero`), MarkdownViewer (`joy-markdown`), ImagePreview (`joy-image-preview`), acronym names (CTASection, FAQSection) and LandingAction (renders `joy-button`); Task 3 is an icon API change (Svelte `strokeWidth` added, React filled icons no longer outline) and README migration notes must say so; new `scripts/test/shared-helpers.test.mjs` asserts the byte-identical helper claim (`overlay-utils`, `chart-core`, `delta-utils` and the other shared `.ts` helpers) that README makes, since nothing tested it. Open: none.
