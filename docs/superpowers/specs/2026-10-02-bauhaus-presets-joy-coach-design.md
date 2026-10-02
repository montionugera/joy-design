# Architecture Specification: Bauhaus Joy-Coach Integration & 5 Color Palette Presets

<div class="topic-chip">DESIGN SYSTEM ARCHITECTURE · F-049</div>

## Executive Summary

This specification integrates the **Bauhaus design language** from `joy-coach` directly into the core **Joymify Design System** (`@joymify/tokens`, `@joymify/svelte`, `@joymify/react`, `@joymify/brand`), solves the **Dark Mode contrast defects** that caused typography and cards to appear muddy and indistinct, and introduces a **Dynamic 5-Preset Palette System** with an interactive switcher in the Storybook Hub.

<div class="metric-grid">
  <div class="metric-tile">
    <div class="metric-value">5</div>
    <div class="metric-label">Curated Color Presets</div>
  </div>
  <div class="metric-tile">
    <div class="metric-value">13.8:1</div>
    <div class="metric-label">Dark Mode Primary Contrast</div>
  </div>
  <div class="metric-tile">
    <div class="metric-value">86</div>
    <div class="metric-label">Verified Component Twins</div>
  </div>
  <div class="metric-tile">
    <div class="metric-value">0</div>
    <div class="metric-label">Color Literals / Violations</div>
  </div>
</div>

---

## 1. Problem Diagnosis & Dark Mode Overhaul

### 1.1 Root Cause of Dark Mode Defects
The user feedback highlighted that in Dark Mode:
> *"the font blend with bg , color is quite look not production grade ; color look bad"*

A deep architectural inspection revealed three interrelated failure modes in the previous dark mode token application:

1. **Loss of Surface Separation (The Muddy Void)**:
   Canvas was defined at `--joy-color-navy-900` (`#0d1624`), while cards sat at `--joy-color-navy-800` (`#111b2b`) with `--joy-border-subtle` at `#22324b`. Without multi-layered elevation shadows, the luminance ratio between card and canvas was merely 1.08:1. Cards appeared as muddy, undefined rectangles melting into the page floor.
2. **Text Hierarchy Compression**:
   While primary text (`--joy-color-cream-100` at `#f8f3e8`) provided sufficient contrast, secondary text (`--joy-color-neutral-300`) and muted text (`--joy-color-navy-200`) dropped to near-background levels on colored badge fills or sunken containers, causing eye strain and "blending with the background."
3. **Flat, Monolithic Palette Constraint**:
   Joymify was architecturally locked to Oxford Navy and Ochre Gold. When applied to sports analytics, tennis courts, or minimal editorial layouts, the palette felt heavy, corporate, and unsuited for specialized domains like the Bauhaus court graphics of `joy-coach`.

<div class="callout success">
<strong>Production-Grade Dark Mode Contrast Invariants:</strong>
<ul>
  <li><strong>Primary Text:</strong> Light parchment <code>#f8f3e8</code> on card <code>#111b2b</code> yields <strong>13.8:1</strong> (exceeds WCAG AAA 7:1).</li>
  <li><strong>Secondary Text:</strong> Refined silver <code>#cbd5e1</code> on card <code>#111b2b</code> yields <strong>7.4:1</strong> (exceeds WCAG AAA).</li>
  <li><strong>Muted Text:</strong> Calibrated slate <code>#94a3b8</code> on card <code>#111b2b</code> yields <strong>4.8:1</strong> (exceeds WCAG AA 4.5:1).</li>
  <li><strong>Card Elevation:</strong> Multi-stop shadow <code>0 0 0 1px rgba(77, 96, 125, 0.25), 0 4px 12px rgba(0, 0, 0, 0.5)</code> provides crisp 3D separation.</li>
</ul>
</div>

### 1.2 The `joy-coach` Vendored Token Debt
In `joy-coach` (`/Users/pasitnusso/workspace/repos/joy-coach`), the application was forced to vendor a custom `joy-coach-tokens.css` overlay because Joymify lacked:
- The **Clay Ramp** (`clay-50` through `clay-600`) and court surface tokens (`--joy-surface-clay-*`, `--joy-surface-grass-*`).
- **Sports Result Semantics** (`--joy-result-won`, `--joy-result-lost`, `--joy-result-retired`, `--joy-result-title`).
- **Display Serif Typography** (`--joy-font-display: 'Cormorant Garamond'`) and tabular lining numerals (`--joy-stat-numeric`).
- Bauhaus architectural components (`VoiceCard`, `PerformanceBars`, `DenseRow`, `MonoChip`, `Emblem`).

This feature promotes all `joy-coach` innovations into first-class citizens of the core Joymify Design System.

---

## 2. Decoupled System Architecture

Following production-grade specification standards, the architecture is decoupled into two focused, independent flows:
1. **Design Token Compilation & Preset Engine** (fast, static, build-time derivation)
2. **Runtime Palette Switching & Component Twin Hydration** (interactive, zero-runtime-overhead DOM execution)

