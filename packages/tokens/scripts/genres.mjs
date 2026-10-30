// 5-Axis Immersive & Genre Presets for @montionugera/joy-tokens/genres.css
// Opt-in stylesheet for Video Game, Dark Fantasy RPG (Lineage II), Celestial MMO (AION 2 / Ragnarok Origin),
// Cyberpunk HUD, and Neo-Brutalist experiences.
// Keeps core @montionugera/joy-tokens/theme.css lean and zero-bloat for corporate/product UI.

// Pure monochrome SVG masks (applied via CSS mask / -webkit-mask with background-color: var(--joy-*))
// so every ornament 100% aligns with the active Joy design tokens in both Light and Dark modes.
export const SVG_ORNAMENTS = {
  // 1. Ragnarok Origin "Videos" Asymmetric Double-Rhombus Watermark Mask
  doubleRhombusWatermark: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' viewBox='0 0 88 88' fill='none'%3E%3Cpolygon points='40,8 72,40 40,72 8,40' fill='black' fill-opacity='0.55'/%3E%3Cpolygon points='47,6 81,40 47,74 13,40' stroke='black' stroke-width='2' fill='none'/%3E%3Cpolygon points='18,68 22,72 18,76 14,72' fill='black'/%3E%3Cpolygon points='26,74 29,77 26,80 23,77' fill='black'/%3E%3C/svg%3E")`,

  // 2. Ragnarok Origin / Celestial Astrolabe Magic Seal Watermark Mask
  astrolabeWatermark: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96' fill='none'%3E%3Cg stroke='black'%3E%3Ccircle cx='48' cy='48' r='34' stroke-width='1.8' stroke-dasharray='3 3'/%3E%3Ccircle cx='48' cy='48' r='26' stroke-width='1.5'/%3E%3Cpath d='M48 6L51 15L48 20L45 15L48 6ZM48 90L51 81L48 76L45 81L48 90ZM6 48L15 51L20 48L15 45L6 48ZM90 48L81 51L76 48L81 45L90 48Z' fill='black' stroke='none'/%3E%3Cpath d='M38 32C30 38 30 58 38 64C33 56 33 40 38 32Z' fill='black' stroke='none'/%3E%3C/g%3E%3C/svg%3E")`,

  // 3. Beaded Diamond Filigree Wings (dashed line, diamonds, beads, then the title between two mirrored wings)
  beadedDiamondWingLeft: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='136' height='16' viewBox='0 0 136 16' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='gL' x1='0' y1='8' x2='136' y2='8' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='black' stop-opacity='0'/%3E%3Cstop offset='0.35' stop-color='black' stop-opacity='0.85'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cline x1='2' y1='8' x2='116' y2='8' stroke='url(%23gL)' stroke-width='1.6' stroke-dasharray='2 3'/%3E%3Cpolygon points='28,4 34,8 28,12 22,8' fill='black'/%3E%3Cpolygon points='76,5 80,8 76,11 72,8' fill='black' fill-opacity='0.8'/%3E%3Cpolygon points='124,2 132,8 124,14 116,8' fill='black'/%3E%3C/svg%3E")`,
  beadedDiamondWingRight: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='136' height='16' viewBox='0 0 136 16' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='gR' x1='136' y1='8' x2='0' y2='8' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='black' stop-opacity='0'/%3E%3Cstop offset='0.35' stop-color='black' stop-opacity='0.85'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cline x1='20' y1='8' x2='134' y2='8' stroke='url(%23gR)' stroke-width='1.6' stroke-dasharray='2 3'/%3E%3Cpolygon points='12,2 20,8 12,14 4,8' fill='black'/%3E%3Cpolygon points='60,5 64,8 60,11 56,8' fill='black' fill-opacity='0.8'/%3E%3Cpolygon points='108,4 114,8 108,12 102,8' fill='black'/%3E%3C/svg%3E")`,

  // 4. Lineage II / ROO "Videos" Tapering Needle + Diamond Filigree Wings (tapering needle line with diamond beads, mirrored around the title)
  flankingDiamondLeftGold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='16' viewBox='0 0 128 16' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='goldL' x1='0' y1='8' x2='110' y2='8' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='black' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M0 8L96 7V9L0 8Z' fill='url(%23goldL)'/%3E%3Cpolygon points='56,5 60,8 56,11 52,8' fill='black'/%3E%3Cpolygon points='96,4 101,8 96,12 91,8' fill='black'/%3E%3Cpolygon points='114,2 122,8 114,14 106,8' fill='black'/%3E%3C/svg%3E")`,
  flankingDiamondRightGold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='16' viewBox='0 0 128 16' fill='none'%3E%3Cdefs%3E%3ClinearGradient id='goldR' x1='128' y1='8' x2='18' y2='8' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='black' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M128 8L32 7V9L128 8Z' fill='url(%23goldR)'/%3E%3Cpolygon points='72,5 76,8 72,11 68,8' fill='black'/%3E%3Cpolygon points='32,4 37,8 32,12 27,8' fill='black'/%3E%3Cpolygon points='14,2 22,8 14,14 6,8' fill='black'/%3E%3C/svg%3E")`,

  // 5. Lineage II / ROO Capsule Edge Star-Diamond Finial + Inner Sparkle (four-point star finial with a small inner sparkle on each capsule end)
  // In a 28x20 viewBox, the outer star/diamond is centered at x=9 (left) or x=19 (right) so left:-9px / right:-9px places it dead-center on the capsule border curve!
  obsidianBtnCapLeft: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='20' viewBox='0 0 28 20' fill='none'%3E%3Cpath d='M9 2L11.4 7.6L17 10L11.4 12.4L9 18L6.6 12.4L1 10L6.6 7.6L9 2Z' fill='black'/%3E%3Cpath d='M22.5 6L23.8 8.7L26.5 10L23.8 11.3L22.5 14L21.2 11.3L18.5 10L21.2 8.7L22.5 6Z' fill='black' fill-opacity='0.9'/%3E%3C/svg%3E")`,
  obsidianBtnCapRight: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='20' viewBox='0 0 28 20' fill='none'%3E%3Cpath d='M19 2L16.6 7.6L11 10L16.6 12.4L19 18L21.4 12.4L27 10L21.4 7.6L19 2Z' fill='black'/%3E%3Cpath d='M5.5 6L4.2 8.7L1.5 10L4.2 11.3L5.5 14L6.8 11.3L9.5 10L6.8 8.7L5.5 6Z' fill='black' fill-opacity='0.9'/%3E%3C/svg%3E")`,

  // 6. Ragnarok Origin / AION 2 4-Point Star Capsule Edge Finial + Inner Sparkle (same four-point star finial with inner sparkle)
  astralBtnFiligreeLeft: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='20' viewBox='0 0 28 20' fill='none'%3E%3Cpath d='M9 2L11.4 7.6L17 10L11.4 12.4L9 18L6.6 12.4L1 10L6.6 7.6L9 2Z' fill='black'/%3E%3Cpath d='M22.5 6L23.8 8.7L26.5 10L23.8 11.3L22.5 14L21.2 11.3L18.5 10L21.2 8.7L22.5 6Z' fill='black' fill-opacity='0.9'/%3E%3C/svg%3E")`,
  astralBtnFiligreeRight: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='20' viewBox='0 0 28 20' fill='none'%3E%3Cpath d='M19 2L16.6 7.6L11 10L16.6 12.4L19 18L21.4 12.4L27 10L21.4 7.6L19 2Z' fill='black'/%3E%3Cpath d='M5.5 6L4.2 8.7L1.5 10L4.2 11.3L5.5 14L6.8 11.3L9.5 10L6.8 8.7L5.5 6Z' fill='black' fill-opacity='0.9'/%3E%3C/svg%3E")`,

  // 7. Carousel Crescent-Star Arrowheads (left and right crescent plus four-point star) & 4-Point / 8-Point Sunburst Pagination Nodes
  crescentArrowLeft: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24' fill='none'%3E%3Cpath d='M16 3C9 5 6 12 9 18C10 20 13 21 16 21C11 19 10 14 10 12C10 10 11 5 16 3Z' fill='black'/%3E%3Cpath d='M4 12L12 5V19L4 12Z' fill='black' fill-opacity='0.75'/%3E%3Cpath d='M18 8L19.5 11L22.5 12L19.5 13L18 16L16.5 13L13.5 12L16.5 11L18 8Z' fill='black'/%3E%3C/svg%3E")`,
  crescentArrowRight: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24' viewBox='0 0 28 24' fill='none'%3E%3Cpath d='M12 3C19 5 22 12 19 18C18 20 15 21 12 21C17 19 18 14 18 12C18 10 17 5 12 3Z' fill='black'/%3E%3Cpath d='M24 12L16 5V19L24 12Z' fill='black' fill-opacity='0.75'/%3E%3Cpath d='M10 8L8.5 11L5.5 12L8.5 13L10 16L11.5 13L14.5 12L11.5 11L10 8Z' fill='black'/%3E%3C/svg%3E")`,
  starNodeInactive: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18' fill='none'%3E%3Cpath d='M9 2L11 7L16 9L11 11L9 16L7 11L2 9L7 7L9 2Z' fill='black'/%3E%3C/svg%3E")`,
  sunburstNodeActive: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12 1L14.2 8.2L20 4L15.8 9.8L23 12L15.8 14.2L20 20L14.2 15.8L12 23L9.8 15.8L4 20L8.2 14.2L1 12L8.2 9.8L4 4L9.8 8.2L12 1ZM12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z' fill='black'/%3E%3C/svg%3E")`,

  // 8. Ragnarok Origin diagonal stripe block prefix (four slanted bars before a heading)
  diagonalStripePrefixCyan: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='28' viewBox='0 0 36 28' fill='none'%3E%3Cpath d='M2 26L12 2M10 26L20 2M18 26L28 2M26 26L34 6' stroke='black' stroke-width='3' stroke-linecap='square'/%3E%3C/svg%3E")`,

  // 9. AION 2 4-point starlight nav/tag prefix (four-point star with a hollow centre)
  starlightPrefix: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 18 18' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M9 0L11.2 6.8L18 9L11.2 11.2L9 18L6.8 11.2L0 9L6.8 6.8L9 0ZM9 11C10.1046 11 11 10.1046 11 9C11 7.89543 10.1046 7 9 7C7.89543 7 7 7.89543 7 9C7 10.1046 7.89543 11 9 11Z' fill='black'/%3E%3C/svg%3E")`,

  // 10. Lineage II / ROO rotated diamond emblem prefix (diamond outline with a solid inner diamond)
  diamondEmblemPrefix: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 18 18' fill='none'%3E%3Cpolygon points='9,1 17,9 9,17 1,9' stroke='black' stroke-width='1.8' fill='none'/%3E%3Cpolygon points='9,4.5 13.5,9 9,13.5 4.5,9' fill='black'/%3E%3C/svg%3E")`,
};

