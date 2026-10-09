# Publish joy-design packages under @montionugera Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the joy-design packages (tokens, icons, brand, react) to GitHub Packages under the `@montionugera` scope, so that the React docs portal in the sibling repo `cli-state-handler` can install them from the registry.
**Architecture:** Phase 1 renames the five workspace packages from `@joymify/*` to `@montionugera/joy-*` in source, tests, docs and the lockfile, with no behaviour change. Phase 2 gives `joy-react` and the React entry of `joy-icons` a compiled `dist/` (TypeScript compiler only, no bundler), adds publish metadata and `files` allowlists, adds a tarball test that installs the packed packages into a fresh Vite + React 19 app outside the workspace, and adds a tag-or-manual GitHub Actions workflow that gates, builds, tests and publishes in dependency order. This plan stops at a local green dry run; the hosted dry run and the real publish happen after it.
**Tech Stack:** pnpm 10.13.1 workspace, turbo 2, TypeScript 5.9 (`tsc`), Node 22 on CI, `node --test`, Playwright (hub contracts), GitHub Actions, GitHub Packages (`https://npm.pkg.github.com`).
**Spec:** `.claude/refined_backlog/<F-NNN>/spec.md` (copied from idea I-077 on refine)

## Global Constraints

- Registry: `https://npm.pkg.github.com`. Scope: `@montionugera`.
- Published names, in dependency order: `@montionugera/joy-tokens`, `@montionugera/joy-icons`, `@montionugera/joy-brand`, `@montionugera/joy-react`.
- Renamed but not published: `@montionugera/joy-svelte`, with `"private": true`.
- First published versions: `0.2.0` for tokens, brand and react; `0.3.0` for icons. Versions are hand-set.
- `repository`: `{ "type": "git", "url": "git+https://github.com/montionugera/joy-design.git", "directory": "packages/<name>" }`.
- `publishConfig`: `{ "registry": "https://npm.pkg.github.com" }`.
- `files`: tokens `dist`; icons `dist`, `src/index.ts`, `src/index.d.ts`, `src/*.svelte`, `PROVENANCE.md`; brand `src`, `assets`; react `dist`.
- `license`: icons `SEE LICENSE IN PROVENANCE.md`; tokens, brand, react `UNLICENSED`.
- `sideEffects`: tokens `["**/*.css"]`; icons, brand, react `false`.
- Build tool: `tsc -p tsconfig.build.json` only. No bundler. `dist/` of react and icons stays untracked; tokens' committed `dist/` is left alone.
- Publish command: `pnpm publish --no-git-checks`. Never `npm publish` (it does not replace `workspace:*`).
- Workflow trigger: a pushed tag matching `packages-v*`, or a manual run with a `dry_run` input. Auth: the workflow's own `GITHUB_TOKEN` with `packages: write`. No new secret.
- Not renamed: anything under `.claude/` and `docs/superpowers/`; the sample consumer `@joymify/quant` in `apps/storybook-hub/build.js`; every CSS name (`--joy-*` variables, `.joy-*` classes).
- `DESIGN.md` is generated. Never hand-edit it; change `scripts/design-md/render.mjs` and run `node scripts/gen-design-md.mjs`.
- No raw OS emoji and no colour literals in any new file (Gate 1 rejects both).
- New commits only. Never `git commit --amend`.
- One heavy command at a time. The full gate `./scripts/integration.sh` runs once per phase (Task 2 and Task 9); every other step uses the narrowest command.
- Shell is zsh on macOS: globs are quoted in every command below.
- **No task pushes a tag or runs a publish without `--dry-run`.** The real publish needs the owner's separate explicit go-ahead and is outside this plan.

---

## Spec deviations found while planning

Each item has evidence and what the plan does instead. None changes an owner decision.

1. **There is no copy of `load-tsx.js` in the Svelte package.** The spec (Phase 1) says "the package-id literals in `packages/react/test/helpers/load-tsx.js` and its copy in the Svelte package". `packages/svelte/test/helpers/` holds only `render-svelte.js` and `svelte-hooks.js`, and neither names a package. The equivalent Svelte-side literal is the string replace at `packages/svelte/test/components.test.js:1024` (`.replace("'@joymify/icons'", ...)`). The plan renames that line and lists it under non-import name strings.
2. **The spec's completion search misses ten references.** `packages/svelte/test/components.test.js` lines 558, 592, 638, 646, 652, 738, 763, 778, 804 and 880 match the package name inside regex literals written `'@joymify\/icons'` (escaped slash). The spec's pattern `@joymify/(tokens|icons|brand|react|svelte)` does not match that spelling, and those assertions would fail after the sources are renamed. The plan uses the widened pattern `@joymify\\?/(tokens|icons|brand|react|svelte)` for both the rewrite and the completion search, and also runs the spec's literal pattern.
3. **`turbo.json` already makes `check` depend on the build.** `turbo.json:12-15` is `"check": { "dependsOn": ["^build"], "outputs": [] }`. The spec says "the plan must add the build as a `turbo` dependency of `check`". There is nothing to add. The plan locks the existing edge with an assertion in `scripts/test/publish-contract.test.mjs` (Task 5) and writes the note in `AGENTS.md` (Task 8).
4. **Pointing the icons React entry at built declarations would drop a public type.** The hand-written `packages/icons/src/react.d.ts:2` exports `IconProps`, but `packages/icons/src/react.ts` (138 lines, one per icon) does not, so the generated `dist/react.d.ts` would not either. Nothing in this repo imports `IconProps` from the entry, so no test would notice, but a consumer would. Task 4 adds `export type { IconProps } from "./react/Activity.js";` to `react.ts`. The now-unused `src/react.d.ts` is left in place (not shipped, not in `files`).
5. **The gate already runs the brand build, so the clean-tree check covers more than the spec assumes.** The spec says brand's build "is not run". `scripts/precheck.sh:47` (step 2b) runs `pnpm check`, which is `turbo run check` with `dependsOn: ["^build"]`, and `joy-react` depends on `joy-brand`, so `node packages/brand/build.js` runs inside the gate and rewrites `packages/brand/assets/`. The gate's Flutter step also runs `flutter pub get` beside the tracked `apps/flutter-hub/pubspec.lock`. The workflow therefore does not run brand's build itself (as the spec says), keeps `git diff --exit-code`, and prints `git status --short` and `git diff --stat` on failure. Whether those files come out byte-identical on the Linux runner is **unproven until the first hosted dry run**; Task 1 and Task 9 check it locally on macOS.
6. **Counts.** The spec estimates "about 122 source imports". Measured on `release/3.7`: 200 occurrences in 85 tracked files outside `.claude/` and `docs/superpowers/` (62 of them in 54 files under `packages/react/src` and `packages/svelte/src`). The name also appears in files the spec's list does not mention (`packages/brand/scripts/outline-text.mjs`, `packages/brand/src/layout.js`, `packages/brand/src/outlines.generated.js`, both `PROVENANCE.md` files, test titles, and hub text and `aria-label`s in `apps/storybook-hub/build.js`). All are enumerated in Task 1.
7. **Main-branch check is applied to manual real runs too.** The spec says the job "refuses a tag whose commit is not on `main`". The workflow applies the same check to a manual run with `dry_run` off, so a real publish can never come from a side branch. Manual dry runs are allowed from any branch.
8. **"Renders" is made checkable.** A Vite build compiles components but never calls them. `scripts/test/consumer-smoke.sh` also renders `Button`, `Tabs`, the `Check` icon and `BrandMark` to a string with `react-dom/server` under plain Node, and has two `@ts-expect-error` guards that fail the type-check if the published types degrade to `any`. This is additional evidence for Acceptance 2, not a change of scope.

---

## File Structure

Created:

| File | Responsibility |
| --- | --- |
| `packages/react/tsconfig.build.json` | Emit `dist/` (JavaScript and declarations) for `joy-react`. |
| `packages/icons/tsconfig.build.json` | Emit `dist/` for the React entry of `joy-icons` only. |
| `scripts/test/publish-contract.test.mjs` | Holds package metadata, `files` coverage of `exports`, build scripts, the turbo edge and the publish workflow to the spec. Runs in Gate 1 step 2e. |
| `scripts/test/consumer-smoke.sh` | The tarball test: pack four packages, install into a fresh app outside the workspace, type-check, build, render. |
| `.github/workflows/publish.yml` | Gate, build, clean-tree check, tarball test, then dry run or publish in dependency order. |

Modified:

| File | Responsibility of the change |
| --- | --- |
| `packages/{tokens,icons,brand,react,svelte}/package.json` | Phase 1: `name` and `workspace:*` keys; `private` on svelte. Phase 2: build scripts, `dist` exports, publish metadata, versions. |
| `pnpm-lock.yaml` | Regenerated for the new names. |
| 27 files in `packages/react/src`, 27 in `packages/svelte/src/lib` | Import specifiers and comments. |
| `packages/icons/src/react.ts` | One added type re-export (`IconProps`). |
| Test files, helpers, `packages/brand/build.js`, brand scripts and sources, hub `build.js`, two Playwright specs, `scripts/test/docs-contract.test.mjs` | Name strings that are not imports. |
| `README.md`, `AGENTS.md`, `PRODUCT.md`, both `PROVENANCE.md` files | Live docs: names; new "Install from the registry" section; build and type-check note. |
| `scripts/design-md/render.mjs`, then generated `DESIGN.md` | Generator text, then regenerated output. |
| `research.md` (beside this plan) | Record of declaration-build findings (Task 3). |

---

# Phase 1: Rename

### Task 1: Rename the five packages from `@joymify/*` to `@montionugera/joy-*`

**Files:**

- Modify, package.json files (5 files, 12 entries):
  - `packages/tokens/package.json` (name)
  - `packages/icons/package.json` (name)
  - `packages/brand/package.json` (name; devDependency key `@joymify/tokens`)
  - `packages/react/package.json` (name; dependency keys brand, icons, tokens)
  - `packages/svelte/package.json` (name; dependency keys brand, icons, tokens; add `"private": true`)
- Modify, source imports (54 files, 62 occurrences):
  - `packages/react/src/`: `Alert.tsx`, `BrandBanner.tsx`, `BrandMark.tsx`, `Cascader.tsx`, `DatePicker.tsx`, `DateRangePicker.tsx`, `Drawer.tsx`, `FAQSection.tsx`, `ImagePreview.tsx`, `LandingPage.tsx`, `MarkdownEditor.tsx`, `MarkdownViewer.tsx`, `Message.tsx`, `MetricTile.tsx`, `Modal.tsx`, `Notification.tsx`, `Pagination.tsx`, `Popconfirm.tsx`, `PricingCard.tsx`, `PricingMatrix.tsx`, `StatCard.tsx`, `TimePicker.tsx`, `Toast.tsx`, `Transfer.tsx`, `TreeSelect.tsx`, `Upload.tsx`, `Wordmark.tsx`
  - `packages/svelte/src/lib/`: the same 27 base names with the `.svelte` extension
  - `packages/react/test/brand-components.test.js:4`, `packages/svelte/test/brand-components.test.js:4` (`import { MARK } from '@joymify/brand'`)