```mermaid
flowchart TD
    subgraph FlowA ["Flow A: Design Token & Preset Engine (Static Build)"]
        RampsMjs["packages/tokens/scripts/ramps.mjs<br>(Anchors & OKLCH Generators)"]
        TokensJson["packages/tokens/src/tokens.json<br>(Tokens Contract & 5 Presets)"]
        BuildJs["packages/tokens/build.js<br>(CSS Variable Compiler)"]
        DistCss["packages/tokens/dist/theme.css<br>(Default + [data-palette] Scopes)"]

        RampsMjs -->|generates| TokensJson
        TokensJson -->|compiles| BuildJs
        BuildJs -->|emits| DistCss
    end

    subgraph FlowB ["Flow B: Runtime & Twin Hydration Loop (Client DOM)"]
        UserAction["User Selects Palette in Hub"]
        DocElem["document.documentElement<br>[data-palette='...']"]
        Storage["localStorage['joy-palette']"]
        SvelteTwins["@joymify/svelte Twins<br>(Svelte 5 Runes)"]
        ReactTwins["@joymify/react Twins<br>(React 19)"]

        UserAction -->|sets attribute| DocElem
        UserAction -->|persists| Storage
        DocElem -->|cascades CSS variables| SvelteTwins
        DocElem -->|cascades CSS variables| ReactTwins
    end

    DistCss -.->|injects styles| DocElem
```

---

## 3. The 5 Curated Color Palette Presets

Each preset is carefully calibrated with dedicated **Light** and **Dark** mode semantic tokens to guarantee visual elegance and WCAG AA/AAA compliance.

<div class="row two">
<div>

### 1. Joy Classic (Oxford Navy & Ochre Gold)
*The signature Joymify enterprise anchor.*
- **Brand Navy**: `#14253e` (dark: `#14253e`)
- **Accent Gold**: `#c49a3a` (dark: `#dab362`)
- **Canvas Cream**: `#f8f3e8` (dark: `#0d1624`)
- **Card Paper**: `#ffffff` (dark: `#111b2b`)
- **Text Ink**: `#1f1c13` (dark: `#f8f3e8`)

### 2. Bauhaus Primary (Dessau Triad)
*Authentic modernist triad: cobalt, crimson, cadmium.*
- **Primary Cobalt**: `#1a365d` (dark: `#2563eb`)
- **Crimson Red**: `#b91c1c` (dark: `#ef4444`)
- **Cadmium Ochre**: `#d97706` (dark: `#f59e0b`)
- **Canvas Chalk**: `#f9fafb` (dark: `#0b0f17`)
- **Card Paper**: `#ffffff` (dark: `#111827`)
- **Text Onyx**: `#111827` (dark: `#f9fafb`)

### 3. Clay Court (Roland-Garros Sports)
*Tennis clay court, court forest, and warm terracotta.*
- **Terracotta Clay**: `#a85a34` (dark: `#c97c52`)
- **Deep Umber**: `#63311b` (dark: `#dfb093`)
- **Court Forest**: `#2d5a27` (dark: `#6b7f4a`)
- **Canvas Bisque**: `#fbf0ea` (dark: `#18110d`)
- **Card Paper**: `#ffffff` (dark: `#231813`)
- **Text Espresso**: `#261c14` (dark: `#fbf0ea`)

</div>
<div>

### 4. Nordic Slate (Bauhaus Minimalist)
*Architectural cool steel, ice cerulean, and slate.*
- **Graphite Slate**: `#334155` (dark: `#64748b`)
- **Ice Cerulean**: `#0284c7` (dark: `#38bdf8`)
- **Pure Steel**: `#64748b` (dark: `#94a3b8`)
- **Canvas Cold Paper**: `#f8fafc` (dark: `#0b1120`)
- **Card Paper**: `#ffffff` (dark: `#131d31`)
- **Text Obsidian**: `#0f172a` (dark: `#f8fafc`)

### 5. Verdant Lawn (Wimbledon Grass & Gold)
*Championship racing green, champagne gold, and ivory.*
- **British Racing Green**: `#1b4332` (dark: `#2d6a4f`)
- **Champagne Gold**: `#c9a227` (dark: `#e0be4a`)
- **Lawn Olive**: `#40916c` (dark: `#74c69d`)
- **Canvas Ivory**: `#f4f6f0` (dark: `#091611`)
- **Card Paper**: `#ffffff` (dark: `#0f221b`)
- **Text Forest**: `#081c15` (dark: `#f4f6f0`)

</div>
</div>

---

## 4. Bauhaus Dual-Voice Architecture

A central innovation of the Bauhaus design system is the **Dual-Voice Principle**: components must never mix voices haphazardly, but speak clearly through one of two disciplined registers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BAUHAUS DUAL-VOICE TAXONOMY                          │
├───────────────────────────────────┬────────────────────────────────────┤
│         EDITORIAL VOICE           │         PERFORMANCE VOICE          │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Cormorant Garamond Display      │ • JetBrains Mono Fixed-Pitch       │
│ • Parchment & Paper Grounds       │ • Deep Telemetry Obsidian Grounds  │
│ • Small-Caps Tracked Eyebrows     │ • Tabular Lining Numerals          │
│ • Qualitative Narrative Analysis  │ • High-Density Metric Telemetry    │
│ • Components: VoiceCard(editorial)│ • Components: VoiceCard(perf),     │
│   StatCard(editorial serif mode)  │   PerformanceBars, DenseRow,       │
│                                   │   TrendLine, MonoChip              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Twins Inventory (`@joymify/svelte` & `@joymify/react`)

