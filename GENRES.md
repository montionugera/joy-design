# Joymify Genre & Immersive Theme Engine (`@montionugera/joy-tokens/genres.css`)

While `DESIGN.md` and `@montionugera/joy-tokens/theme.css` govern **Financial / Enterprise / Consumer Instrument UIs** with zero extra payload, `GENRES.md` and `@montionugera/joy-tokens/genres.css` provide an **opt-in 5-Axis Genre Theme Engine** for Video Games, RPGs, Lore Codices, Cyberpunk Tactical HUDs, Anime/Gacha experiences, and Neo-Brutalist drops.

---

## 1. Opt-In Usage (Zero Context or CSS Bloat on Corporate Apps)

Import `@montionugera/joy-tokens/genres.css` alongside `theme.css` **only** in apps or routes that use genre palettes:

```ts
import "@montionugera/joy-tokens/theme.css";
import "@montionugera/joy-tokens/genres.css";
```

Then set `data-palette` on `<html>`, `<body>`, or a scoped `<LandingPage>` / container:

```html
<div data-theme="dark" data-palette="cyberpunk">
  <!-- All .joy-card, .joy-button, .joy-badge, .joy-hero components automatically
       bind to the 5-Axis Genre variables -->
</div>
```

---

## 2. The 5 Structural Axes

Unlike corporate `[data-palette]` presets (which only swap 24 color variables), every genre preset in `genres.css` overrides **5 orthogonal axes**:

1. **Typography & Display Voice**: `--joy-font-family-heading`, `--joy-letter-spacing-heading`, `--joy-text-transform-heading`
2. **Silhouette & Geometry**: `--joy-radius-card`, `--joy-radius-control`, `--joy-clip-path-card`, `--joy-clip-path-control`
3. **Frame & Ornament**: `--joy-border-width-card`, `--joy-border-width-control`, `--joy-frame-outline`, `--joy-frame-outline-offset`, `--joy-card-accent-bar`
4. **Atmosphere & FX**: `--joy-fx-glow`, `--joy-fx-button-shadow`, `--joy-surface-pattern`
5. **Dual-Accent Chromatic Tension**: `--joy-accent-default` + `--joy-accent-secondary`, `--joy-accent-secondary-subtle`, `--joy-accent-secondary-text`

---

## 3. Built-In Genre Archetypes

| `data-palette` | Archetype Name             | Target Categories                                    | Key Structural Signature                                                                                                                                                                                                                              |
| -------------- | -------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cyberpunk`    | **Cyberpunk Tactical HUD** | Sci-Fi / Tactical Shooter / Neural HUD               | `2px` corners, `clip-path` corner chamfers (`16px` on cards, `10px` on controls), `Rajdhani`/`Orbitron` uppercase `+0.04em` display, CRT scanline pattern, Cyan + Neon Magenta dual-accent tension                                                    |
| `obsidian`     | **Obsidian Reliquary**     | Dark Fantasy / Grimdark RPG / Lore Codex             | `4px` card corners, `9999px` star-capped capsule buttons, inlaid double border (`outline-offset: -5px`), `Cinzel`/`Cormorant Garamond` serif headers, warm candlelight vignette, Crimson (light) / Gold (dark) accent with Bronze / Crimson secondary |
| `astral`       | **Astral Odyssey**         | Celestial Fantasy MMORPG / Anime RPG / Summon Banner | `14px` card corners, `9999px` star-capped capsule buttons, `2px` card borders, hard zero-blur `0 3px 0` to `0 12px 0` cel shadows, Indigo (light) / Starlight Gold (dark) accent with Amber / Sky Blue secondary                                      |
| `quantum`      | **Quantum Brutalist**      | Neo-Brutalist / Arcade Fighter / Web3 Drop           | `0px` raw corners, `2px` exposed structural borders, `3px 3px 0` to `12px 12px 0` hard offset block shadows, `Space Grotesk` uppercase `-0.02em` display, Violet + Green (light) / Acid Lime + Electric Violet (dark) tension                         |
| `titanium`     | **Titanium Mecha**         | Hard-Surface Sci-Fi / Mecha Hangar / Sim Telemetry   | Single top-right `12px` chamfer on cards (buttons stay `2px` rectangles), diagonal hazard-hatch surface pattern, `Chakra Petch` uppercase `+0.04em` display, Afterburner Orange + Cryo Blue tension                                                   |

Chamfered cards (`cyberpunk`, `titanium`) use `clip-path`, which also clips any descendant that overflows the card (popovers, menus, focus outlines). Modals and drawers therefore never receive the chamfer. Render overlays outside the card (portal) or inside a genre without a card `clip-path`.

-------------- | -------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cyberpunk` | **Cyberpunk Tactical HUD** | Sci-Fi / Tactical Shooter / Neural HUD | 45-degree `clip-path` chamfers, `Rajdhani`/`Orbitron` uppercase `+0.07em` display, CRT scanline pattern, Cyan + Neon Magenta dual-accent tension |
| `obsidian` | **Obsidian Reliquary** | Dark Fantasy / Grimdark RPG / Lore Codex | `2px` forged corners, inlaid double gold border (`outline-offset: -5px`), `Cinzel`/`Cormorant` serif headers, warm candlelight vignette, Gold + Crimson Seal tension |
| `astral` | **Astral Pop** | Anime Action RPG / Cozy Chibi MMO / Gacha | `22px` squircles, `9999px` pills, `2px` cel ink outlines, hard `0 5px 0` zero-blur cel shadows, Starlight Gold + Sky Blue tension |
| `quantum` | **Quantum Brutalist** | Neo-Brutalist / Arcade Fighter / Web3 Drop | `0px` raw corners, `2px` exposed structural borders, `6px 6px 0` hard offset block shadows, Acid Lime + Electric Violet tension |
| `titanium` | **Titanium Mecha** | Hard-Surface Sci-Fi / Mecha Hangar / Sim Telemetry | Single top-right `12px` chamfer, diagonal hazard-hatch surface pattern, Afterburner Orange + Cryo Blue tension |