- Modify, non-import name strings:
  - `packages/react/test/helpers/load-tsx.js:8,18` (the package-id literal; if missed, the helper falls through to `requireFromHere(id)`)
  - `packages/svelte/test/components.test.js:1024` (string replace of `'@joymify/icons'`) and its regex literals at lines 558, 592, 638, 646, 652, 738, 763, 778, 804, 880, plus assertion messages at 328, 358, 439, 624
  - `packages/react/test/components.test.js:345,373,434,1320`, `packages/react/test/landing-proof.test.js:183`, `packages/svelte/test/landing-proof.test.js:177`, `packages/icons/test/icons.test.js:6`, `packages/tokens/test/wave-3.test.js:13`, `packages/brand/test/layout.test.js:7`
  - `packages/brand/build.js:3,27,29,36,38,43,48` (the tokens lookup by name at lines 36 and 38)
  - `packages/brand/scripts/outline-text.mjs:5,102`, `packages/brand/src/layout.js:2`, `packages/brand/src/outlines.generated.js:2`
  - `apps/storybook-hub/build.js` (21 lines: 18, 162, 200, 210, 277, 286, 770, 4935, 4939, 4945, 4949, 4955, 4959, 5018, 5535, 6438, 9263, 11154, 11157, 14295, 14299; line 6395 `@joymify/quant` must stay)
  - `apps/storybook-hub/tests/contracts.spec.ts:68`, `apps/storybook-hub/tests/framework-switcher.spec.ts:47,53,67`
  - `scripts/test/docs-contract.test.mjs:43`
- Modify, live docs: `README.md` (21 lines), `AGENTS.md:23`, `PRODUCT.md:13,38`, `packages/brand/PROVENANCE.md:26,30,32`, `packages/icons/PROVENANCE.md:1,4`
- Modify, generator then generated: `scripts/design-md/render.mjs:242,265`, then `DESIGN.md` (regenerated, line 751)
- Regenerate: `pnpm-lock.yaml` (7 keys)

**Interfaces:**

- Consumes: nothing.
- Produces: workspace package names `@montionugera/joy-tokens`, `@montionugera/joy-icons`, `@montionugera/joy-brand`, `@montionugera/joy-react`, `@montionugera/joy-svelte` (private). Subpaths keep their shape: `@montionugera/joy-icons/react`, `@montionugera/joy-tokens/theme.css`, `@montionugera/joy-tokens/tailwind`, `@montionugera/joy-brand/assets/*`. Hub card labels become `Open @montionugera/joy-tokens`, `Open @montionugera/joy-svelte`, `Open @montionugera/joy-react`. Versions are unchanged in this task.

- [ ] **Step 1: Write the failing check (the completion search) and see it fail.**

```bash
git grep --untracked -nE '@joymify\\?/(tokens|icons|brand|react|svelte)' -- . ':!.claude' ':!docs/superpowers' ':!**/dist/**' ':!graft' | wc -l
```

Expected before the rename: a non-zero line count (178 on `release/3.7`). `--untracked` still honours `.gitignore`, so `node_modules`, `graft/` and untracked `dist/` are excluded; the pathspecs exclude the tracked `packages/tokens/dist/` and the historical folders.

- [ ] **Step 2: Confirm the starting tree is clean.**

```bash
git status --short
```

Expected: no tracked changes.

- [ ] **Step 3: Rewrite every reference in one pass.** This excludes the lockfile (regenerated in Step 7) and `DESIGN.md` (regenerated in Step 8).

```bash
git grep -lE '@joymify\\?/(tokens|icons|brand|react|svelte)' -- . ':!.claude' ':!docs/superpowers' ':!**/dist/**' ':!pnpm-lock.yaml' ':!DESIGN.md' \
  | xargs perl -pi -e 's{\@joymify(\\?)/(tokens|icons|brand|react|svelte)\b}{\@montionugera$1/joy-$2}g'
git status --short | wc -l
```

Expected: `83` files modified. The capture group `(\\?)` keeps the escaped slash in the ten regex literals, so `'@joymify\/icons'` becomes `'@montionugera\/joy-icons'`.

- [ ] **Step 4: Check the five package.json files.** After Step 3 they must read:

`packages/tokens/package.json` line 2: `"name": "@montionugera/joy-tokens",`

`packages/icons/package.json` line 2: `"name": "@montionugera/joy-icons",`

`packages/brand/package.json` line 2 and the last devDependency:

```json
  "name": "@montionugera/joy-brand",
```

```json
    "@montionugera/joy-tokens": "workspace:*"
```

`packages/react/package.json` line 2 and `dependencies`:

```json
  "name": "@montionugera/joy-react",
```

```json
  "dependencies": {
    "@montionugera/joy-brand": "workspace:*",
    "@montionugera/joy-icons": "workspace:*",
    "@montionugera/joy-tokens": "workspace:*"
  },
```

`packages/svelte/package.json` line 2 and `dependencies` (same three keys as react):

```json
  "name": "@montionugera/joy-svelte",
```

Verify:

```bash
grep -n '"name"\|montionugera' packages/tokens/package.json packages/icons/package.json packages/brand/package.json packages/react/package.json packages/svelte/package.json
```

Expected: 5 `name` lines and 7 `workspace:*` keys, all `@montionugera/joy-*`.

- [ ] **Step 5: Mark the Svelte package private.** In `packages/svelte/package.json`, change

```json
  "name": "@montionugera/joy-svelte",
  "version": "0.1.0",
```

to

```json
  "name": "@montionugera/joy-svelte",
  "version": "0.1.0",
  "private": true,
```

- [ ] **Step 6: Check the two things a blind rewrite could get wrong.**

```bash
grep -n "@joymify/quant" apps/storybook-hub/build.js
grep -n "id === " packages/react/test/helpers/load-tsx.js
grep -c "montionugera\\\\/joy-icons" packages/svelte/test/components.test.js
grep -n "require.resolve.paths\|path.join(base" packages/brand/build.js
```

Expected, in order: one line (6395) still reading `from '@joymify/quant'`; `if (id === '@montionugera/joy-icons/react') return loadFile(...)`; `10`; both brand lines naming `'@montionugera/joy-tokens'`.

- [ ] **Step 7: Regenerate the lockfile and relink the workspace.**

```bash
pnpm install
grep -c "@joymify" pnpm-lock.yaml
grep -c "'@montionugera/joy-" pnpm-lock.yaml
pnpm install --frozen-lockfile
find packages apps -maxdepth 3 -type d -path '*/node_modules/@joymify'
```

Expected: install exits 0; counts `0` then `7`; the frozen install exits 0 (this is what the gate runs); `find` prints nothing. If `find` prints a path, remove that stale untracked link directory with `rm -rf <path>` and re-run the `find`.

- [ ] **Step 8: Regenerate `DESIGN.md` from the renamed generator.**

```bash
node scripts/gen-design-md.mjs
node scripts/gen-design-md.mjs --check
git diff --stat DESIGN.md
```

Expected: `--check` exits 0; `DESIGN.md` shows 1 insertion and 1 deletion (line 751, `@montionugera/joy-icons`). The generated `deprecated-aliases` region of `README.md` (line 801) was already rewritten in Step 3 and matches the generator.

- [ ] **Step 9: Run the completion search and see it pass.**

```bash
git grep --untracked -nE '@joymify\\?/(tokens|icons|brand|react|svelte)' -- . ':!.claude' ':!docs/superpowers' ':!**/dist/**' ':!graft'
git grep --untracked -nE '@joymify/(tokens|icons|brand|react|svelte)' -- . ':!.claude' ':!docs/superpowers' ':!**/dist/**' ':!graft'
git grep --untracked -n '@joymify/' -- . ':!.claude' ':!docs/superpowers' ':!**/dist/**' ':!graft'
```