export const genrePresets = {
  cyberpunk: {
    name: "Cyberpunk Tactical HUD",
    category: "Sci-Fi / Tactical Shooter / Neural HUD",
    axes: {
      "font-family-heading":
        "'Rajdhani', 'Orbitron', 'Chakra Petch', 'IBM Plex Sans Thai', 'M PLUS 1 Code', 'Noto Sans Thai', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', var(--joy-font-family-mono)",
      "letter-spacing-heading": "0.04em",
      "text-transform-heading": "uppercase",
      "radius-card": "2px",
      "radius-control": "2px",
      "clip-path-card":
        "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      "clip-path-control":
        "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      "border-width-card": "1px",
      "border-width-control": "1px",
      "frame-outline": "1px solid var(--joy-border-subtle)",
      "frame-outline-offset": "-4px",
      "card-accent-bar": "3px solid var(--joy-accent-default)",
    },
    light: {
      "surface-canvas": "#eef6fa",
      "surface-card": "#f7fbfd",
      "surface-raised": "#e1eff6",
      "surface-sunken": "#d3e5ef",
      "text-primary": "#06131f",
      "text-secondary": "#163247",
      "text-muted": "#35566e",
      "text-on-accent": "#ffffff",
      "text-link": "#005a70",
      "border-subtle": "#a9c7d8",
      "border-default": "#6d9ab2",
      "border-strong": "#006680",
      "border-focus": "#006680",
      "accent-default": "#006680",
      "accent-hover": "#004f63",
      "accent-active": "#003b4a",
      "accent-subtle": "#d0eef5",
      "accent-text": "#00566b",
      "accent-secondary": "#b80058",
      "accent-secondary-subtle": "#fce4ef",
      "accent-secondary-text": "#940046",
      "focus-ring": "#006680",
      "fx-glow":
        "0 0 18px rgba(0, 102, 128, 0.22), inset 0 0 12px rgba(0, 102, 128, 0.06)",
      "fx-button-shadow": "0 0 14px rgba(0, 102, 128, 0.32)",
      "surface-pattern":
        "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 102, 128, 0.035) 3px)",
      "elevation-sm": "0 2px 6px -1px rgba(6, 19, 31, 0.12)",
      "elevation-md": "0 6px 16px -2px rgba(6, 19, 31, 0.18)",
      "elevation-lg": "0 14px 28px -4px rgba(6, 19, 31, 0.24)",
      "elevation-xl": "0 24px 44px -8px rgba(6, 19, 31, 0.30)",
    },
    dark: {
      "surface-canvas": "#050811",
      "surface-card": "#091020",
      "surface-raised": "#0f1a30",
      "surface-sunken": "#03050b",
      "text-primary": "#e6faff",
      "text-secondary": "#9ccce0",
      "text-muted": "#6d9cb2",
      "text-on-accent": "#030811",
      "text-link": "#00f0ff",
      "border-subtle": "#142c46",
      "border-default": "#1d4d73",
      "border-strong": "#00d8eb",
      "border-focus": "#00f0ff",
      "accent-default": "#00e5ff",
      "accent-hover": "#52f0ff",
      "accent-active": "#00b8cc",
      "accent-subtle": "#082c3d",
      "accent-text": "#00f0ff",
      "accent-secondary": "#ff2a85",
      "accent-secondary-subtle": "#3a0b24",
      "accent-secondary-text": "#ff7ab3",
      "focus-ring": "#00f0ff",
      "fx-glow":
        "0 0 22px rgba(0, 229, 255, 0.24), inset 0 0 16px rgba(0, 229, 255, 0.08)",
      "fx-button-shadow": "0 0 18px rgba(0, 229, 255, 0.42)",
      "surface-pattern":
        "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0, 229, 255, 0.03) 3px)",
      "elevation-sm": "0 2px 8px -1px rgba(0, 0, 0, 0.65)",
      "elevation-md": "0 8px 20px -2px rgba(0, 0, 0, 0.75)",
      "elevation-lg": "0 16px 36px -4px rgba(0, 0, 0, 0.85)",
      "elevation-xl": "0 24px 48px -8px rgba(0, 0, 0, 0.92)",
    },
  },

  obsidian: {
    name: "Obsidian Reliquary (Lineage II / Dark Fantasy RPG)",
    category: "Dark Fantasy / Grimdark MMORPG / Lore Codex",
    axes: {
      "font-family-heading":
        "'Cinzel', 'Cormorant Garamond', 'Noto Serif Thai', 'Shippori Mincho', 'Noto Serif JP', 'Noto Serif SC', 'Noto Serif TC', Georgia, serif",
      "letter-spacing-heading": "0.03em",
      "text-transform-heading": "none",
      "radius-card": "4px",
      "radius-control": "9999px",
      "clip-path-card": "none",
      "clip-path-control": "none",
      "border-width-card": "1px",
      "border-width-control": "1.5px",
      "frame-outline": "1px solid var(--joy-border-default)",
      "frame-outline-offset": "-5px",
      "card-accent-bar": "2px solid var(--joy-border-strong)",
    },
    light: {
      "surface-canvas": "#f4ede1",
      "surface-card": "#faf5ec",
      "surface-raised": "#ebe1d1",
      "surface-sunken": "#e0d4c0",
      "text-primary": "#1c150e",
      "text-secondary": "#403122",
      "text-muted": "#634d38",
      "text-on-accent": "#fff8eb",
      "text-link": "#7a1c1c",
      "border-subtle": "#d4c3aa",
      "border-default": "#b09774",
      "border-strong": "#785a32",
      "border-focus": "#7a1c1c",
      "accent-default": "#7a1c1c",
      "accent-hover": "#5e1414",
      "accent-active": "#470e0e",
      "accent-subtle": "#f2dada",
      "accent-text": "#7a1c1c",
      "accent-secondary": "#785a32",
      "accent-secondary-subtle": "#ede0cc",
      "accent-secondary-text": "#5e4524",
      "focus-ring": "#7a1c1c",
      "fx-glow":
        "inset 0 0 28px rgba(120, 90, 50, 0.14), 0 8px 24px rgba(28, 21, 14, 0.14)",
      "fx-button-shadow":
        "inset 0 0 0 1px rgba(212, 166, 74, 0.65), 0 4px 14px rgba(28, 21, 14, 0.32)",
      "surface-pattern":
        "radial-gradient(ellipse at 50% 0%, rgba(120, 90, 50, 0.12), transparent 70%)",
      "elevation-sm": "0 2px 6px -1px rgba(28, 21, 14, 0.12)",
      "elevation-md": "0 6px 16px -2px rgba(28, 21, 14, 0.18)",
      "elevation-lg": "0 14px 28px -4px rgba(28, 21, 14, 0.24)",
      "elevation-xl": "0 24px 44px -8px rgba(28, 21, 14, 0.32)",
    },
    dark: {
      "surface-canvas": "#0b0908",
      "surface-card": "#14100d",
      "surface-raised": "#1f1914",
      "surface-sunken": "#060504",
      "text-primary": "#f2e8d5",
      "text-secondary": "#c7b699",
      "text-muted": "#9c896b",
      "text-on-accent": "#140e06",
      "text-link": "#e5b85c",
      "border-subtle": "#2e241b",
      "border-default": "#544029",
      "border-strong": "#b89047",
      "border-focus": "#e5b85c",
      "accent-default": "#d4a64a",
      "accent-hover": "#e3ba68",
      "accent-active": "#b88b32",
      "accent-subtle": "#2b2011",
      "accent-text": "#e5b85c",
      "accent-secondary": "#9e2a2b",
      "accent-secondary-subtle": "#2e1112",
      "accent-secondary-text": "#f08080",
      "focus-ring": "#e5b85c",
      "fx-glow":
        "inset 0 0 32px rgba(212, 166, 74, 0.10), 0 12px 32px rgba(0, 0, 0, 0.82)",
      "fx-button-shadow":
        "inset 0 0 0 1px rgba(255, 240, 200, 0.55), 0 0 18px rgba(212, 166, 74, 0.35)",
      "surface-pattern":
        "radial-gradient(ellipse at 50% 0%, rgba(212, 166, 74, 0.14), transparent 70%)",
      "elevation-sm": "0 2px 8px -1px rgba(0, 0, 0, 0.70)",
      "elevation-md": "0 8px 20px -2px rgba(0, 0, 0, 0.80)",
      "elevation-lg": "0 16px 36px -4px rgba(0, 0, 0, 0.88)",
      "elevation-xl": "0 24px 48px -8px rgba(0, 0, 0, 0.94)",
    },
  },

  astral: {
    name: "Astral Odyssey (AION 2 / Ragnarok Origin MMORPG)",
    category: "Celestial Fantasy MMORPG / Anime RPG / Summon Banner",
    axes: {
      "font-family-heading":
        "'Cinzel', 'Fredoka', 'Plus Jakarta Sans', 'Mitr', 'Kanit', 'M PLUS Rounded 1c', 'Zen Maru Gothic', 'Noto Sans Thai', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', var(--joy-font-family-sans)",
      "letter-spacing-heading": "0.02em",
      "text-transform-heading": "none",
      "radius-card": "14px",
      "radius-control": "9999px",
      "clip-path-card": "none",
      "clip-path-control": "none",
      "border-width-card": "2px",
      "border-width-control": "1.5px",
      "frame-outline": "1px solid var(--joy-border-subtle)",
      "frame-outline-offset": "-4px",
      "card-accent-bar": "3px solid var(--joy-border-strong)",
    },
    light: {
      "surface-canvas": "#f0f5ff",
      "surface-card": "#ffffff",
      "surface-raised": "#e4edff",
      "surface-sunken": "#d4e2ff",
      "text-primary": "#17153b",
      "text-secondary": "#312e63",
      "text-muted": "#514d85",
      "text-on-accent": "#ffffff",
      "text-link": "#3730a3",
      "border-subtle": "#c7d7fe",
      "border-default": "#8198f8",
      "border-strong": "#312e81",
      "border-focus": "#4338ca",
      "accent-default": "#4338ca",
      "accent-hover": "#3730a3",
      "accent-active": "#312e81",
      "accent-subtle": "#e0e7ff",
      "accent-text": "#3730a3",
      "accent-secondary": "#b45309",
      "accent-secondary-subtle": "#fef3c7",
      "accent-secondary-text": "#92400e",
      "focus-ring": "#4338ca",
      "fx-glow":
        "0 8px 24px rgba(67, 56, 202, 0.14), inset 0 0 0 1px rgba(129, 152, 248, 0.35)",
      "fx-button-shadow":
        "inset 0 0 0 2px rgba(255, 255, 255, 0.45), 0 4px 14px rgba(67, 56, 202, 0.35)",
      "surface-pattern":
        "radial-gradient(circle at 85% 15%, rgba(67, 56, 202, 0.10), transparent 55%)",
      "elevation-sm": "0 3px 0 #312e81",
      "elevation-md": "0 5px 0 #312e81",
      "elevation-lg": "0 8px 0 #312e81",
      "elevation-xl": "0 12px 0 #312e81",
    },
    dark: {
      "surface-canvas": "#0d1026",
      "surface-card": "#151a3a",
      "surface-raised": "#1f2752",
      "surface-sunken": "#080a1a",
      "text-primary": "#f5f7ff",
      "text-secondary": "#c7d2fe",
      "text-muted": "#93a5f5",
      "text-on-accent": "#14122e",
      "text-link": "#fbbf24",
      "border-subtle": "#29346b",
      "border-default": "#4c5fd5",
      "border-strong": "#818cf8",
      "border-focus": "#fbbf24",
      "accent-default": "#fbbf24",
      "accent-hover": "#fcd34d",
      "accent-active": "#f59e0b",
      "accent-subtle": "#362c12",
      "accent-text": "#fbbf24",
      "accent-secondary": "#38bdf8",
      "accent-secondary-subtle": "#0c2d48",
      "accent-secondary-text": "#7dd3fc",
      "focus-ring": "#fbbf24",
      "fx-glow":
        "0 8px 28px rgba(76, 95, 213, 0.28), inset 0 0 18px rgba(129, 140, 248, 0.14)",
      "fx-button-shadow":
        "inset 0 0 0 2px rgba(255, 255, 255, 0.55), 0 0 20px rgba(251, 191, 36, 0.45)",
      "surface-pattern":
        "radial-gradient(circle at 85% 15%, rgba(251, 191, 36, 0.14), transparent 55%)",
      "elevation-sm": "0 3px 0 #4c5fd5",
      "elevation-md": "0 5px 0 #4c5fd5",
      "elevation-lg": "0 8px 0 #4c5fd5",
      "elevation-xl": "0 12px 0 #4c5fd5",
    },
  },

  quantum: {
    name: "Quantum Brutalist (Arcade / Protocol Drop)",
    category: "Neo-Brutalist / Arcade Fighter / Web3 Drop",
    axes: {
      "font-family-heading":
        "'Space Grotesk', 'Syne', 'Kanit', 'Anuphan', 'Noto Sans Thai', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', var(--joy-font-family-mono)",
      "letter-spacing-heading": "-0.02em",
      "text-transform-heading": "uppercase",
      "radius-card": "0px",
      "radius-control": "0px",
      "clip-path-card": "none",
      "clip-path-control": "none",
      "border-width-card": "2px",
      "border-width-control": "2px",
      "frame-outline": "none",
      "frame-outline-offset": "0px",
      "card-accent-bar": "2px solid var(--joy-border-strong)",
    },
    light: {
      "surface-canvas": "#f4f4f0",
      "surface-card": "#ffffff",
      "surface-raised": "#eaeae4",
      "surface-sunken": "#dcdcd4",
      "text-primary": "#0a0a0a",
      "text-secondary": "#262626",
      "text-muted": "#525252",
      "text-on-accent": "#ffffff",
      "text-link": "#4f1d96",
      "border-subtle": "#a3a39e",
      "border-default": "#525250",
      "border-strong": "#0a0a0a",
      "border-focus": "#5b21b6",
      "accent-default": "#5b21b6",
      "accent-hover": "#4c1d95",
      "accent-active": "#3b0764",
      "accent-subtle": "#ede9fe",
      "accent-text": "#5b21b6",
      "accent-secondary": "#15803d",
      "accent-secondary-subtle": "#dcfce7",
      "accent-secondary-text": "#166534",
      "focus-ring": "#5b21b6",
      "fx-glow": "6px 6px 0 #0a0a0a",
      "fx-button-shadow": "4px 4px 0 #0a0a0a",
      "surface-pattern":
        "linear-gradient(90deg, rgba(10, 10, 10, 0.04) 1px, transparent 1px), linear-gradient(rgba(10, 10, 10, 0.04) 1px, transparent 1px)",
      "elevation-sm": "3px 3px 0 #0a0a0a",
      "elevation-md": "6px 6px 0 #0a0a0a",
      "elevation-lg": "8px 8px 0 #0a0a0a",
      "elevation-xl": "12px 12px 0 #0a0a0a",
    },
    dark: {
      "surface-canvas": "#09090b",
      "surface-card": "#121216",
      "surface-raised": "#1c1c22",
      "surface-sunken": "#050507",
      "text-primary": "#fafafa",
      "text-secondary": "#d4d4d8",
      "text-muted": "#a1a1aa",
      "text-on-accent": "#090d00",
      "text-link": "#bef264",
      "border-subtle": "#27272a",
      "border-default": "#52525b",
      "border-strong": "#a3e635",
      "border-focus": "#bef264",
      "accent-default": "#a3e635",
      "accent-hover": "#bef264",
      "accent-active": "#84cc16",
      "accent-subtle": "#1f2e08",
      "accent-text": "#bef264",
      "accent-secondary": "#c084fc",
      "accent-secondary-subtle": "#2e1065",
      "accent-secondary-text": "#d8b4fe",
      "focus-ring": "#bef264",
      "fx-glow": "6px 6px 0 #a3e635",
      "fx-button-shadow": "4px 4px 0 #fafafa",
      "surface-pattern":
        "linear-gradient(90deg, rgba(163, 230, 53, 0.05) 1px, transparent 1px), linear-gradient(rgba(163, 230, 53, 0.05) 1px, transparent 1px)",
      "elevation-sm": "3px 3px 0 #a3e635",
      "elevation-md": "6px 6px 0 #a3e635",
      "elevation-lg": "8px 8px 0 #a3e635",
      "elevation-xl": "12px 12px 0 #a3e635",
    },
  },

  titanium: {
    name: "Titanium Mecha (Industrial Sci-Fi / Hard-Surface)",
    category: "Mecha Hangar / Hard-Surface Sci-Fi / Sim Telemetry",
    axes: {
      "font-family-heading":
        "'Chakra Petch', 'Rajdhani', 'IBM Plex Sans Thai', 'M PLUS 1 Code', 'Noto Sans Thai', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', var(--joy-font-family-mono)",
      "letter-spacing-heading": "0.04em",
      "text-transform-heading": "uppercase",
      "radius-card": "4px",
      "radius-control": "2px",
      "clip-path-card":
        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
      "clip-path-control": "none",
      "border-width-card": "1px",
      "border-width-control": "1px",
      "frame-outline": "1px solid var(--joy-border-subtle)",
      "frame-outline-offset": "-3px",
      "card-accent-bar": "3px solid var(--joy-accent-default)",
    },
    light: {
      "surface-canvas": "#eceff3",
      "surface-card": "#f7f9fb",
      "surface-raised": "#dfe5ec",
      "surface-sunken": "#cfd7e0",
      "text-primary": "#0f1722",
      "text-secondary": "#2a374b",
      "text-muted": "#4d5e75",
      "text-on-accent": "#ffffff",
      "text-link": "#9a3412",
      "border-subtle": "#bdcad8",
      "border-default": "#8a9db3",
      "border-strong": "#47596e",
      "border-focus": "#b43e12",
      "accent-default": "#b43e12",
      "accent-hover": "#9a3412",
      "accent-active": "#7c2d12",
      "accent-subtle": "#ffedd5",
      "accent-text": "#9a3412",
      "accent-secondary": "#0369a1",
      "accent-secondary-subtle": "#e0f2fe",
      "accent-secondary-text": "#075985",
      "focus-ring": "#b43e12",
      "fx-glow":
        "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 12px rgba(15, 23, 34, 0.10)",
      "fx-button-shadow": "0 2px 8px rgba(180, 62, 18, 0.28)",
      "surface-pattern":
        "repeating-linear-gradient(-45deg, transparent 0px, transparent 8px, rgba(15, 23, 34, 0.025) 8px, rgba(15, 23, 34, 0.025) 9px)",
      "elevation-sm": "0 2px 5px -1px rgba(15, 23, 34, 0.10)",
      "elevation-md": "0 6px 14px -2px rgba(15, 23, 34, 0.15)",
      "elevation-lg": "0 12px 24px -4px rgba(15, 23, 34, 0.20)",
      "elevation-xl": "0 20px 38px -8px rgba(15, 23, 34, 0.26)",
    },
    dark: {
      "surface-canvas": "#0d1117",
      "surface-card": "#151b24",
      "surface-raised": "#1e2734",
      "surface-sunken": "#080b0f",
      "text-primary": "#ecf2f8",
      "text-secondary": "#b1c1d1",
      "text-muted": "#7d92a8",
      "text-on-accent": "#140802",
      "text-link": "#fb923c",
      "border-subtle": "#263242",
      "border-default": "#3b4d63",
      "border-strong": "#7d92a8",
      "border-focus": "#fb923c",
      "accent-default": "#fb923c",
      "accent-hover": "#fdba74",
      "accent-active": "#f97316",
      "accent-subtle": "#361c08",
      "accent-text": "#fb923c",
      "accent-secondary": "#38bdf8",
      "accent-secondary-subtle": "#0b2940",
      "accent-secondary-text": "#7dd3fc",
      "focus-ring": "#fb923c",
      "fx-glow":
        "inset 0 1px 0 rgba(236, 242, 248, 0.08), 0 8px 24px rgba(0, 0, 0, 0.65)",
      "fx-button-shadow": "0 0 14px rgba(251, 146, 60, 0.35)",
      "surface-pattern":
        "repeating-linear-gradient(-45deg, transparent 0px, transparent 8px, rgba(251, 146, 60, 0.025) 8px, rgba(251, 146, 60, 0.025) 9px)",
      "elevation-sm": "0 2px 6px -1px rgba(0, 0, 0, 0.65)",
      "elevation-md": "0 6px 16px -2px rgba(0, 0, 0, 0.75)",
      "elevation-lg": "0 14px 30px -4px rgba(0, 0, 0, 0.85)",
      "elevation-xl": "0 22px 44px -8px rgba(0, 0, 0, 0.90)",
    },
  },
};

