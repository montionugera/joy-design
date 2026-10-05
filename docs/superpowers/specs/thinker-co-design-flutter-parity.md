# Flutter Parity Ecosystem — Architectural Critique and Co-Design Recommendations

> **Document type:** Independent stress-test of a design spec and its implementation plan
> **Reviews:** `docs/superpowers/specs/2026-10-05-flutter-parity-ecosystem-design.md` (the spec) and `docs/superpowers/plans/2026-10-05-flutter-parity-ecosystem-plan.md` (the plan)
> **Intended location:** `docs/superpowers/specs/thinker-co-design-flutter-parity.md` in `joy-design` (the release guard blocked writing there from the main checkout)
> **Date:** 2026-10-05
> **Verdict:** The direction is right. The spec and plan are not ready to execute as written.

<div class="metric-grid">
<div class="metric-tile alarm">
<div class="metric-label">Components in the parity registry</div>
<div class="metric-val">91</div>
<div class="metric-desc">The spec's matrix covers roughly 55 of them; 32 have no Flutter plan</div>
</div>
<div class="metric-tile alarm">
<div class="metric-label">Plan tasks with real content</div>
<div class="metric-val">5 of 27</div>
<div class="metric-desc">Tasks 7 to 23 are empty step templates</div>
</div>
<div class="metric-tile">
<div class="metric-label">Proposed feature slices</div>
<div class="metric-val">5</div>
<div class="metric-desc">Recommended: about 14, across several releases</div>
</div>
<div class="metric-tile">
<div class="metric-label">Shared end-to-end contracts planned</div>
<div class="metric-val">5</div>
<div class="metric-desc">Against a stated goal of 100 percent sharing</div>
</div>
</div>

## Summary

The spec makes three promises that the plan cannot keep in its current form.

1. **"Exact token fidelity"** — the token generator in the plan hardcodes spacing, radius and theme colours, silently drops tokens it cannot parse, and would emit Dart that does not compile against the real `tokens.json`.
2. **"100 percent shared end-to-end tests"** — the example contract and runner are written in web terms (CSS selectors, `:focus`, `data-theme`) that have no meaning on a Flutter canvas. Most of what the spec wants to prove on Flutter cannot be observed through the browser at all.
3. **"Triplet parity for every component"** — the registry the gate reads has 91 components; the spec lists about 55 and invents its own feature numbering. The gap is never acknowledged.

The fix is not more effort on the same shape. It is three structural changes:

- **Build one component end to end first.** Button goes through every layer (tokens, widget, contract, both runners, both gates) before any second widget is written. The plan currently builds 60 widgets and designs the test contract last.
- **Run the shared contract natively in Flutter widget tests**, and reduce Playwright-over-Flutter-Web to a small smoke suite. The contract stays shared; the fragile runner stops being load-bearing.
- **Replace the five giant slices with about fourteen small ones spread over several releases**, tracked by a per-component manifest so the gate goes green incrementally.

<div class="callout warn">
<strong>How this was checked.</strong> Repository facts below were read directly from the working tree (file and line cited). Statements about Flutter engine behaviour come from knowledge of the framework, not from a run in this repo: no Flutter code exists here yet and nothing was executed. Section 7 lists the spikes that turn those statements into evidence.
</div>

---

## 1. Findings verified against the repository

These are defects in the spec or plan that can be confirmed by reading the repo today. Each one would stop or mislead an implementer.

### 1.1 Scope: the registry is much larger than the spec

`scripts/parity-check.mjs:6-104` lists 91 components. The spec's matrix (section 5) omits these 32:

| Group | Missing from the spec's matrix |
| :--- | :--- |
| Forms | `Mentions`, `Upload`, `TreeSelect`, `Cascader`, `Transfer`, `MarkdownEditor` |
| Display and navigation | `Anchor`, `MarkdownViewer`, `Statistic` |
| Charts | `BarChart`, `LineChart`, `CandlestickChart` |
| Landing | `CTASection`, `PricingCard`, `FeatureCard`, `FeatureGrid`, `LogoCloud`, `StatsSection`, `TestimonialCard`, `FAQSection`, `SiteFooter`, `LandingPage`, `LandingAction` |
| Brand | `BrandMark`, `Wordmark`, `Ribbon`, `BrandBanner`, `Emblem` |
| Domain | `PerformanceBars`, `ChronometerDial`, `TelemetryStrip`, `CommandIsland` |

The plan's own global constraint says every component in that registry must exist in all three frameworks. As written, the gate would be red until all 91 exist, or someone quietly narrows the list. Neither is planned.

The charts matter most: `CandlestickChart` and `LineChart` are exactly what a mobile trading view needs, and they are the most expensive widgets to build (custom painting, gestures). They appear nowhere.

### 1.2 The token generator in the plan does not match `tokens.json`

