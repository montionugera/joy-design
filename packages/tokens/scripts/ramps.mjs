// Script to generate primitive color ramps and semantic layers for Joymify Tokens
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  srgbToLinear,
  linearToSrgb,
  hexToRgb,
  rgbToHex,
  hexToOklch,
  oklchToHex,
  relativeLuminance,
  contrastRatio,
} from "./color.mjs";

export {
  srgbToLinear,
  linearToSrgb,
  hexToRgb,
  rgbToHex,
  hexToOklch,
  oklchToHex,
  relativeLuminance,
  contrastRatio,
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function generateAllTokens() {
  // Primitives with anchors:
  // navy-500: #14253e (fixed)
  // gold-400: #c49a3a (fixed)
  // ink-500:  #1f1c13 (fixed)
  // cream-100: #f8f3e8 (fixed)
  // gold-600: ≥ 4.5:1 on white and cream (text/link use)
  // gold-300: ≥ 4.5:1 on navy-900 (dark accent)

  // 1. Navy ramp anchored at navy-500 #14253e
  const { L: lNavyAnchor, C: cNavyAnchor, H: hNavy } = hexToOklch("#14253e");
  const navySteps = [
    { step: "50", L: 0.96, C: 0.015 },
    { step: "100", L: 0.88, C: 0.025 },
    { step: "200", L: 0.76, C: 0.04 },
    { step: "300", L: 0.62, C: 0.05 },
    { step: "400", L: 0.52, C: 0.052 }, // Dark border.default >= 3:1 vs dark card & canvas
    { step: "500", L: lNavyAnchor, C: cNavyAnchor, hex: "#14253e" },
    { step: "600", L: 0.252, C: 0.045 },
    { step: "700", L: 0.242, C: 0.04 },
    { step: "800", L: 0.222, C: 0.035 },
    { step: "900", L: 0.2, C: 0.03 },
    { step: "950", L: 0.183, C: 0.03 },
  ];
  const navyRamp = {};
  for (const s of navySteps) {
    navyRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hNavy),
      type: "color",
    };
  }

  // 2. Gold ramp anchored at gold-400 #c49a3a
  const { L: lGoldAnchor, C: cGoldAnchor, H: hGold } = hexToOklch("#c49a3a");
  const goldSteps = [
    { step: "50", L: 0.97, C: 0.02 },
    { step: "100", L: 0.93, C: 0.04 },
    { step: "200", L: 0.86, C: 0.08 },
    { step: "300", L: 0.785, C: 0.11 }, // Dark accent (>= 4.5:1 on dark surfaces)
    { step: "400", L: lGoldAnchor, C: cGoldAnchor, hex: "#c49a3a" },
    { step: "450", L: 0.65, C: 0.105 },
    { step: "500", L: 0.62, C: 0.11 },
    { step: "600", L: 0.525, C: 0.1 }, // Text link (>= 4.5:1 on white and cream-100)
    { step: "700", L: 0.43, C: 0.09 },
    { step: "800", L: 0.34, C: 0.08 },
    { step: "900", L: 0.25, C: 0.06 },
    { step: "950", L: 0.16, C: 0.04 },
  ];
  const goldRamp = {};
  for (const s of goldSteps) {
    goldRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hGold),
      type: "color",
    };
  }

  // 3. Ink ramp anchored at ink-500 #1f1c13
  const { L: lInkAnchor, C: cInkAnchor, H: hInk } = hexToOklch("#1f1c13");
  const inkSteps = [
    { step: "50", L: 0.96, C: 0.008 },
    { step: "100", L: 0.88, C: 0.012 },
    { step: "200", L: 0.74, C: 0.015 },
    { step: "300", L: 0.58, C: 0.016 },
    { step: "400", L: 0.4, C: 0.017 },
    { step: "500", L: lInkAnchor, C: cInkAnchor, hex: "#1f1c13" },
    { step: "600", L: 0.2, C: 0.015 },
    { step: "700", L: 0.175, C: 0.013 },
    { step: "800", L: 0.15, C: 0.011 },
    { step: "900", L: 0.125, C: 0.009 },
    { step: "950", L: 0.1, C: 0.007 },
  ];
  const inkRamp = {};
  for (const s of inkSteps) {
    inkRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hInk),
      type: "color",
    };
  }

  // 4. Cream ramp anchored at cream-100 #f8f3e8
  const { L: lCreamAnchor, C: cCreamAnchor, H: hCream } = hexToOklch("#f8f3e8");
  const creamSteps = [
    { step: "50", L: 0.985, C: 0.01 },
    { step: "100", L: lCreamAnchor, C: cCreamAnchor, hex: "#f8f3e8" },
    { step: "200", L: 0.935, C: 0.018 },
    { step: "300", L: 0.895, C: 0.022 },
  ];
  const creamRamp = {};
  for (const s of creamSteps) {
    creamRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hCream),
      type: "color",
    };
  }

  // 5. Neutral ramp tinted toward warm ink/navy hue (H=90, Chroma in 0.005-0.015)
  const neutralSteps = [
    { step: "50", L: 0.97 },
    { step: "100", L: 0.93 },
    { step: "200", L: 0.86 },
    { step: "300", L: 0.78 },
    { step: "400", L: 0.62 }, // Light border.default & Dark text.muted
    { step: "500", L: 0.51 }, // Light text.muted (>= 4.5:1 on cream-100)
    { step: "600", L: 0.43 }, // Light border.strong
    { step: "700", L: 0.35 }, // Light text.secondary
    { step: "800", L: 0.26 },
    { step: "900", L: 0.18 },
    { step: "950", L: 0.11 },
  ];
  const neutralRamp = {};
  for (const s of neutralSteps) {
    neutralRamp[s.step] = {
      value: oklchToHex(s.L, 0.01, 90.0),
      type: "color",
    };
  }

  // 6. Status ramps hue-tuned to brand with even OKLCH steps
  const statusSpecs = {
    success: { H: 145, cMax: 0.12 },
    warning: { H: 75, cMax: 0.14 },
    danger: { H: 25, cMax: 0.16 },
    info: { H: 250, cMax: 0.11 },
  };
  const statusLSteps = {
    100: { L: 0.95, cScale: 0.15 },
    300: { L: 0.78, cScale: 0.75 },
    500: { L: 0.58, cScale: 1.0 },
    600: { L: 0.48, cScale: 0.9 },
    700: { L: 0.38, cScale: 0.8 },
    900: { L: 0.2, cScale: 0.4 },
  };
  const statusRamps = {};
  for (const [name, cfg] of Object.entries(statusSpecs)) {
    statusRamps[name] = {};
    for (const [step, lCfg] of Object.entries(statusLSteps)) {
      statusRamps[name][step] = {
        value: oklchToHex(lCfg.L, cfg.cMax * lCfg.cScale, cfg.H),
        type: "color",
      };
    }
  }

  // 7. Clay ramp (Joy-Coach terracotta clay court scale 50-600)
  const claySteps = [
    { step: "50", hex: "#FBF0EA" },
    { step: "100", hex: "#F0D8C9" },
    { step: "200", hex: "#DFB093" },
    { step: "300", hex: "#C97C52" },
    { step: "400", hex: "#A85A34" },
    { step: "500", hex: "#8A4526" },
    { step: "600", hex: "#63311B" },
  ];
  const clayRamp = {};
  for (const s of claySteps) {
    clayRamp[s.step] = {
      value: s.hex,
      type: "color",
    };
  }

  const semanticLight = {
    // Surfaces
    surface: {
      canvas: { value: "{color.cream.100}", type: "color" },
      card: { value: "#ffffff", type: "color" },
      raised: { value: "#ffffff", type: "color" },
      sunken: { value: "{color.cream.200}", type: "color" },
      disabled: { value: "{color.cream.200}", type: "color" },
      overlay: { value: "#ffffff", type: "color" },
      inverse: { value: "{color.navy.500}", type: "color" },
      thumb: { value: "#ffffff", type: "color" },
      "clay-bg": { value: "{color.clay.100}", type: "color" },
      "clay-fg": { value: "{color.clay.500}", type: "color" },
      "hard-bg": { value: "#E2E8EF", type: "color" },
      "hard-fg": { value: "{color.navy.500}", type: "color" },
      "grass-bg": { value: "#E4EADA", type: "color" },
      "grass-fg": { value: "#4E5F36", type: "color" },
      "indoor-bg": { value: "{color.cream.300}", type: "color" },
      "indoor-fg": { value: "{color.navy.400}", type: "color" },
    },
    // Text
    text: {
      primary: { value: "{color.ink.500}", type: "color" },
      secondary: { value: "{color.neutral.700}", type: "color" },
      muted: { value: "{color.neutral.500}", type: "color" },
      disabled: { value: "{color.neutral.500}", type: "color" },
      inverse: { value: "#ffffff", type: "color" },
      link: { value: "{color.gold.600}", type: "color" },
      "on-accent": { value: "{color.navy.500}", type: "color" },
    },
    // Border
    border: {
      subtle: { value: "{color.cream.300}", type: "color" },
      default: { value: "{color.neutral.400}", type: "color" },
      strong: { value: "{color.neutral.600}", type: "color" },
      focus: { value: "{color.gold.600}", type: "color" },
      disabled: { value: "{color.cream.300}", type: "color" },
    },
    // Accent
    accent: {
      default: { value: "{color.gold.400}", type: "color" },
      hover: { value: "{color.gold.500}", type: "color" },
      active: { value: "{color.gold.600}", type: "color" },
      subtle: { value: "{color.gold.50}", type: "color" },
      text: { value: "{color.gold.600}", type: "color" },
      "gradient-end": { value: "{color.gold.450}", type: "color" },
      highlight: { value: "{color.gold.200}", type: "color" },
    },
    // Status
    status: {
      "success-fg": { value: "{color.status.success.700}", type: "color" },
      "success-bg": { value: "{color.status.success.100}", type: "color" },
      "success-border": { value: "{color.status.success.300}", type: "color" },
      "warning-fg": { value: "{color.status.warning.700}", type: "color" },
      "warning-bg": { value: "{color.status.warning.100}", type: "color" },
      "warning-border": { value: "{color.status.warning.300}", type: "color" },
      "danger-fg": { value: "{color.status.danger.600}", type: "color" },
      "danger-bg": { value: "{color.status.danger.100}", type: "color" },
      "danger-border": { value: "{color.status.danger.300}", type: "color" },
      "danger-solid-bg": { value: "{color.status.danger.600}", type: "color" },
      "danger-solid-fg": { value: "#ffffff", type: "color" },
      "danger-solid-border": {
        value: "{color.status.danger.700}",
        type: "color",
      },
      "info-fg": { value: "{color.status.info.700}", type: "color" },
      "info-bg": { value: "{color.status.info.100}", type: "color" },
      "info-border": { value: "{color.status.info.300}", type: "color" },
    },
    // Focus ring
    "focus-ring": { value: "2px solid #856515", type: "border" },
    // Elevation
    elevation: {
      0: { value: "none", type: "shadow" },
      1: {
        value:
          "0 1px 3px rgba(20, 37, 62, 0.08), 0 1px 2px rgba(20, 37, 62, 0.04)",
        type: "shadow",
      },
      2: {
        value:
          "0 4px 8px -2px rgba(20, 37, 62, 0.1), 0 2px 4px -2px rgba(20, 37, 62, 0.06)",
        type: "shadow",
      },
      3: {
        value:
          "0 12px 20px -4px rgba(20, 37, 62, 0.12), 0 4px 6px -2px rgba(20, 37, 62, 0.04)",
        type: "shadow",
      },
      "accent-1": {
        value:
          "0 1px 2px rgba(196, 154, 58, 0.28), 0 1px 3px rgba(20, 37, 62, 0.08)",
        type: "shadow",
      },
      "accent-2": {
        value:
          "0 6px 16px -2px rgba(196, 154, 58, 0.42), 0 2px 6px -1px rgba(20, 37, 62, 0.12)",
        type: "shadow",
      },
      "accent-inset": {
        value: "inset 0 2px 4px rgba(133, 101, 21, 0.35)",
        type: "shadow",
      },
      bevel: {
        value: "inset 0 1px 0 0 rgba(255, 255, 255, 0.70)",
        type: "shadow",
      },
    },
    // F-043 Brand
    brand: {
      tile: { value: "{color.navy.500}", type: "color" },
      mark: { value: "{color.gold.600}", type: "color" },
      "mark-on-tile": { value: "{color.gold.400}", type: "color" },
      "mark-contrast": { value: "{color.cream.50}", type: "color" },
      ink: { value: "{color.navy.500}", type: "color" },
      "ink-on-tile": { value: "{color.cream.100}", type: "color" },
    },
    // Court semantics (Joy-Coach Bauhaus tennis analytics)
    court: {
      default: { value: "{color.clay.400}", type: "color" },
      soft: { value: "{color.clay.100}", type: "color" },
      line: { value: "{color.navy.500}", type: "color" },
    },
    // Result semantics
    result: {
      won: { value: "{color.status.success.700}", type: "color" },
      "won-bg": { value: "{color.status.success.100}", type: "color" },
      lost: { value: "{color.status.danger.700}", type: "color" },
      "lost-bg": { value: "{color.status.danger.100}", type: "color" },
      retired: { value: "{color.status.warning.700}", type: "color" },
      title: { value: "{color.gold.400}", type: "color" },
    },
  };

  const semanticDark = {
    // Surfaces
    surface: {
      canvas: { value: "{color.navy.900}", type: "color" },
      card: { value: "{color.navy.800}", type: "color" },
      raised: { value: "{color.navy.500}", type: "color" },
      sunken: { value: "{color.navy.950}", type: "color" },
      disabled: { value: "{color.navy.800}", type: "color" },
      overlay: { value: "{color.navy.800}", type: "color" },
      inverse: { value: "{color.cream.100}", type: "color" },
      thumb: { value: "{color.cream.100}", type: "color" },
      "clay-bg": { value: "{color.clay.600}", type: "color" },
      "clay-fg": { value: "{color.clay.200}", type: "color" },
      "hard-bg": { value: "{color.navy.800}", type: "color" },
      "hard-fg": { value: "{color.navy.200}", type: "color" },
      "grass-bg": { value: "#1a2c17", type: "color" },
      "grass-fg": { value: "#8fb382", type: "color" },
      "indoor-bg": { value: "{color.navy.700}", type: "color" },
      "indoor-fg": { value: "{color.navy.200}", type: "color" },
    },
    // Text
    text: {
      primary: { value: "{color.cream.100}", type: "color" },
      secondary: { value: "{color.neutral.300}", type: "color" },
      muted: { value: "{color.navy.200}", type: "color" },
      disabled: { value: "{color.navy.300}", type: "color" },
      inverse: { value: "{color.ink.500}", type: "color" },
      link: { value: "{color.gold.300}", type: "color" },
      "on-accent": { value: "{color.navy.950}", type: "color" },
    },
    // Border
    border: {
      // F-038 D2b: navy-700 was 1.05:1 against the dark card (rows, headers and chips invisible); this is 1.34:1,
      // matching the light hairline (1.37:1). Literal, like accent.subtle: the ramp has no step between 700 and 400.
      subtle: { value: "#22324b", type: "color" },
      default: { value: "{color.navy.400}", type: "color" },
      strong: { value: "{color.navy.300}", type: "color" },
      focus: { value: "{color.gold.300}", type: "color" },
      disabled: { value: "{color.navy.700}", type: "color" },
    },
    // Accent
    accent: {
      default: { value: "{color.gold.300}", type: "color" },
      hover: { value: "{color.gold.200}", type: "color" },
      active: { value: "{color.gold.400}", type: "color" },
      subtle: { value: "#1e2129", type: "color" },
      text: { value: "{color.gold.300}", type: "color" },
      "gradient-end": { value: "{color.gold.400}", type: "color" },
      highlight: { value: "{color.gold.200}", type: "color" },
    },
    // Status. F-038 D2b: the *-bg fills are a 65/35 mix of the 900 and 700 stops (literals, like accent.subtle) so an
    // alert/badge/tag sits visibly off the dark card (1.10-1.19:1, was 1.04-1.07:1); fg text stays >= 7.5:1.
    status: {
      "success-fg": { value: "{color.status.success.300}", type: "color" },
      "success-bg": { value: "#0d2d0f", type: "color" },
      "success-border": { value: "{color.status.success.500}", type: "color" },
      "warning-fg": { value: "{color.status.warning.300}", type: "color" },
      "warning-bg": { value: "#3a1e00", type: "color" },
      "warning-border": { value: "{color.status.warning.500}", type: "color" },
      "danger-fg": { value: "{color.status.danger.300}", type: "color" },
      "danger-bg": { value: "#470d0e", type: "color" },
      "danger-border": { value: "{color.status.danger.500}", type: "color" },
      "danger-solid-bg": { value: "{color.status.danger.600}", type: "color" },
      "danger-solid-fg": { value: "#ffffff", type: "color" },
      "danger-solid-border": {
        value: "{color.status.danger.700}",
        type: "color",
      },
      "info-fg": { value: "{color.status.info.300}", type: "color" },
      "info-bg": { value: "#0b2741", type: "color" },
      "info-border": { value: "{color.status.info.500}", type: "color" },
    },
    // Focus ring
    "focus-ring": { value: "2px solid #dab362", type: "border" },
    // Elevation
    elevation: {
      0: { value: "none", type: "shadow" },
      1: {
        value:
          "0 0 0 1px rgba(77, 96, 125, 0.25), 0 1px 3px rgba(0, 0, 0, 0.4)",
        type: "shadow",
      },
      2: {
        value:
          "0 0 0 1px rgba(77, 96, 125, 0.35), 0 4px 12px rgba(0, 0, 0, 0.5)",
        type: "shadow",
      },
      3: {
        value:
          "0 0 0 1px rgba(77, 96, 125, 0.45), 0 12px 24px -4px rgba(0, 0, 0, 0.6)",
        type: "shadow",
      },
      "accent-1": {
        value:
          "0 0 0 1px rgba(218, 179, 98, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4)",
        type: "shadow",
      },
      "accent-2": {
        value:
          "0 0 0 1px rgba(218, 179, 98, 0.50), 0 6px 18px rgba(0, 0, 0, 0.6)",
        type: "shadow",
      },
      "accent-inset": {
        value: "inset 0 2px 4px rgba(0, 0, 0, 0.45)",
        type: "shadow",
      },
      bevel: {
        value: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        type: "shadow",
      },
    },
    // F-043 Brand
    brand: {
      tile: { value: "{color.navy.500}", type: "color" },
      mark: { value: "{color.gold.300}", type: "color" },
      "mark-on-tile": { value: "{color.gold.400}", type: "color" },
      "mark-contrast": { value: "{color.cream.50}", type: "color" },
      ink: { value: "{color.cream.100}", type: "color" },
      "ink-on-tile": { value: "{color.cream.100}", type: "color" },
    },
    // Court semantics (Joy-Coach Bauhaus tennis analytics)
    court: {
      default: { value: "{color.clay.300}", type: "color" },
      soft: { value: "{color.clay.600}", type: "color" },
      line: { value: "{color.navy.200}", type: "color" },
    },
    // Result semantics
    result: {
      won: { value: "{color.status.success.300}", type: "color" },
      "won-bg": { value: "{color.status.success.900}", type: "color" },
      lost: { value: "{color.status.danger.300}", type: "color" },
      "lost-bg": { value: "{color.status.danger.900}", type: "color" },
      retired: { value: "{color.status.warning.300}", type: "color" },
      title: { value: "{color.gold.200}", type: "color" },
    },
  };

  // Shared scales across themes
  const zScale = {
    base: { value: "0", type: "dimension" },
    sticky: { value: "100", type: "dimension" },
    backdrop: { value: "900", type: "dimension" },
    dropdown: { value: "1000", type: "dimension" },
    drawer: { value: "1020", type: "dimension" },
    modal: { value: "1050", type: "dimension" },
    popover: { value: "1060", type: "dimension" },
    toast: { value: "1100", type: "dimension" },
    tooltip: { value: "1200", type: "dimension" },
  };

  const fontScale = {
    size: {
      xs: { value: "0.75rem", type: "dimension" },
      sm: { value: "0.875rem", type: "dimension" },
      md: { value: "1rem", type: "dimension" },
      lg: { value: "1.2rem", type: "dimension" },
      xl: { value: "1.44rem", type: "dimension" },
      "2xl": { value: "1.728rem", type: "dimension" },
      "3xl": { value: "2.074rem", type: "dimension" },
      "4xl": { value: "2.488rem", type: "dimension" },
      "5xl": { value: "2.986rem", type: "dimension" },
      "display-sm": {
        value: "clamp(2rem, 4vw + 1rem, 2.5rem)",
        type: "dimension",
      },
      "display-md": {
        value: "clamp(2.5rem, 5vw + 1rem, 3.25rem)",
        type: "dimension",
      },
      "display-lg": {
        value: "clamp(3rem, 6vw + 1rem, 4rem)",
        type: "dimension",
      },
    },
    "line-height": {
      tight: { value: "1.15", type: "dimension" },
      snug: { value: "1.375", type: "dimension" },
      normal: { value: "1.5", type: "dimension" },
      relaxed: { value: "1.625", type: "dimension" },
    },
    weight: {
      regular: { value: "400", type: "dimension" },
      medium: { value: "500", type: "dimension" },
      semibold: { value: "600", type: "dimension" },
      bold: { value: "700", type: "dimension" },
    },
    "letter-spacing": {
      tight: { value: "-0.015em", type: "dimension" },
      normal: { value: "0em", type: "dimension" },
    },
  };

  const spaceScale = {
    0.5: { value: "2px", type: "dimension" },
    1: { value: "4px", type: "dimension" },
    2: { value: "8px", type: "dimension" },
    3: { value: "12px", type: "dimension" },
    4: { value: "16px", type: "dimension" },
    5: { value: "20px", type: "dimension" },
    6: { value: "24px", type: "dimension" },
    8: { value: "32px", type: "dimension" },
    10: { value: "40px", type: "dimension" },
    12: { value: "48px", type: "dimension" },
    16: { value: "64px", type: "dimension" },
    20: { value: "80px", type: "dimension" },
    24: { value: "96px", type: "dimension" },
  };

  const radiusScale = {
    control: { value: "6px", type: "dimension" },
    card: { value: "12px", type: "dimension" },
    overlay: { value: "16px", type: "dimension" },
    pill: { value: "9999px", type: "dimension" },
  };

  const motionScale = {
    duration: {
      fast: { value: "150ms", type: "duration" },
      normal: { value: "250ms", type: "duration" },
      slow: { value: "400ms", type: "duration" },
    },
    ease: {
      out: { value: "cubic-bezier(0.0, 0.0, 0.2, 1)", type: "cubicBezier" },
      "in-out": {
        value: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        type: "cubicBezier",
      },
      emphasized: {
        value: "cubic-bezier(0.2, 0.0, 0, 1)",
        type: "cubicBezier",
      },
    },
  };

  const controlHeightScale = {
    sm: { value: "32px", type: "dimension" },
    md: { value: "40px", type: "dimension" },
    lg: { value: "48px", type: "dimension" },
  };

  const presets = {
    classic: {
      name: "Joy Classic",
      description: "Oxford Navy, Ochre Gold, Parchment Cream",
      light: {
        "brand-navy": "#14253e",
        "brand-gold": "#c49a3a",
        "brand-cream": "#f8f3e8",
        "brand-ink": "#1f1c13",
        "accent-default": "#c49a3a",
        "accent-hover": "#d0aa52",
        "accent-active": "#b58b2f",
        "accent-subtle": "#fbf4e6",
        "accent-text": "#856515",
        "accent-gradient-end": "#b58b2f",
        "accent-highlight": "#e9cd94",
        "color-brand-primary": "#c49a3a",
        "surface-canvas": "#f8f3e8",
        "surface-card": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-sunken": "#efe9dc",
        "text-primary": "#1f1c13",
        "text-secondary": "#3c3a35",
        "text-muted": "#686660",
        "text-on-accent": "#14253e",
        "border-subtle": "#e3dccc",
        "border-default": "#88867f",
        "border-strong": "#52504a",
        "border-focus": "#856515",
      },
      dark: {
        "brand-navy": "#14253e",
        "brand-gold": "#dab362",
        "brand-cream": "#f8f3e8",
        "brand-ink": "#1f1c13",
        "accent-default": "#dab362",
        "accent-hover": "#e9cd94",
        "accent-active": "#c49a3a",
        "accent-subtle": "#1e2129",
        "accent-text": "#dab362",
        "accent-gradient-end": "#c49a3a",
        "accent-highlight": "#e9cd94",
        "color-brand-primary": "#dab362",
        "surface-canvas": "#0d1624",
        "surface-card": "#111b2b",
        "surface-raised": "#14253e",
        "surface-sunken": "#0a121f",
        "text-primary": "#f8f3e8",
        "text-secondary": "#bab7b0",
        "text-muted": "#a2b2cb",
        "text-on-accent": "#0a121f",
        "border-subtle": "#22324b",
        "border-default": "#566a87",
        "border-strong": "#7487a5",
        "border-focus": "#dab362",
      },
    },
    "bauhaus-primary": {
      name: "Dessau Bauhaus",
      description:
        "Architectural Cobalt, Graphic Charcoal, Crimson and Cadmium emblems",
      light: {
        "brand-navy": "#1e40af",
        "brand-gold": "#d97706",
        "brand-cream": "#f8fafc",
        "brand-ink": "#101828",
        "accent-default": "#1e40af",
        "accent-hover": "#1d4ed8",
        "accent-active": "#1e3a8a",
        "accent-subtle": "#eff6ff",
        "accent-text": "#1e40af",
        "accent-gradient-end": "#2563eb",
        "accent-highlight": "#b91c1c",
        "color-brand-primary": "#1e40af",
        "surface-canvas": "#f8fafc",
        "surface-card": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-sunken": "#f1f5f9",
        "text-primary": "#101828",
        "text-secondary": "#334155",
        "text-muted": "#64748b",
        "text-on-accent": "#ffffff",
        "border-subtle": "#dbe3ec",
        "border-default": "#7c8798",
        "border-strong": "#475569",
        "border-focus": "#1e40af",
      },
      dark: {
        "brand-navy": "#2563eb",
        "brand-gold": "#f59e0b",
        "brand-cream": "#f8fafc",
        "brand-ink": "#101828",
        "accent-default": "#2563eb",
        "accent-hover": "#1d4ed8",
        "accent-active": "#1e40af",
        "accent-subtle": "#172554",
        "accent-text": "#93c5fd",
        "accent-gradient-end": "#1d4ed8",
        "accent-highlight": "#dc2626",
        "color-brand-primary": "#2563eb",
        "surface-canvas": "#080c14",
        "surface-card": "#101828",
        "surface-raised": "#1e293b",
        "surface-sunken": "#060910",
        "text-primary": "#f8fafc",
        "text-secondary": "#cbd5e1",
        "text-muted": "#94a3b8",
        "text-on-accent": "#ffffff",
        "border-subtle": "#334155",
        "border-default": "#64748b",
        "border-strong": "#94a3b8",
        "border-focus": "#60a5fa",
      },
    },
    "clay-court": {
      name: "Clay Court",
      description: "Roland-Garros Terracotta, Court Pine, Court Line White",
      light: {
        "brand-navy": "#264e22",
        "brand-gold": "#c85a32",
        "brand-cream": "#fbf0ea",
        "brand-ink": "#261c14",
        "accent-default": "#9c4221",
        "accent-hover": "#87391d",
        "accent-active": "#6f2f19",
        "accent-subtle": "#f8e5da",
        "accent-text": "#87391d",
        "accent-gradient-end": "#c85a32",
        "accent-highlight": "#e7a17c",
        "color-brand-primary": "#9c4221",
        "surface-canvas": "#fbf0ea",
        "surface-card": "#fffaf7",
        "surface-raised": "#ffffff",
        "surface-sunken": "#f3ded2",
        "text-primary": "#261c14",
        "text-secondary": "#4a3e35",
        "text-muted": "#73645b",
        "text-on-accent": "#ffffff",
        "border-subtle": "#e5d1c6",
        "border-default": "#9a7b6c",
        "border-strong": "#765a4c",
        "border-focus": "#9c4221",
      },
      dark: {
        "brand-navy": "#264e22",
        "brand-gold": "#d97746",
        "brand-cream": "#fbf0ea",
        "brand-ink": "#261c14",
        "accent-default": "#d97746",
        "accent-hover": "#e58b5d",
        "accent-active": "#cc6239",
        "accent-subtle": "#3a1d12",
        "accent-text": "#e99568",
        "accent-gradient-end": "#cc6239",
        "accent-highlight": "#f0b18f",
        "color-brand-primary": "#d97746",
        "surface-canvas": "#17110e",
        "surface-card": "#211713",
        "surface-raised": "#2d201a",
        "surface-sunken": "#0f0a08",
        "text-primary": "#fbf0ea",
        "text-secondary": "#d8c3b7",
        "text-muted": "#b39a8c",
        "text-on-accent": "#18110d",
        "border-subtle": "#463127",
        "border-default": "#80604f",
        "border-strong": "#a47c66",
        "border-focus": "#e58b5d",
      },
    },
    "nordic-slate": {
      name: "Nordic Slate",
      description:
        "Architectural Granite, Arctic Fjord Navy, Silver Mist Paper",
      light: {
        "brand-navy": "#101828",
        "brand-gold": "#0369a1",
        "brand-cream": "#f8fafc",
        "brand-ink": "#101828",
        "accent-default": "#0369a1",
        "accent-hover": "#075985",
        "accent-active": "#0c4a6e",
        "accent-subtle": "#edf3f6",
        "accent-text": "#0369a1",
        "accent-gradient-end": "#075985",
        "accent-highlight": "#7d97a3",
        "color-brand-primary": "#0369a1",
        "surface-canvas": "#f8fafc",
        "surface-card": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-sunken": "#eef2f5",
        "text-primary": "#101828",
        "text-secondary": "#334155",
        "text-muted": "#64748b",
        "text-on-accent": "#ffffff",
        "border-subtle": "#dce4e8",
        "border-default": "#7b8796",
        "border-strong": "#526071",
        "border-focus": "#0369a1",
      },
      dark: {
        "brand-navy": "#1e293b",
        "brand-gold": "#0369a1",
        "brand-cream": "#f8fafc",
        "brand-ink": "#101828",
        "accent-default": "#075985",
        "accent-hover": "#0369a1",
        "accent-active": "#0c4a6e",
        "accent-subtle": "#102b3b",
        "accent-text": "#8bb9cf",
        "accent-gradient-end": "#0369a1",
        "accent-highlight": "#9db4bf",
        "color-brand-primary": "#075985",
        "surface-canvas": "#0b111b",
        "surface-card": "#111a27",
        "surface-raised": "#1e293b",
        "surface-sunken": "#070b12",
        "text-primary": "#f8fafc",
        "text-secondary": "#cbd5e1",
        "text-muted": "#94a3b8",
        "text-on-accent": "#ffffff",
        "border-subtle": "#2d3a49",
        "border-default": "#64748b",
        "border-strong": "#94a3b8",
        "border-focus": "#7aa9bf",
      },
    },
    "verdant-lawn": {
      name: "Verdant Lawn",
      description: "British Racing Green, Champagne Gold, Lawn Ivory",
      light: {
        "brand-navy": "#143d2b",
        "brand-gold": "#c9a227",
        "brand-cream": "#f4f6f0",
        "brand-ink": "#0b1e14",
        "accent-default": "#143d2b",
        "accent-hover": "#0f3021",
        "accent-active": "#092218",
        "accent-subtle": "#e8efe9",
        "accent-text": "#143d2b",
        "accent-gradient-end": "#22593d",
        "accent-highlight": "#c9a227",
        "color-brand-primary": "#143d2b",
        "surface-canvas": "#f4f6f0",
        "surface-card": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-sunken": "#e5ebe4",
        "text-primary": "#0b1e14",
        "text-secondary": "#29483a",
        "text-muted": "#526f5f",
        "text-on-accent": "#ffffff",
        "border-subtle": "#d4ddd5",
        "border-default": "#788f7f",
        "border-strong": "#526f5f",
        "border-focus": "#143d2b",
      },
      dark: {
        "brand-navy": "#22593d",
        "brand-gold": "#d6b64a",
        "brand-cream": "#f4f6f0",
        "brand-ink": "#0b1e14",
        "accent-default": "#22593d",
        "accent-hover": "#2e6a4a",
        "accent-active": "#143d2b",
        "accent-subtle": "#102a1d",
        "accent-text": "#96cdaa",
        "accent-gradient-end": "#2e6a4a",
        "accent-highlight": "#d6b64a",
        "color-brand-primary": "#22593d",
        "surface-canvas": "#09150f",
        "surface-card": "#0e2118",
        "surface-raised": "#173328",
        "surface-sunken": "#050c08",
        "text-primary": "#f4f6f0",
        "text-secondary": "#c7d8cb",
        "text-muted": "#96ad9d",
        "text-on-accent": "#ffffff",
        "border-subtle": "#294536",
        "border-default": "#5d7866",
        "border-strong": "#84a28e",
        "border-focus": "#d6b64a",
      },
    },
    outdoor: {
      name: "High-Noon Outdoor",
      description: "AAA high-contrast mode for outdoor sunlight glare",
      light: {
        "brand-navy": "#0f172a",
        "brand-gold": "#b45309",
        "brand-cream": "#ffffff",
        "brand-ink": "#000000",
        "accent-default": "#0f172a",
        "accent-hover": "#1e293b",
        "accent-active": "#000000",
        "accent-subtle": "#f1f5f9",
        "accent-text": "#0f172a",
        "accent-gradient-end": "#0f172a",
        "accent-highlight": "#0f172a",
        "color-brand-primary": "#0f172a",
        "surface-canvas": "#ffffff",
        "surface-card": "#ffffff",
        "surface-raised": "#ffffff",
        "surface-sunken": "#f1f5f9",
        "text-primary": "#000000",
        "text-secondary": "#0f172a",
        "text-muted": "#334155",
        "text-on-accent": "#ffffff",
        "border-subtle": "#0f172a",
        "border-default": "#0f172a",
        "border-strong": "#000000",
        "border-focus": "#000000",
      },
      dark: {
        "brand-navy": "#000000",
        "brand-gold": "#f59e0b",
        "brand-cream": "#ffffff",
        "brand-ink": "#000000",
        "accent-default": "#ffffff",
        "accent-hover": "#f8fafc",
        "accent-active": "#e2e8f0",
        "accent-subtle": "#1e293b",
        "accent-text": "#ffffff",
        "accent-gradient-end": "#ffffff",
        "accent-highlight": "#ffffff",
        "color-brand-primary": "#ffffff",
        "surface-canvas": "#000000",
        "surface-card": "#05080e",
        "surface-raised": "#0f172a",
        "surface-sunken": "#000000",
        "text-primary": "#ffffff",
        "text-secondary": "#f8fafc",
        "text-muted": "#cbd5e1",
        "text-on-accent": "#000000",
        "border-subtle": "#ffffff",
        "border-default": "#ffffff",
        "border-strong": "#ffffff",
        "border-focus": "#ffffff",
      },
    },
  };

  return {
    color: {
      navy: navyRamp,
      gold: goldRamp,
      ink: inkRamp,
      cream: creamRamp,
      neutral: neutralRamp,
      status: statusRamps,
      clay: clayRamp,
    },
    semantic: {
      light: semanticLight,
      dark: semanticDark,
    },
    preset: presets,
    z: zScale,
    "font-size": fontScale["size"],
    "line-height": fontScale["line-height"],
    "font-weight": fontScale["weight"],
    "letter-spacing": fontScale["letter-spacing"],
    space: spaceScale,
    radius: radiusScale,
    duration: motionScale["duration"],
    ease: motionScale["ease"],
    "control-height": controlHeightScale,

    // Base font families
    font: {
      family: {
        sans: {
          value: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          type: "fontFamily",
        },
        mono: { value: "JetBrains Mono, Menlo, monospace", type: "fontFamily" },
        display: {
          value: '"Cormorant Garamond", "Noto Serif", Georgia, serif',
          type: "fontFamily",
        },
      },
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = generateAllTokens();
  const destPath = path.resolve(__dirname, "../src/tokens.json");
  fs.writeFileSync(destPath, JSON.stringify(all, null, 2) + "\n");
  console.log("Successfully wrote generated tokens to", destPath);
}
