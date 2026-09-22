// Script to generate primitive color ramps and semantic layers for Joymify Tokens
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  srgbToLinear,
  linearToSrgb,
  hexToRgb,
  rgbToHex,
  hexToOklch,
  oklchToHex,
  relativeLuminance,
  contrastRatio
} from './color.mjs';

export {
  srgbToLinear,
  linearToSrgb,
  hexToRgb,
  rgbToHex,
  hexToOklch,
  oklchToHex,
  relativeLuminance,
  contrastRatio
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
  const { L: lNavyAnchor, C: cNavyAnchor, H: hNavy } = hexToOklch('#14253e');
  const navySteps = [
    { step: '50', L: 0.96, C: 0.015 },
    { step: '100', L: 0.88, C: 0.025 },
    { step: '200', L: 0.76, C: 0.040 },
    { step: '300', L: 0.62, C: 0.050 },
    { step: '400', L: 0.520, C: 0.052 }, // Dark border.default >= 3:1 vs dark card & canvas
    { step: '500', L: lNavyAnchor, C: cNavyAnchor, hex: '#14253e' },
    { step: '600', L: 0.252, C: 0.045 },
    { step: '700', L: 0.242, C: 0.040 },
    { step: '800', L: 0.222, C: 0.035 },
    { step: '900', L: 0.200, C: 0.030 },
    { step: '950', L: 0.183, C: 0.030 }
  ];
  const navyRamp = {};
  for (const s of navySteps) {
    navyRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hNavy),
      type: 'color'
    };
  }

  // 2. Gold ramp anchored at gold-400 #c49a3a
  const { L: lGoldAnchor, C: cGoldAnchor, H: hGold } = hexToOklch('#c49a3a');
  const goldSteps = [
    { step: '50', L: 0.97, C: 0.02 },
    { step: '100', L: 0.93, C: 0.04 },
    { step: '200', L: 0.86, C: 0.08 },
    { step: '300', L: 0.785, C: 0.11 }, // Dark accent (>= 4.5:1 on dark surfaces)
    { step: '400', L: lGoldAnchor, C: cGoldAnchor, hex: '#c49a3a' },
    { step: '500', L: 0.62, C: 0.11 },
    { step: '600', L: 0.525, C: 0.10 }, // Text link (>= 4.5:1 on white and cream-100)
    { step: '700', L: 0.43, C: 0.09 },
    { step: '800', L: 0.34, C: 0.08 },
    { step: '900', L: 0.25, C: 0.06 },
    { step: '950', L: 0.16, C: 0.04 }
  ];
  const goldRamp = {};
  for (const s of goldSteps) {
    goldRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hGold),
      type: 'color'
    };
  }

  // 3. Ink ramp anchored at ink-500 #1f1c13
  const { L: lInkAnchor, C: cInkAnchor, H: hInk } = hexToOklch('#1f1c13');
  const inkSteps = [
    { step: '50', L: 0.96, C: 0.008 },
    { step: '100', L: 0.88, C: 0.012 },
    { step: '200', L: 0.74, C: 0.015 },
    { step: '300', L: 0.58, C: 0.016 },
    { step: '400', L: 0.40, C: 0.017 },
    { step: '500', L: lInkAnchor, C: cInkAnchor, hex: '#1f1c13' },
    { step: '600', L: 0.200, C: 0.015 },
    { step: '700', L: 0.175, C: 0.013 },
    { step: '800', L: 0.150, C: 0.011 },
    { step: '900', L: 0.125, C: 0.009 },
    { step: '950', L: 0.100, C: 0.007 }
  ];
  const inkRamp = {};
  for (const s of inkSteps) {
    inkRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hInk),
      type: 'color'
    };
  }

  // 4. Cream ramp anchored at cream-100 #f8f3e8
  const { L: lCreamAnchor, C: cCreamAnchor, H: hCream } = hexToOklch('#f8f3e8');
  const creamSteps = [
    { step: '50', L: 0.985, C: 0.010 },
    { step: '100', L: lCreamAnchor, C: cCreamAnchor, hex: '#f8f3e8' },
    { step: '200', L: 0.935, C: 0.018 },
    { step: '300', L: 0.895, C: 0.022 }
  ];
  const creamRamp = {};
  for (const s of creamSteps) {
    creamRamp[s.step] = {
      value: s.hex || oklchToHex(s.L, s.C, hCream),
      type: 'color'
    };
  }

  // 5. Neutral ramp tinted toward warm ink/navy hue (H=90, Chroma in 0.005-0.015)
  const neutralSteps = [
    { step: '50', L: 0.97 },
    { step: '100', L: 0.93 },
    { step: '200', L: 0.86 },
    { step: '300', L: 0.78 },
    { step: '400', L: 0.62 }, // Light border.default & Dark text.muted
    { step: '500', L: 0.51 }, // Light text.muted (>= 4.5:1 on cream-100)
    { step: '600', L: 0.43 }, // Light border.strong
    { step: '700', L: 0.35 }, // Light text.secondary
    { step: '800', L: 0.26 },
    { step: '900', L: 0.18 },
    { step: '950', L: 0.11 }
  ];
  const neutralRamp = {};
  for (const s of neutralSteps) {
    neutralRamp[s.step] = {
      value: oklchToHex(s.L, 0.010, 90.0),
      type: 'color'
    };
  }

  // 6. Status ramps hue-tuned to brand with even OKLCH steps
  const statusSpecs = {
    success: { H: 145, cMax: 0.12 },
    warning: { H: 75, cMax: 0.14 },
    danger: { H: 25, cMax: 0.16 },
    info: { H: 250, cMax: 0.11 }
  };
  const statusLSteps = {
    '100': { L: 0.95, cScale: 0.15 },
    '300': { L: 0.78, cScale: 0.75 },
    '500': { L: 0.58, cScale: 1.00 },
    '600': { L: 0.48, cScale: 0.90 },
    '700': { L: 0.38, cScale: 0.80 },
    '900': { L: 0.20, cScale: 0.40 }
  };
  const statusRamps = {};
  for (const [name, cfg] of Object.entries(statusSpecs)) {
    statusRamps[name] = {};
    for (const [step, lCfg] of Object.entries(statusLSteps)) {
      statusRamps[name][step] = {
        value: oklchToHex(lCfg.L, cfg.cMax * lCfg.cScale, cfg.H),
        type: 'color'
      };
    }
  }

  const semanticLight = {
    // Surfaces
    "surface": {
      "canvas": { "value": "{color.cream.100}", "type": "color" },
      "card": { "value": "#ffffff", "type": "color" },
      "raised": { "value": "#ffffff", "type": "color" },
      "sunken": { "value": "{color.cream.200}", "type": "color" },
      "overlay": { "value": "#ffffff", "type": "color" },
      "inverse": { "value": "{color.navy.500}", "type": "color" }
    },
    // Text
    "text": {
      "primary": { "value": "{color.ink.500}", "type": "color" },
      "secondary": { "value": "{color.neutral.700}", "type": "color" },
      "muted": { "value": "{color.neutral.500}", "type": "color" },
      "inverse": { "value": "#ffffff", "type": "color" },
      "link": { "value": "{color.gold.600}", "type": "color" },
      "on-accent": { "value": "{color.navy.500}", "type": "color" }
    },
    // Border
    "border": {
      "subtle": { "value": "{color.cream.300}", "type": "color" },
      "default": { "value": "{color.neutral.400}", "type": "color" },
      "strong": { "value": "{color.neutral.600}", "type": "color" },
      "focus": { "value": "{color.gold.600}", "type": "color" }
    },
    // Accent
    "accent": {
      "default": { "value": "{color.gold.400}", "type": "color" },
      "hover": { "value": "{color.gold.500}", "type": "color" },
      "active": { "value": "{color.gold.600}", "type": "color" },
      "subtle": { "value": "{color.gold.50}", "type": "color" },
      "text": { "value": "{color.gold.600}", "type": "color" }
    },
    // Status
    "status": {
      "success-fg": { "value": "{color.status.success.700}", "type": "color" },
      "success-bg": { "value": "{color.status.success.100}", "type": "color" },
      "success-border": { "value": "{color.status.success.300}", "type": "color" },
      "warning-fg": { "value": "{color.status.warning.700}", "type": "color" },
      "warning-bg": { "value": "{color.status.warning.100}", "type": "color" },
      "warning-border": { "value": "{color.status.warning.300}", "type": "color" },
      "danger-fg": { "value": "{color.status.danger.700}", "type": "color" },
      "danger-bg": { "value": "{color.status.danger.100}", "type": "color" },
      "danger-border": { "value": "{color.status.danger.300}", "type": "color" },
      "info-fg": { "value": "{color.status.info.700}", "type": "color" },
      "info-bg": { "value": "{color.status.info.100}", "type": "color" },
      "info-border": { "value": "{color.status.info.300}", "type": "color" }
    },
    // Focus ring
    "focus-ring": { "value": "2px solid #856515", "type": "border" },
    // Elevation
    "elevation": {
      "0": { "value": "none", "type": "shadow" },
      "1": { "value": "0 1px 3px rgba(20, 37, 62, 0.08), 0 1px 2px rgba(20, 37, 62, 0.04)", "type": "shadow" },
      "2": { "value": "0 4px 8px -2px rgba(20, 37, 62, 0.1), 0 2px 4px -2px rgba(20, 37, 62, 0.06)", "type": "shadow" },
      "3": { "value": "0 12px 20px -4px rgba(20, 37, 62, 0.12), 0 4px 6px -2px rgba(20, 37, 62, 0.04)", "type": "shadow" }
    }
  };

  const semanticDark = {
    // Surfaces
    "surface": {
      "canvas": { "value": "{color.navy.900}", "type": "color" },
      "card": { "value": "{color.navy.800}", "type": "color" },
      "raised": { "value": "{color.navy.700}", "type": "color" },
      "sunken": { "value": "{color.navy.950}", "type": "color" },
      "overlay": { "value": "{color.navy.800}", "type": "color" },
      "inverse": { "value": "{color.cream.100}", "type": "color" }
    },
    // Text
    "text": {
      "primary": { "value": "{color.cream.100}", "type": "color" },
      "secondary": { "value": "{color.neutral.300}", "type": "color" },
      "muted": { "value": "{color.neutral.400}", "type": "color" },
      "inverse": { "value": "{color.ink.500}", "type": "color" },
      "link": { "value": "{color.gold.300}", "type": "color" },
      "on-accent": { "value": "{color.navy.950}", "type": "color" }
    },
    // Border
    "border": {
      "subtle": { "value": "{color.navy.600}", "type": "color" },
      "default": { "value": "{color.navy.400}", "type": "color" },
      "strong": { "value": "{color.navy.300}", "type": "color" },
      "focus": { "value": "{color.gold.300}", "type": "color" }
    },
    // Accent
    "accent": {
      "default": { "value": "{color.gold.300}", "type": "color" },
      "hover": { "value": "{color.gold.200}", "type": "color" },
      "active": { "value": "{color.gold.400}", "type": "color" },
      "subtle": { "value": "#2a2211", "type": "color" },
      "text": { "value": "{color.gold.300}", "type": "color" }
    },
    // Status
    "status": {
      "success-fg": { "value": "{color.status.success.300}", "type": "color" },
      "success-bg": { "value": "{color.status.success.900}", "type": "color" },
      "success-border": { "value": "{color.status.success.700}", "type": "color" },
      "warning-fg": { "value": "{color.status.warning.300}", "type": "color" },
      "warning-bg": { "value": "{color.status.warning.900}", "type": "color" },
      "warning-border": { "value": "{color.status.warning.700}", "type": "color" },
      "danger-fg": { "value": "{color.status.danger.300}", "type": "color" },
      "danger-bg": { "value": "{color.status.danger.900}", "type": "color" },
      "danger-border": { "value": "{color.status.danger.700}", "type": "color" },
      "info-fg": { "value": "{color.status.info.300}", "type": "color" },
      "info-bg": { "value": "{color.status.info.900}", "type": "color" },
      "info-border": { "value": "{color.status.info.700}", "type": "color" }
    },
    // Focus ring
    "focus-ring": { "value": "2px solid #dab362", "type": "border" },
    // Elevation
    "elevation": {
      "0": { "value": "none", "type": "shadow" },
      "1": { "value": "0 0 0 1px rgba(77, 96, 125, 0.25), 0 1px 3px rgba(0, 0, 0, 0.4)", "type": "shadow" },
      "2": { "value": "0 0 0 1px rgba(77, 96, 125, 0.35), 0 4px 12px rgba(0, 0, 0, 0.5)", "type": "shadow" },
      "3": { "value": "0 0 0 1px rgba(77, 96, 125, 0.45), 0 12px 24px -4px rgba(0, 0, 0, 0.6)", "type": "shadow" }
    }
  };

  // Shared scales across themes
  const zScale = {
    "base": { "value": "0", "type": "dimension" },
    "sticky": { "value": "100", "type": "dimension" },
    "backdrop": { "value": "900", "type": "dimension" },
    "dropdown": { "value": "1000", "type": "dimension" },
    "drawer": { "value": "1020", "type": "dimension" },
    "modal": { "value": "1050", "type": "dimension" },
    "popover": { "value": "1060", "type": "dimension" },
    "toast": { "value": "1100", "type": "dimension" },
    "tooltip": { "value": "1200", "type": "dimension" }
  };

  const fontScale = {
    "size": {
      "xs": { "value": "0.75rem", "type": "dimension" },
      "sm": { "value": "0.875rem", "type": "dimension" },
      "md": { "value": "1rem", "type": "dimension" },
      "lg": { "value": "1.2rem", "type": "dimension" },
      "xl": { "value": "1.44rem", "type": "dimension" },
      "2xl": { "value": "1.728rem", "type": "dimension" },
      "3xl": { "value": "2.074rem", "type": "dimension" },
      "4xl": { "value": "2.488rem", "type": "dimension" },
      "5xl": { "value": "2.986rem", "type": "dimension" },
      "display-sm": { "value": "clamp(2rem, 4vw + 1rem, 2.5rem)", "type": "dimension" },
      "display-md": { "value": "clamp(2.5rem, 5vw + 1rem, 3.25rem)", "type": "dimension" },
      "display-lg": { "value": "clamp(3rem, 6vw + 1rem, 4rem)", "type": "dimension" }
    },
    "line-height": {
      "tight": { "value": "1.15", "type": "dimension" },
      "snug": { "value": "1.375", "type": "dimension" },
      "normal": { "value": "1.5", "type": "dimension" },
      "relaxed": { "value": "1.625", "type": "dimension" }
    },
    "weight": {
      "regular": { "value": "400", "type": "dimension" },
      "medium": { "value": "500", "type": "dimension" },
      "semibold": { "value": "600", "type": "dimension" },
      "bold": { "value": "700", "type": "dimension" }
    },
    "letter-spacing": {
      "tight": { "value": "-0.015em", "type": "dimension" },
      "normal": { "value": "0em", "type": "dimension" }
    }
  };

  const spaceScale = {
    "0.5": { "value": "2px", "type": "dimension" },
    "1": { "value": "4px", "type": "dimension" },
    "2": { "value": "8px", "type": "dimension" },
    "3": { "value": "12px", "type": "dimension" },
    "4": { "value": "16px", "type": "dimension" },
    "5": { "value": "20px", "type": "dimension" },
    "6": { "value": "24px", "type": "dimension" },
    "8": { "value": "32px", "type": "dimension" },
    "10": { "value": "40px", "type": "dimension" },
    "12": { "value": "48px", "type": "dimension" },
    "16": { "value": "64px", "type": "dimension" },
    "20": { "value": "80px", "type": "dimension" },
    "24": { "value": "96px", "type": "dimension" }
  };

  const radiusScale = {
    "control": { "value": "6px", "type": "dimension" },
    "card": { "value": "12px", "type": "dimension" },
    "overlay": { "value": "16px", "type": "dimension" },
    "pill": { "value": "9999px", "type": "dimension" }
  };

  const motionScale = {
    "duration": {
      "fast": { "value": "150ms", "type": "duration" },
      "normal": { "value": "250ms", "type": "duration" },
      "slow": { "value": "400ms", "type": "duration" }
    },
    "ease": {
      "out": { "value": "cubic-bezier(0.0, 0.0, 0.2, 1)", "type": "cubicBezier" },
      "in-out": { "value": "cubic-bezier(0.4, 0.0, 0.2, 1)", "type": "cubicBezier" },
      "emphasized": { "value": "cubic-bezier(0.2, 0.0, 0, 1)", "type": "cubicBezier" }
    }
  };

  const controlHeightScale = {
    "sm": { "value": "32px", "type": "dimension" },
    "md": { "value": "40px", "type": "dimension" },
    "lg": { "value": "48px", "type": "dimension" }
  };

  return {
    "color": {
      "navy": navyRamp,
      "gold": goldRamp,
      "ink": inkRamp,
      "cream": creamRamp,
      "neutral": neutralRamp,
      "status": statusRamps
    },
    "semantic": {
      "light": semanticLight,
      "dark": semanticDark
    },
    "z": zScale,
    "font-size": fontScale["size"],
    "line-height": fontScale["line-height"],
    "font-weight": fontScale["weight"],
    "letter-spacing": fontScale["letter-spacing"],
    "space": spaceScale,
    "radius": radiusScale,
    "duration": motionScale["duration"],
    "ease": motionScale["ease"],
    "control-height": controlHeightScale,

    // Base font families
    "font": {
      "family": {
        "sans": { "value": "Inter, -apple-system, BlinkMacSystemFont, sans-serif", "type": "fontFamily" },
        "mono": { "value": "JetBrains Mono, Menlo, monospace", "type": "fontFamily" }
      }
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const all = generateAllTokens();
  const destPath = path.resolve(__dirname, '../src/tokens.json');
  fs.writeFileSync(destPath, JSON.stringify(all, null, 2) + '\n');
  console.log('Successfully wrote generated tokens to', destPath);
}