Plan Task 2 contains a full generator script. Compared with the real file:

| What the plan's generator does | What `packages/tokens/src/tokens.json` actually contains | Consequence |
| :--- | :--- | :--- |
| Hardcodes `space4/8/16/24/32` and `radiusSm/Md/Lg` | Spacing keys are ordinal: `space.1` is `4px`, `space.2` is `8px` (lines 1452-1463) | The single source of truth is bypassed on day one; names disagree with the CSS variables web engineers already know |
| Loops two levels under `color` | `color.status.success.100` is three levels deep (lines 209-213) | Every status primitive is silently skipped |
| Emits three surface colours with literal hex fallbacks | `semantic.light.surface` has 16 keys; there are 10 semantic groups including `brand`, `court`, `result` (lines 346-663) | Theme is a stub with invented colours; `JoyColors.neutral50 ?? const Color(...)` is a null-check on a non-nullable constant and fails analysis |
| Converts keys to identifiers directly | Keys include `default` (lines 449, 467), `clay-bg`, `danger-solid-bg`, and numeric `"0"` (line 563) | `default` is a reserved word in Dart; hyphens and leading digits are not legal identifiers |
| Knows only light and dark | Six palette presets, each with light and dark, plus an outdoor mode (lines 980-1316; `build.js:6819-6828`) | Flutter apps cannot use the palettes the web hub already ships |
| Ignores elevation, type and motion | Elevation is multi-layer CSS `box-shadow` text, some `inset` (lines 562-592); three font sizes use `clamp()` with viewport units (lines 1394-1402); letter spacing is in `em` | None of these translate one-to-one; each needs an explicit rule |
| Returns black for any unparseable colour; `lerp` returns `this` | — | Silent wrong output; theme transitions snap instead of animating |

The spec's sample output also shows `navy50 = 0xFFF0F4F8`; the real value is `#ecf2fc` (line 5). Illustrative, but it shows the samples were not generated from the source.

### 1.3 Plan steps that cannot pass as written

- **Task 1, step 4** expects `flutter analyze` to report no issues, but the barrel file exports `src/tokens/joy_tokens.g.dart`, which Task 2 creates. An export of a missing file is an analysis error.
- **Task 1 pubspec** declares Dart `>=3.3.0` and Flutter `>=3.19.0`; the spec says Flutter 3.32 and Dart 3.8. The known consumer, `joy-coach-app`, already requires Dart `^3.8.1`. Pick one floor: Dart 3.8.
- **Task 1 barrel** uses `library joymify_flutter;`, which current lint sets flag as an unnecessary library name. Under `--fatal-infos` that fails the gate the same task introduces.
- **Task 3, step 1** writes a test file with `echo "// test \u{1F7E2}"`. Bash does not expand that escape, so the file contains no emoji and the "failing test" proves nothing.
- **Task 3** adds `packages/flutter/lib` to the colour linter, but the linter's pattern (`scripts/lint-colors.sh:35`) only matches `#hex`, `rgb()`, `hsl()` and CSS variable fallbacks. It cannot see `Color(0xFF...)` or `Colors.blue`. The plan describes the needed change in a comment and does not write it.
- **Spec section 6.1** refers to `scripts/check-zero-emoji.py`. No such file exists; the check is inline Python in `scripts/precheck.sh:15-36`. That walker skips `node_modules`, `dist` and a few others, but not Flutter's `build/` or `.dart_tool/`, so it will crawl compiled web output on every run.
- **Spec section 6.1** runs `flutter test packages/flutter/test/contrast_test.dart` from the repo root; `flutter test` must run inside the package directory.
- **Spec section 8** names the features F-063 to F-067. The release tool reports 57 features and 62 ideas, so the next idea is I-063 but the next feature is F-058. Never hardcode identifiers the tool mints.

### 1.4 Gate and pipeline facts the spec overlooks

- **Gate 1 (`scripts/precheck.sh`, the pre-ship build and test check) already runs the full Playwright suite** (line 64), and Gate 2 (`scripts/integration.sh`, the release integration check) calls Gate 1 (line 12). Anything added to Gate 1 runs twice per release and once per feature.
- **CI has no Flutter toolchain.** `.github/workflows/ci.yml` installs Node, pnpm, Playwright and ripgrep only. `Dockerfile`, `nginx.conf` and `package.json` contain no reference to Flutter.
- **The Playwright server is `npx serve dist` on port 6116** (`apps/storybook-hub/playwright.config.ts:33`). The spec's `http://localhost:6116/flutter/` only works if the Flutter build is copied into the hub's `dist` and built with a matching base path. Nothing in the plan does that.
- **The main checkout is dirty.** `packages/tokens/build.js`, `packages/tokens/dist/theme.css`, and the `Dropdown` and `Select` twins have uncommitted changes, and two Playwright specs are untracked. Plan Task 2 modifies `build.js`. Settle that work before opening the release.
- **The spec, the plan and the architecture diagram are themselves untracked files on `main`.** The release guard blocks edits there, so they need a home on a branch before anyone can revise them.