Expected: the first two print nothing and exit 1 (the second is the spec's literal pattern). The third prints exactly one line: `apps/storybook-hub/build.js:6395:import { Router, OrderType } from '@joymify/quant';`.

- [ ] **Step 10: Run the narrow tests, one command at a time.**

```bash
pnpm --filter @montionugera/joy-tokens test
pnpm --filter @montionugera/joy-icons test
pnpm --filter @montionugera/joy-brand test
pnpm --filter @montionugera/joy-react test
pnpm --filter @montionugera/joy-svelte test
node --test 'scripts/test/*.test.mjs'
node scripts/parity-check.mjs
```

Expected: every command exits 0 with `# fail 0`. `docs-contract.test.mjs` passing proves `PRODUCT.md`, `README.md` and the package names agree.

- [ ] **Step 11: Type-check through turbo and confirm the brand build leaves no diff.**

```bash
pnpm check
git status --short packages/brand/assets packages/tokens/dist
```

Expected: `pnpm check` exits 0. `git status` prints nothing (see deviation 5: turbo runs the brand build here).

- [ ] **Step 12: Rebuild the hub and run the two renamed Playwright specs.**

```bash
node packages/tokens/build.js && node apps/storybook-hub/build.js
PLAYWRIGHT_PORT=6177 pnpm --filter storybook-hub exec playwright test tests/contracts.spec.ts tests/framework-switcher.spec.ts
```

Expected: build exits 0; all tests in both specs pass in `desktop-chrome` and `mobile-chrome`.

- [ ] **Step 13: Commit.**

```bash
git add -u
git status --short
git commit -m "refactor(packages): rename @joymify/* workspace packages to @montionugera/joy-*"
```

Expected before the commit: only `M` entries, 85 files (83 from Step 3, plus `pnpm-lock.yaml` and `DESIGN.md`), no untracked source files. `git add -u` stages tracked modifications only; this task creates no new file.

- [ ] **Step 14: Phase gate.** Shared with Task 2, which is the Phase 1 gate. Do not start Task 3 until Task 2 is complete.

### Task 2: Phase 1 gate (full verification, visual check, review)

**Files:**

- Modify: only what the review finds, inside the files Task 1 touched.
- Test: `./scripts/integration.sh` (the one full gate run of Phase 1).

**Interfaces:**

- Consumes: the renamed workspace from Task 1.
- Produces: a verified, reviewed Phase 1. Phase 2 may start.

- [ ] **Step 1: Run the full gate once.**

```bash
PLAYWRIGHT_PORT=6177 ./scripts/integration.sh 2>&1 | tail -n 25
```

Expected: last line `==> All integration checks passed! <==`, exit 0. If it fails, read the failing step's output, fix the cause in a new commit, and re-run.

- [ ] **Step 2: Confirm the gate left the tree clean.**

```bash
git status --short
```

Expected: nothing.

- [ ] **Step 3: Visual check of the hub home cards.** The three card headings are longer now (`@montionugera/joy-tokens` in place of `@joymify/tokens`). Run this from the repo root; it writes four screenshots outside the repo and fails on overflow.

```bash
export SHOTS="$(mktemp -d)"
(cd apps/storybook-hub && node --input-type=module -e '
import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
const browser = await chromium.launch();
let bad = 0;
for (const theme of ["light", "dark"]) {
  for (const width of [375, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(pathToFileURL("dist/index.html").href + "#overview");
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    const clipped = await page.$$eval(".hub-card h3", (els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    await page.screenshot({ path: process.env.SHOTS + "/hub-home-" + theme + "-" + width + ".png" });
    console.log(theme, width, "clipped headings:", JSON.stringify(clipped), "page overflow:", pageOverflow);
    if (clipped.length || pageOverflow) bad += 1;
    await page.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
')
echo "screenshots in $SHOTS"
```

Expected: four lines, each `clipped headings: [] page overflow: false`, exit 0. Then dispatch one subagent to read the four PNG files and return a text verdict (headings readable, no overlap with the card icon, in both themes); do not open the images in the main thread. If a heading is clipped or overlaps, fix the heading's wrapping in `apps/storybook-hub/build.js` using existing tokens only, rebuild the hub, re-run this step and commit as `fix(hub): keep renamed package headings inside the home cards`.

- [ ] **Step 4: Independent review.** Dispatch `code-reviewer` and `typescript-reviewer` in parallel on the Phase 1 diff:

```bash
git diff "$(git merge-base HEAD release/3.7)"..HEAD --stat | tail -n 5
```

Brief for both: "Review `git diff $(git merge-base HEAD release/3.7)..HEAD`. It must be a pure rename of `@joymify/(tokens|icons|brand|react|svelte)` to `@montionugera/joy-$1` plus `"private": true` on the Svelte package. Report any line that changes behaviour, any reference left behind, any CSS name (`--joy-*`, `.joy-*`) that changed, and whether `@joymify/quant` at `apps/storybook-hub/build.js:6395` is untouched."

- [ ] **Step 5: Act on the review.** Fix every finding in a new commit (`fix(packages): <finding>`). Then run `/simplify` on the diff; for a pure rename the expected result is no change.

- [ ] **Step 6: Re-verify if Step 3 or Step 5 changed any file.** Re-run Step 1 of this task and Task 1 Step 9. Expected: gate exit 0, search empty. If nothing changed, the Step 1 result stands.

- [ ] **Step 7: Phase gate.** This task is the gate for Tasks 1 and 2. Phase 1 is complete when Steps 1 to 6 are done with the evidence above.

---

# Phase 2: Build, metadata, tarball test, workflow

### Task 3: Prove the declaration build of `joy-react`

This is deliberately first in Phase 2: `noEmit` type-checking never exercised declaration emit across the 103 source files.

**Files:**

- Create: `packages/react/tsconfig.build.json`
- Modify: `packages/react/package.json` (`scripts` only)
- Modify: `research.md` beside this plan (record findings)
- Possibly modify: files in `packages/react/src/` that fail declaration emit, and the byte-identical twin in `packages/svelte/src/lib/` when the file is a shared `.ts` helper
- Test: the build itself

**Interfaces:**

- Consumes: package name `@montionugera/joy-react` (Task 1).
- Produces: script `build` in `packages/react/package.json` (`tsc -p tsconfig.build.json`); output `packages/react/dist/index.js` and `packages/react/dist/index.d.ts` plus one `.js` and one `.d.ts` per source file; `dist/` untracked. `exports` still point at `src/` after this task (changed in Task 5).

- [ ] **Step 1: Write the failing check and see it fail.**

```bash
test -f packages/react/dist/index.d.ts; echo "exit $?"
```

Expected: `exit 1`.

- [ ] **Step 2: Create `packages/react/tsconfig.build.json`.**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "allowImportingTsExtensions": false,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "module": "ESNext"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.ts", "src/**/*.stories.tsx"]
}
```

- [ ] **Step 3: Add the `build` script.** In `packages/react/package.json`, change

```json
  "scripts": {
    "test": "node --test test/*.test.js",
    "check": "tsc -p tsconfig.json"
  },
```

to

```json
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "node --test test/*.test.js",
    "check": "tsc -p tsconfig.json"
  },