---

## 4. WCAG 2.2 AA Mathematical Verification

All 5 genre presets are mathematically verified in both Light and Dark modes by `packages/tokens/test/genres.test.js`:

- **Body, secondary, muted, link, and dual-accent text** vs `surface-canvas`, `surface-card`, `surface-raised`: **>= 4.5:1**
- **Button action text (`--joy-text-on-accent`)** vs `accent-default`, `accent-hover`, `accent-active`: **>= 4.5:1**
- **Structural borders (`--joy-border-strong`)** vs `surface-canvas`, `surface-card`: **>= 3.0:1**
- **Text on subtle accent fills** (`text-primary`, `text-secondary`, `accent-text`, `text-link` on `accent-subtle`; `accent-secondary-text` on `accent-secondary-subtle`): **>= 4.5:1**
- **Focus indicators (`--joy-border-focus`, `--joy-focus-ring`)** vs `surface-canvas`, `surface-card`, `surface-raised`, `accent-subtle`: **>= 3.0:1**

The full generated table lives in `research/contrast-table-after.md`.

### Behaviour guarantees

- **Disabled buttons** look disabled in every genre: no accent fill, lattice or glow, even on the star-capped capsule buttons.
- **`prefers-reduced-motion: reduce`** removes genre transitions and animations.
- **`forced-colors: active`** drops decorative ornaments (finials, emblems, watermarks, chamfers) and shows plain system-colour borders; carousel arrows and dots become bordered shapes.
- `genres.css` does not load fonts. Load the families you use (for example `Cinzel`, `Rajdhani`, `Chakra Petch`, `Space Grotesk`); stacks fall back to system fonts.

---

## 5. Multi-Script Support: Thai (`th`), Japanese (`ja`), and Chinese (`zh-Hans` / `zh-Hant`)

`genres.css` includes built-in multi-script font stacks and `:lang(th)` / `:lang(ja)` / `:lang(zh)` / `[data-lang]` typographical rules:

- **Thai (`:lang(th)`, `[data-lang="th"]`)**:
  - Pairs Latin display fonts with `'Chakra Petch'` (Cyberpunk/Mecha), `'Noto Serif Thai'` (Obsidian RPG), `'Mitr'` / `'Kanit'` (Astral Gacha), and `'Anuphan'` (body prose).
  - Automatically resets `--joy-letter-spacing-heading: 0em` (`letter-spacing: 0em`) so Thai vowels and tone marks (`ั ิ ี ึ ื ุ ู ่ ้ ๊ ๋ ์`) never detach from consonants, and expands vertical line-height (`1.45`–`1.65`) so chamfered `clip-path` buttons never clip stacked Thai diacritics.
- **Japanese (`:lang(ja)`) & Chinese (`:lang(zh)`, `SC`/`TC`)**:
  - Pairs Latin display fonts with `'Shippori Mincho'` / `'Noto Serif JP'` / `'Noto Serif SC'` / `'Noto Serif TC'` (Obsidian RPG), `'M PLUS Rounded 1c'` / `'Zen Maru Gothic'` (Astral Gacha), and `'M PLUS 1 Code'` (Cyberpunk/Mecha).
  - Enforces `letter-spacing: 0.02em`, `line-break: strict`, and `word-break: keep-all` on buttons, badges, and navigation tabs.
