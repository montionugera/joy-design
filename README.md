# Joymify Design System (`joy-design`)

Enterprise multi-platform design system and composed Storybook workshop powering the Joymify ecosystem:

- **Quant** (`quant-fe`, `quant-admin-fe`): Svelte 5 + SvelteKit high-density trading UI
- **JoyCoach** (`joy-coach-fe`): Svelte 5 coaching and scoring UI
- **AssetStudio** (`asset-studio`): React 19 visual generation & inspection suite
- **JoyQuest / Portal** (`joymify-portal`): Svelte 5 & React 19 interactive platform

## Architecture

| Package                               | What it is                                                                                                                                                                                                                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/tokens` (`@joymify/tokens`) | `src/tokens.json` is the only place colour values live. `node packages/tokens/build.js` generates `dist/theme.css` (CSS variables plus all component CSS), `dist/tailwind-theme.css` (Tailwind v4 `@theme`), and `dist/index.{js,cjs,d.ts}`.                                      |
| `packages/icons` (`@joymify/icons`)   | SVG icons as Svelte 5 components (`@joymify/icons`) and React components (`@joymify/icons/react`), with identical rendering.                                                                                                                                                      |
| `packages/brand` (`@joymify/brand`)   | The Joymify brand kit: geometry (`src/geometry.js`), pure SVG renderers (`src/render.js`), and `build.js`, which reads the light-theme `--joy-brand-*` values from `packages/tokens/dist/theme.css` and writes the static files in `assets/` (see [Brand kit](#brand-kit) below). |
| `packages/svelte` (`@joymify/svelte`) | Svelte 5 (Runes) components.                                                                                                                                                                                                                                                      |
| `packages/react` (`@joymify/react`)   | React 19 twins of the Svelte components: the same props, the same classes and ref forwarding.                                                                                                                                                                                     |
| `packages/flutter` (`joymify_flutter`) | Flutter 3.32+ / Dart 3.8.1 package providing semantic token parity (`JoyThemeTokens`), pure style resolvers, and native widgets (`JoyButton`). |
| `packages/contracts`                  | Declarative behavioral JSON contracts (`schemas/*.contract.json`) executed across Web and Flutter runners. |
| `apps/storybook-hub`                  | The unified Developer Portal at dev.joymify.com (with legacy 301 redirect from design.joymify.com). Serves the Developer Portal Hero Landing Page at `/`, fanning out to 3 isolated sub-webapps: Joy Design System (`/design/`), Node Server Decorator (`/server-decorator/`), and CLI State Handler (`/cli-state-handler/`) in a single high-performance Nginx pod. |
| `apps/flutter-hub`                    | The Flutter Web interactive showcase and Playwright bridge (`window.__joyHub`). |

### Developer Portal Architecture (`dev.joymify.com`)

The Joymify Developer Portal consolidates 3 core open-source libraries under a single domain on Vultr Kubernetes:

- **Web Root (`/`)**: Dedicated Developer Portal Hero Landing Page introducing the Joymify ecosystem and featuring 3 interactive launch cards for the sub-webapps. Any component hashes on root (e.g. `/#primitives`) automatically redirect to `/design/#primitives`.
- **Joy Design System (`/design/`)**: Multi-framework component suite (React 19, Svelte 5 runes, Flutter Web) with 70+ components and design token explorer.
- **Node Server Decorator (`/server-decorator/`)**: Polyglot microservices decorator suite (TypeScript, Python, Go, Nim) powered by Astro Starlight.
- **CLI State Handler (`/cli-state-handler/`)**: Deterministic terminal state machine, CAS content-addressed storage, and React Ink tutorial studio (browser-safe UCSA Studio).
- **Legacy Domain (`design.joymify.com`)**: Permanently redirects (HTTP 301) to `https://dev.joymify.com/design$request_uri`.
- **Local Portal Verification**: Run `pnpm dev:portal` to compile tokens, build all 3 sub-apps, and serve the unified portal at `http://localhost:6006/`.


Design references: **`DESIGN.md`** holds the visual system in the Google Stitch DESIGN.md format (colours in both themes with measured contrast, type, spacing, radius, elevation, z-index, motion, mobile rules, the per-component state matrix, and the ban list). It is generated by `node scripts/gen-design-md.mjs`, so never edit it by hand. **`PRODUCT.md`** covers register, users, principles and the accessibility bar. **`AGENTS.md`** holds the rules for agents. Specs and plans for each feature live in `.claude/refined_backlog/<F-NNN>/`.

### Token layers

1. **Primitives**: brand ramps (`--joy-color-navy-*`, `gold`, `ink`, `cream`, `neutral`, `status-*`). They only feed layer 2.
2. **Semantic roles, per theme**: `--joy-surface-*`, `--joy-text-*`, `--joy-border-*`, `--joy-accent-*`, `--joy-status-*`, `--joy-focus-ring`, `--joy-elevation-*`. **This is the contract.** Components and consumers use these, together with the scale tokens (`--joy-space-*`, `--joy-radius-*`, `--joy-font-size-*`, `--joy-duration-*`, `--joy-ease-*`, `--joy-z-*`, `--joy-control-height-*`).
3. **Component CSS**: `.joy-*` classes in `dist/theme.css`, written only in terms of layer 2.

### Theme switching contract

Import the stylesheet once: `import '@joymify/tokens/theme.css'`. Light is the default. `data-theme="dark"` or `data-theme="light"` on `<html>` always wins. Without the attribute, `@media (prefers-color-scheme: dark)` applies dark through `:root:not([data-theme="light"])`. Set the attribute before first paint to avoid a flash. Components and charts repaint when it changes; charts also listen for the `joy-theme-change` event.

### Tailwind v4

`@import "@joymify/tokens/tailwind";` (which is `dist/tailwind-theme.css`) adds the tokens to Tailwind's `@theme`, so utilities such as `bg-joy-navy-500` resolve to the same values. Prefer the semantic CSS variables for anything theme-dependent.

### Consumer migration notes

- **Deprecated aliases.** The legacy `--joy-color-brand-*` and `--joy-color-surface-*` style names still resolve, but they are marked `@deprecated` in the types. The generated table under [Deprecated token aliases](#deprecated-token-aliases) maps each one to its semantic replacement.
- **No fallbacks.** Write `var(--joy-text-primary)`, never `var(--joy-text-primary, #333)`. The lint rejects fallbacks because they hide a missing stylesheet.
- **Icons (Wave 6).** Svelte icons now accept `strokeWidth` like the React icons (default `1.5`). The React filled and custom icons (such as `HeartFilled` and `ArrowLeft`) no longer stroke the root `<svg>`, so filled shapes lose the outline they wrongly had, and `strokeWidth` now takes effect. React `ZoomOut` draws a minus rather than a vertical bar. Filled icons cut their details out with `--joy-surface-canvas`.
- **React charts (Wave 6).** `BarChart`, `LineChart` and `CandlestickChart` now honour the `theme` prop. Before, it was never read and threw a ReferenceError when the chart mounted.
- **Chart `theme` prop is now live, both twins (Wave 6 review fix).** `BarChart`, `LineChart` and `CandlestickChart` used to apply `theme` only once, at mount — a later change to the prop was silently ignored. Both React and Svelte twins now re-apply it on every change via a new `JoyChartCore.setTheme(theme)` method, which mutates the existing chart instance in place and repaints (no instance recreation, no leaked canvas listeners).
- **Ant Design 5 Quality Bar & Custom DatePickers.** Replaced unstyled native `<input type="date">` with custom accessible popover overlays. `DatePicker` provides `<< < Month Year > >>` navigation, 7x6 day grid, out-of-month muted cells, today highlight, quick-pick "Today", `min`/`max` boundary clamping, `disabledDate?: (current: Date) => boolean` predicate, `blackoutDates?: string[]`, and `blackoutRanges?: Array<[string, string]>`. `DateRangePicker` introduces a unified trigger pill `[ Start Date → End Date (x) [Calendar] ]` with side-by-side dual calendars (Month 1 & Month 2), continuous hover range trail highlighting intervals at 60fps, clear action `(x)`, financial presets (`Today`, `Last 7 Days`, `Last 30 Days`, `MTD`, `YTD`), and `forbidCrossBlackout?: boolean` to block selecting range spans across blackout windows. Shared `calendar-utils.ts` powers both React 19 and Svelte 5 twins with byte-identical parity.

## Quality gates

**Gate 1** is `bash scripts/precheck.sh`. It runs before every ship, and CI runs it through `scripts/integration.sh`. Set a distinct `PLAYWRIGHT_PORT` per worktree.

| Step | Command                                                               | What it enforces                                                                                                                                                                                         |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | `pnpm install --frozen-lockfile`                                      | Workspace packages are linked, including any package a merge just added.                                                                                                                                 |
| 1    | emoji scan (inline Python)                                            | No raw OS emoji in tracked files.                                                                                                                                                                        |
| 2    | `bash scripts/lint-colors.sh`                                         | No hex, `rgb()`/`hsl()` or `var(--joy-*, fallback)` in any package source or the hub. Every hit fails. Narrow exceptions live in `scripts/lint-colors.allow`.                                            |
| 2a   | `bash scripts/test-lint-colors.sh`, `bash scripts/test-epic-check.sh` | Self-tests: the gate scripts still catch what they claim to.                                                                                                                                             |
| 2b   | `pnpm check`                                                          | Type check: `tsc` for `@joymify/react` and `svelte-check` for `@joymify/svelte`, through turbo.                                                                                                          |
| 2c   | `pnpm -r test`                                                        | Unit tests for every package, including the WCAG 2.2 AA contrast gate in both themes (`packages/tokens/test/contrast.test.js`) and icon Svelte/React parity (`packages/icons/test/icon-parity.test.js`). |
| 2d   | `node scripts/parity-check.mjs`                                       | Svelte and React twins: props, classes and ref forwarding. It must report 0 violations.                                                                                                                  |
| 2e   | `node --test 'scripts/test/*.test.mjs'`                               | DESIGN.md generator tests, the docs contract (AGENTS.md, PRODUCT.md, README and CI stay true to the code), and byte-identical shared helpers.                                                            |
| 2f   | `node scripts/gen-design-md.mjs --check`                              | `DESIGN.md` and the generated README regions are up to date with the tokens.                                                                                                                             |
| 2g   | `(cd packages/flutter && flutter analyze --fatal-infos && flutter test)` | Flutter strong analysis (strict casts/inference/raw-types) and native widget/contract tests. |
| 3    | `node apps/storybook-hub/build.js`                                    | The hub builds.                                                                                                                                                                                          |
| 4    | Playwright (`apps/storybook-hub/tests/*.spec.ts`)                     | Hub and component contracts at 375px and 1280px in light and dark: overflow, contrast, 44px targets, focus, reduced motion, and slop sweeps.                                                             |

Also available:

- `bash scripts/epic-check.sh` runs the design-system subset: colour lint, parity, design doc drift, type check, workspace tests, hub build and Playwright.
- `bash scripts/integration.sh` runs the token build, the package tests and Gate 1, then checks that the k8s manifests exist. This is what CI runs.
- CI (`.github/workflows/ci.yml`) runs `pnpm check`, then `scripts/integration.sh`.

## What production-grade means here

A component or screen is done when all of these are true:

- [ ] Every colour, space, radius, shadow, duration and z-index is a token, with no literals and no fallbacks.
- [ ] Both themes are designed, and dark is not inverted light.
- [ ] Contrast is computed and meets AA: 4.5:1 for body text, and 3:1 for large text and UI boundaries.
- [ ] Every interactive state it can reach is styled (default, hover, focus-visible, active, disabled, and loading, error or selected where they apply) at every size it ships.
- [ ] Touch targets are at least 44px on coarse pointers, and nothing scrolls horizontally at 375px.
- [ ] Every animation respects `prefers-reduced-motion`.
- [ ] It is keyboard operable with a visible focus ring. Overlays close on Escape, and modals trap focus and return it to the opener.
- [ ] The Svelte and React twins match (`scripts/parity-check.mjs`).
- [ ] Nothing from the ban list in `DESIGN.md` appears: no emoji, gradient text, side stripes, or glassmorphism.
- [ ] It has been checked in both themes at 375px and 1280px, and Gate 1 exits 0.

## Component inventory

<!-- BEGIN GENERATED:component-inventory -->
<!-- Generated by scripts/gen-design-md.mjs. Do not edit by hand. -->

91 components; 90 are held to Svelte/React parity by `scripts/parity-check.mjs` (props, classes, ref forwarding).

| Component | Svelte | React | Parity |
| --- | --- | --- | --- |
| `Alert` | yes | yes | parity-gated |
| `Anchor` | - | yes | React only |
| `Avatar` | yes | yes | parity-gated |
| `AvatarGroup` | yes | yes | parity-gated |
| `Badge` | yes | yes | parity-gated |
| `BarChart` | yes | yes | parity-gated |
| `BentoCard` | yes | yes | parity-gated |
| `BentoGrid` | yes | yes | parity-gated |
| `BrandBanner` | yes | yes | parity-gated |
| `BrandMark` | yes | yes | parity-gated |
| `Breadcrumb` | yes | yes | parity-gated |
| `Button` | yes | yes | parity-gated |
| `CTASection` | yes | yes | parity-gated |
| `CandlestickChart` | yes | yes | parity-gated |
| `Cascader` | - | yes | React only |
| `Checkbox` | yes | yes | parity-gated |
| `ChronometerDial` | yes | yes | parity-gated |
| `CommandIsland` | yes | yes | parity-gated |
| `CourtRadar` | yes | yes | parity-gated |
| `DatePicker` | yes | yes | parity-gated |
| `DateRangePicker` | - | yes | React only |
| `DenseRow` | yes | yes | parity-gated |
| `Divider` | yes | yes | parity-gated |
| `Drawer` | yes | yes | parity-gated |
| `Dropdown` | - | yes | React only |
| `Emblem` | yes | yes | parity-gated |
| `EmptyState` | yes | yes | parity-gated |
| `FAQSection` | yes | yes | parity-gated |
| `FeatureCard` | yes | yes | parity-gated |
| `FeatureGrid` | yes | yes | parity-gated |
| `Flex` | yes | yes | parity-gated |
| `Form` | yes | yes | parity-gated |
| `FormItem` | - | yes | React only |
| `HeroSection` | yes | yes | parity-gated |
| `Image` | yes | yes | parity-gated |
| `ImagePreview` | - | yes | React only |
| `Input` | yes | yes | parity-gated |
| `InputNumber` | yes | yes | parity-gated |
| `JoyChartCore` | - | yes | React only |
| `LandingPage` | yes | yes | parity-gated |
| `LineChart` | yes | yes | parity-gated |
| `LogoCloud` | yes | yes | parity-gated |
| `MarkdownEditor` | yes | yes | parity-gated |
| `MarkdownViewer` | yes | yes | parity-gated |
| `MatchScoreboard` | yes | yes | parity-gated |
| `Mentions` | - | yes | React only |
| `Menu` | - | yes | React only |
| `Message` | yes | yes | parity-gated |
| `MetricTile` | yes | yes | parity-gated |
| `Modal` | yes | yes | parity-gated |
| `MonoChip` | yes | yes | parity-gated |
| `Notification` | yes | yes | parity-gated |
| `Pagination` | yes | yes | parity-gated |
| `PerformanceBars` | yes | yes | parity-gated |
| `PerformanceFigure` | yes | yes | parity-gated |
| `Popconfirm` | yes | yes | parity-gated |
| `PricingCard` | yes | yes | parity-gated |
| `PricingMatrix` | yes | yes | parity-gated |
| `Progress` | yes | yes | parity-gated |
| `RadioGroup` | yes | yes | parity-gated |
| `Rate` | yes | yes | parity-gated |
| `Result` | yes | yes | parity-gated |
| `Ribbon` | yes | yes | parity-gated |
| `Segmented` | - | yes | React only |
| `Select` | yes | yes | parity-gated |
| `SiteFooter` | yes | yes | parity-gated |
| `Skeleton` | yes | yes | parity-gated |
| `Slider` | yes | yes | parity-gated |
| `Space` | yes | yes | parity-gated |
| `Spin` | yes | yes | parity-gated |
| `Splitter` | yes | yes | parity-gated |
| `StatCard` | yes | yes | parity-gated |
| `Statistic` | yes | yes | parity-gated |
| `StatsSection` | yes | yes | parity-gated |
| `Steps` | - | yes | React only |
| `Switch` | yes | yes | parity-gated |
| `Table` | yes | yes | parity-gated |
| `Tabs` | - | yes | React only |
| `Tag` | yes | yes | parity-gated |
| `TelemetryStrip` | yes | yes | parity-gated |
| `TestimonialCard` | yes | yes | parity-gated |
| `TimePicker` | yes | yes | parity-gated |
| `Timeline` | - | yes | React only |
| `Toast` | yes | yes | parity-gated |
| `Tooltip` | yes | yes | parity-gated |
| `Transfer` | - | yes | React only |
| `TreeSelect` | - | yes | React only |
| `TrendLine` | yes | yes | parity-gated |
| `Upload` | - | yes | React only |
| `VoiceCard` | yes | yes | parity-gated |
| `Wordmark` | yes | yes | parity-gated |

<!-- END GENERATED:component-inventory -->

## Framework Parity & Component Coverage

Joymify Design System provides full **Triplet Parity** across three first-class frameworks:
- **React 19** (`@joymify/react`): Production TSX twins with ref forwarding, standard camelCase event handlers, and full token fidelity.
- **Svelte 5** (`@joymify/svelte`): Idiomatic Svelte 5 Runes components (`$state`, `$derived`, `$props`, `ref = $bindable(null)`).
- **Flutter 3.32+ / Dart 3.8.1** (`joymify_flutter`): Production mobile and desktop widgets, pure style resolvers, and semantic token theme extensions.

### Triplet Parity Standards

Every cross-framework component satisfies the core contract:
1. **Semantic Token Contract**: 100% powered by `--joy-*` semantic tokens (`JoyThemeTokens` in Flutter). Zero hardcoded color literals in component source code.
2. **State & Geometry Invariance**: Identical state matrices (default, hover, focus-visible, active, disabled, error, loading) and guaranteed minimum 44px touch targets on coarse pointers.
3. **Accessibility**: Accessible ARIA semantic equivalents (`Semantics` in Flutter, roles/attributes in Web), keyboard operability, and focus outlines.

### "One Contract, Three Runners" Testing Architecture

Cross-framework fidelity is proven through a single declarative contract architecture evaluated across three independent test runners:

```
                      +---------------------------------------+
                      |   Declarative Behavioral Contract     |
                      | (packages/contracts/schemas/*.json)   |
                      +-------------------+-------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+-----------------------+     +-----------------------+     +-----------------------+
|  Storybook Web E2E    |     | Native Flutter Runner |     |   Flutter Web E2E     |
|   (Playwright Web)    |     |  (testWidgets/Engine) |     |  (Playwright Bridge)  |
|                       |     |                       |     |                       |
| Evaluates React 19 &  |     | Evaluates native      |     | Evaluates Flutter Web |
| Svelte 5 twins in     |     | Dart widget semantics |     | canvas via            |
| browser DOM & CSS     |     | and hit targets       |     | window.__joyHub       |
+-----------------------+     +-----------------------+     +-----------------------+
```

1. **Declarative Behavioral Contracts (`packages/contracts/schemas/*.contract.json`)**:
   Machine-readable behavioral specifications defining component props, states, interaction sequences, ARIA roles, and accessibility bounds.
2. **Native Flutter Widget Runner (`packages/flutter/test/contracts/`)**:
   Runs native `testWidgets` in the Flutter test engine to verify geometry, tap target dimensions (>=44px), semantic nodes, and pure style resolution against each contract schema.
3. **Playwright Browser Contracts (Storybook Web & Flutter Web)**:
   Playwright executes contracts against the Web Storybook Hub (`apps/storybook-hub`) and the Flutter Web Showcase (`apps/flutter-hub`). Flutter Web exposes state and component harnesses to Playwright via the `JoyHubBridge` (`window.__joyHub`), validating cross-platform visual and behavioral parity under identical scenarios.

### Unified Developer Portal (`dev.joymify.com`) & Tri-Framework Workshop

`dev.joymify.com` serves as the centralized Joymify developer hub consolidating three open-source foundations under **a single, ultra-lightweight Nginx pod**:

1. **Web Root (`/` and `/#overview`)**: Developer Portal Bento Landing introducing the 3 libraries, quick links, copyable commands, live tokens, and the 70+ component Storybook Hub.
2. **Joy Design System (`/design`)**: Permanent redirect or alias into the primary design system showcase.
3. **Node Server Decorator (`/server-decorator/`)**: Polyglot microservices decorator documentation (Astro Starlight).
4. **CLI State Handler (`/cli-state-handler/`)**: Deterministic terminal state machine documentation (Vite React).
5. **Legacy Domain (`design.joymify.com`)**: Permanently redirected (HTTP 301) to `https://dev.joymify.com/design$request_uri`.

The primary design workshop provides a **3-way framework switcher**:
```text
[ Svelte 5 | React 19 | Flutter 3.32 ]
```
- **Live Twin Toggling**: Hot-swap between Svelte 5 and React 19 component instances in-place with zero page reload.
- **Flutter 3.32 Workshop**: Switch to Flutter to instantly view Dart widget code snippets (`JoyButton`, `JoyInput`, `JoyTable`), copy vector icon constants (`JoyIcons.<name>`), and explore the live Flutter Web CanvasKit app (`#flutter` view or `/flutter/index.html`).
- **Synchronized Bridge**: Toggling between Light and Dark mode or selecting a brand palette preset (`Joy Classic`, `Ocean Blue`, etc.) propagates in real-time across both HTML DOM components and the embedded Flutter canvas via `JoyHubBridge`.
- **Single-Pod Assembly**: Running `bash scripts/assemble-portal.sh` assembles all 3 static doc trees into `apps/storybook-hub/dist/` for Docker and K8s deployment.

### Quickstart for Mobile Applications (`joymify_flutter`)

For mobile products such as `joy-coach-fe` and `quant-fe`:

#### 1. Add Dependency

In your application's `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  joymify_flutter:
    path: ../joy-design/packages/flutter
```

#### 2. Configure Theme

Wrap your `MaterialApp` with Joymify theme configurations:

```dart
import 'package:flutter/material.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

void main() {
  runApp(const JoymifyMobileApp());
}

class JoymifyMobileApp extends StatelessWidget {
  const JoymifyMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Joymify Mobile',
      theme: JoyTheme.lightTheme(),
      darkTheme: JoyTheme.darkTheme(),
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
```

#### 3. Use Components and Semantic Tokens

```dart
import 'package:flutter/material.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tokens = context.joyTheme;

    return Scaffold(
      backgroundColor: tokens.surfaceCanvas,
      appBar: AppBar(
        title: JoyText('Trading Telemetry', variant: JoyTextVariant.h2),
        backgroundColor: tokens.surfaceCard,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(tokens.space4),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            JoyMetricTile(
              label: 'Portfolio Value',
              value: '$1,248,500.00',
              trend: JoyTrend.up,
              delta: '+12.4%',
            ),
            SizedBox(height: tokens.space4),
            JoyButton(
              text: 'Execute Order',
              variant: JoyButtonVariant.solid,
              size: JoyButtonSize.lg,
              onPressed: () {
                JoyNotification.show(
                  context,
                  title: 'Order Submitted',
                  description: 'Limit order executed successfully.',
                  type: JoyNotificationType.success,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

## Form Controls (Wave 2)

Wave 2 delivers production-grade, hero-tier Button and form control primitives with full cross-framework parity across `@joymify/svelte` (Svelte 5 Runes) and `@joymify/react` (React 19). All styling is powered strictly by semantic design tokens defined in `packages/tokens`.

### State Matrix & Component Coverage

All 21 form controls support a comprehensive state matrix across Light and Dark themes:

| Component Category        | Components                                                                                          | Sizes                                 | States & Modifiers                                                                                                                                                                                       |
| :------------------------ | :-------------------------------------------------------------------------------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Action**                | `Button`                                                                                            | `sm` (32px), `md` (40px), `lg` (48px) | Variants (`solid`, `outline`, `ghost`, `danger`, `link`), States (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`), Modifiers (`block`, `iconOnly`), Slots (`iconStart`, `iconEnd`) |
| **Text Inputs**           | `Input`, `InputNumber`, `Mentions`, `DatePicker`, `TimePicker`, `DateRangePicker`, `MarkdownEditor` | `sm`, `md`, `lg`                      | `default`, `hover`, `focus-visible`, `disabled`, `readonly`, `error`, `success`, `message` helper slot, `prefix` / `suffix` addons                                                                       |
| **Choice Controls**       | `Checkbox`, `Switch`, `RadioGroup`, `Slider`, `Rate`, `Segmented`                                   | `sm`, `md`                            | `default`, `hover`, `focus-visible`, `active`, `disabled`, `indeterminate` (`Checkbox`), `allowHalf` / `readonly` (`Rate`), roving keyboard tabindex (`RadioGroup`, `Rate`, `Segmented`, `Slider`)       |
| **Overlay Controls**      | `Select`, `TreeSelect`, `Cascader`, `TimePicker`, `Mentions`                                        | `sm`, `md`, `lg`                      | `open`, `closed`, `disabled`, `error`, fixed-anchor dropdown panel, mobile bottom-sheet mode                                                                                                             |
| **Data Transfer & Files** | `Upload`, `Transfer`                                                                                | `md`                                  | `Upload` (dragger box, drag-over, file list, remove), `Transfer` (dual listboxes, item selection, move actions, responsive stack)                                                                        |
| **Form Layout**           | `Form`, `FormItem`                                                                                  | -                                     | Layouts (`vertical`, `horizontal`, `inline`), `colon`, `labelAlign`, `labelWidth`, required indicator, error explain (`role="alert"`)                                                                    |

### Cross-Framework Casing & Prop Parity Rule

Components in `@joymify/svelte` and `@joymify/react` share identical API contracts and emit the same CSS class hierarchy:

- **Event Handlers**: React uses camelCase (`onChange`, `onInput`, `onSelect`, `onRemove`, `onSubmit`, `onClick`). Svelte uses standard lowercase runes/props (`onchange`, `oninput`, `onselect`, `onremove`, `onsubmit`, `onclick`).
- **Class Attribute**: React accepts `className`; Svelte accepts `class`.
- **References & Rest Props**: React components forward element refs (`React.forwardRef`) and spread `...rest`. Svelte components expose bindable refs (`ref = $bindable(null)`) and spread `...rest`.
- **Invariance**: Every other prop name, option interface, and slot behavior is 100% identical between frameworks.

### Overlay Primitive (`openOverlay` & `useOverlay`)

Dropdown-bearing controls (`Select`, `TreeSelect`, `Cascader`, `TimePicker`, `Mentions`) utilize a unified positioning primitive (`packages/svelte/src/lib/overlay-utils.ts` and `packages/react/src/overlay-utils.ts`, plus React's `useOverlay` hook):

- **Anchored Positioning**: Uses `position: fixed` with smart collision detection. Panels drop below the control by default and flip upward when viewport space is constrained.
- **Adaptive Bottom Sheets**: When viewport width is under 480px or when a coarse pointer is detected (`@media (pointer: coarse)`), panels automatically adapt into mobile bottom sheets (`.joy-overlay--sheet`) docked at `bottom: 0`.
- **Accessibility & Focus Trapping**: Closes on `Escape` keypress and returns focus to the trigger anchor element; closes on pointerdown outside the anchor/panel boundary.
- **Containing Block Notice**: Because positioning uses `position: fixed`, ancestors applying `transform`, `filter`, or `perspective` will establish a new containing block.

### Touch Target Ergonomics

- **44px Minimum Hit Area**: Under coarse pointer media queries (`@media (pointer: coarse)`), `--joy-control-height-sm` and `--joy-control-height-md` expand to 44px, ensuring compliant tap targets on mobile touch devices.
- **iOS Zoom Prevention**: All text inputs (`.joy-input`, `.joy-textarea`, `.joy-select`, `.joy-input-number__input`, `.joy-date-picker__input`) enforce a 16px minimum font size on coarse pointers to prevent iOS Safari auto-zooming.

### Quality & Precheck Gates

The full gate list is under [Quality gates](#quality-gates). Wave 2 added the parity check and strict colour linting for its 21 controls; since Wave 6 the colour lint is strict for every file.

## Display, Feedback, Navigation & Overlay (Wave 3)

Wave 3 brings the 39 display, feedback, navigation and overlay components plus the shared chart engine (`chart-core.ts`) to the same standard as Wave 2, in both `@joymify/svelte` and `@joymify/react`. Every component in this wave guarantees:

- **Tokens only**: no hex/rgb/hsl literal and no `var(--joy-*, <foreign fallback>)` in the component files or their CSS (`packages/tokens/build.js` is the single source of truth for every `joy-*` class both twins render).
- **Dark mode through tokens**: no per-component dark overrides; surfaces, borders and status fills flip with `[data-theme]`.
- **44px touch targets** under `@media (pointer: coarse)` for pagination, tab, menu, dropdown, close and toolbar controls (tag close is a documented exception, see Known deviations).
- **Keyboard and ARIA**: roles, names and keyboard operation listed in the table below.
- **No banned patterns**: no side-stripe borders, no decorative `backdrop-filter`, no tracked uppercase eyebrow labels, no HTML-entity or Unicode-glyph icons (icons come from `@joymify/icons`).

### Components and contract points

Handlers follow the casing rule (Svelte `onclose`, React `onClose`). All 19 React components that used to swallow refs now `forwardRef` and spread `...rest` onto the root element.

| Component                                   | Contract                                                                                                                                                                                                                                                                                |
| :------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Alert`                                     | `role="alert"`, per-variant status icon, full 1px status border (no side stripe). `closable` + `onclose` / `onClose`; uncontrolled (hides itself, then calls the handler); close button `aria-label="Dismiss alert"`                                                                    |
| `Anchor`                                    | `role="navigation"`, active link `aria-current="location"`, coarse-pointer 44px links                                                                                                                                                                                                   |
| `Avatar`                                    | Image error falls back to initials; ring colour is `--joy-surface-canvas` in both themes                                                                                                                                                                                                |
| `AvatarGroup`                               | `items` (declarative list) and `max`: at most `max` avatars then one `joy-avatar-group__overflow` "+N" avatar. In Svelte `max` applies to `items` only (snippet children cannot be sliced)                                                                                              |
| `Badge`                                     | Status and brand variants from `--joy-status-*` and `--joy-accent-subtle` / `--joy-accent-text` (the brand badge is not navy)                                                                                                                                                           |
| `Breadcrumb`                                | `<nav aria-label="Breadcrumb">`, last crumb `aria-current="page"`, horizontal scroll under 768px, coarse 44px links                                                                                                                                                                     |
| `Divider`                                   | Vertical divider carries `role="separator"` and `aria-orientation="vertical"` in both twins                                                                                                                                                                                             |
| `Drawer`                                    | `role="dialog"` `aria-modal`, close button `aria-label="Close drawer"`, scroll lock + focus trap + Escape (topmost only); bottom sheet at 480px and below                                                                                                                               |
| `Dropdown`                                  | Trigger `aria-haspopup="menu"` `aria-expanded`, `role="menu"` / `menuitem` panel, arrow-key focus, positioned through `openOverlay` / `useOverlay`; coarse 44px items                                                                                                                   |
| `EmptyState`                                | Surface `--joy-surface-card`; React forwards ref and rest                                                                                                                                                                                                                               |
| `Flex`, `Space`                             | Layout only. `Space` exposes its gap as `--joy-space-gap`. A responsive `Flex` direction prop is deferred                                                                                                                                                                               |
| `Image`, `ImagePreview`                     | Split into two files in both packages. `Image` shows a hover/focus preview overlay; `ImagePreview` is a modal-layer dialog (`aria-label` overridable) with a `role="toolbar"` of labelled buttons (Zoom in, Zoom out, Rotate left, Rotate right, Reset, Close) and arrow-key navigation |
| `MarkdownViewer`                            | Copy button `aria-label="Copy code to clipboard"` with focus ring and live status; blockquote is a full border on `--joy-accent-subtle`; `hr` uses `--joy-border-default`                                                                                                               |
| `Menu`                                      | `role="menu"` / `menuitem`, active item `aria-current="page"`, roving `tabindex`, ArrowUp/ArrowDown/Home/End; coarse 44px items                                                                                                                                                         |
| `Message`, `Notification`, `Toast`          | `z-index: var(--joy-z-toast)`, tone classes on icons, Notification/Toast close button `aria-label="Dismiss notification"` with 44px area; Message and Notification auto-dismiss through the shared `auto-dismiss.ts` (one `onClose`, timer does not restart on re-render)               |
| `MetricTile`, `StatCard`, `Statistic`       | Sentence-case muted labels, SVG trend icons (`TrendingUp` / `TrendingDown`), `StatCard` `trend: 'up' \| 'down' \| 'flat'` (derived from the delta text through `delta-utils.ts` when omitted; `deltaTone` only sets colour)                                                             |
| `Modal`                                     | `role="dialog"` `aria-modal`, unique title id, close `aria-label="Close dialog"`, scroll lock + focus trap + Escape (topmost only) + focus return to the opener; full-bleed with sticky footer at 480px and below                                                                       |
| `Pagination`                                | Windowed page list with ellipsis, `Page N` labels, `aria-current="page"`, chevron icons, out-of-range `current` clamped; compact mode (prev, current, next) at 480px and below; page-size select uses `joy-pagination__size`                                                            |
| `Popconfirm`                                | `role="alertdialog"`, confirm button `joy-button--solid`, Escape and outside click through the overlay primitive; `open` is bindable in Svelte with `onopenchange`, React takes `onOpenChange`                                                                                          |
| `Progress`                                  | `role="progressbar"` with `aria-valuenow/min/max` on the root element, non-finite values clamped to 0, default fill `--joy-accent-text`                                                                                                                                                 |
| `Result`                                    | Status icon colours from `--joy-status-*`                                                                                                                                                                                                                                               |
| `Skeleton`                                  | One wrapper element (one `role="progressbar"`) for multi-line text; consumer `style` merges after the computed size; shimmer stops for `prefers-reduced-motion`                                                                                                                         |
| `Spin`                                      | `role="status"` `aria-busy`, tip text `--joy-accent-text`, slowed (not stopped) under reduced motion; `className` lands on the root                                                                                                                                                     |
| `Splitter`                                  | `role="separator"` with `aria-orientation`, `aria-valuenow/min/max` (the enforced bounds), `tabindex="0"`, arrow keys plus Home/End; panes sized by `--joy-splitter-size`; stacks vertically under 640px                                                                                |
| `Steps`                                     | `role="navigation"`, `aria-current="step"` on the item at `current`, vertical under 768px                                                                                                                                                                                               |
| `Table`                                     | Sortable header: `tabindex="0"`, Enter/Space, `aria-sort`; `variant: 'stack' \| 'scroll'` (scroll variant is a keyboard-focusable `role="region"` with a sticky first column and `isolation: isolate`); hover uses `--joy-accent-subtle`                                                |
| `Tabs`                                      | `role="tablist"` / `tab` / `tabpanel` with generated ids and `aria-controls` / `aria-labelledby`, roving `tabindex`, ArrowLeft/ArrowRight/Home/End, horizontal scroll with fade edge, coarse 44px                                                                                       |
| `Tag`                                       | Close control is a 24px visual with a 34x44 hit box (see Known deviations); checkable tags have a `:focus-visible` ring; primary tag text uses `--joy-accent-text`                                                                                                                      |
| `Timeline`                                  | Connector and dot from `--joy-border-default` / tokens, no inline colour                                                                                                                                                                                                                |
| `Tooltip`                                   | Trigger linked with `aria-describedby`; tap/click toggles it on touch devices; Escape and outside click dismiss                                                                                                                                                                         |
| `BarChart`, `LineChart`, `CandlestickChart` | HUD text through token classes (`joy-chart__hud-*`), wraps on phones, canvas container `role="img"` with `aria-label`, plus an accessible summary table (capped)                                                                                                                        |
| `chart-core.ts`                             | Palette read from CSS variables and repainted on theme change (see Charts)                                                                                                                                                                                                              |

### Overlay layer

Only some of this wave's overlays use the shared primitives in `overlay-utils.ts`:

- **Positioned panels (`openOverlay` in Svelte, `useOverlay` in React):** Popconfirm and Dropdown (and, from Wave 2, Select, TreeSelect, Cascader, TimePicker, Mentions).
- **Dialogs (`lockBodyScroll`, `trapFocus`, `registerDialog`):** Modal, Drawer and ImagePreview. Svelte calls the three functions directly; React goes through `useDialog` in `dialog-hooks.ts`.
- **Token scale only (no primitive):** Tooltip is CSS-positioned (`.joy-tooltip { position: absolute; z-index: var(--joy-z-tooltip) }`); Message, Notification and Toast are fixed-position stacks using `--joy-z-toast`. None of them calls `openOverlay` / `useOverlay`.

All of them use the token scale below.

| Token              | Value | Layer                                                          |
| :----------------- | :---- | :------------------------------------------------------------- |
| `--joy-z-base`     | 0     | Page content                                                   |
| `--joy-z-sticky`   | 100   | Sticky table column and header                                 |
| `--joy-z-backdrop` | 900   | Reserved (no rule uses it: the backdrop is the panel's parent) |
| `--joy-z-dropdown` | 1000  | Dropdown, overlay primitive panels                             |
| `--joy-z-drawer`   | 1020  | Drawer                                                         |
| `--joy-z-modal`    | 1050  | Modal, ImagePreview mask                                       |
| `--joy-z-popover`  | 1060  | Popconfirm (above Modal), ImagePreview toolbar                 |
| `--joy-z-toast`    | 1100  | Message, Notification, Toast (above Modal and Popconfirm)      |
| `--joy-z-tooltip`  | 1200  | Tooltip                                                        |

- **Popconfirm above Modal**: 1060 is greater than 1050, so a Popconfirm opened from inside a Modal renders on top of it. The hub contract measures this in a real browser.
- **Dialog stack**: Modal, Drawer and ImagePreview call `lockBodyScroll()`, `trapFocus(el)` and `registerDialog()` (from `overlay-utils.ts`). `registerDialog()` returns a handle with `isTopmost()` and `unregister()`, so Escape closes only the topmost dialog. The handler also calls `preventDefault()` so a popover inside a dialog closes alone.
- **Fallback positioning**: panels not (yet) placed by `openOverlay` keep an absolute fallback (`.joy-dropdown:not(.joy-overlay)`, `.joy-popconfirm__panel:not(.joy-overlay)`), so static hub demos and server-rendered markup are not laid out in flow.
- **Mobile**: Modal is full-bleed with a sticky footer and safe-area insets at 480px and below; Drawer becomes a bottom sheet at 480px and below.
- **Scrim**: `color-mix(in srgb, var(--joy-color-navy-900) 60%, transparent)` (85% for ImagePreview). The spec named `--joy-surface-overlay`, but that token is white in light mode, so the scrim would not dim the page. `--joy-color-navy-900` is near-black in both themes. No `backdrop-filter`.
- **Motion**: Modal and Drawer have an enter animation only (see Known deviations); reduced motion is honoured by the Wave 1 global block.

### Charts

- `readChartPalette(canvas)` (exported from `chart-core.ts`) reads the theme once per render through `getComputedStyle`. `ChartPalette` fields: `textSecondary`, `textPrimary`, `bull`, `bear`, `border`, `accent`, `onAccent`. Bull/bear reuse `--joy-status-success-fg` / `--joy-status-danger-fg`; there is no separate chart token family.
- **Theme repaint**: `chart-core` installs a `MutationObserver` on `document.documentElement` (attribute `data-theme`), so a theme flip repaints without any event. A `joy-theme-change` event on `window` also triggers a repaint (nothing in the repo dispatches it; it is available to hosts that switch themes another way).
- **HUD**: token classes `joy-chart__hud`, `joy-chart__hud-item`, `joy-chart__hud-label`, `joy-chart__hud-value` (and `--accent`, bull, bear modifiers) instead of inline colours; solid card background, no blur; wraps under 480px.
- **Accessible summary**: each chart's canvas container is `role="img"` with an `aria-label`, and a visually hidden summary table (capped window from `summaryWindow`) carries the values.

### Shared helpers (byte-identical between packages)

These files exist in both `packages/svelte/src/lib/` and `packages/react/src/` and must stay identical (`cmp` exits 0):
`overlay-utils.ts`, `chart-core.ts`, `delta-utils.ts`, `auto-dismiss.ts`, `roving-utils.ts`, `pagination-utils.ts`, `splitter-utils.ts`, `table-utils.ts`, `calendar-utils.ts`.
Their tests (`overlay-utils`, `chart-core`, `roving-utils`, `pagination-utils`, `splitter-utils`, `table-utils` `.test.js`) are the same file in both packages apart from the import path line. `delta-utils.ts`, `auto-dismiss.ts` and `calendar-utils.ts` are covered inside `components.test.js`. Byte-identity is asserted by `scripts/test/shared-helpers.test.mjs` in Gate 1, which also checks that this list is complete; the twin diff in `scripts/parity-check.mjs` covers the components. `dialog-hooks.ts` (`useDialog`, `useOpener`, `useMergedRef`) is React-only; its Svelte counterpart for the focus-return part is `dialog-opener.ts` (`createOpenerTracker`, driven by `$effect.pre`), so an autofocused child cannot become the remembered opener in either package.

### Casing rule and the parity gate

The Wave 2 rule is unchanged: Svelte handler props are all lowercase (`onclose`, `onchange`, `onselect`, `onsort`, `onopenchange`) and use `class`; React handler props are camelCase (`onClose`, `onChange`, `onSelect`, `onSort`, `onOpenChange`) and use `className`.

`node scripts/parity-check.mjs` covers 75 components (`COMPONENTS`: the 21 Wave 2 controls, the 39 Wave 3 components, the 14 Wave 4 landing components and the internal `LandingAction`). It exits non-zero on any of:

- **Class diff**: `joy-*` classes present in only one twin, including CSS custom properties (`--joy-space-gap`) and dynamic prefixes (`joy-progress--status-*`), which are compared but need no theme rule.
- **Undefined class**: a fully spelled class with no rule in `dist/theme.css`; `STRUCTURAL_CLASSES` is a small allowlist of unstyled hook classes, honoured only while both twins carry the hook.
- **Prop diff**: prop names in one twin only, plus the exact `CONTRACT` props for the Wave 2 controls. Handlers compare case-insensitively.
- **Handler casing per side**: Svelte handler props must be lowercase, React handler props camelCase (`HANDLER_CASING_EXCEPTIONS` is empty).
- **`REF_FORWARDING`**: the 33 named React components (the Wave 2 and Wave 3 set plus the 14 landing names) must `forwardRef` and spread `...rest`/`...props`.

Modes: default (twin), `--side svelte`, `--side react` (single-side checks used while a twin is still being built), and `--json` (machine-readable result). Run `node scripts/parity-check.mjs --side react` to see the React-only gaps.

### Gates

- **Strict colour lint**: `bash scripts/lint-colors.sh` hard-fails on foreign colour literals in every package source and the hub (Wave 6 removed the per-wave `strict_file_pattern` and the warning tier). `bash scripts/lint-colors.sh --strict <files>` checks an explicit file list; `scripts/test-lint-colors.sh` holds the fixtures.
- **Unit tests**: `pnpm -r test` (icons, tokens, svelte, react).
- **Playwright contracts**: `apps/storybook-hub/tests/display-contracts.spec.ts` (no real horizontal overflow at 375px in light and dark, Popconfirm above Modal with Escape closing it first, Drawer as a bottom sheet at 375px and a side panel at 1280px, 44px pagination/tab/menu/dropdown/close controls on the coarse-pointer project, no purple or hard-coded white, no side stripes, chart HUD contrast of 4.5:1 or more, Pagination compact and windowed modes). Run `PLAYWRIGHT_PORT=6117 pnpm --filter storybook-hub exec playwright test`; the config defaults to port 6116, so set a different `PLAYWRIGHT_PORT` per worktree or an already-running server from another worktree is silently reused.
- **Screenshots**: `F038_SCREENS=1 PLAYWRIGHT_PORT=6117 pnpm --filter storybook-hub exec playwright test tests/screens-f038.spec.ts --project=desktop-chrome` writes 44 PNGs (11 names x light/dark x 375/1280) to `.claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/screens/` (index in that folder's `README.md`).
- **Release gates**: see [Quality gates](#quality-gates).

### Hub views

The storybook hub has two aspect views for this wave: **Data Display & Feedback** (`#view-data-display-feedback`: Alert, Badge, Tag, Avatar, Image, ImagePreview, Statistic/MetricTile/StatCard, Progress, Skeleton, Spin, EmptyState, Result, Toast/Message/Notification, Table, charts) and **Navigation & Workflow** (`#view-navigation-workflow`: Pagination, Tabs, Menu, Breadcrumb, Steps, Anchor, Timeline, Splitter, overlay openers for Modal, Drawer, Popconfirm, Dropdown and Tooltip, MarkdownViewer).

### Breaking changes and migration notes

- **Svelte `ImagePreview` handler props renamed** (breaking; the component shipped in release 2.16): `onClose` becomes `onclose` and `onChange` becomes `onchange`, to follow the casing rule. Update every Svelte consumer that passes them. React `ImagePreview` keeps `onClose` / `onChange`.
- **React `Image` no longer has a `placeholder` prop** (it was never rendered). `Image` now lives in its own `Image.tsx`, matching Svelte, and is exported from the package index.
- **Tokens changed globally in dark mode** (values live in `packages/tokens/scripts/ramps.mjs`, `tokens.json` and `dist/theme.css` are generated from them): `--joy-border-subtle` is now `#22324b` (was navy-700, 1.05:1 against the card, now 1.34:1) and `--joy-status-{success,warning,danger,info}-bg` are now `#0d2d0f`, `#3a1e00`, `#470d0e`, `#0b2741` (were the near-black 900 stops). Anything in the ecosystem that uses these tokens in dark mode gets slightly lighter hairlines and status fills; status text stays at 7.5:1 or better.
- **Progress** default fill is now `--joy-accent-text` in both twins (the Svelte scoped style used the navy `--joy-color-primary`); the `role="progressbar"` attributes moved to the root element.
- **Message, Notification, Toast** now stack at `--joy-z-toast` (1100), above Modal (1050) and Popconfirm (1060), and below Tooltip (1200).
- **Close labels**: Notification and Toast close buttons are labelled "Dismiss notification" (was "Close notification" / raw text); Modal and Drawer close buttons are icon buttons labelled "Close dialog" / "Close drawer".
- **Markup and class changes** for consumers that style internals or query the DOM: Alert (icon, close button, full border instead of a 4px stripe, `joy-alert__close`); Skeleton with `lines > 1` renders one wrapper around plain line elements (the wrapper no longer carries `joy-skeleton` classes); Pagination (windowed list, ellipsis spans, chevron icons, `Page N` labels, page-size select class `joy-pagination__size`); Tabs and Menu now carry `role="tablist"` / `role="menu"` with roving `tabindex`; Popconfirm panel is `role="alertdialog"` and its confirm button is `joy-button--solid` (the old `joy-button--primary` class had no CSS); Spin puts `className` on the root and removes inline styles; Notification, Toast and ImagePreview use classes instead of inline styles.
- **Removed classes** (for consumers that query the DOM): Svelte `ImagePreview` no longer renders `joy-nav-btn` / `joy-preview-btn` (now `joy-image-preview-nav`, `joy-image-preview-btn`); React `joy-image-wrapper` no longer comes from `ImagePreview.tsx` (it is rendered by `Image.tsx`, as in Svelte); `joy-button--primary` on Popconfirm (see above). Everything else in the wave keeps its class names or adds new ones.
- **Additive**: Alert `closable` / `onclose` / `onClose`, StatCard `trend`, Table `variant` (`'stack'` is the default, so existing Table usage is unchanged), AvatarGroup `items`, Popconfirm `onopenchange` (Svelte) / `onOpenChange` (React), React `Form` emits `joy-form--<layout>` like Svelte.

### Known deviations and deferred gaps

Rationale for each lives in `.claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/rulings-and-deferrals.md`; the per-issue status of all 203 audit findings is in `research/issue-coverage.md` next to it.

- **Tooltip, Message, Notification and Toast do not use the overlay primitive** (spec item 3 listed them): they only use the `--joy-z-*` tokens. Tooltip therefore is not viewport-aware and can be clipped by an `overflow: hidden` ancestor (for example the Table scroll region).
- **No exit animation** for Modal and Drawer: they render conditionally, so only the enter animation exists (spec asked for enter and exit).
- **iOS scroll lock (SVD-097)**: `lockBodyScroll` only sets `overflow: hidden` on the body; the `position: fixed` scroll-position technique is not implemented.
- **Tag close hit area is 34x44, not 44x44**: it grows toward the right edge only, because a 44px-wide hit box would overlap neighbouring tags (8px gap). Alert and Toast close buttons get the full 44x44.
- **Menu keeps `role="menu"`** even in navigation-style usage (the brief and audit required it); screen readers announce a menu for site navigation. Consumers can override `role` through `...rest`.
- **`Flex` responsive direction** (SVD-032) is a feature request and is deferred.
- **No TypeScript gate**: the repo has no `tsc` / `@types/react`, and `packages/react/package.json` `types` points at a missing file, so React typings are not compile-checked.

## Landing suite (Wave 4)

Wave 4 brings the 14 landing components to the same standard in both `@joymify/svelte` and `@joymify/react`: `HeroSection`, `CTASection`, `PricingCard`, `PricingMatrix`, `FeatureCard`, `FeatureGrid`, `BentoCard`, `BentoGrid`, `LogoCloud`, `FAQSection`, `StatsSection`, `TestimonialCard`, `SiteFooter` and `LandingPage`. An internal twin, `LandingAction` (not exported from either index), renders the CTA button for `HeroSection` and `CTASection`: without `href` it composes `Button`, with `href` it renders an anchor, and a disabled or loading link drops its `href` and leaves the tab order. The full record of rulings, deviations and deferrals is in `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/rulings-and-deferrals.md`; the per-issue status of every audit finding is in `research/issue-coverage.md` next to it.

### Props (notable components)

`HeroSection` and `CTASection` share the CTA props. Defaults differ: the hero uses `Get started free` / `Explore documentation`, the CTA band uses `Get started today` / `Contact sales`.

| Prop                                                     | HeroSection                                                                               | CTASection               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| `badgeText`, `titleEmphasis`, `subtitle`, `previewSlot`  | yes                                                                                       | no                       |
| `title`                                                  | optional                                                                                  | required                 |
| `description`                                            | no                                                                                        | optional                 |
| `primaryCtaText`, `secondaryCtaText`                     | strings, defaults above                                                                   | strings, defaults above  |
| `primaryHref`, `secondaryHref`                           | anchor instead of button                                                                  | anchor instead of button |
| `primaryLoading`, `primaryDisabled`, `secondaryDisabled` | boolean, default `false`                                                                  | boolean, default `false` |
| Click handlers                                           | Svelte `onprimaryclick` / `onsecondaryclick`, React `onPrimaryClick` / `onSecondaryClick` | same                     |

`titleEmphasis` renders a `<span class="joy-hero__title-emphasis">` in solid `--joy-accent-text` (never a gradient). `previewSlot` is a Svelte `Snippet` and a React `ReactNode`.

| Component                | Props worth knowing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `FeatureGrid`            | `layout`: `'lead'` (default) or `'uniform'`. From 900px `lead` is three columns with the first card spanning two and the last card filling its row, for any card count; below 900px it is one column. `columns` (`2`, `3`, `4`, default `3`) applies only with `layout="uniform"`, where it is a maximum (auto-fit).                                                                                                                                                                                         |
| `FeatureCard`            | `title`, `description`, `icon`, `badge` (Svelte snippets, React nodes), `linkText`, `linkHref`, `onlinkclick` (Svelte) / `onLinkClick` (React). A handler without `linkHref` renders a `<button>`.                                                                                                                                                                                                                                                                                                           |
| `BentoGrid`, `BentoCard` | `BentoCard` takes `colSpan` (1 to 12, default `4`; anything else falls back to 4), `title`, `description`, `badge`, children. Every span from 1 to 12 has a CSS rule; below 900px every card is full width.                                                                                                                                                                                                                                                                                                  |
| `PricingCard`            | `title`, `price` (required), `description`, `period` (default `/month`), `features`, `ctaText`, `featured`, `badge`, `loading`, `disabled`, `onselect` (Svelte) / `onSelect` (React).                                                                                                                                                                                                                                                                                                                        |
| `PricingMatrix`          | Children card grid by default. Optional data props `columns` (string array) and `rows` (`{ label, values }[]`, where a value is a string or a boolean) render a real table inside a scroll region instead; pass both or neither (a lone data prop is ignored). `rowHeaderLabel` (default `Feature`) and `label` (default `Pricing plans`, names the scroll region).                                                                                                                                          |
| `LogoCloud`              | `title`, `logos`. Logos are `currentColor` at `--joy-text-muted` with no invert filter.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `FAQSection`             | `title`, `subtitle`, `items`, `allowMultiple`. Ids are per instance; closed answers stay in the DOM with `hidden`.                                                                                                                                                                                                                                                                                                                                                                                           |
| `StatsSection`           | `stats`. An inline-size container; the column count follows the container width and the stat count.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `TestimonialCard`        | `quote`, `authorName`, `authorRole`, `avatarSrc`, `avatarInitials`, `rating` (default `5`, clamped to 0 to 5 whole stars).                                                                                                                                                                                                                                                                                                                                                                                   |
| `SiteFooter`             | `brandTitle` (default `Joymify`), `brandDescription`, `brandLogo`, `columns` (required, `{ title, links: { label, href, external? }[] }[]`), `copyright` (defaults to the current year), `socialLinks`. It renders a plain `<footer>` with no explicit role, so it is the page `contentinfo` landmark only when it is not nested in `section` or `article`. Svelte `socialLinks` entries may also carry a trusted-input `svgHtml` string; React passes an element through `icon`.                            |
| `LandingPage`            | `palette` (`joymify` default, `obsidian`, `quantum`, `cyberpunk`, `titanium`; a plain `data-palette` attribute, the theme is decided by `data-theme` alone), `interactiveSlot`, deploy and docs handlers (Svelte `ondeployclick` / `ondocsclick`, React `onDeployClick` / `onDocsClick`). Under 768px the header collapses to a menu button that opens a `Drawer`. It renders its own skip link (`.joy-landing-skip`) and its own `<main>`, so render it as the page body and never inside another `<main>`. |

### Casing rule

The Wave 2 and Wave 3 rule applies to every landing component. React handler props are camelCase (`onPrimaryClick`, `onDeployClick`), use `className`, and forward the root element ref with `React.forwardRef` and `...rest`. Svelte handler props are all lowercase (`onprimaryclick`, `ondeployclick`), use `class`, expose the root through `ref = $bindable(null)` and spread `{...rest}`. Every landing Svelte `Props` interface now extends the root element's `HTMLAttributes` (with `class`, `children` and `title` omitted where redefined), so `aria-*` and `data-*` attributes type-check. `LandingAction` is the exception: it is internal and has no rest spread.

### Design rules

- **No slop**: no `&bull;` or middle-dot separators, no gradient text, no glass or `backdrop-filter`, no tracked uppercase eyebrows, no side-stripe borders, no arrows in link text, no identical icon-card grid (`FeatureGrid` leads with one wide card). Stat values use `--joy-accent-text` and rating stars use `--joy-status-warning-fg`.
- **Fluid type**: section headings (hero, CTA, FAQ, the hub features heading) use the display clamps. Card titles use fixed scale tokens (`--joy-font-size-2xl` for feature cards, `--joy-font-size-xl` for bento cards). This is a deliberate deviation from the original "every heading fluid" line: the clamps split words in 150 to 220px cards.
- **Dark treatment is token-driven**: no `[data-theme]` component selectors were added (the phase-b cap of 15 is untouched); surfaces, borders and text flip through the token remap, including for OS-level dark.
- **Layout**: `StatsSection` uses container queries (`@container joy-stats`), so it adapts inside frames and sidebars. `PricingMatrix` cards are a wrapping flex row. `FeatureGrid` `lead` spans keep every row edge to edge. Viewport breakpoints: 899 (bento and feature grids collapse to one column; from 900 the wide layouts apply), 767 (LandingPage header collapses to a menu button and Drawer, footer padding tightens), 480 to 767 (footer link groups pair up in two columns), 639 (footer bottom row stacks), 479 (hero and CTA action buttons stack, CTA band padding shrinks) and 480 (the Drawer is the Wave 3 bottom sheet). The 767 and 639 values are deliberate, so 768 and 640 keep the wide layout.

### Generated hub blocks

`apps/storybook-hub` has two landing views: `#landing-preview` (the full-page simulator: generated from the real components except the hand-written header, toolbar and scripts, plus a hub-only features heading and pricing section around the `LandingPage` output) and `#landing-blocks` (Bento and Landing Suite blocks). Both are produced by SSR-rendering the Svelte components:

```bash
node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write   # regenerate
node apps/storybook-hub/scripts/gen-landing-blocks.mjs --check   # fail on drift
```

**Regenerate after any landing component markup change.** `packages/svelte/test/hub-landing-blocks.test.js` fails on drift, so a forgotten `--write` turns `pnpm -r test` red. The simulator frame-width toggle only changes the frame width; media queries follow the real browser window.

### Tests, gates and screenshots

- **Unit tests**: `pnpm -r test`. Landing coverage lives in `packages/svelte/test/landing-*.test.js`, `packages/svelte/test/hub-landing-blocks.test.js` and the React equivalents. Svelte tests render through `packages/svelte/test/helpers/render-svelte.js` and React tests load TSX through `packages/react/test/helpers/load-tsx.js`.
- **Playwright**: `PLAYWRIGHT_PORT=6120 pnpm --filter storybook-hub exec playwright test --workers=3`. Landing specs in `apps/storybook-hub/tests/`: `landing-contracts` (hub views at 375 and 1280, light and dark), `landing-component-page` (real React and Svelte components on `dist/theme.css` only, no hub CSS and no reset, so the hub cannot mask a component defect), `landing-cta-contrast`, `landing-stats-*` (grid and overflow), `landing-blocks-*` (layout and states), `landing-simulator-t2`, `landing-layout-t1`, `landing-pricing-grid` and `landing-button-states`. Set a distinct `PLAYWRIGHT_PORT` per worktree or a server from another worktree is silently reused.
- **Screenshots**: `F039_SCREENS=1 PLAYWRIGHT_PORT=6120 pnpm --filter storybook-hub exec playwright test tests/screens-f039.spec.ts --project=desktop-chrome` writes the PNGs to `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/screens/`.
- **Parity gate**: `COMPONENTS` and `REF_FORWARDING` in `scripts/parity-check.mjs` list the 14 landing names, and the new `SVELTE_REF_REST` list (checked by `checkSvelteRefRest`) requires each listed Svelte component to destructure `ref = $bindable(null)`, spread `{...rest}` and bind the root to `ref`.
- **Strict colour lint**: all 30 landing files (and, since Wave 6, every other source file) hard-fail on foreign colour literals.

### Breaking and visible changes (Wave 4)

- **`titleGradient` is removed from `HeroSection`; use `titleEmphasis`** in both twins, with no alias (an alias would keep the banned gradient API alive). Consumers that still pass `titleGradient` get no emphasis and no error: the old prop is spread onto the root element as an unknown attribute, so search your code for the name and rename it.
- **`.joy-button--glass` is removed**, together with its hover rule. Use `joy-button--outline`. Markup that still carries the class silently loses its styling.
- **Any `.joy-button` with `aria-disabled="true"` now looks disabled and gets `pointer-events: none`**, in every component, not only the landing suite (it used to look enabled). A consumer using the focusable-disabled pattern (`aria-disabled="true"` on a button that shows a tooltip) no longer receives hover or click events on it; keep such a button on `disabled` semantics or move the tooltip to a wrapper.
- **`FeatureGrid` default changed from the uniform column grid to `layout="lead"`** (the first card is wider; the last card fills its row). To keep the old look, pass `layout="uniform"` together with `columns`.
- **React `LogoCloud` `forwardRef` element type changed from `HTMLDivElement` to `HTMLElement`** (the root element is now a `<section>`, so `HTMLDivElement` no longer matches). Update the `ref` typing in consumers, for example `useRef<HTMLElement>(null)`.
- **`SiteFooter` no longer sets `role="contentinfo"`**: the implicit landmark applies unless the footer is nested in `section` or `article`. Footer links have a 44px minimum height at every pointer type.
- **`PricingMatrix` gained optional `columns` / `rows` data props** (additive; the children card grid is unchanged).
- **CTA band restyle**: a raised surface with an accent wash and a strong border in both themes. The light band is no longer navy.
- **`LandingPage` renders its own `<main>` and a skip link**: do not nest it inside another `<main>`.
- **Svelte landing `Props` extend the element attributes**, so extra attributes are typed and forwarded to the root.
- **Card titles use fixed scale tokens** instead of the display clamps.

## Storybook hub (Wave 5)

`apps/storybook-hub/build.js` generates the hub page (`apps/storybook-hub/dist/index.html`): stylesheet, 38 manifest views and the runtime script. Wave 5 rebuilt its chrome for phones and dark mode.

### Layout tiers

| Width           | Chrome                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| over 900px      | Sidebar always shown; topbar has the theme toggle and the Svelte/React switcher.                                                                                                                                                                                                                                                                                        |
| 900px and below | The sidebar becomes an off-canvas drawer (`#hub-sidebar`, `z-index: var(--joy-z-drawer)`) behind a scrim. The topbar shows the menu button (`aria-controls`, `aria-expanded`) and the brand. While open, Tab stays inside the drawer; Escape closes it and returns focus to the menu button. A closed drawer is `visibility: hidden`, so its links leave the tab order. |
| 767px and below | The topbar is menu button, brand and theme toggle only. The framework switcher moves into the drawer. Content uses 16px gutters, and token and props tables scroll sideways inside labelled, focusable regions (`.hub-scroll-x`).                                                                                                                                       |
| 480px and below | The theme toggle is icon-only. It keeps its `aria-label`.                                                                                                                                                                                                                                                                                                               |

The menu button, drawer close, theme toggle (on phones) and the drawer's framework buttons are at least 44px square. Framework buttons carry `data-framework` and `aria-pressed`, and `setFramework()` keeps both copies in sync.

### Theme and colour

- **Theme is resolved before the first paint.** An inline `<head>` script sets `data-theme` from `localStorage['joy-theme']`, or from `prefers-color-scheme` when nothing is saved. The toggle stores the choice; its label reads "Dark theme" / "Light theme" and its `aria-label` says "Switch to dark theme" / "Switch to light theme".
- **Token-only colours.** The hub stylesheet uses `--joy-*` tokens, plus `--hub-*` chrome aliases (`--hub-sidebar-bg`, `--hub-topbar-bg`, `--hub-chrome-border`, `--hub-code-bg`, `--hub-code-fg`, `--hub-drawer-edge`, `--hub-scrim`). The drawer scrim is `--hub-scrim` at 55% (the inverse surface in light, the darkest neutral in dark, so it always dims). The aliases are defined once in `:root` and once in `[data-theme="dark"]`, and every one resolves to a token. There are no `div[style*=...]` dark-mode patches. `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js` reports 0.
- **No slop in the chrome.** There is no glass (`backdrop-filter`), gradient text, tracked uppercase labels, arrow suffixes, middle dots or numbered markers. Font sizes use `--joy-font-size-*`, z-index uses `--joy-z-*`, and transitions run 150-250ms on `--joy-duration-*`. They switch off under `prefers-reduced-motion`.

### Heroes and the particle field

- The landing view (`#overview`) opens with a real `HeroSection` render. Its "Browse components" and "Read the tokens" buttons are wired in `build.js`.
- The kinetic hero in `#landing-blocks` is also a `HeroSection` render, placed over a decorative canvas. Both come from `scripts/gen-landing-blocks.mjs`, which now owns a fourth region, `overview-hero`. Regenerate with `--write` and check with `--check`, as for the other regions.
- The particle canvas reads `--joy-accent-default`, `--joy-accent-hover`, `--joy-accent-active` and `--joy-text-muted` through `window.hubKineticPalette()`, and re-reads them whenever `data-theme` changes.
- Under reduced motion the canvas draws one still frame. On a coarse pointer the canvas is hidden and a still accent gradient shows instead.
- Frames only run while an `IntersectionObserver` sees the hero and the tab is visible, capped at 60fps. The field never paints under the hero text or CTAs.
- One component fix landed with this wave: `.joy-radio-group` gained `flex-wrap: wrap`, because a horizontal group of long options ran off a 375px screen.

### Hero Section variants & Apple Narrative Landing Page (F-055)

The Storybook Hub provides 8 distinct Hero Section variants in `#landing-blocks` switchable via `.hub-segmented-ctrl--wrap`, plus a full-page Apple Keynote Continuous Narrative Scroll showcase in `#apple-landing`:

1. **8 Hero Section Variants (`#landing-blocks`)**:
   - `antigravity`: Kinetic particle physics field with interactive mouse repulsion and token-derived palette.
   - `mesh3d`: Real-time 3D wave wireframe mesh on 2D canvas with mouse pitch/yaw tilt and perspective projection.
   - `editorial`: Centered luxury fashion/editorial cover with embedded architectural SVG artwork backdrop, centered masthead, eyebrow, title, description, and gold pill CTA.
   - `keynote`: Apple Keynote hardware showcase with dual CTAs and device silhouette.
   - `cockpit`: SaaS financial trading terminal with real-time sparkline and live tick metrics.
   - `cyberpunk`: Tactical HUD terminal with monospaced brackets and telemetry scanline.
   - `swiss`: Modernist Zurich 1957 typography canon with top ticker marquee and technical specs.
   - `aura`: Chromatic ambient mesh with smooth fluid gradient orbs.

2. **Apple Keynote Continuous Narrative Landing Page (`#apple-landing`)**:
   - Continuous scroll presentation inspired by iPhone Duo foldable / MacBook Pro keynotes.
   - **Sticky Sub-Navigation**: Persistent model title (`iPhone Duo`), `Pro Foldable` badge, quick jump links, and price CTA.
   - **Scene 1 (Monumental Intro)**: Large keynote typography, dual CTAs, and hardware silhouette showcase.
   - **Scene 2 (Posture & Fold Mechanics)**: Continuous scrub slider controlling 0°–180° CSS 3D folding angles, alongside 6 posture pills (`แนวนอน`, `แนวตั้ง`, `พับปิด`, `วางเปิด`, `กางตั้ง`, `ความทนทาน`).
   - **Scene 3 (Cinematic Immersion)**: Edge-to-edge widescreen cinema frame with aspect ratio switcher (`21:9`, `16:9`, `4:3`).
   - **Scene 4 (Silicon Specs Bento)**: A18 Pro 3nm GPU specs, Grade 5 Titanium chassis, and all-day battery telemetry.
   - **Scene 5 (Studio Finish Customizer)**: 4 Titanium swatches, 4 storage tiers, live pricing calculator, and order CTA.


### Smart Glasses Head-Up Display (Glasses HUD) & UI Guidelines (F-056 / F-057)

The Storybook Hub provides a monocular Optical See-Through (OST) Head-Up Display interface in `#glasses-hud`, accompanied by comprehensive architectural interaction guidelines (`docs/superpowers/specs/glasses-hud-design.md` and rendered `docs/superpowers/specs/glasses-hud-design.html`):

1. **Optical Waveguide Physics & Additive Light Model**:
   - Built for MicroLED diffraction grating waveguides (25° monocular FOV, 3,500 nits luminescent brightness).
   - **All-Case Optical Dark Background**: In optical waveguides, true zero-emission black is 100% transparent glass, allowing physical reality to pass through unobstructed. Light or white card surfaces do not exist in optical waveguides; the HUD visor frame maintains its true optical dark background (`var(--joy-color-navy-950)`) across all themes and ambient scenes.
   - **P43 Phosphor Green (530nm Mono)**: Human eye photopic sensitivity $V(\lambda)$ peaks at 555nm (green). A single-color P43 green emitter produces 4× to 5× higher perceived luminance per milliwatt than blue or red, punching through direct 10,000-lux ambient sunlight with 3,500+ nits while preserving all-day battery life.
   - **Optical Phosphor Emitter Switcher**: Toggle between `P43 Phosphor Green (530nm Mono)` [default], `P20 Amber Phosphor (585nm)`, and `Polychrome Dual-RGB`.
   - **Ambient Optic Scene Switcher**: `Cyberpunk Night`, `Daylight Walk`, `Optical Bench`.

2. **Single-Color Symbolic State & Selection Matrix**:
   - Because single-color optics cannot rely on color hue variance, all interactive states and hierarchical navigation use high-contrast geometric symbols and typographic fills:
     - **Active Selection**: `▶` cursor arrow with military HUD reverse-video highlight (solid phosphor green rectangular bar with dark black text).
     - **Checklist States**: `[x]` for completed tasks (with strikethrough text) vs `[ ]` for pending tasks.
     - **Destructive Actions**: `[×] [ Delete ]` cross notation.
     - **Audio States**: `▶ TALKING` (with animated green phosphor meter bars), `[~ LISTEN]` (listening standby), `〇 WATCH` (glance mode), `● REC` (voice recording).
     - **Directional Navigation**: `▲ Swipe (Prev)`, `▼ Swipe (Next)`, `◄ Double Tap (Back)`.

3. **Audio-Visual Communication State Machine**:
   - Deterministic 4-state machine: `Listening` (ambient active mic), `Watching` (CV glance), `AI Talking` (synthesized speech output), and `Recording` (hands-free memo).
   - Instant Tap-to-Interrupt: tapping the temple touchpad during AI speech halts Claudia immediately and frees user attention without latency stalls.
   - Streaming conversational transcript box displaying interactive turn-taking between `User` and `Claudia (Agent)`.

4. **Dual-Panel 50% / 50% Monocular Visor**:
   - **Left Panel (Communication Stream)**: Live state indicator pill, prompt simulator chips (`Prompt: Checklist`, `Prompt: Meeting`), and animated cursor speech feed.
   - **Right Panel (Hierarchical Assist Navigation)**:
     - *Control Center*: Top launcher for Conversation Control, Daily Todos (`[ 1 / 3 ]`), and Notifications (`[ 2 ] 10m ago`).
     - *Today Todos Checklist*: Interactive task list with reverse-video selection (`▶ [ ] Walk 3 Km`, `[x] Prepare Meeting note`).
     - *Todo Detail Action Tray*: Action buttons (`[x] [ Mark done ]`, `[ ] [ Mark not done ]`, `[×] [ Delete ]`) with live counter badge sync.
     - *Communication Control Guide*: Touch gesture syntax reference.

5. **Temple Capacitive Touchpad Gesture Simulator**:
   - Hardware controls: Tap (`▶ Select / ⏸ Interrupt`), Double Tap (`◄ Back`), Swipe Down / Up (`▼ / ▲ Cursor`), Hold (`● Record Memo`).
   - Live gesture event feed telemetry.
   - Strict Zero OS Emoji policy with vector icons from `@joymify/icons` and 100% WCAG 2.2 AA token contrast.

### Contracts and screenshots

`apps/storybook-hub/tests/contracts.spec.ts` covers the hub in these contracts. Most run on the `desktop-chrome` project and set their own viewports.

- **Contract 5**: the kinetic hero is a `HeroSection`; the palette follows the theme; no paint sits under the hero text; the field is still under reduced motion, hidden on a touch pointer, and schedules no frames while off screen.
- **Contract 6**: every manifest view at 375px and 1280px, in light and dark. It checks for no document or `.main` horizontal overflow, no element past the viewport, no content cut off inside an `overflow: hidden` box, and no `background-clip: text`. It writes one screenshot per view, theme and width to `apps/storybook-hub/test-results/` (gitignored).
- **Contract 7**: `data-theme` is right at the first animation frame for an OS light or dark preference, and a saved choice wins after reload.
- **Contract 8**: topbar and sidebar text has a contrast ratio of at least 4.5:1 in both themes, at 375px and 1280px.
- **Contract 8b**: card outlines stay visible against the canvas and the card surface in both themes; Contract 8 also checks that the drawer scrim darkens the page in both themes.
- **Contract 9**: phone chrome, 44px hit areas, the drawer focus trap and the framework switcher in the drawer.
- **Contract 9b**: the market filter is 16px on phones, so iOS does not zoom on focus.
- **Contract 10**: the slop sweep over every view, plus reduced motion.

Run them:

```bash
node apps/storybook-hub/build.js
cd apps/storybook-hub && PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/contracts.spec.ts --project=desktop-chrome
F040_SCREENS=1 PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/screens-f040.spec.ts --project=desktop-chrome
```

The last command writes the 16 acceptance screenshots (landing, primitives, forms and data display, at 375px and 1280px, light and dark) to `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens/`. The per-issue status of the hub audit (HUB-001 to HUB-070), including the deferrals, is in `research/issue-coverage.md` in the same folder.

## Brand kit

`packages/brand` (`@joymify/brand`) is the single source for the Joymify mark, wordmark, hero banner and social card. Geometry (`src/geometry.js`) and pure SVG renderers (`src/render.js`) take a palette built from the light-theme `--joy-brand-*` values in `packages/tokens/dist/theme.css`, so every asset traces back to the tokens, never a hand-typed hex. `node packages/brand/build.js` regenerates the committed files below; a drift test in `packages/brand/test/` fails if the committed output and a fresh build disagree. See the generated [Brand](DESIGN.md#brand) section of `DESIGN.md` for the mark geometry, the wordmark padding/overflow rules, the `--joy-brand-*` table and the Don'ts.

The `Wordmark` component's glyph deliberately overflows about 8% of its height on each edge (it renders with `overflow: visible`), so a parent must not clip it with `overflow: hidden` unless that parent also adds matching padding back.

### Assets (`packages/brand/assets/`)

| File                                      | Size                    | Use                                                                                 |
| ----------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `mark.svg`                                | 32 viewBox              | diamond on navy tile, for app icons                                                 |
| `mark-bare.svg`                           | 32 viewBox              | gold diamond, transparent, for inline use                                           |
| `favicon.svg`                             | 32                      | same as `mark.svg`, with `<title>Joymify</title>`                                   |
| `favicon-32.png`, `apple-touch-icon.png`  | 32, 180                 | raster fallbacks                                                                    |
| `wordmark-deep.svg`, `wordmark-cream.svg` | mark + "Joymify" lockup | on light and dark surfaces                                                          |
| `og-card.svg`, `og-card.png`              | 1200×630                | social share card: navy field, diamond, wordmark, tagline, thin gold rule           |
| `hero-banner.svg`                         | 1600×560                | decorative navy banner with a fine gold diamond lattice fading to one side, no text |

### Adoption

Favicon and Open Graph tags, served from wherever a consumer copies `packages/brand/assets/` (e.g. `static/brand/`). A bundler-aware consumer can instead import a file directly through the package's `./assets/*` export, e.g. `@joymify/brand/assets/favicon.svg`:

```html
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
<meta property="og:image" content="https://<your-host>/brand/og-card.png" />
```

Components, Svelte and React:

```js
import { BrandMark, Wordmark, Ribbon, BrandBanner } from "@joymify/svelte";
```

```jsx
import { BrandMark, Wordmark, Ribbon, BrandBanner } from "@joymify/react";
```

## Palette presets

Joymify ships five curated architectural palette presets under the `data-palette` attribute, supporting both Light and Dark modes (`data-theme="light"` / `data-theme="dark"`). Every preset defines all 24 semantic token keys and passes the 110-pair WCAG 2.2 AA automated contrast gate (≥ 4.5:1 text, ≥ 3.0:1 borders):

| Preset (`data-palette`) | Physical Scene & Vernacular                              | Action Accent (`--joy-accent-default`)       | Identity Anchors                                                       |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| `classic`               | Oxford ledger, navy cloth, brass, parchment              | Ochre Gold (`#c49a3a` / `#dab362`)           | Oxford Navy (`#14253e`), Parchment Cream (`#f8f3e8`)                   |
| `bauhaus-primary`       | Dessau painted steel, glass, architectural wayfinding    | Architectural Cobalt (`#1e40af` / `#2563eb`) | Graphic Charcoal (`#101828`), Crimson & Cadmium emblems                |
| `clay-court`            | Roland-Garros crushed brick, chalk line, shaded pine     | Fired Terracotta (`#9c4221` / `#d97746`)     | Court Pine (`#264e22`), Court Line White (`#fbf0ea`)                   |
| `nordic-slate`          | Granite, Arctic fjord water, silvered mist paper         | Arctic Fjord Navy (`#0369a1` / `#075985`)    | Architectural Granite (`#101828` / `#1e293b`), Silver Mist (`#f8fafc`) |
| `verdant-lawn`          | Cut grass, racing green paint, ivory linen, trophy metal | British Racing Green (`#143d2b` / `#22593d`) | Champagne Gold (`#c9a227` / `#d6b64a`), Lawn Ivory (`#f4f6f0`)         |

To apply a preset globally, set `data-palette` on `<html>` or any container subtree:

```html
<html data-palette="bauhaus-primary" data-theme="dark"></html>
```

## Deprecated token aliases

<!-- BEGIN GENERATED:deprecated-aliases -->
<!-- Generated by scripts/gen-design-md.mjs. Do not edit by hand. -->

64 legacy aliases still resolve, marked `@deprecated` in `@joymify/tokens` types. Replace them with the semantic token.

| Deprecated | Use instead |
| --- | --- |
| `--joy-color-brand-primary` | `--joy-accent-default` |
| `--joy-color-brand-primary-hover` | `--joy-accent-hover` |
| `--joy-color-brand-secondary` | `--joy-color-navy-500` |
| `--joy-color-brand-accent` | `--joy-accent-default` |
| `--joy-color-brand-navy` | `--joy-color-navy-500` |
| `--joy-color-brand-gold` | `--joy-color-gold-400` |
| `--joy-color-brand-cream` | `--joy-color-cream-100` |
| `--joy-color-brand-ink` | `--joy-color-ink-500` |
| `--joy-color-surface-base` | `--joy-surface-card` |
| `--joy-color-surface-canvas` | `--joy-surface-canvas` |
| `--joy-color-surface-card` | `--joy-surface-card` |
| `--joy-color-surface-subtle` | `--joy-surface-sunken` |
| `--joy-color-surface-muted` | `--joy-surface-sunken` |
| `--joy-color-surface-elevated` | `--joy-surface-raised` |
| `--joy-color-surface-dark-base` | `--joy-color-navy-950` |
| `--joy-color-surface-dark-card` | `--joy-color-navy-900` |
| `--joy-color-surface-dark-subtle` | `--joy-color-navy-800` |
| `--joy-surface-frosted` | no direct replacement; pick the semantic role that matches the use |
| `--joy-backdrop-blur` | no direct replacement; pick the semantic role that matches the use |
| `--joy-color-border-base` | `--joy-border-default` |
| `--joy-color-border-subtle` | `--joy-border-subtle` |
| `--joy-color-border-default` | `--joy-border-default` |
| `--joy-color-border-dark` | `--joy-border-strong` |
| `--joy-border` | `--joy-border-default` |
| `--joy-border-hairline` | `--joy-border-subtle` |
| `--joy-color-text-primary` | `--joy-text-primary` |
| `--joy-color-text-secondary` | `--joy-text-secondary` |
| `--joy-color-text-muted` | `--joy-text-muted` |
| `--joy-color-text-inverse` | `--joy-text-inverse` |
| `--joy-color-status-success` | `--joy-status-success-fg` |
| `--joy-color-status-warning` | `--joy-status-warning-fg` |
| `--joy-color-status-danger` | `--joy-status-danger-fg` |
| `--joy-color-status-info` | `--joy-status-info-fg` |
| `--joy-spacing-1` | `--joy-space-1` |
| `--joy-spacing-2` | `--joy-space-2` |
| `--joy-spacing-3` | `--joy-space-3` |
| `--joy-spacing-4` | `--joy-space-4` |
| `--joy-spacing-6` | `--joy-space-6` |
| `--joy-spacing-8` | `--joy-space-8` |
| `--joy-radius-sm` | no direct replacement; pick the semantic role that matches the use |
| `--joy-radius-md` | `--joy-radius-control` |
| `--joy-radius-lg` | `--joy-radius-card` |
| `--joy-radius-xl` | `--joy-radius-overlay` |
| `--joy-radius-full` | `--joy-radius-pill` |
| `--joy-motion-duration-fast` | `--joy-duration-fast` |
| `--joy-motion-duration-normal` | `--joy-duration-normal` |
| `--joy-motion-duration-slow` | `--joy-duration-slow` |
| `--joy-motion-easing-standard` | `--joy-ease-in-out` |
| `--joy-motion-easing-decelerate` | `--joy-ease-out` |
| `--joy-motion-easing-accelerate` | no direct replacement; pick the semantic role that matches the use |
| `--joy-motion-easing-spring` | no direct replacement; pick the semantic role that matches the use |
| `--joy-shadow-sm` | `--joy-elevation-1` |
| `--joy-shadow-md` | `--joy-elevation-2` |
| `--joy-shadow-lg` | `--joy-elevation-3` |
| `--joy-shadow-overlay` | no direct replacement; pick the semantic role that matches the use |
| `--joy-z-index-dropdown` | `--joy-z-dropdown` |
| `--joy-z-index-modal` | `--joy-z-modal` |
| `--joy-z-index-tooltip` | `--joy-z-tooltip` |
| `--joy-font-display-letter-spacing` | no direct replacement; pick the semantic role that matches the use |
| `--joy-font-variant-numeric` | no direct replacement; pick the semantic role that matches the use |
| `--joy-form-label-width` | no direct replacement; pick the semantic role that matches the use |
| `--joy-danger-solid-bg` | `--joy-status-danger-solid-bg` |
| `--joy-danger-solid-fg` | `--joy-status-danger-solid-fg` |
| `--joy-danger-solid-border` | `--joy-status-danger-solid-border` |

<!-- END GENERATED:deprecated-aliases -->