```

- [ ] **Step 4: Run the declaration build and capture the result.**

```bash
pnpm --filter @montionugera/joy-react build 2>&1 | tail -n 40
```

Expected: exit 0 with no `error TS` lines. If there are errors, go to Step 5; otherwise skip to Step 6.

- [ ] **Step 5: Fix declaration-only errors without changing behaviour.** The errors that appear only with `declaration: true` are `TS4023`, `TS4025`, `TS4058`, `TS4060`, `TS4078` (an exported value's type uses a name that is not exported), `TS2742` (an inferred type cannot be named without a reference to another module) and `TS7056` (an inferred type is too large to serialise). The fix in every case is to make the type nameable: export the interface or type alias that the error names, or add an explicit annotation to the exported value. For example, for `error TS4023: Exported variable 'Foo' has or is using name 'FooState' from external module "./foo-utils" but cannot be named`, change `interface FooState {` to `export interface FooState {` in `foo-utils.ts`. Do not change any runtime expression. If the file is one of the shared helpers that must stay byte-identical (`auto-dismiss.ts`, `calendar-utils.ts`, `chart-core.ts`, `delta-utils.ts`, `overlay-utils.ts`, `pagination-utils.ts`, `roving-utils.ts`, `splitter-utils.ts`, `table-utils.ts`), make the identical edit in `packages/svelte/src/lib/<same name>` and run `node scripts/parity-check.mjs` (expected exit 0). Re-run Step 4 until it exits 0.

- [ ] **Step 6: Record what the build showed.** Append to `research.md` beside this plan:

```markdown
## Declaration build of joy-react (Task 3)

- Command: `pnpm --filter @montionugera/joy-react build` (`tsc -p tsconfig.build.json`, `declaration: true`).
- First run result: <exit code, and each `error TS` line verbatim, or "exit 0, no errors">.
- Fixes applied: <file and one-line description per fix, or "none needed">.
```

Replace the two angle-bracket fields with the actual output of Step 4 and the actual edits of Step 5.

- [ ] **Step 7: Check the output shape.**

```bash
test -f packages/react/dist/index.js && test -f packages/react/dist/index.d.ts && echo present
ls packages/react/dist | grep -c '\.d\.ts$'
ls packages/react/dist | grep -vc '\.d\.ts$'
grep -rlE "from ['\"]\./[^'\"]+\.tsx?['\"]" packages/react/dist | wc -l
git check-ignore -q packages/react/dist && echo ignored
git status --short packages/react
```

Expected: `present`; `103`; `103`; `0` (no emitted import ends in `.ts` or `.tsx`); `ignored`; and the status shows only `M packages/react/package.json` and `?? packages/react/tsconfig.build.json` (plus any source file fixed in Step 5).

- [ ] **Step 8: Confirm nothing else moved.**

```bash
pnpm --filter @montionugera/joy-react check
pnpm --filter @montionugera/joy-react test
```

Expected: both exit 0.

- [ ] **Step 9: Commit.** If Step 5 edited sources, add those exact paths as well.

```bash
git add packages/react/tsconfig.build.json packages/react/package.json
git add -u .claude/refined_backlog
git status --short
git commit -m "build(joy-react): emit dist with declarations via tsc"
```

Expected: after the commit, `git status --short` shows no tracked changes.

- [ ] **Step 10: Phase gate.** Shared with Tasks 4 and 5 (same subsystem: package build and metadata); it runs at the end of Task 5.

### Task 4: Build the React entry of `joy-icons`

**Files:**

- Create: `packages/icons/tsconfig.build.json`
- Modify: `packages/icons/package.json` (`scripts` only)
- Modify: `packages/icons/src/react.ts` (append one line after line 138)
- Test: the build itself

**Interfaces:**

- Consumes: package name `@montionugera/joy-icons` (Task 1).
- Produces: script `build` in `packages/icons/package.json` (`tsc -p tsconfig.build.json`); output `packages/icons/dist/react.js`, `packages/icons/dist/react.d.ts` and `packages/icons/dist/react/<Icon>.js` plus `.d.ts` for each of the 138 icons; type export `IconProps` from the React entry. The Svelte entry (`src/index.ts`) is not built. `exports` still point at `src/` after this task (changed in Task 5).

- [ ] **Step 1: Write the failing check and see it fail.**

```bash
test -f packages/icons/dist/react.d.ts && grep -q "IconProps" packages/icons/dist/react.d.ts; echo "exit $?"
```

Expected: `exit 1`.

- [ ] **Step 2: Create `packages/icons/tsconfig.build.json`.** The `include` list keeps the 138 `.svelte` files and `src/index.ts` out of the program.

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "allowImportingTsExtensions": false,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "module": "ESNext"
  },
  "include": ["src/react.ts", "src/react/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.ts", "src/**/*.stories.tsx"]
}
```

- [ ] **Step 3: Add the `build` script.** In `packages/icons/package.json`, change

```json
  "scripts": {
    "test": "node --test test/*.test.js",
    "check": "svelte-check --tsconfig ./tsconfig.json --threshold error"
  },
```

to

```json
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "node --test test/*.test.js",
    "check": "svelte-check --tsconfig ./tsconfig.json --threshold error"
  },
```

- [ ] **Step 4: Keep `IconProps` public.** Append this line to the end of `packages/icons/src/react.ts` (after `export { ZoomOut } from "./react/ZoomOut.js";`):

```ts
export type { IconProps } from "./react/Activity.js";
```

Every icon file declares the same `IconProps` interface (`size`, `color`, `strokeWidth` on top of `React.SVGProps<SVGSVGElement>`); `Activity.tsx` is the first one alphabetically.

- [ ] **Step 5: Build and see the check pass.**

```bash
pnpm --filter @montionugera/joy-icons build 2>&1 | tail -n 20
test -f packages/icons/dist/react.d.ts && grep -q "IconProps" packages/icons/dist/react.d.ts; echo "exit $?"
ls packages/icons/dist
ls packages/icons/dist/react | grep -c '\.d\.ts$'
ls packages/icons/dist/react | grep -vc '\.d\.ts$'
git check-ignore -q packages/icons/dist && echo ignored
```

Expected: build exits 0 with no `error TS` lines; `exit 0`; `ls` prints exactly `react`, `react.d.ts`, `react.js` (no `index.js`: the Svelte entry is not compiled); `138`; `138`; `ignored`. If the build reports a declaration-only error, apply the same rule as Task 3 Step 5 here: export the named type or annotate the exported value in the icon file the error names, change no runtime expression, and re-run this step.

- [ ] **Step 6: Confirm the package's own checks still pass.**

```bash
pnpm --filter @montionugera/joy-icons test
pnpm --filter @montionugera/joy-icons check
```

Expected: both exit 0.

- [ ] **Step 7: Commit.**

```bash
git add packages/icons/tsconfig.build.json packages/icons/package.json packages/icons/src/react.ts
git status --short
git commit -m "build(joy-icons): emit dist for the React entry and export IconProps"
```

Expected: after the commit, `git status --short` shows no tracked changes.

- [ ] **Step 8: Phase gate.** Shared with Tasks 3 and 5; it runs at the end of Task 5.

### Task 5: Publish metadata, `dist` exports and the publish contract test

**Files:**

- Create: `scripts/test/publish-contract.test.mjs`
- Modify: `packages/tokens/package.json`, `packages/icons/package.json`, `packages/brand/package.json`, `packages/react/package.json` (whole files shown below)
- Test: `node --test scripts/test/publish-contract.test.mjs`

**Interfaces:**

- Consumes: `build` scripts and `dist/` layouts from Tasks 3 and 4; names from Task 1.
- Produces: versions `@montionugera/joy-tokens@0.2.0`, `@montionugera/joy-icons@0.3.0`, `@montionugera/joy-brand@0.2.0`, `@montionugera/joy-react@0.2.0`; `@montionugera/joy-react` resolving to `./dist/index.js` and `./dist/index.d.ts`; `@montionugera/joy-icons/react` resolving to `./dist/react.js` and `./dist/react.d.ts`; test file `scripts/test/publish-contract.test.mjs` (Task 7 appends to it), picked up by Gate 1 step 2e (`node --test 'scripts/test/*.test.mjs'`).

- [ ] **Step 1: Write the failing test.** Create `scripts/test/publish-contract.test.mjs`:

```js
// Holds the four published packages to the publish contract (spec I-077): names, versions,
// registry, repository link, licence, sideEffects, the files allowlist and that every path in
// `exports` is covered by it. Reading package.json is the behaviour under test.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const REGISTRY = 'https://npm.pkg.github.com';
const REPO_URL = 'git+https://github.com/montionugera/joy-design.git';

// Dependency order: this is also the order the workflow publishes in.
const PUBLISHED = [
  { dir: 'tokens', name: '@montionugera/joy-tokens', version: '0.2.0', license: 'UNLICENSED', sideEffects: ['**/*.css'], files: ['dist'] },
  { dir: 'icons', name: '@montionugera/joy-icons', version: '0.3.0', license: 'SEE LICENSE IN PROVENANCE.md', sideEffects: false, files: ['dist', 'src/index.ts', 'src/index.d.ts', 'src/*.svelte', 'PROVENANCE.md'] },
  { dir: 'brand', name: '@montionugera/joy-brand', version: '0.2.0', license: 'UNLICENSED', sideEffects: false, files: ['src', 'assets'] },
  { dir: 'react', name: '@montionugera/joy-react', version: '0.2.0', license: 'UNLICENSED', sideEffects: false, files: ['dist'] },
];

/** Every string leaf of an `exports` value. */
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportTargets);
  return [];
}

/** True when a package-relative path (`./dist/index.js`, `./assets/*`) is shipped by the allowlist. */
function covered(target, files) {
  const rel = target.replace(/^\.\//, '');
  return files.some((entry) => {
    if (entry.includes('*')) {
      const pattern = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(rel);
    }
    return rel === entry || rel.startsWith(`${entry}/`);
  });
}

for (const spec of PUBLISHED) {
  test(`${spec.name}: publish metadata matches the contract`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    assert.strictEqual(pkg.name, spec.name);
    assert.strictEqual(pkg.version, spec.version);
    assert.notStrictEqual(pkg.private, true, 'a published package must not be private');
    assert.deepStrictEqual(pkg.publishConfig, { registry: REGISTRY });
    assert.deepStrictEqual(pkg.repository, { type: 'git', url: REPO_URL, directory: `packages/${spec.dir}` });
    assert.strictEqual(pkg.license, spec.license);
    assert.deepStrictEqual(pkg.sideEffects, spec.sideEffects);
    assert.deepStrictEqual(pkg.files, spec.files);
  });

  test(`${spec.name}: every exports, main, module and types path is inside files`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    const targets = [...exportTargets(pkg.exports), pkg.main, pkg.module, pkg.types].filter(Boolean);
    assert.ok(targets.length > 0, 'expected at least one entry point');
    for (const target of targets) {
      assert.ok(covered(target, pkg.files), `${target} is not shipped by files ${JSON.stringify(pkg.files)}`);
    }
  });
}

test('joy-react resolves to built output, not TypeScript source', () => {
  const pkg = readJson('packages/react/package.json');
  assert.strictEqual(pkg.main, './dist/index.js');
  assert.strictEqual(pkg.module, './dist/index.js');
  assert.strictEqual(pkg.types, './dist/index.d.ts');
  assert.deepStrictEqual(pkg.exports, {
    '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
  });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
});

test('joy-icons builds only its React entry; the Svelte entry stays source', () => {
  const pkg = readJson('packages/icons/package.json');
  assert.deepStrictEqual(pkg.exports['./react'], { types: './dist/react.d.ts', default: './dist/react.js' });
  assert.deepStrictEqual(pkg.exports['.'], { types: './src/index.d.ts', svelte: './src/index.ts', default: './src/index.ts' });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
  assert.match(read('packages/icons/src/react.ts'), /^export type \{ IconProps \} from "\.\/react\/Activity\.js";$/m);
});

test('joy-react depends only on published workspace packages', () => {
  const pkg = readJson('packages/react/package.json');
  const publishedNames = PUBLISHED.map((p) => p.name);
  const workspaceDeps = Object.entries(pkg.dependencies).filter(([, range]) => String(range).startsWith('workspace:'));
  assert.deepStrictEqual(
    workspaceDeps.map(([name]) => name).sort(),
    ['@montionugera/joy-brand', '@montionugera/joy-icons', '@montionugera/joy-tokens'],
  );
  for (const [name] of workspaceDeps) assert.ok(publishedNames.includes(name), `${name} is not a published package`);
});

test('joy-svelte is renamed and private', () => {
  const pkg = readJson('packages/svelte/package.json');
  assert.strictEqual(pkg.name, '@montionugera/joy-svelte');
  assert.strictEqual(pkg.private, true);
  assert.strictEqual(pkg.publishConfig, undefined);
});

test('turbo builds dependencies before the type-check', () => {
  const turbo = readJson('turbo.json');
  assert.ok(turbo.tasks.check.dependsOn.includes('^build'), 'check must depend on ^build: joy-react reads joy-icons declarations from dist');
});
```

- [ ] **Step 2: Run it and see it fail.**

```bash
node --test scripts/test/publish-contract.test.mjs 2>&1 | tail -n 12
```

Expected: exit 1. The eight per-package tests and the two entry-point tests fail (for example `Expected values to be strictly equal: '0.1.0' !== '0.2.0'`); `joy-react depends only on published workspace packages`, `joy-svelte is renamed and private` and `turbo builds dependencies before the type-check` already pass.

- [ ] **Step 3: Replace `packages/tokens/package.json` with:**

```json
{
  "name": "@montionugera/joy-tokens",
  "version": "0.2.0",
  "type": "module",
  "license": "UNLICENSED",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/montionugera/joy-design.git",
    "directory": "packages/tokens"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "dist"
  ],
  "sideEffects": [
    "**/*.css"
  ],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./theme.css": "./dist/theme.css",
    "./tailwind": "./dist/tailwind-theme.css"
  },
  "scripts": {
    "build": "node build.js",
    "test": "node --test test/*.test.js",
    "check": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@types/node": "^22.20.4",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 4: Replace `packages/icons/package.json` with:**

```json
{
  "name": "@montionugera/joy-icons",
  "version": "0.3.0",
  "type": "module",
  "license": "SEE LICENSE IN PROVENANCE.md",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/montionugera/joy-design.git",
    "directory": "packages/icons"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "dist",
    "src/index.ts",
    "src/index.d.ts",
    "src/*.svelte",
    "PROVENANCE.md"
  ],
  "sideEffects": false,
  "main": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "svelte": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./react": {
      "types": "./dist/react.d.ts",
      "default": "./dist/react.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "node --test test/*.test.js",
    "check": "svelte-check --tsconfig ./tsconfig.json --threshold error"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "svelte": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "svelte": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "react": "^19.3.0",
    "svelte": "^5.57.1",
    "svelte-check": "^4.7.6",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 5: Replace `packages/brand/package.json` with:**

```json
{
  "name": "@montionugera/joy-brand",
  "version": "0.2.0",
  "type": "module",
  "license": "UNLICENSED",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/montionugera/joy-design.git",
    "directory": "packages/brand"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "src",
    "assets"
  ],
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "default": "./src/index.js"
    },
    "./assets/*": "./assets/*"
  },
  "scripts": {
    "build": "node build.js",
    "test": "node --test test/*.test.js",
    "outline": "node scripts/outline-text.mjs"
  },
  "devDependencies": {
    "opentype.js": "^2.0.0",
    "@fontsource/cormorant-garamond": "^5.3.0",
    "@resvg/resvg-js": "^2.6.2",
    "@montionugera/joy-tokens": "workspace:*"
  }
}
```

- [ ] **Step 6: Replace `packages/react/package.json` with:**

```json
{
  "name": "@montionugera/joy-react",
  "version": "0.2.0",
  "type": "module",
  "license": "UNLICENSED",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/montionugera/joy-design.git",
    "directory": "packages/react"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "files": [
    "dist"
  ],
  "sideEffects": false,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "node --test test/*.test.js",
    "check": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "@montionugera/joy-brand": "workspace:*",
    "@montionugera/joy-icons": "workspace:*",
    "@montionugera/joy-tokens": "workspace:*"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0"
  }
}
```

This also removes the `types` entry that pointed at the non-existent `src/index.d.ts` (a follow-up the spec says this feature closes).

- [ ] **Step 7: Run the contract test and see it pass.**

```bash
node --test scripts/test/publish-contract.test.mjs 2>&1 | tail -n 12
```

Expected: `# pass 13`, `# fail 0`, exit 0.