---

## 2. Triplet parity in one monorepo — blast radius and blind spots

### 2.1 Parity is defined in web terms today

The existing checker is built on class names, `React.forwardRef`, rest-prop spreading and Svelte `$bindable` (`scripts/parity-check.mjs:106-209`). None of those concepts exist in Flutter. "Extend the script to parse Flutter exports" understates the work: a third framework needs a **neutral description of a component's API**, with the three implementations checked against it rather than against each other.

The spec's own matrix already breaks "shared prop names": `JoyButton` takes `onPressed` and `child`, `JoyInput` takes a `controller`, `JoyModal` uses `visible`. Those are the correct Flutter idioms. The contract should say so instead of pretending the names match.

**Recommendation — an API manifest per component, one file each:**

```json
{
  "component": "Button",
  "targets": { "react": "required", "svelte": "required", "flutter": "required" },
  "props": {
    "variant": { "enum": ["solid", "outline", "ghost", "danger", "link"] },
    "size": { "enum": ["sm", "md", "lg"] },
    "loading": { "type": "boolean" },
    "disabled": { "type": "boolean" }
  },
  "events": { "activate": { "react": "onClick", "svelte": "onclick", "flutter": "onPressed" } },
  "content": { "react": "children", "svelte": "children", "flutter": "child" }
}
```

- `targets.flutter` is `required`, `planned`, or `not-applicable` with a written reason. The gate only allows movement toward `required` (a ratchet). This follows the convention already in the checker: lists start empty and each lane adds its names in the commit that makes them pass (`parity-check.mjs:163-164`).
- One file per component removes the merge-conflict hotspot that a single shared array creates when several lanes work in parallel.
- The Flutter side is read by a small Dart tool that prints each widget's constructor parameters as JSON. Parsing Dart with regular expressions from Node will break on named, optional and generic parameters.

### 2.2 Components that should not be forced into Flutter

A mobile library gains little from marketing sections. Recommended starting classification, for the owner to confirm:

| Classification | Components | Reason |
| :--- | :--- | :--- |
| Not applicable | `SiteFooter`, `LandingPage`, `LandingAction`, `LogoCloud`, `FAQSection`, `TestimonialCard`, `Anchor` | Website page furniture; no mobile screen uses it |
| Planned, later | `HeroSection`, `CTASection`, `PricingCard`, `PricingMatrix`, `FeatureCard`, `FeatureGrid`, `BentoCard`, `BentoGrid`, `StatsSection`, `MarkdownEditor`, `Mentions`, `TreeSelect`, `Cascader`, `Transfer` | Possible in-app use, low priority |
| Required, missing from the spec | The three charts, `Statistic`, `Upload`, `MarkdownViewer`, the five brand marks, the four domain widgets | Real mobile value |

### 2.3 Hard edge cases the spec does not address

- **Imperative overlays.** `Message`, `Toast` and `Notification` are called as `show()` on the web, where a global document exists. Flutter needs an overlay host in the widget tree and a `BuildContext`. This forces a root widget (see 5.1) and changes the API shape.
- **Controlled values.** React uses `value` plus `onChange`; Svelte allows `bind:value`; Flutter text fields prefer a controller. Decide once: every Flutter widget is controlled by `value` and `onChanged`, and text inputs additionally accept an optional controller.
- **Slots.** Svelte snippets and React `children` or render props become typed widget parameters or builder callbacks. Each slot in the manifest needs a named mapping.
- **"44 pixels on coarse pointers."** The web decides this with a CSS media query. Flutter has no equivalent. State the rule explicitly: 44 logical pixels minimum on iOS and Android always; the `control-height` token on desktop and on web with a mouse. Also decide whether the 44 is the painted size or the tappable size, because a 32-pixel chip with an enlarged tap area passes one definition and fails the other.
- **Platform adaptation is a declared divergence, not a parity failure.** `Select` as a bottom sheet, date pickers as modal calendars, drawers with swipe-to-dismiss, the Android back gesture closing a modal. The contract needs a field for these (section 4.4).
- **Things only mobile has.** System text scaling, safe areas and notches, the on-screen keyboard pushing content, right-to-left layout, reduced-motion settings, haptics. Web parity tests will never catch a regression in any of them; Flutter widget tests must.
- **Icons.** Parsing SVG at runtime for every icon is slow in long lists. Precompile the icon set at build time (vector graphics compiler or an icon font) and make sure icons inherit the current text colour so the colour rule holds.
- **Generated code and distribution.** The package is `publish_to: none`, so other repos will consume it as a git dependency. Git dependencies do not run build steps, so `joy_tokens.g.dart` must be committed, and the gate must fail when it is stale. The repo already has this pattern: `scripts/gen-design-md.mjs --check` (`precheck.sh:58`).