/**
 * Generates the opt-in @montionugera/joy-tokens/genres.css stylesheet.
 */
export function buildGenresCss() {
  let css = `/* ==========================================================================
 * @montionugera/joy-tokens/genres.css
 * Opt-in 5-Axis Immersive & Genre Theme Presets + Bespoke SVG Game Art Anatomy
 * Archetypes: cyberpunk | obsidian | astral | quantum | titanium
 * Zero bloat on core theme.css: load only for Game, RPG, Fantasy, Sci-Fi, or Arcade UIs.
 * ========================================================================== */\n`;

  css += `
/* ── Genre Swatch Preview Tokens (for Hub Picker) ── */
:root {
  --joy-genre-swatch-cyberpunk-1: #050811;
  --joy-genre-swatch-cyberpunk-2: #00e5ff;
  --joy-genre-swatch-cyberpunk-3: #ff2a85;
  --joy-genre-swatch-obsidian-1: #14100d;
  --joy-genre-swatch-obsidian-2: #d4a64a;
  --joy-genre-swatch-obsidian-3: #9e2a2b;
  --joy-genre-swatch-astral-1: #151a3a;
  --joy-genre-swatch-astral-2: #fbbf24;
  --joy-genre-swatch-astral-3: #38bdf8;
  --joy-genre-swatch-quantum-1: #09090b;
  --joy-genre-swatch-quantum-2: #a3e635;
  --joy-genre-swatch-quantum-3: #c084fc;
  --joy-genre-swatch-titanium-1: #151b24;
  --joy-genre-swatch-titanium-2: #fb923c;
  --joy-genre-swatch-titanium-3: #38bdf8;
}
`;

  const genreSelectorList = Object.keys(genrePresets)
    .map((k) => `[data-palette="${k}"]`)
    .join(", ");

  for (const [key, preset] of Object.entries(genrePresets)) {
    const axisEntries = Object.entries(preset.axes)
      .map(([k, v]) => `  --joy-${k}: ${v};`)
      .join("\n");
    const lightEntries = Object.entries(preset.light)
      .map(([k, v]) => `  --joy-${k}: ${v};`)
      .join("\n");
    const darkEntries = Object.entries(preset.dark)
      .map(([k, v]) => `  --joy-${k}: ${v};`)
      .join("\n");

    css += `\n/* ── Genre Preset: ${preset.name} (Light + 5-Axis Geometry) ── */\n[data-palette="${key}"], :root[data-palette="${key}"] {\n${axisEntries}\n${lightEntries}\n}\n`;
    css += `\n/* ── Genre Preset: ${preset.name} (Dark) ── */\n[data-theme="dark"][data-palette="${key}"], [data-theme="dark"] [data-palette="${key}"] {\n${darkEntries}\n}\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"])[data-palette="${key}"] {\n${darkEntries}\n  }\n}\n`;
  }

  css += `\n/* ── 5-Axis Structural Bindings for Genre Scopes ── */
:is(${genreSelectorList}) {
  background-color: var(--joy-surface-canvas);
  background-image: var(--joy-surface-pattern);
  color: var(--joy-text-primary);
}

:is(${genreSelectorList}) :is(h1, h2, h3, .joy-hero__title, .joy-card__title, .joy-bento-card__title, .joy-feature-card__title, .joy-pricing-card__name, .joy-modal__title) {
  font-family: var(--joy-font-family-heading);
  letter-spacing: var(--joy-letter-spacing-heading);
  text-transform: var(--joy-text-transform-heading);
}

:is(${genreSelectorList}) :is(.joy-card, .joy-bento-card, .joy-feature-card, .joy-pricing-card, .joy-testimonial-card, .joy-modal, .joy-drawer) {
  border-radius: var(--joy-radius-card);
  border-width: var(--joy-border-width-card);
  border-color: var(--joy-border-default);
  outline: var(--joy-frame-outline);
  outline-offset: var(--joy-frame-outline-offset);
  box-shadow: var(--joy-fx-glow);
  background-image: var(--joy-surface-pattern);
}

/* Chamfered cards clip any descendant that overflows them. Modals and drawers host popovers, menus and
 * focus outlines, so they keep the radius/frame but never get the chamfer clip-path. */
:is(${genreSelectorList}) :is(.joy-card, .joy-bento-card, .joy-feature-card, .joy-pricing-card, .joy-testimonial-card) {
  clip-path: var(--joy-clip-path-card);
}

:is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select) {
  border-radius: var(--joy-radius-control);
  clip-path: var(--joy-clip-path-control);
  font-family: var(--joy-font-family-heading);
  letter-spacing: var(--joy-letter-spacing-heading);
  text-transform: var(--joy-text-transform-heading);
}

:is(${genreSelectorList}) .joy-button {
  white-space: nowrap;
}

:is(${genreSelectorList}) .joy-button--solid {
  /* The base theme gradient ends in a classic gold that is not part of any genre palette and drops the
   * mid-gradient label below 4.5:1. Keep the gradient inside the contrast-tested accent/hover pair. */
  --joy-accent-gradient-end: var(--joy-accent-hover);
}

/* The glow is an enabled-state affordance: :where() keeps this at the same specificity as the base rule
 * and excludes disabled buttons, so theme.css's \`.joy-button:disabled { box-shadow: none }\` still applies. */
:is(${genreSelectorList}) .joy-button--solid:where(:not(:disabled, [aria-disabled="true"])) {
  box-shadow: var(--joy-fx-button-shadow);
}

/* Keyboard focus: the chamfer clip-path clips the base box-shadow ring and the star-capped capsule
 * box-shadow overrides it, so draw the ring as an outline on a clip-free box. */
:is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select):focus-visible {
  clip-path: none;
  outline: 2px solid var(--joy-border-focus);
  outline-offset: 3px;
}

/* ==========================================================================
 * Bespoke Vector Art Ornaments (100% Token-Colored via CSS mask / -webkit-mask)
 * ========================================================================== */

/* 1. UNIQUE ART TAGS & BADGES: Unbroken Border Frame + Token-Colored Star/Diamond Emblem */
:is([data-palette="obsidian"], [data-palette="astral"], [data-palette="cyberpunk"], [data-palette="titanium"]) :is(.joy-badge, .joy-tag) {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--joy-font-family-heading);
  letter-spacing: 0.02em;
  text-transform: none;
  white-space: nowrap;
  padding-inline: 11px;
  border-radius: 4px;
  border: 1px solid var(--joy-border-strong);
}

[data-palette="obsidian"] :is(.joy-badge, .joy-tag)::before {
  content: "";
  display: inline-block;
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask: ${SVG_ORNAMENTS.diamondEmblemPrefix} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.diamondEmblemPrefix} no-repeat center / contain;
}

[data-palette="astral"] :is(.joy-badge, .joy-tag)::before {
  content: "";
  display: inline-block;
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask: ${SVG_ORNAMENTS.starlightPrefix} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.starlightPrefix} no-repeat center / contain;
}

:is([data-palette="obsidian"], [data-palette="astral"]) .joy-badge__dot {
  display: none;
}

/* 2. STAR-CAPPED CAPSULE GAME BUTTONS (Ragnarok Origin / Lineage II Reference Silhouette & Pattern: star, Label, star)
 * - Rounded capsule body (border-radius: 9999px) with overflow: hidden and background-clip: padding-box
 *   so neither the inner diamond lattice pattern nor the left/right four-point star finials
 *   ever exceed the button container.
 * - Both .joy-button--solid and .joy-button--outline/.joy-button--secondary share the exact same shape,
 *   symmetrical inline left/right star finials, and 100% token-mixed lattice pattern.
 */
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only) {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding-inline: 14px;
  border-radius: 9999px;
  clip-path: none;
  overflow: hidden;
  background-clip: padding-box;
}

:is([data-palette="obsidian"], [data-palette="astral"]) .joy-button--sm:is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only) {
  padding-inline: 11px;
  gap: 5px;
}

:is([data-palette="obsidian"], [data-palette="astral"]) .joy-button--solid:not(.joy-button--icon-only) {
  background-color: var(--joy-accent-default);
  background-image:
    radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--joy-text-on-accent) 22%, transparent) 0%, transparent 68%),
    repeating-linear-gradient(45deg, color-mix(in srgb, var(--joy-text-on-accent) 10%, transparent) 0px, color-mix(in srgb, var(--joy-text-on-accent) 10%, transparent) 1px, transparent 1px, transparent 11px),
    repeating-linear-gradient(-45deg, color-mix(in srgb, var(--joy-text-on-accent) 10%, transparent) 0px, color-mix(in srgb, var(--joy-text-on-accent) 10%, transparent) 1px, transparent 1px, transparent 11px),
    linear-gradient(180deg, var(--joy-accent-default) 0%, var(--joy-accent-hover) 100%);
  border: 1.5px solid color-mix(in srgb, var(--joy-text-on-accent) 38%, var(--joy-accent-default));
  box-shadow:
    inset 0 0 0 1.5px color-mix(in srgb, var(--joy-text-on-accent) 28%, transparent),
    0 4px 12px color-mix(in srgb, var(--joy-accent-default) 26%, transparent);
}

:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only) {
  background-color: var(--joy-surface-raised);
  background-image:
    radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--joy-accent-default) 12%, transparent) 0%, transparent 68%),
    repeating-linear-gradient(45deg, color-mix(in srgb, var(--joy-accent-default) 11%, transparent) 0px, color-mix(in srgb, var(--joy-accent-default) 11%, transparent) 1px, transparent 1px, transparent 11px),
    repeating-linear-gradient(-45deg, color-mix(in srgb, var(--joy-accent-default) 11%, transparent) 0px, color-mix(in srgb, var(--joy-accent-default) 11%, transparent) 1px, transparent 1px, transparent 11px),
    linear-gradient(180deg, var(--joy-surface-card) 0%, var(--joy-surface-raised) 100%);
  color: var(--joy-text-primary);
  border: 1.5px solid var(--joy-border-strong);
  box-shadow:
    inset 0 0 0 1.5px color-mix(in srgb, var(--joy-border-subtle) 65%, transparent),
    0 3px 10px color-mix(in srgb, var(--joy-border-strong) 15%, transparent);
}

:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::before,
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::after {
  content: "";
  display: inline-block;
  width: 22px;
  height: 16px;
  flex-shrink: 0;
  pointer-events: none;
}

:is([data-palette="obsidian"], [data-palette="astral"]) .joy-button--solid:not(.joy-button--icon-only)::before,
:is([data-palette="obsidian"], [data-palette="astral"]) .joy-button--solid:not(.joy-button--icon-only)::after {
  background-color: var(--joy-text-on-accent);
}

:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::before,
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::after {
  background-color: var(--joy-accent-default);
}

[data-palette="obsidian"] :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::before {
  -webkit-mask: ${SVG_ORNAMENTS.obsidianBtnCapLeft} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.obsidianBtnCapLeft} no-repeat center / contain;
}
[data-palette="obsidian"] :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::after {
  -webkit-mask: ${SVG_ORNAMENTS.obsidianBtnCapRight} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.obsidianBtnCapRight} no-repeat center / contain;
}

[data-palette="astral"] :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::before {
  -webkit-mask: ${SVG_ORNAMENTS.astralBtnFiligreeLeft} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.astralBtnFiligreeLeft} no-repeat center / contain;
}
[data-palette="astral"] :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary):not(.joy-button--icon-only)::after {
  -webkit-mask: ${SVG_ORNAMENTS.astralBtnFiligreeRight} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.astralBtnFiligreeRight} no-repeat center / contain;
}

/* Disabled capsule buttons keep the capsule silhouette but drop the accent fill, lattice and glow.
 * The extra .joy-button class makes this rule outrank the decoration rules above (and any hover/active
 * state in theme.css), so a disabled solid/outline button reads as disabled in every genre. */
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary).joy-button:is(:disabled, [aria-disabled="true"]) {
  background-color: var(--joy-surface-disabled);
  background-image: none;
  color: var(--joy-text-disabled);
  border-color: var(--joy-border-disabled);
  box-shadow: none;
}
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary).joy-button:is(:disabled, [aria-disabled="true"])::before,
:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary).joy-button:is(:disabled, [aria-disabled="true"])::after {
  background-color: var(--joy-text-disabled);
}

/* 3. UNIQUE ART SECTION HEADERS: Token-Colored Emblem Watermark + Flanking Diamond Filigree Wings */
:is([data-palette="obsidian"], [data-palette="astral"]) .joy-hero__title {
  position: relative;
  z-index: 0;
  padding-block: 12px;
}
[data-palette="obsidian"] .joy-hero__title::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 88px;
  height: 88px;
  z-index: -1;
  pointer-events: none;
  background-color: var(--joy-accent-default);
  opacity: 0.22;
  -webkit-mask: ${SVG_ORNAMENTS.doubleRhombusWatermark} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.doubleRhombusWatermark} no-repeat center / contain;
}
[data-palette="astral"] .joy-hero__title::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  width: 92px;
  height: 92px;
  z-index: -1;
  pointer-events: none;
  background-color: var(--joy-accent-default);
  opacity: 0.24;
  -webkit-mask: ${SVG_ORNAMENTS.astrolabeWatermark} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.astrolabeWatermark} no-repeat center / contain;
}

/* 4. UNIQUE ART CARDS: Top-Center V-Filigree Crest + Vertical Bar Title Prefix */
[data-palette="obsidian"] :is(.joy-card, .joy-bento-card, .joy-feature-card, .joy-pricing-card) {
  border-top: 2px solid var(--joy-border-strong);
}

:is([data-palette="obsidian"], [data-palette="astral"]) :is(.joy-card__title, .joy-bento-card__title, .joy-feature-card__title) {
  padding-left: 10px;
  border-left: 3px solid var(--joy-border-strong);
}

/* 5. UNIQUE ART NAVIGATION & TABS: Token-Colored Starlight & Diamond Active States */
[data-palette="obsidian"] .joy-tabs__tab--active {
  background: linear-gradient(90deg, var(--joy-accent-subtle) 0%, transparent 92%);
  border-top: 1px solid var(--joy-border-strong);
  border-bottom: 1px solid var(--joy-border-strong);
  border-left: 3px solid var(--joy-accent-default);
}
[data-palette="obsidian"] .joy-tabs__tab--active::before {
  content: "";
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  vertical-align: -2px;
  background-color: var(--joy-accent-default);
  -webkit-mask: ${SVG_ORNAMENTS.diamondEmblemPrefix} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.diamondEmblemPrefix} no-repeat center / contain;
}

[data-palette="astral"] .joy-tabs__tab--active {
  position: relative;
  background: linear-gradient(90deg, var(--joy-accent-subtle) 0%, transparent 100%);
  box-shadow: inset 0 -2px 0 var(--joy-accent-default);
}
[data-palette="astral"] .joy-tabs__tab--active::before {
  content: "";
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 6px;
  vertical-align: -2px;
  background-color: var(--joy-accent-default);
  -webkit-mask: ${SVG_ORNAMENTS.starlightPrefix} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.starlightPrefix} no-repeat center / contain;
}

/* 6. CYBERPUNK HUD & TITANIUM MECHA (Diagonal Stripe Prefix Blocks & Tactical Reticle Brackets) */
[data-palette="cyberpunk"] .joy-button--solid:not(.joy-button--icon-only)::before,
[data-palette="titanium"] .joy-button--solid:not(.joy-button--icon-only)::before {
  content: "// ";
  content: "// " / "";
  opacity: 0.75;
  font-weight: 700;
  margin-right: 4px;
}

[data-palette="cyberpunk"] .joy-tabs__tab--active,
[data-palette="titanium"] .joy-tabs__tab--active {
  border-left: 3px solid var(--joy-accent-default);
  background: linear-gradient(90deg, var(--joy-accent-subtle) 0%, transparent 90%);
}
[data-palette="cyberpunk"] .joy-tabs__tab--active::before,
[data-palette="titanium"] .joy-tabs__tab--active::before {
  content: "\\25B8 ";
  content: "\\25B8 " / "";
  color: var(--joy-accent-text);
  font-weight: 700;
}

/* 7. BESPOKE GAME CAROUSEL & PAGINATION ART (100% Token-Colored Crescent-Star Arrows & Sunburst Nodes) */
.joy-game-carousel-nav {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}
.joy-game-carousel-arrow {
  width: 28px;
  height: 24px;
  border: none;
  background-color: var(--joy-accent-default);
  cursor: pointer;
  transition: transform 150ms ease, background-color 150ms ease;
}
.joy-game-carousel-arrow:hover {
  background-color: var(--joy-accent-hover);
  transform: scale(1.08);
}
.joy-game-carousel-arrow--prev {
  -webkit-mask: ${SVG_ORNAMENTS.crescentArrowLeft} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.crescentArrowLeft} no-repeat center / contain;
}
.joy-game-carousel-arrow--next {
  -webkit-mask: ${SVG_ORNAMENTS.crescentArrowRight} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.crescentArrowRight} no-repeat center / contain;
}
.joy-game-carousel-line {
  width: 56px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--joy-border-strong), transparent);
}
.joy-game-carousel-dot {
  width: 16px;
  height: 16px;
  border: none;
  background-color: var(--joy-border-default);
  -webkit-mask: ${SVG_ORNAMENTS.starNodeInactive} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.starNodeInactive} no-repeat center / contain;
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}
.joy-game-carousel-dot:hover {
  background-color: var(--joy-border-strong);
}
.joy-game-carousel-dot--active {
  width: 24px;
  height: 24px;
  background-color: var(--joy-accent-default);
  -webkit-mask: ${SVG_ORNAMENTS.sunburstNodeActive} no-repeat center / contain;
  mask: ${SVG_ORNAMENTS.sunburstNodeActive} no-repeat center / contain;
}

/* ==========================================================================
 * 8. Multi-Script CJK & Thai Game Typography Guardrails (TH / JA / ZH-Hans / ZH-Hant)
 * ========================================================================== */

:is(${genreSelectorList}) {
  --joy-font-family-sans: 'Inter', 'Anuphan', 'Noto Sans Thai', 'Noto Sans JP', 'Noto Sans SC', 'Noto Sans TC', system-ui, -apple-system, sans-serif;
}

:is(${genreSelectorList}):is(:lang(th), [data-lang="th"]),
:is(${genreSelectorList}) :is(:lang(th), [data-lang="th"]) {
  --joy-letter-spacing-heading: 0em;
  --joy-text-transform-heading: none;
  letter-spacing: 0em;
  line-height: 1.65;
}

:is(${genreSelectorList}):is(:lang(th), [data-lang="th"]) :is(h1, h2, h3, .joy-hero__title, .joy-card__title, .joy-bento-card__title, .joy-feature-card__title, .joy-button, .joy-badge, .joy-tag),
:is(${genreSelectorList}) :is(:lang(th), [data-lang="th"]):is(h1, h2, h3, .joy-hero__title, .joy-card__title, .joy-bento-card__title, .joy-feature-card__title, .joy-button, .joy-badge, .joy-tag) {
  letter-spacing: 0em;
  text-transform: none;
  line-height: 1.45;
}

:is(${genreSelectorList}):is(:lang(th), [data-lang="th"]) .joy-button,
:is(${genreSelectorList}) :is(:lang(th), [data-lang="th"]).joy-button {
  padding-top: 0.45em;
  padding-bottom: 0.45em;
}

:is(${genreSelectorList}):is(:lang(ja), :lang(zh), [data-lang="ja"], [data-lang="zh"]),
:is(${genreSelectorList}) :is(:lang(ja), :lang(zh), [data-lang="ja"], [data-lang="zh"]) {
  --joy-letter-spacing-heading: 0.02em;
  --joy-text-transform-heading: none;
  line-break: strict;
  line-height: 1.7;
}

:is(${genreSelectorList}):is(:lang(ja), :lang(zh), [data-lang="ja"], [data-lang="zh"]) :is(.joy-button, .joy-badge, .joy-tag, .joy-tabs__tab),
:is(${genreSelectorList}) :is(:lang(ja), :lang(zh), [data-lang="ja"], [data-lang="zh"]):is(.joy-button, .joy-badge, .joy-tag, .joy-tabs__tab) {
  word-break: keep-all;
  white-space: nowrap;
  letter-spacing: 0.02em;
  text-transform: none;
}

/* ==========================================================================
 * 9. Accessibility fallbacks: forced-colors and reduced motion.
 * Ornaments carry no information of their own, so they degrade to plain borders.
 * ========================================================================== */
@media (forced-colors: active) {
  :is(${genreSelectorList}) {
    background-image: none;
  }
  :is(${genreSelectorList}) :is(.joy-card, .joy-bento-card, .joy-feature-card, .joy-pricing-card, .joy-testimonial-card),
  :is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select) {
    clip-path: none;
  }
  :is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select) {
    border: 2px solid ButtonText;
  }
  /* Disabled stays distinguishable from enabled: system GrayText for text and border. */
  :is(${genreSelectorList}) :is(.joy-button--solid, .joy-button--outline, .joy-button--secondary, .joy-button).joy-button:is(:disabled, [aria-disabled="true"]) {
    color: GrayText;
    border-color: GrayText;
  }
  /* Mask-only ornaments would paint the forced canvas colour (invisible): drop the decoration. */
  :is(${genreSelectorList}) .joy-button::before,
  :is(${genreSelectorList}) .joy-button::after,
  :is(${genreSelectorList}) :is(.joy-badge, .joy-tag)::before,
  :is(${genreSelectorList}) .joy-hero__title::before,
  :is(${genreSelectorList}) .joy-tabs__tab--active::before {
    display: none;
  }
  /* Mask-only controls (carousel arrows/dots) would vanish: swap the mask for a plain bordered shape. */
  .joy-game-carousel-arrow,
  .joy-game-carousel-dot {
    -webkit-mask: none;
    mask: none;
    forced-color-adjust: none;
    background-color: ButtonFace;
    border: 2px solid ButtonText;
  }
  .joy-game-carousel-dot {
    border-radius: 50%;
  }
  .joy-game-carousel-dot--active {
    background-color: Highlight;
    border-color: HighlightText;
    outline: 2px solid Highlight;
  }
  .joy-game-carousel-arrow:hover,
  .joy-game-carousel-dot:hover {
    background-color: Highlight;
  }
  .joy-game-carousel-line {
    background: ButtonText;
  }
}

@media (prefers-reduced-motion: reduce) {
  :is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select),
  :is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select)::before,
  :is(${genreSelectorList}) :is(.joy-button, .joy-input, .joy-select)::after,
  .joy-game-carousel-arrow,
  .joy-game-carousel-dot {
    transition: none;
    animation: none;
  }
  .joy-game-carousel-arrow:hover {
    transform: none;
  }
}
`;

  return css;
}