- [ ] **Step 8: Confirm the lockfile is still valid.** Version, metadata and script changes do not alter `workspace:*` links.

```bash
pnpm install --frozen-lockfile
git status --short pnpm-lock.yaml
```

Expected: exit 0; no lockfile change.

- [ ] **Step 9: Prove the type-check works through turbo with the `dist` exports, from clean.**

```bash
rm -rf packages/icons/dist packages/react/dist
pnpm check
ls packages/icons/dist/react.d.ts
```

Expected: `pnpm check` exits 0 (turbo runs `@montionugera/joy-icons#build` before `@montionugera/joy-react#check`, which now reads `dist/react.d.ts`); the file exists. Removing the two folders first makes this a clean-checkout proof; both are untracked build output.

- [ ] **Step 10: Run the affected package tests, one at a time.**

```bash
pnpm --filter @montionugera/joy-react test
pnpm --filter @montionugera/joy-icons test
pnpm --filter @montionugera/joy-svelte check
node --test 'scripts/test/*.test.mjs'
```

Expected: all exit 0. The React tests still load `src/` through `packages/react/test/helpers/load-tsx.js`, so they do not depend on `dist/`.

- [ ] **Step 11: Commit.**

```bash
git add scripts/test/publish-contract.test.mjs packages/tokens/package.json packages/icons/package.json packages/brand/package.json packages/react/package.json
git status --short
git commit -m "feat(packages): publish metadata, files allowlists and dist entry points for the four joy packages"
```

Expected: after the commit, `git status --short` shows no tracked changes.

- [ ] **Step 12: Phase gate for Tasks 3, 4 and 5.**
  1. Verify: Steps 7, 9 and 10 of this task passed with the output shown (do not re-run the full gate here; Task 9 runs it).
  2. Review: dispatch `code-reviewer` and `typescript-reviewer` in parallel on `git diff "$(git merge-base HEAD release/3.7)"..HEAD -- packages/react/tsconfig.build.json packages/icons/tsconfig.build.json packages/icons/src/react.ts 'packages/*/package.json' scripts/test/publish-contract.test.mjs` plus any source file changed in Task 3 Step 5. Brief: "Check the two build configs emit ES modules with declarations and nothing else; check each package's `files` covers every `exports` path; check `scripts/test/publish-contract.test.mjs` would fail if any metadata value drifted; report any behaviour change in component sources."
  3. Refactor: fix every finding in a new commit, then run `/simplify` on the same diff.
  4. Re-verify: re-run Steps 7, 9 and 10 of this task. Expected: same passing output.

### Task 6: The tarball test `scripts/test/consumer-smoke.sh`

**Files:**

- Create: `scripts/test/consumer-smoke.sh` (executable)
- Test: the script itself

**Interfaces:**

- Consumes: `build` scripts of `@montionugera/joy-icons` and `@montionugera/joy-react` (Tasks 3, 4); `files` allowlists and versions (Task 5); exports `Button`, `ButtonProps`, `Tabs`, `TabItem`, `BrandMark` from `@montionugera/joy-react`, `Check` and `IconProps` from `@montionugera/joy-icons/react`, `MARK` from `@montionugera/joy-brand`, and the subpath `@montionugera/joy-tokens/theme.css`.
- Produces: command `scripts/test/consumer-smoke.sh` (run from the repo root, no arguments, needs network access to `registry.npmjs.org`). Exit 0 and last line `consumer-smoke: PASS` on success; exit non-zero and a line starting `consumer-smoke: FAIL:` on any failure. Removes its temporary folder on every exit. It is not matched by the gate's `scripts/test/*.test.mjs` glob, so the gate does not run it.

- [ ] **Step 1: Write the failing check and see it fail.**

```bash
./scripts/test/consumer-smoke.sh; echo "exit $?"
```

Expected: `no such file or directory`, `exit 127`.

- [ ] **Step 2: Create `scripts/test/consumer-smoke.sh`.**

```bash
#!/usr/bin/env bash
# Tarball test for the four published packages (spec I-077, Phase 2 part 3).
#
# Packs @montionugera/joy-tokens, joy-icons, joy-brand and joy-react exactly as `pnpm publish`
# would, installs the tarballs into a fresh Vite + React 19 app in a temporary folder outside
# this workspace, then type-checks, builds and renders that app. It is the only check that
# loads the built output: the unit tests load src/ through their helpers.
#
# Usage: scripts/test/consumer-smoke.sh   (from anywhere; needs network for the app's own deps)
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
packages=(tokens icons brand react)

fail() {
  echo "consumer-smoke: FAIL: $*" >&2
  exit 1
}

work="$(mktemp -d "${TMPDIR:-/tmp}/joy-consumer-smoke.XXXXXX")"
work="$(cd "$work" && pwd -P)"
trap 'rm -rf "$work"' EXIT

case "$work/" in
  "$repo_root"/*) fail "temporary folder $work is inside the repo" ;;
esac

# Paths every tarball may contain, as one anchored pattern per package (the `files` table).
allowed_pattern() {
  case "$1" in
    tokens | react) echo '^package/(package\.json|dist/.+)$' ;;
    icons) echo '^package/(package\.json|PROVENANCE\.md|dist/.+|src/index\.ts|src/index\.d\.ts|src/[^/]+\.svelte)$' ;;
    brand) echo '^package/(package\.json|src/.+|assets/.+)$' ;;
  esac
}

# Paths every tarball must contain: each entry point named in that package's exports.
required_files() {
  case "$1" in
    tokens) echo "dist/theme.css dist/tailwind-theme.css dist/index.js dist/index.cjs dist/index.d.ts" ;;
    icons) echo "dist/react.js dist/react.d.ts dist/react/Check.js dist/react/Check.d.ts src/index.ts src/index.d.ts src/Check.svelte PROVENANCE.md" ;;
    brand) echo "src/index.js src/index.d.ts src/geometry.js src/render.js src/layout.js src/outlines.generated.js assets/mark.svg assets/favicon.svg" ;;
    react) echo "dist/index.js dist/index.d.ts dist/Button.js dist/Button.d.ts dist/Tabs.js dist/BrandMark.js" ;;
  esac
}

tarball_of() {
  echo "$work/tarballs/$1"/*.tgz
}

echo "==> 1/7 Building joy-icons and joy-react"
(cd "$repo_root" && pnpm --filter @montionugera/joy-icons build)
(cd "$repo_root" && pnpm --filter @montionugera/joy-react build)

echo "==> 2/7 Packing the four packages"
for pkg in "${packages[@]}"; do
  mkdir -p "$work/tarballs/$pkg"
  (cd "$repo_root/packages/$pkg" && pnpm pack --pack-destination "$work/tarballs/$pkg" > /dev/null)
  [ -f "$(tarball_of "$pkg")" ] || fail "pnpm pack produced no single tarball for $pkg"
done

echo "==> 3/7 Checking tarball contents"
for pkg in "${packages[@]}"; do
  tgz="$(tarball_of "$pkg")"
  list="$work/tarballs/$pkg/files.txt"
  tar -tzf "$tgz" | sort > "$list"
  echo "--- $(basename "$tgz"): $(wc -l < "$list" | tr -d ' ') files"
  if grep -E '(^|/)(test|tests|__tests__)/|\.test\.|\.spec\.|\.stories\.' "$list"; then
    fail "$pkg tarball contains a test or story file (listed above)"
  fi
  if grep -Ev "$(allowed_pattern "$pkg")" "$list"; then
    fail "$pkg tarball contains a path outside its files allowlist (listed above)"
  fi
  for required in $(required_files "$pkg"); do
    grep -qx "package/$required" "$list" || fail "$pkg tarball is missing $required"
  done
  if tar -xOzf "$tgz" package/package.json | grep -n 'workspace:'; then
    fail "$pkg tarball package.json still contains a workspace: range (listed above)"
  fi
done

echo "==> 4/7 Creating the consumer app in $work/app"
app="$work/app"
mkdir -p "$app/src"

TOKENS_TGZ="$(tarball_of tokens)" ICONS_TGZ="$(tarball_of icons)" BRAND_TGZ="$(tarball_of brand)" REACT_TGZ="$(tarball_of react)" \
  node -e '
const fs = require("node:fs");
const tarballs = {
  "@montionugera/joy-tokens": "file:" + process.env.TOKENS_TGZ,
  "@montionugera/joy-icons": "file:" + process.env.ICONS_TGZ,
  "@montionugera/joy-brand": "file:" + process.env.BRAND_TGZ,
  "@montionugera/joy-react": "file:" + process.env.REACT_TGZ,
};
const pkg = {
  name: "joy-consumer-smoke",
  private: true,
  version: "0.0.0",
  type: "module",
  dependencies: { ...tarballs, react: "^19.0.0", "react-dom": "^19.0.0" },
  devDependencies: {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    typescript: "^5.9.3",
    vite: "^7.0.0",
  },
  // joy-react depends on the other three by version; the overrides make those transitive
  // dependencies resolve to the local tarballs too, so nothing is fetched from the registry.
  pnpm: { overrides: tarballs, onlyBuiltDependencies: ["esbuild"] },
};
fs.writeFileSync(process.argv[1], JSON.stringify(pkg, null, 2) + "\n");
' "$app/package.json"

cat > "$app/index.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>joy consumer smoke</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > "$app/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
EOF

cat > "$app/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
EOF

cat > "$app/src/main.tsx" << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@montionugera/joy-tokens/theme.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF

cat > "$app/src/App.tsx" << 'EOF'
import { Button, Tabs, BrandMark, type ButtonProps, type TabItem } from '@montionugera/joy-react';
import { Check, type IconProps } from '@montionugera/joy-icons/react';

const items: TabItem[] = [
  { key: 'overview', label: 'Overview', content: <p>Overview panel</p> },
  { key: 'usage', label: 'Usage', content: <p>Usage panel</p> },
];

// Guards against the published types degrading to `any`: if they did, these two assignments
// would compile, the expect-error comments would be unused, and the type-check would fail.
// @ts-expect-error variant is a closed union of five strings
export const badVariant: ButtonProps['variant'] = 'not-a-variant';
// @ts-expect-error size is number | string, never a boolean
export const badSize: IconProps['size'] = true;

export function App() {
  return (
    <main>
      <BrandMark size={32} variant="tile" title="Joymify" />
      <Button variant="solid" size="md" iconStart={<Check size={16} />}>
        Save
      </Button>
      <Tabs items={items} />
    </main>
  );
}
EOF

cat > "$app/ssr-check.mjs" << 'EOF'
// Renders the same four pieces to a string under plain Node. A Vite build only compiles the
// components; this calls them, and it resolves every package through its published exports.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Tabs, BrandMark } from '@montionugera/joy-react';
import { Check } from '@montionugera/joy-icons/react';
import { MARK } from '@montionugera/joy-brand';
import * as tokens from '@montionugera/joy-tokens';

const html = renderToStaticMarkup(
  h(
    'main',
    null,
    h(BrandMark, { size: 32, variant: 'tile', title: 'Joymify' }),
    h(Button, { variant: 'solid', size: 'md', iconStart: h(Check, { size: 16 }) }, 'Save'),
    h(Tabs, {
      items: [
        { key: 'overview', label: 'Overview', content: 'Overview panel' },
        { key: 'usage', label: 'Usage', content: 'Usage panel' },
      ],
    }),
  ),
);

const needles = [
  'joy-brand-mark',
  MARK.viewBox,
  'joy-button--solid',
  'joy-button__label',
  '<polyline points="20 6 9 17 4 12"',
  'joy-tabs-container',
  'role="tab"',
];
const missing = needles.filter((needle) => !html.includes(needle));
if (missing.length > 0) {
  console.error('ssr-check: rendered markup is missing:', missing);
  process.exit(1);
}

const themeCss = fs.readFileSync(fileURLToPath(import.meta.resolve('@montionugera/joy-tokens/theme.css')), 'utf8');
if (!themeCss.includes('--joy-surface-canvas')) {
  console.error('ssr-check: theme.css does not define --joy-surface-canvas');
  process.exit(1);
}
if (Object.keys(tokens).length === 0) {
  console.error('ssr-check: the joy-tokens JavaScript entry exports nothing');
  process.exit(1);
}
console.log('ssr-check: rendered', html.length, 'characters of markup');
EOF

echo "==> 5/7 Installing the tarballs"
(cd "$app" && pnpm install --no-frozen-lockfile --ignore-workspace)

for pkg in "${packages[@]}"; do
  installed="$(cd "$app/node_modules/@montionugera/joy-$pkg" && pwd -P)"
  case "$installed/" in
    "$work"/*) ;;
    *) fail "joy-$pkg resolves to $installed, which is outside the temporary folder" ;;
  esac
done
if grep -nF "$repo_root" "$app/package.json" "$app/pnpm-lock.yaml"; then
  fail "the consumer app has a path into this repo (listed above)"
fi

echo "==> 6/7 Type-checking and building the consumer app"
(cd "$app" && pnpm exec tsc --noEmit -p tsconfig.json)
(cd "$app" && pnpm exec vite build)
[ -f "$app/dist/index.html" ] || fail "vite build produced no dist/index.html"
grep -rq -e '--joy-surface-canvas' "$app/dist/assets" || fail "the built CSS does not contain the joy-tokens theme"

echo "==> 7/7 Rendering Button, Tabs, the Check icon and BrandMark"
(cd "$app" && node ssr-check.mjs)

echo "consumer-smoke: PASS"
```