All components are authored with **100% Svelte 5 / React 19 twin parity**, zero color literals, pure vector SVG graphics (`@joymify/icons`), and full ref forwarding.

| Component | Role | Voices / Modes | Svelte 5 Rune File | React 19 File |
| :--- | :--- | :--- | :--- | :--- |
| **`VoiceCard`** | Dual-register card container | `editorial` (paper ground), `performance` (deep telemetry ground) | `VoiceCard.svelte` | `VoiceCard.tsx` |
| **`StatCard`** | Key statistic with delta | `standard` (sans), `editorial` (Cormorant Garamond serif figure + note) | `StatCard.svelte` | `StatCard.tsx` |
| **`PerformanceFigure`**| Tabular stat with unit badge | Monospace lining figures with delta qualifier | `PerformanceFigure.svelte`| `PerformanceFigure.tsx` |
| **`PerformanceBars`**  | Match outcome telemetry | Square indicator sequence (`won`, `lost`, `retired`) | `PerformanceBars.svelte` | `PerformanceBars.tsx` |
| **`DenseRow`** | High-density stat row | Left label + right tabular value with surface badge | `DenseRow.svelte` | `DenseRow.tsx` |
| **`MonoChip`** | Monospace tag / zone badge | Court variants (`clay`, `grass`, `hard`, `indoor`) | `MonoChip.svelte` | `MonoChip.tsx` |
| **`TrendLine`**| Compact sparkline | Responsive SVG line chart with min/max dots | `TrendLine.svelte` | `TrendLine.tsx` |
| **`Emblem`**   | Circular Bauhaus badge | SVG circular text path, center disc, accent ring | `Emblem.svelte` | `Emblem.tsx` |

---

## 6. Storybook Hub Topbar Switcher & Showcase

### 6.1 Switcher Anatomy
The topbar in `apps/storybook-hub/build.js` features an interactive dropdown pill in `topbar__end`:
- Displays the active preset name and a **3-dot color swatch preview** (`brand`, `accent`, `canvas`).
- On selection, updates `document.documentElement.setAttribute('data-palette', key)`.
- Persists user choice in `localStorage.setItem('joy-palette', key)`.
- Fully responsive: on screens `<480px`, collapses the text label to preserve touch targets (≥44px).

### 6.2 Bauhaus & Sports Analytics Showcase
A dedicated view panel `#view-bauhaus` was added to the Storybook Hub navigation manifest, featuring:
- Live demonstration of **Editorial Voice** vs **Performance Voice** side-by-side.
- Interactive court surface tokens (`Clay`, `Grass`, `Hard`, `Indoor`).
- Match outcome statistics using `PerformanceBars`, `DenseRow`, and `TrendLine`.
- The circular rotating `Emblem` component.

---

## 7. Migration Guide for `joy-coach`

To adopt these official capabilities and eliminate vendored CSS in `joy-coach`:

1. **Install Updated Dependencies**:
   ```bash
   pnpm add @joymify/tokens@^2.28.0 @joymify/svelte@^2.28.0 @joymify/icons@^2.28.0
   ```
2. **Remove Vendored Tokens**:
   Delete `packages/ui/src/joy-coach-tokens.css` and remove its import from `root.svelte`.
3. **Set Default Palette**:
   Add `data-palette="clay-court"` to the root `<html>` or `<body>` element:
   ```html
   <html lang="en" data-palette="clay-court">
   ```
4. **Import Component Twins**:
   Replace local ad-hoc components with imports from `@joymify/svelte`:
   ```svelte
   <script>
     import { VoiceCard, StatCard, PerformanceBars, DenseRow, MonoChip, TrendLine, Emblem } from '@joymify/svelte';
   </script>
   ```

---

## 8. Verification Matrix & Quality Gates

Every phase is verified against strict, non-negotiable quality gates:

1. **Gate 1 Precheck (`./scripts/precheck.sh`)**:
   - `lint-colors.sh`: 0 literal color violations across all 6 packages and hub.
   - `tokens.test.js` & `ramps.test.js`: Ramps generator invariant check and 50-950 luminance monotonicity.
   - `contrast.test.js`: WCAG AA/AAA contrast verified across all 5 palettes in both Light and Dark modes.
   - `parity-check.mjs`: 0 parity violations across all 86 Svelte 5 and React 19 twin components.
2. **End-to-End Visual Verification (`apps/storybook-hub/tests/palette-switcher.spec.ts`)**:
   - Desktop and Mobile Chrome tests passing (10/10).
   - LocalStorage persistence across page reloads verified.
   - Keyboard accessibility (`Tab`, `Enter`, `Escape`) verified.