### 2.4 Toolchain blast radius

Adding `flutter analyze` and `flutter test` to Gate 1 makes the Flutter SDK a hard requirement for every feature in this repo, including pure web fixes, on every machine and agent that ships. That is acceptable only if it is deliberate:

- Pin the SDK version in the repo and in CI, so "works on my machine" differences in lints and rendering cannot occur.
- In Gate 1, fail loudly when the SDK is missing. Never skip silently; a gate that skips is decoration.
- Keep the Flutter web build and the browser run in Gate 2 only. They add minutes, and Gate 1 runs per feature.
- Exclude `build/` and `.dart_tool/` from the emoji walker and the colour linter.

---

## 3. Styling architecture for the widgets

### 3.1 Recommended layering

<div class="schematic">
Layer 1  Generated tokens        joy_tokens.g.dart — primitives as const, semantic sets per palette and brightness
            |
Layer 2  Theme carrier           JoyThemeTokens (ThemeExtension) + JoyTheme.data() building a complete ThemeData
            |
Layer 3  Component style         JoyButtonStyle.resolve(tokens, variant, size, states) — pure function, no widgets
            |
Layer 4  Widget                  Built from basic widgets: DecoratedBox, FocusableActionDetector, Semantics
</div>

- **Keep `ThemeExtension` as the carrier** (the spec's choice). It is the standard mechanism and gives animated light-to-dark transitions for free, provided `lerp` is implemented for real. Assumption: consuming apps use `MaterialApp`; confirm with `joy-coach-app`.
- **Also generate a complete `ThemeData`** from the same tokens (colour scheme, text theme, input, app bar, dialog). Consumer apps will use stock Material widgets beside Joy widgets; without this they render in Material's default purple. This is the single largest "framework surprise" for a mobile engineer.
- **Build Joy widgets from basic widgets, not from Material components.** Wrapping `ElevatedButton` or `Chip` imports Material's own state layers, ripples, minimum sizes and density rules. Those are colours and dimensions that no token controls and no regular-expression lint can see. Exceptions where rebuilding is not worth it: text editing (wrap the text field with every decoration overridden) and the date and time pickers (theme the platform pickers and declare the divergence).
- **Resolve style in a pure function per component.** Variant, size and interaction state go in; an immutable style comes out. This is unit-testable without pumping a widget, and it is where the token-to-widget mapping can be compared against the web twin's CSS.

### 3.2 Enforcing "zero hardcoded colours" mechanically

A lint on hex literals is not enough in Dart. The gate needs all of these, each with a self-test fixture in `scripts/test-lint-colors.sh` (the existing self-test for the linter):

| Rule | Catches |
| :--- | :--- |
| Ban `Color(`, `Color.from`, `HSLColor`, `HSVColor` outside the generated file | Literal colours in any form |
| Ban `Colors.` and `CupertinoColors.` | Stock palettes |
| Ban `.withOpacity(`, `.withAlpha(`, `.withValues(` in components | Colours derived at runtime that no token describes; add alpha tokens instead |
| Ban brightness conditionals such as `isDark ? a : b` in components | Dark mode derived in code, against the "dark is designed" principle |
| Ban `import 'package:flutter/material.dart'` under `lib/src/components/`, with a short allowlist | Material defaults leaking in through stock widgets |

Replace the spec's fallback `?? JoyThemeTokens.light` with a debug assertion. A silent light-theme fallback inside a dark app is a bug that hides itself.

### 3.3 Fidelity rules the generator must implement

**Principle: the generator fails on any token it cannot translate. No defaults, no skipped entries.**

| Token kind | Rule |
| :--- | :--- |
| Identifiers | Kebab case to camel case; a fixed table for reserved words (`default` becomes `base`); numeric keys get a prefix. Names follow the CSS variable (`--joy-space-4` becomes `JoySpace.s4`), so web and mobile engineers share vocabulary |
| Semantic sets | Emit every group and key found, for every palette preset and both brightness modes |
| Elevation | Parse each shadow layer into a `BoxShadow` list. `inset` has no Flutter equivalent: emit a separate inner-shadow description and paint it explicitly, or stop the build |
| Fluid font sizes | Emit minimum, maximum and slope; resolve against screen width at runtime |
| Line height and letter spacing | Line height becomes a multiplier with even leading distribution, otherwise text sits lower than in the browser. Letter spacing in `em` is multiplied by font size |
| Fonts | Bundle Inter, JetBrains Mono and Cormorant Garamond inside the package. Without this, Flutter Web downloads fallback fonts from a public CDN at runtime, which breaks offline CI and makes screenshots unstable |
| Motion | Durations become `Duration`; `cubic-bezier` becomes `Cubic` |

**Verification:** drop the hand-picked assertions (`expect(JoyRadius.radiusMd, 8.0)`). The generator also writes the resolved values as JSON; a Dart test loads it and compares every generated constant. A separate Dart contrast test is then redundant, because the existing JavaScript contrast gate already covers the same resolved values.

---

## 4. Shared end-to-end testing — critique and hardened design

### 4.1 Why the proposed runner will not work

Flutter Web paints into a canvas. Since Flutter 3.29 there is no HTML renderer. The only DOM that Playwright can query is the accessibility tree that Flutter mirrors into the page, and that tree is switched off until something asks for it.

| What the spec's runner does | What happens on Flutter Web |
| :--- | :--- |
| `page.getByRole('button', { name: 'Submit' })` straight after load | Finds nothing: the accessibility tree is not built until enabled |
| `waitForLoadState('networkidle')` | Says nothing about whether the first frame has painted; font and engine downloads make it slow or flaky |
| `assertElement: "[data-role='spinner']"` | CSS selectors over component internals do not exist; there are no component DOM nodes |
| `page.locator(':focus')` and "expect outline" | Flutter manages focus internally; the outline is pixels in the canvas, invisible to CSS |
| `setAttribute('data-theme', 'dark')` | Does nothing; Flutter does not read the attribute |
| "Contrast assertions" from computed styles | No computed styles exist for canvas content |
| `expectedEvent: onClick, expectedCount: 1` | Nothing in the page exposes callback counts, on either engine |
| Route `/flutter/#button` | Flutter's hash routing expects `#/button`; a bare fragment is not a route |
| 44-pixel check via `boundingBox()` | Returns the accessibility node's rectangle, which may be the painted size rather than the tappable size |
| Playwright `animations: 'disabled'` | Affects CSS animations only; Flutter animations keep running, so screenshots are unstable |
| `flutter build web --wasm` served by `npx serve` | Works in Chromium, but without cross-origin isolation headers the engine runs single-threaded. Performance in the test differs from production |

Other realities: lists only expose the rows currently on screen; dragging a slider needs stepped pointer moves; text entry goes through a hidden input that Flutter positions itself; touch gestures need a touch-enabled browser context.

### 4.2 The 1.5 percent pixel threshold is not a meaningful gate

Comparing a browser-rendered component with a Skia-rendered one pixel by pixel fails on text alone: different rasterisers, hinting and sub-pixel positioning. On a small component a 1.5 percent budget is exhausted by the label. On a full-page capture the same budget is so loose that a wrong border colour passes.

**Replace it with three checks that each mean something:**

1. **Per-engine baselines.** Each engine is compared against its own earlier screenshot, with a tight threshold. This catches regressions.
2. **Cross-engine geometry.** Compare the measured boxes: width, height, padding and gaps within one pixel. This catches layout drift between frameworks.
3. **Cross-engine colour sampling.** Read the pixel at declared points (centre of the surface, border edge) and require an exact match with the token value. This is the real test of token fidelity on a canvas.

### 4.3 Restructure: one contract, three runners

The deeper issue is the target. The consumers are iOS and Android apps. A Playwright run over Flutter Web tests Flutter's browser accessibility bridge, which no mobile user ever touches. It is the least representative place to prove mobile behaviour, and the most fragile.

<div class="schematic">
  [ Shared Contract Files: tests/contracts/*.contract.json ]
                    |
      +-------------+-------------+
      |                           |
      v                           v
  [ Playwright on Web Hub ]   [ Flutter Widget Test Runner ]  [ Playwright on Flutter Web ]
  (React &amp; Svelte Twins)     (Reads Same JSON Natively)      (Small Smoke Subset)
      |                           |                               |
      +-------------+-------------+                               |
                    |                                             v
                    v                                    [ Gate 2: Per Release ]
          [ Gate 1: Per Feature ]
</div>

- **Flutter widget tests become the primary Flutter runner.** A Dart test harness loads the same contract JSON and executes it with the framework's own test tools: real gesture dispatch, direct access to the semantics tree, exact tap-target measurement, text scaling, right-to-left. It runs in seconds, needs no browser, and fits in Gate 1.
- **Playwright over Flutter Web shrinks to a smoke suite** in Gate 2: the showcase loads, the accessibility tree appears, one interaction per component family works, and the screenshots for 4.2 are captured.
- The contract is still written once. What changes is which runner carries the weight.

### 4.4 Hardened contract schema

The contract must describe behaviour in neutral terms and leave the "how" to each runner.

```json
{
  "schema": 2,
  "component": "Button",
  "story": "button/default",
  "anchors": { "root": "joy.button.submit" },
  "cases": [
    {
      "name": "activate fires once",
      "arrange": { "props": { "variant": "solid" } },
      "act": [{ "do": "activate", "on": "root" }],
      "expect": [
        { "event": "activate", "count": 1 },
        { "semantics": { "role": "button", "label": "Submit", "enabled": true } }
      ]
    },
    {
      "name": "loading blocks activation",
      "arrange": { "props": { "loading": true } },
      "act": [{ "do": "activate", "on": "root" }],
      "expect": [
        { "event": "activate", "count": 0 },
        { "semantics": { "busy": true } }
      ]
    }
  ],
  "geometry": { "minHitTarget": { "width": 44, "height": 44, "when": "touch" } },
  "focus": { "reachableByKeyboard": true, "visibleIndicator": "sampled" },
  "adaptations": [
    { "target": "flutter", "note": "none" }
  ],
  "skip": []
}
```

Rules that make this robust:

- **Anchors, never selectors.** Each testable node carries a stable identifier. On the web twins it is `data-testid`. In Flutter it is the semantics `identifier`, which the web engine writes into the page as an attribute and which also becomes the native accessibility identifier on iOS and Android. Playwright's test-id attribute can be set per project, so `getByTestId` works unchanged on both engines. Role-and-name lookups break the moment copy changes or is translated.
- **A closed vocabulary of actions** (`activate`, `type`, `toggle`, `select`, `dismiss`, `focusNext`, `drag`). Each runner maps the verb to the right mechanism. No runner-specific fields in the contract.
- **Events are observed through a declared channel**, not inferred. See the bridge below.
- **State is asserted through semantics** (`enabled`, `checked`, `busy`, `expanded`, `selected`), not through the presence of an internal element such as a spinner node.
- **`adaptations` and `skip` are explicit and require a reason.** A case that cannot run on one runner is listed, counted and reported. "100 percent shared" becomes a measured number instead of a claim.
- **The schema is validated in Gate 1**, and a gate check confirms every `required` component in the manifest has a contract file.

### 4.5 The hub bridge

Both showcase apps expose the same small JavaScript object. The runner talks only to this object, never to engine internals.

```ts
interface JoyHubBridge {
  ready: Promise<void>;                 // first frame painted, fonts loaded, accessibility tree on
  events(): { name: string; anchor: string }[];
  reset(): void;
  setTheme(mode: 'light' | 'dark', palette?: string): Promise<void>;
  setTextScale(factor: number): Promise<void>;
  setMotion(enabled: boolean): Promise<void>;
}
// window.__joyHub
```

- **Hydration:** the Flutter showcase turns the accessibility tree on at start-up in test mode and resolves `ready` after the first frame. Every test awaits `ready`. This replaces `networkidle` and removes the main source of flakiness.
- **Events:** each story reports callbacks to `events()`. The web hub needs the same shim, since Playwright cannot count React callbacks either.
- **Determinism:** `setMotion(false)` stops Flutter animations before screenshots.

### 4.6 Playwright configuration changes

- Add separate projects (`flutter-desktop`, `flutter-mobile`) with their own base address and test-id attribute, instead of looping over engines inside a spec file. Failures are then reported per engine, and the Flutter projects can be excluded from Gate 1.
- Serve the Flutter build from its own server on a second port. Playwright accepts several servers; this avoids copying builds into the hub's `dist` and the base-path coupling.
- The current config retries once locally and twice in CI (`playwright.config.ts:25`). Retries hide flakiness. Record the retry rate for the Flutter projects and treat a rising rate as a failure.

---

## 5. Developer ergonomics for mobile engineers

Each item removes a specific surprise for someone building an app with `joymify_flutter`.

### 5.1 One-line setup

```dart
MaterialApp(
  theme: JoyTheme.light(),          // full ThemeData plus the Joy extension
  darkTheme: JoyTheme.dark(),
  builder: JoyScope.builder,        // overlay host for toasts, messages, notifications
  home: const HomeScreen(),
);
```

`JoyTheme.light(palette: JoyPalette.classic)` selects a preset. `JoyScope` is what makes `JoyToast.show(context, ...)` possible. A debug assertion with a clear message fires if a Joy widget is used without it.

### 5.2 Idiomatic Dart, with the mapping written down

- Enums instead of strings (`JoyButtonVariant.solid`), generics for values (`JoySelect<T>`), `onPressed` and `onChanged`, `child` and `children`.
- `const` constructors everywhere possible. The spec's `static final light` should be `static const`.
- One published table maps each web prop name to its Dart name. It is generated from the manifest in 2.1, so it cannot drift.

### 5.3 Token access that reads well

```dart
final joy = context.joy;
DecoratedBox(
  decoration: BoxDecoration(
    color: joy.surface.card,
    borderRadius: JoyRadius.md,
    boxShadow: joy.elevation.e2,
  ),
  child: Padding(padding: JoyInsets.all.s4, child: child),
);
```

Scales that do not change with theme (spacing, radius, duration) are static constants. Colours and shadows come from context. Provide ready-made `JoyGap.s4` spacers so engineers do not write raw numbers.

### 5.4 Mobile behaviour built in, and tested

- Respect system text scaling; test each widget at 1.0 and 2.0 for overflow.
- Use direction-aware padding and alignment so right-to-left layouts work.
- Modals, drawers and bottom sheets handle safe areas, the on-screen keyboard and the Android back gesture.
- Honour the reduced-motion setting.
- `JoyTable` on a phone: decide and document one behaviour (horizontal scroll with a fixed first column, or collapse to cards). Rows must be built lazily.
- Canvas-heavy widgets (`CourtRadar`, charts, `TrendLine`) sit behind a repaint boundary.

### 5.5 Distribution and versioning

- Document the dependency snippet (git URL, `path: packages/flutter`, pinned tag).
- Version the package independently of the hub's release number, with its own changelog.
- Deprecate before removing: one minor version with `@Deprecated` and a migration note.

### 5.6 A testing helper library for consumers

Export `package:joymify_flutter/testing.dart` with a `pumpJoy(tester, widget, {brightness, palette, textScale})` helper and the anchor identifiers as constants. App teams can then write integration tests against Joy widgets without guessing internals.

### 5.7 The showcase is also the catalogue

`apps/flutter-hub` should run on a simulator and a device, not only as a web build. It then serves as the living reference mobile engineers open, and as the place to check real touch, keyboard and font behaviour that the web build cannot show.

---

## 6. Plan and release lifecycle restructuring

### 6.1 Problems with the five-wave plan

- **The slices are too large.** Wave 3 is 22 widgets in one feature and one worktree. A per-phase independent review of that diff is not realistic, and one failing widget blocks the other 21 from shipping.
- **The riskiest work is last.** The contract schema, the showcase and the cross-engine runner all arrive in Wave 5, after about 60 widgets exist. Every lesson learned there (anchors, event reporting, semantics labels) must then be retrofitted into every widget.
- **Seventeen tasks are templates.** Tasks 7 to 23 say "write the failing test" with no test, no API and no acceptance criteria. An agent executing them will invent the contract per widget, which is the drift the plan exists to prevent.
- **Phase gates only verify.** Each ends with "run `precheck.sh`". There is no independent review and no refactor step, which the project's own phased quality gate requires.
- **One release holds everything.** With a single `release/3.00`, nothing reaches `main` until all waves finish, and unrelated web work either waits or is mixed in.
- **Shared files become bottlenecks.** Every lane edits the barrel export, the registry array and the README. Parallel worktrees will conflict on each ship.

### 6.2 Recommended slicing

<div class="callout action">
<strong>Slice 0 is a walking skeleton.</strong> Button alone, through every layer and both gates. Nothing else starts until it is green, because it fixes the conventions every later slice copies.
</div>

| Slice | Content | Why here |
| :--- | :--- | :--- |
| 0. Skeleton | SDK pin, CI toolchain, package scaffold, real token generator with round-trip test and staleness check, `JoyTheme`, `JoyButton`, API manifest, contract schema version 2, Dart contract runner, minimal showcase with bridge, one Playwright smoke test, colour and import lints with fixtures | Proves the architecture; every later slice is a copy of the pattern |
| 1. Foundation widgets | `JoyIcon` (precompiled icons), `JoyText`, `JoyScope` overlay host, layout primitives | Everything else composes these |
| 2. Simple form controls | Checkbox, Switch, RadioGroup, Segmented, Rate, Slider | Independent of each other |
| 3. Text inputs and Form | Input, InputNumber, Form, FormItem | Shares text-editing decisions |
| 4. Pickers | Select, DatePicker, TimePicker, DateRangePicker | Shares the platform-adaptation policy |
| 5. Overlays | Modal, Drawer, Popconfirm, Tooltip, Dropdown | Shares overlay and back-gesture handling |
| 6. Feedback | Alert, Message, Toast, Notification, Progress, Result, Skeleton, Spin | Uses the overlay host from slice 1 |
| 7. Navigation | Breadcrumb, Menu, Pagination, Steps, Tabs | Independent |
| 8. Data display | Avatar, Badge, Tag, EmptyState, Timeline, Image, Statistic, StatCard, MetricTile | Independent |
| 9. Table | `JoyTable` alone | Largest single widget; virtualisation and mobile layout |
| 10. Charts | BarChart, LineChart, CandlestickChart, TrendLine | Custom painting; missing from the spec |
| 11. Domain | VoiceCard, CourtRadar, MatchScoreboard, PerformanceFigure and the rest | Custom painting |
| 12. Brand | BrandMark, Wordmark, Emblem, Ribbon, BrandBanner | Small |
| 13. Hardening | Cross-engine geometry and colour sampling, text-scale and right-to-left sweep, consumer docs, pilot integration in `joy-coach-app` | Epic verification |

- **Slices 2 to 12 are independent lanes** once slice 1 lands. Run several in parallel worktrees.
- **Remove the shared-file conflicts first** (in slice 0): generate the barrel file from the directory listing, keep one manifest file per component, and generate the README component table.
- **Every slice ends with:** implement, verify, independent review, refactor, re-verify. Write that into each task.
- **Write real task bodies** for slices 0 and 1 now. Write the others just before they start, using slice 0 as the template, so they reflect what the skeleton taught.

### 6.3 Release sequencing

- **Ship the epic across several releases**, not one. For example: slice 0 and 1 in the next release, form slices in the one after. Each release promotes a working, gated increment. The Flutter package is not part of the production web deployment, so each promotion carries little risk.
- Reserve the 3.00 label for the release that completes the epic if the milestone name matters.
- Let the release tool mint identifiers. Remove the hardcoded idea and feature numbers from the spec.
- The pilot integration in slice 13 is the real acceptance test: a consuming app adds the dependency, wraps its root, and replaces one screen. Until that works, "effortless for mobile engineers" is unproven.

---

## 7. Spikes to run before committing to the plan

These are short experiments on the pinned Flutter version. Each turns an assumption in this document into evidence.

| Spike | Question it answers | Pass condition |
| :--- | :--- | :--- |
| Semantics identifier in the browser | Does the Flutter web build expose the semantics identifier as a page attribute that `getByTestId` can use? | One button found and clicked by identifier in Chromium |
| Activation through the accessibility node | Does a Playwright click on that node trigger the widget callback exactly once? | Event count is 1 over 50 repeats |
| Hidden text input | Does Playwright `fill` work on a Joy text field? | Value round-trips through the bridge |
| Canvas screenshots | Are two consecutive screenshots of a static story identical with motion off and fonts bundled? | Zero differing pixels over 20 runs |
| Tap-target measurement | Does the Dart widget test measure the tappable area rather than the painted area? | A 32-pixel visual with enlarged tap area reports 44 |
| Token round trip | Does the real generator compile against the full `tokens.json` under strict analysis? | Analysis clean; every constant equals the resolved JSON |
| CI cost | How long do SDK setup, analysis, widget tests and the web build take on the CI runner? | Gate 1 increase under two minutes; web build in Gate 2 only |

If the first two spikes fail, drop Playwright over Flutter Web entirely and rely on the Dart contract runner plus native integration tests. The contract design in section 4.4 does not change.

---

## 8. Change list for the spec and the plan

**Spec**

1. Replace the component matrix with the full 91-entry registry, each marked required, planned or not applicable with a reason.
2. Replace section 3.2's sample output with output from the real generator; state the fidelity rules in 3.3 of this document.
3. Add palette presets and outdoor mode to the theme design.
4. Rewrite section 7 around one contract and three runners; replace the 1.5 percent threshold with the three checks in 4.2.
5. Correct section 6: no `check-zero-emoji.py`; list the real lint rules; move the web build to Gate 2 only; add the CI toolchain and SDK pin.
6. Remove hardcoded idea and feature identifiers; describe multi-release sequencing.
7. State the 44-pixel rule precisely (platforms, and painted versus tappable).

**Plan**

1. Insert slice 0 (walking skeleton) and reorder so the contract runner and showcase come first.
2. Rewrite Task 2 with a data-driven generator, the reserved-word table, the staleness check and the round-trip test.
3. Fix Task 1 (SDK floor, lint set, barrel that does not export a missing file) and Task 3 (a real emoji fixture, written lint patterns, self-test fixtures).
4. Replace Task 4's regular-expression parsing with the API manifest and a Dart tool.
5. Split Tasks 7 to 23 into the slices in 6.2 and write full bodies only for the first two.
6. Add the review and refactor steps to every phase gate.
7. Add a first task that settles the uncommitted changes on the main checkout.

---

## 9. Decisions the owner needs to make

| Decision | Recommended default |
| :--- | :--- |
| Which of the 91 components are required in Flutter | The classification in 2.2 |
| Is Playwright over Flutter Web a gate or a smoke check | Smoke check in Gate 2; Dart contract runner is the gate |
| One release or several | Several; the skeleton ships first |
| Does the Flutter SDK become mandatory for all contributors | Yes, pinned, with a loud failure when missing |
| Build custom pickers or theme the platform ones | Theme the platform pickers; declare the divergence |
| Minimum Dart version | 3.8, matching `joy-coach-app` |