- [ ] **Step 3: Make it executable.**

```bash
chmod +x scripts/test/consumer-smoke.sh
bash -n scripts/test/consumer-smoke.sh; echo "syntax exit $?"
```

Expected: `syntax exit 0`.

- [ ] **Step 4: Run it and see it pass.**

```bash
./scripts/test/consumer-smoke.sh > "$TMPDIR/consumer-smoke.log" 2>&1; echo "exit $?"; tail -n 30 "$TMPDIR/consumer-smoke.log"
```

Expected: the seven `==>` stage lines, four `--- montionugera-joy-<name>-<version>.tgz: N files` lines, an `ssr-check: rendered ... characters of markup` line, last line `consumer-smoke: PASS`, `exit 0`. If stage 7 fails because a component module touches `window` or `document` when imported, that is a real defect a consumer would hit: stop and report it to the owner with the stack trace. Do not remove the check and do not change component behaviour in this feature.

- [ ] **Step 5: Prove it fails when it should, and cleans up.** Temporarily break the allowlist, run, then restore.

```bash
cp packages/brand/package.json "$TMPDIR/brand-package.json.bak"
node -e 'const fs=require("node:fs");const p="packages/brand/package.json";const j=JSON.parse(fs.readFileSync(p,"utf8"));j.files=["src","assets","test"];fs.writeFileSync(p,JSON.stringify(j,null,2)+"\n");'
./scripts/test/consumer-smoke.sh > "$TMPDIR/consumer-smoke.log" 2>&1; echo "exit $?"; tail -n 4 "$TMPDIR/consumer-smoke.log"
cp "$TMPDIR/brand-package.json.bak" packages/brand/package.json
git status --short packages/brand
find "${TMPDIR:-/tmp}" -maxdepth 1 -name 'joy-consumer-smoke.*' | wc -l
```

Expected: `consumer-smoke: FAIL: brand tarball contains a test or story file (listed above)`, `exit 1`; after the restore `git status` prints nothing; the last command prints `0` (no temporary folder left behind by either run).

- [ ] **Step 6: Confirm the gate scripts still accept the new file.**

```bash
node --test 'scripts/test/*.test.mjs' 2>&1 | tail -n 6
bash scripts/lint-colors.sh
```

Expected: both exit 0 (the script has no colour literal and is not matched by the `*.test.mjs` glob).

- [ ] **Step 7: Commit.**

```bash
git add scripts/test/consumer-smoke.sh
git status --short
git commit -m "test(packages): tarball smoke test that installs the packed packages into a fresh Vite + React 19 app"
```

Expected: after the commit, `git status --short` shows no tracked changes.

- [ ] **Step 8: Phase gate.** Shared with Task 7 (same subsystem: the publish pipeline); it runs at the end of Task 7.

### Task 7: The publish workflow `.github/workflows/publish.yml`

**Files:**

- Create: `.github/workflows/publish.yml`
- Modify: `scripts/test/publish-contract.test.mjs` (append one test block)
- Test: `node --test scripts/test/publish-contract.test.mjs`, `actionlint`

**Interfaces:**

- Consumes: `scripts/integration.sh` (existing gate); `scripts/test/consumer-smoke.sh` (Task 6); `build` scripts of `@montionugera/joy-icons` and `@montionugera/joy-react` (Tasks 3, 4); package folders `packages/tokens`, `packages/icons`, `packages/brand`, `packages/react` with the names and versions from Task 5.
- Produces: workflow `Publish packages to GitHub Packages` with trigger tag `packages-v*` and manual input `dry_run` (boolean, default `true`).

- [ ] **Step 1: Write the failing test.** Append to the end of `scripts/test/publish-contract.test.mjs`:

```js

test('the publish workflow gates, builds, tests, then publishes in dependency order', () => {
  const wf = read('.github/workflows/publish.yml');
  assert.match(wf, /^\s+- 'packages-v\*'$/m, 'trigger must be a packages-v* tag');
  assert.match(wf, /^\s+dry_run:$/m, 'manual runs need a dry_run input');
  assert.match(wf, /^\s+packages: write$/m, 'the job token needs packages: write');
  assert.ok(wf.includes('git merge-base --is-ancestor "$GITHUB_SHA" origin/main'), 'must refuse a commit that is not on main');
  for (const needle of ["flutter-version: '3.32.8'", 'playwright install --with-deps chromium', 'apt-get install -y -qq ripgrep', 'pnpm install --frozen-lockfile']) {
    assert.ok(wf.includes(needle), `runner setup must include: ${needle}`);
  }
  const order = [
    'run: ./scripts/integration.sh',
    'pnpm --filter @montionugera/joy-icons build',
    'pnpm --filter @montionugera/joy-react build',
    'git diff --exit-code',
    'run: ./scripts/test/consumer-smoke.sh',
    'pnpm publish --dry-run --no-git-checks',
    'pnpm publish --no-git-checks)',
  ];
  const positions = order.map((needle) => wf.indexOf(needle));
  for (const [i, pos] of positions.entries()) assert.ok(pos >= 0, `workflow must contain: ${order[i]}`);
  assert.deepStrictEqual(positions, [...positions].sort((a, b) => a - b), 'steps must run in gate, build, clean-tree, tarball-test, publish order');
  assert.ok(!/\bnpm publish\b/.test(wf.replace(/pnpm publish/g, '')), 'npm publish does not replace workspace:* and must not be used');
  assert.ok(wf.includes('npm view "$name@$version" version'), 'must ask the registry before publishing each package');
  const loops = wf.match(/for dir in ([a-z ]+); do/g) || [];
  assert.ok(loops.length >= 3, 'dry run, publish and verify each loop over the packages');
  for (const loop of loops) assert.strictEqual(loop, 'for dir in tokens icons brand react; do', 'packages must be handled in dependency order');
  assert.ok(!wf.includes('packages/brand && node build.js') && !wf.includes('joy-brand build'), 'the workflow must not run the brand build itself');
});
```

- [ ] **Step 2: Run it and see it fail.**

```bash
node --test scripts/test/publish-contract.test.mjs 2>&1 | tail -n 8
```

Expected: exit 1 with `ENOENT: no such file or directory, open '.../.github/workflows/publish.yml'`; `# pass 13`, `# fail 1`.

- [ ] **Step 3: Create `.github/workflows/publish.yml`.** The runner setup repeats the `build` job of `.github/workflows/ci.yml` (same actions, versions, Flutter 3.32.8, Playwright Chromium, ripgrep), because the gate needs all three.

```yaml
name: Publish packages to GitHub Packages

# Publishes @montionugera/joy-tokens, joy-icons, joy-brand and joy-react.
# A published version is permanent, so this runs only on a deliberate act:
# a pushed tag matching packages-v*, or a manual run. Manual runs default to a dry run.
on:
  push:
    tags:
      - 'packages-v*'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Dry run: gate, build and tarball test, then pnpm publish --dry-run. Nothing is published.'
        type: boolean
        required: false
        default: true

permissions:
  contents: read
  packages: write

concurrency:
  group: publish-packages
  cancel-in-progress: false

env:
  REGISTRY_URL: https://npm.pkg.github.com
  DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && inputs.dry_run && 'true' || 'false' }}
  NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

jobs:
  publish:
    name: Gate, build, test, publish
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # A real publish must come from a commit that is on main. Dry runs may run from any branch.
      - name: Refuse a commit that is not on main
        if: env.DRY_RUN == 'false'
        run: |
          git fetch --no-tags origin '+refs/heads/main:refs/remotes/origin/main'
          if ! git merge-base --is-ancestor "$GITHUB_SHA" origin/main; then
            echo "::error::$GITHUB_REF_NAME ($GITHUB_SHA) is not on main. Publish only from a commit that has been merged to main."
            exit 1
          fi
          echo "$GITHUB_SHA is on main."

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.13.1

      - name: Setup Node 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@montionugera'

      - name: Set up Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.32.8'
          channel: 'stable'
          cache: true

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm --filter storybook-hub exec playwright install --with-deps chromium

      # scripts/lint-colors.sh and its self-test search with ripgrep, which the runner image lacks.
      - name: Install ripgrep
        run: sudo apt-get update -qq && sudo apt-get install -y -qq ripgrep

      # The gate rebuilds tokens and, through turbo's ^build edge on check, the brand assets.
      - name: Gate (scripts/precheck.sh via scripts/integration.sh)
        run: ./scripts/integration.sh

      # Only joy-icons and joy-react are built here; their dist/ is untracked.
      - name: Build joy-icons and joy-react
        run: |
          pnpm --filter @montionugera/joy-icons build
          pnpm --filter @montionugera/joy-react build

      # The bytes published must be the bytes in git: fail if the gate or build changed a tracked file.
      - name: Check the tree is unchanged
        run: |
          if ! git diff --exit-code > /dev/null; then
            echo "::error::The gate or build changed tracked files. Commit the regenerated output and tag again."
            git status --short
            git diff --stat
            exit 1
          fi
          echo "No tracked file changed."

      - name: Tarball test (scripts/test/consumer-smoke.sh)
        run: ./scripts/test/consumer-smoke.sh

      - name: Dry run (nothing is published)
        if: env.DRY_RUN == 'true'
        run: |
          mkdir -p "$RUNNER_TEMP/packs"
          echo "## Dry run: nothing was published" >> "$GITHUB_STEP_SUMMARY"
          for dir in tokens icons brand react; do
            name="@montionugera/joy-$dir"
            version="$(node -p "require('./packages/$dir/package.json').version")"
            echo "::group::$name@$version"
            (cd "packages/$dir" && pnpm publish --dry-run --no-git-checks)
            mkdir -p "$RUNNER_TEMP/packs/$dir"
            (cd "packages/$dir" && pnpm pack --pack-destination "$RUNNER_TEMP/packs/$dir" > /dev/null)
            echo "Tarball file list for $name@$version:"
            tar -tzf "$RUNNER_TEMP/packs/$dir"/*.tgz | sort
            echo "::endgroup::"
            echo "- \`$name@$version\`: $(tar -tzf "$RUNNER_TEMP/packs/$dir"/*.tgz | wc -l | tr -d ' ') files" >> "$GITHUB_STEP_SUMMARY"
          done

      - name: Publish the versions not yet on the registry
        if: env.DRY_RUN == 'false'
        run: |
          echo "## Publish" >> "$GITHUB_STEP_SUMMARY"
          for dir in tokens icons brand react; do
            name="@montionugera/joy-$dir"
            version="$(node -p "require('./packages/$dir/package.json').version")"
            err="$RUNNER_TEMP/npm-view-$dir.err"
            set +e
            found="$(npm view "$name@$version" version --registry "$REGISTRY_URL" 2> "$err")"
            code=$?
            set -e
            if [ "$code" -eq 0 ] && [ "$found" = "$version" ]; then
              echo "$name@$version is already on the registry: skipped."
              echo "- \`$name@$version\`: already published, skipped" >> "$GITHUB_STEP_SUMMARY"
              continue
            fi
            if [ "$code" -ne 0 ] && ! grep -q 'E404' "$err"; then
              echo "::error::Could not ask the registry about $name@$version (npm view exit $code)."
              cat "$err"
              exit 1
            fi
            echo "Publishing $name@$version"
            (cd "packages/$dir" && pnpm publish --no-git-checks)
            echo "- \`$name@$version\`: published" >> "$GITHUB_STEP_SUMMARY"
          done

      - name: Verify each version is on the registry
        if: env.DRY_RUN == 'false'
        run: |
          for dir in tokens icons brand react; do
            name="@montionugera/joy-$dir"
            version="$(node -p "require('./packages/$dir/package.json').version")"
            found=""
            for attempt in 1 2 3 4 5; do
              echo "Asking the registry for $name@$version (attempt $attempt of 5)"
              found="$(npm view "$name@$version" version --registry "$REGISTRY_URL" 2> /dev/null || true)"
              if [ "$found" = "$version" ]; then break; fi
              sleep 5
            done
            if [ "$found" != "$version" ]; then
              echo "::error::$name@$version is not visible on the registry after publish."
              exit 1
            fi
            echo "$name@$version is on the registry."
          done
```

Behaviour this encodes, matching the spec's error table: a failing gate or tarball test stops the job before the publish step; a version already on the registry is skipped and reported while the others still publish; a partial failure is fixed by re-running, because published versions are skipped. `npm view` exits 0 with empty output when the package exists but the version does not, and exits non-zero with `E404` when the package does not exist yet (the first publish); both mean "publish". Any other failure of `npm view` stops the job instead of being read as "not published".

- [ ] **Step 4: Run the contract test and see it pass.**

```bash
node --test scripts/test/publish-contract.test.mjs 2>&1 | tail -n 8
```

Expected: `# pass 14`, `# fail 0`, exit 0.

- [ ] **Step 5: Lint the workflow.**

```bash
actionlint .github/workflows/publish.yml; echo "exit $?"
```

Expected: no output, `exit 0`. `actionlint` and `shellcheck` are both installed in `/usr/local/bin` on the owner's machine, so the `run:` blocks are shell-linted too. If it reports a finding, fix the line it names in `publish.yml`, re-run Step 4 and this step.

- [ ] **Step 6: Confirm the existing docs and CI contract still pass.**

```bash
node --test 'scripts/test/*.test.mjs' 2>&1 | tail -n 6
```

Expected: `# fail 0`, exit 0.

- [ ] **Step 7: Commit.**

```bash
git add .github/workflows/publish.yml scripts/test/publish-contract.test.mjs
git status --short
git commit -m "ci(publish): tag-or-manual workflow that gates, tests tarballs and publishes the four joy packages"
```

Expected: after the commit, `git status --short` shows no tracked changes. This commit only adds a workflow file; it publishes nothing and pushes no tag.

- [ ] **Step 8: Phase gate for Tasks 6 and 7.**
  1. Verify: Task 6 Step 4 (`consumer-smoke: PASS`, exit 0), and Steps 4 and 5 of this task passed with the output shown.
  2. Review: dispatch `code-reviewer` and `typescript-reviewer` in parallel on `git diff "$(git merge-base HEAD release/3.7)"..HEAD -- scripts/test/consumer-smoke.sh .github/workflows/publish.yml scripts/test/publish-contract.test.mjs`. Brief: "Look for a path where the workflow could publish after a failed gate or tarball test, publish out of dependency order, publish from a commit not on main, or treat a registry error as 'not published'. In the script, look for a failure that exits 0, a temporary folder that survives, a dependency that could resolve to this repo's source in place of a tarball, and anything that would not run under bash 3.2 on macOS or bash 5 on Ubuntu."
  3. Refactor: fix every finding in a new commit, then run `/simplify` on the same diff.
  4. Re-verify: re-run Task 6 Step 4 and Steps 4 and 5 of this task. Expected: same passing output.

### Task 8: README "Install from the registry" and the `AGENTS.md` build note

Package names throughout `README.md`, `AGENTS.md` and `PRODUCT.md` were rewritten in Task 1 Step 3, in the same commit as the manifests, because `scripts/test/docs-contract.test.mjs` fails whenever the docs cite a name that is not a workspace package. This task verifies that, then adds the new content.

**Files:**

- Modify: `scripts/test/docs-contract.test.mjs` (append one test)
- Modify: `README.md` (insert a section before `## Quality gates`, currently line 61; reword line 71)
- Modify: `AGENTS.md` (insert rule 5 before the `<!-- graft:start -->` line)
- Test: `node --test scripts/test/docs-contract.test.mjs`

**Interfaces:**

- Consumes: the four published names and versions (Tasks 1, 5); `scripts/test/consumer-smoke.sh` (Task 6); `.github/workflows/publish.yml`, tag pattern `packages-v*`, input `dry_run` (Task 7); the `^build` edge on `check` in `turbo.json`.
- Produces: README heading `## Install from the registry`; `AGENTS.md` rule `5. **Package builds and type-check**`.

- [ ] **Step 1: Verify the names in the live docs.**

```bash
grep -c "@joymify/" README.md AGENTS.md PRODUCT.md
grep -c "@montionugera/joy-" README.md
```

Expected: `README.md:0`, `AGENTS.md:0`, `PRODUCT.md:0`; then `21` (the number of README lines that name a package before this task adds more).

- [ ] **Step 2: Write the failing test.** Append to the end of `scripts/test/docs-contract.test.mjs`:

```js

test('README documents installing from the registry, and AGENTS.md the build and type-check rule', () => {
  const readme = read('README.md');
  assert.match(readme, /^## Install from the registry$/m, 'README needs the Install from the registry section');
  for (const needle of [
    '@montionugera:registry=https://npm.pkg.github.com',
    '//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}',
    "import '@montionugera/joy-tokens/theme.css';",
    "import { Button, Tabs } from '@montionugera/joy-react';",
    'read:packages',
    'scripts/test/consumer-smoke.sh',
    '.github/workflows/publish.yml',
    'packages-v',
  ]) {
    assert.ok(readme.includes(needle), `README must mention ${needle}`);
  }
  for (const name of packageNames) assert.ok(readme.includes(name), `README must name ${name}`);
  assert.ok(!/@joymify\/(tokens|icons|brand|react|svelte)/.test(readme), 'README must not use the old package scope');

  const agents = read('AGENTS.md');
  for (const needle of ['tsconfig.build.json', 'pnpm check', '^build', 'turbo.json', 'scripts/test/consumer-smoke.sh', '.github/workflows/publish.yml']) {
    assert.ok(agents.includes(needle), `AGENTS.md must mention ${needle}`);
  }
});
```

- [ ] **Step 3: Run it and see it fail.**

```bash
node --test scripts/test/docs-contract.test.mjs 2>&1 | tail -n 8
```

Expected: exit 1 with `README needs the Install from the registry section`.

- [ ] **Step 4: Add the README section.** Insert the block below immediately before the line `## Quality gates`, followed by one blank line.

````markdown
## Install from the registry

Four packages are published to GitHub Packages under the `@montionugera` scope. `@montionugera/joy-svelte` is not published yet; it is used inside this workspace only.

| Package | Ships | Import |
| --- | --- | --- |
| `@montionugera/joy-tokens` | Built CSS variables, component CSS, Tailwind theme and the JS token map. | `@montionugera/joy-tokens/theme.css`, `@montionugera/joy-tokens/tailwind`, `@montionugera/joy-tokens` |
| `@montionugera/joy-icons` | React icons as built JavaScript with type declarations; Svelte icons as source. | `@montionugera/joy-icons/react` (React), `@montionugera/joy-icons` (Svelte) |
| `@montionugera/joy-brand` | Brand geometry and SVG renderers (plain JavaScript with types) and the generated asset files. | `@montionugera/joy-brand`, `@montionugera/joy-brand/assets/*` |
| `@montionugera/joy-react` | The React components as built JavaScript with type declarations. | `@montionugera/joy-react` |

Add an `.npmrc` to the consuming repo:

```ini
# .npmrc in the consuming repo
@montionugera:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Install and use:

```bash
pnpm add @montionugera/joy-tokens @montionugera/joy-icons @montionugera/joy-react
```

```ts
import '@montionugera/joy-tokens/theme.css';
import { Button, Tabs } from '@montionugera/joy-react';
import { Check } from '@montionugera/joy-icons/react';
```

`@montionugera/joy-react` needs `react` and `react-dom` 18 or 19 as peers. The repo and its packages are private, so every install needs a token:

- **On a developer machine:** a personal GitHub token with the `read:packages` permission, exported as `GITHUB_TOKEN`.
- **In another repo's GitHub Actions:** that repo's automatic token cannot read these packages by default. Either grant that repo access in each of the four packages' settings on GitHub, or store a personal token as a secret in the consuming repo.

Fonts are still loaded by the consumer (see `DESIGN.md`).

### Publishing

Publishing is done only by `.github/workflows/publish.yml`. It runs on a pushed tag matching `packages-v*` whose commit is on `main`, or on a manual run, which defaults to a dry run. It runs `scripts/integration.sh`, builds `@montionugera/joy-icons` and `@montionugera/joy-react`, fails if any tracked file changed, runs the tarball test `scripts/test/consumer-smoke.sh`, then publishes tokens, icons, brand and react in that order, skipping any version already on the registry. Versions are set by hand in each `package.json`. A published version is never reused: fix a bad release by publishing a higher version.

`scripts/test/consumer-smoke.sh` also runs locally. It packs the four packages, installs the tarballs into a fresh Vite + React 19 app in a temporary folder outside this workspace, and type-checks, builds and renders it.
````

- [ ] **Step 5: Reword the type-check row of the gate table.** In `README.md`, in the table row for step `2b`, replace the cell text

```text
Type check: `tsc` for `@montionugera/joy-react` and `svelte-check` for `@montionugera/joy-svelte`, through turbo.
```

with

```text
Type check: `tsc` for `@montionugera/joy-react` and `svelte-check` for `@montionugera/joy-svelte`, through turbo, which builds dependencies first (`check` depends on `^build`).
```

That sentence is the whole cell; the trailing padding spaces before the closing `|` may stay. Find the row with `grep -n "| 2b " README.md`.

- [ ] **Step 6: Add the rule to `AGENTS.md`.** Insert the block below immediately before the line `<!-- graft:start -->`, followed by one blank line.

```markdown
5. **Package builds and type-check**:
   - `@montionugera/joy-react` and the `./react` entry of `@montionugera/joy-icons` resolve to a built, untracked `dist/` (`tsc -p tsconfig.build.json`). Run the type-check through turbo with `pnpm check`: in `turbo.json`, `check` depends on `^build`, so dependencies are built first. `pnpm --filter @montionugera/joy-react check` on a clean checkout fails until `pnpm --filter @montionugera/joy-icons build` has run.
   - Unit tests load `src/` through their helpers and never need `dist/`. The only check of the built output is the tarball test `scripts/test/consumer-smoke.sh`.
   - Publishing is done only by `.github/workflows/publish.yml` (a `packages-v*` tag on `main`, or a manual dry run). Never run `npm publish`, or `pnpm publish` without `--dry-run`, by hand.
```

- [ ] **Step 7: Run the docs tests and see them pass.**

```bash
node --test 'scripts/test/*.test.mjs' 2>&1 | tail -n 6
node scripts/gen-design-md.mjs --check; echo "exit $?"
```

Expected: `# fail 0`; `exit 0` (the hand-written section sits outside the generated README regions).

- [ ] **Step 8: Commit.**

```bash
git add README.md AGENTS.md scripts/test/docs-contract.test.mjs
git status --short
git commit -m "docs: install from the registry, publishing, and the build-before-check rule"
```

Expected: after the commit, `git status --short` shows no tracked changes.

- [ ] **Step 9: Phase gate.** Shared with Task 9, which is the final Phase 2 gate.

### Task 9: Local dry run and final Phase 2 gate

**Files:**

- Modify: only what the review finds.
- Test: `./scripts/test/consumer-smoke.sh`, `pnpm publish --dry-run --no-git-checks` in each of the four package folders, `./scripts/integration.sh` (the one full gate run of Phase 2).

**Interfaces:**

- Consumes: everything from Tasks 1 to 8.
- Produces: a local green dry run. This is where the plan ends.

- [ ] **Step 1: Run the full gate once.**

```bash
PLAYWRIGHT_PORT=6177 ./scripts/integration.sh 2>&1 | tail -n 25
git status --short
```

Expected: last gate line `==> All integration checks passed! <==`, exit 0; `git status` prints nothing (the local equivalent of the workflow's `git diff --exit-code`, including the brand assets and `apps/flutter-hub/pubspec.lock`).

- [ ] **Step 2: Run the tarball test.**

```bash
./scripts/test/consumer-smoke.sh > "$TMPDIR/consumer-smoke.log" 2>&1; echo "exit $?"; tail -n 30 "$TMPDIR/consumer-smoke.log"
```

Expected: last line `consumer-smoke: PASS`, `exit 0` (Acceptance 2).

- [ ] **Step 3: Dry-run publish each package, in dependency order, one at a time, and inspect each file list.**

```bash
(cd packages/tokens && pnpm publish --dry-run --no-git-checks) 2>&1 | tail -n 30
```

```bash
(cd packages/icons && pnpm publish --dry-run --no-git-checks) 2>&1 | tail -n 30
```

```bash
(cd packages/brand && pnpm publish --dry-run --no-git-checks) 2>&1 | tail -n 30
```

```bash
(cd packages/react && pnpm publish --dry-run --no-git-checks) 2>&1 | tail -n 30
```

Expected for each: exit 0, a tarball listing, and a final line naming the package and version (`@montionugera/joy-tokens@0.2.0`, `@montionugera/joy-icons@0.3.0`, `@montionugera/joy-brand@0.2.0`, `@montionugera/joy-react@0.2.0`) with the registry `https://npm.pkg.github.com`. `--dry-run` uploads nothing. Expected total files, including `package.json`: tokens 6 (5 in `dist`), icons 420 (278 in `dist`, 138 `.svelte`, `src/index.ts`, `src/index.d.ts`, `PROVENANCE.md`), brand 17 (6 in `src`, 10 in `assets`), react 207 (206 in `dist`). No path contains `test`, `.test.` or `.stories.` (Acceptance 3; the concrete-version half of Acceptance 3 is asserted by stage 3 of the tarball test).

- [ ] **Step 4: Confirm nothing was published and nothing was tagged.**

```bash
git tag --list 'packages-v*'
git status --short
```

Expected: both print nothing.

- [ ] **Step 5: Final phase gate for Tasks 8 and 9, and for Phase 2 as a whole.**
  1. Verify: Steps 1 to 4 of this task passed with the output shown.
  2. Review: dispatch `code-reviewer` and `typescript-reviewer` in parallel on the whole Phase 2 diff: `git diff "$(git log --format=%H -n 1 --grep='^refactor(packages): rename @joymify')"..HEAD`. Brief: "Check the diff against the spec at `.claude/refined_backlog/<this feature's folder>/spec.md`, sections Phase 2 parts 1 to 4, Error handling and Acceptance items 2 to 4. Report anything the spec requires that is missing, anything present that the spec does not ask for, and any way a real publish could happen without a `packages-v*` tag on main or a manual run with `dry_run` off."
  3. Refactor: fix every finding in a new commit, then run `/simplify` on the same diff.
  4. Re-verify: if step 3 changed any file, re-run Steps 1 to 4 of this task. Expected: same passing output.

- [ ] **Step 6: Stop here.** Report the evidence from Steps 1 to 4 and hand back to the owner. Do not push a tag. Do not run `pnpm publish` without `--dry-run`.

---

## After this plan (not tasks; owner decisions)

- **Hosted dry run (Acceptance 4).** A manually triggered workflow can only be started once its file exists on the default branch. So the GitHub-hosted dry run can only happen after the release branch that carries this feature has been merged to `main`. Then: Actions, "Publish packages to GitHub Packages", "Run workflow", `dry_run` left on. It is the first proof that the gate leaves tracked files unchanged on the Linux runner (deviation 5).
- **Real publish (Acceptance 5).** Pushing a `packages-v*` tag (or a manual run with `dry_run` off) is irreversible and is **out of this plan**. It needs the owner's separate, explicit go-ahead at that moment. After it, `npm view` must return the expected version for each of the four names, and the smoke app must install them from the registry and build.

## Acceptance map

| Spec acceptance item | Where it is met |
| --- | --- |
| 1. Search empty and `scripts/integration.sh` passes (Phase 1) | Task 1 Step 9; Task 2 Step 1 |
| 2. `scripts/test/consumer-smoke.sh` passes locally, no path into this repo | Task 6 Steps 2 and 4 (stage 5 of the script); Task 9 Step 2 |
| 3. Tarball file lists match the `files` table, no tests or stories, concrete versions | Task 5 (contract test); Task 6 (stage 3 of the script); Task 9 Step 3 |
| 4. Workflow dry run passes on GitHub, four packages in dependency order | Workflow written and contract-tested in Task 7; the hosted run is after merge to `main` (see above) |
| 5. After the real publish, `npm view` and registry install | Out of this plan; workflow's verify step is written in Task 7 |

## Audit trail

Plan written 2026-10-09; not yet independently audited.
