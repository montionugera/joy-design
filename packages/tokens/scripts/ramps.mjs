// Script to generate primitive color ramps and semantic layers for Joymify Tokens
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c) {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

export function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r, g, b) {
  const toHex = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToOklch(hex) {
  const [r255, g255, b255] = hexToRgb(hex);
  const r = srgbToLinear(r255);
  const g = srgbToLinear(g255);
  const b = srgbToLinear(b255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOklch = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.hypot(a, bOklch);
  let H = (Math.atan2(bOklch, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { L, C, H };
}

export function oklchToHex(L, C, H) {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const r = linearToSrgb(rLin) * 255;
  const g = linearToSrgb(gLin) * 255;
  const bRgb = linearToSrgb(bLin) * 255;

  return rgbToHex(r, g, bRgb);
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export function generateAllTokens() {
  // Primitives with anchors:
  // navy-500: #14253e
  // gold-400: #c49a3a
  // ink-500:  #1f1c13
  // cream-100: #f8f3e8
  // gold-600: #8c671a (≥ 4.5:1 on white and cream)
  // gold-300: #deb853 (≥ 4.5:1 on navy-900)

  const navyRamp = {
    "50": { "value": "#f2f5f9", "type": "color" },
    "100": { "value": "#e1e8f2", "type": "color" },
    "200": { "value": "#c4d3e5", "type": "color" },
    "300": { "value": "#9cb5d3", "type": "color" },
    "400": { "value": "#4c6e9f", "type": "color" },
    "500": { "value": "#14253e", "type": "color" },
    "600": { "value": "#182c47", "type": "color" },
    "700": { "value": "#16273e", "type": "color" },
    "800": { "value": "#15243b", "type": "color" },
    "900": { "value": "#0f1b2e", "type": "color" },
    "950": { "value": "#09111e", "type": "color" }
  };

  const goldRamp = {
    "50": { "value": "#fdf9ee", "type": "color" },
    "100": { "value": "#fbf2db", "type": "color" },
    "200": { "value": "#f4e2b0", "type": "color" },
    "300": { "value": "#deb853", "type": "color" },
    "400": { "value": "#c49a3a", "type": "color" },
    "500": { "value": "#b3892f", "type": "color" },
    "600": { "value": "#8c671a", "type": "color" },
    "700": { "value": "#6e4f10", "type": "color" },
    "800": { "value": "#503908", "type": "color" },
    "900": { "value": "#352403", "type": "color" },
    "950": { "value": "#1e1400", "type": "color" }
  };

  const inkRamp = {
    "50": { "value": "#f8f6f0", "type": "color" },
    "100": { "value": "#ede8dd", "type": "color" },
    "200": { "value": "#dad2c0", "type": "color" },
    "300": { "value": "#bfb49e", "type": "color" },
    "400": { "value": "#9a8d75", "type": "color" },
    "500": { "value": "#1f1c13", "type": "color" },
    "600": { "value": "#1b1810", "type": "color" },
    "700": { "value": "#17140e", "type": "color" },
    "800": { "value": "#13100b", "type": "color" },
    "900": { "value": "#0e0c08", "type": "color" },
    "950": { "value": "#080705", "type": "color" }
  };

  const creamRamp = {
    "50": { "value": "#fcfaf4", "type": "color" },
    "100": { "value": "#f8f3e8", "type": "color" },
    "200": { "value": "#f3ede0", "type": "color" },
    "300": { "value": "#ece4d2", "type": "color" }
  };

  const neutralRamp = {
    "50": { "value": "#faf8f5", "type": "color" },
    "100": { "value": "#f3ede2", "type": "color" },
    "200": { "value": "#e5ded0", "type": "color" },
    "300": { "value": "#d5cdbd", "type": "color" },
    "400": { "value": "#938a79", "type": "color" },
    "500": { "value": "#6c6557", "type": "color" },
    "600": { "value": "#5f574a", "type": "color" },
    "700": { "value": "#474136", "type": "color" },
    "800": { "value": "#312c24", "type": "color" },
    "900": { "value": "#201c16", "type": "color" },
    "950": { "value": "#14120e", "type": "color" }
  };

  const statusRamps = {
    "success": {
      "100": { "value": "#eef8f2", "type": "color" },
      "300": { "value": "#6ee7b7", "type": "color" },
      "500": { "value": "#198754", "type": "color" },
      "600": { "value": "#146c43", "type": "color" },
      "700": { "value": "#0f5132", "type": "color" },
      "900": { "value": "#062817", "type": "color" }
    },
    "warning": {
      "100": { "value": "#fef6e7", "type": "color" },
      "300": { "value": "#fcd34d", "type": "color" },
      "500": { "value": "#d97706", "type": "color" },
      "600": { "value": "#b45309", "type": "color" },
      "700": { "value": "#873b06", "type": "color" },
      "900": { "value": "#361603", "type": "color" }
    },
    "danger": {
      "100": { "value": "#fef2f2", "type": "color" },
      "300": { "value": "#fca5a5", "type": "color" },
      "500": { "value": "#dc2626", "type": "color" },
      "600": { "value": "#b91c1c", "type": "color" },
      "700": { "value": "#8f1414", "type": "color" },
      "900": { "value": "#3a0909", "type": "color" }
    },
    "info": {
      "100": { "value": "#edf5fd", "type": "color" },
      "300": { "value": "#93c5fd", "type": "color" },
      "500": { "value": "#1d6ec6", "type": "color" },
      "600": { "value": "#15549a", "type": "color" },
      "700": { "value": "#0f3d70", "type": "color" },
      "900": { "value": "#091e3a", "type": "color" }
    }
  };

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
    "focus-ring": { "value": "2px solid #8c671a", "type": "border" },
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
      "canvas": { "value": "{color.navy.950}", "type": "color" },
      "card": { "value": "{color.navy.900}", "type": "color" },
      "raised": { "value": "{color.navy.800}", "type": "color" },
      "sunken": { "value": "#060b14", "type": "color" },
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
    "focus-ring": { "value": "2px solid #deb853", "type": "border" },
    // Elevation
    "elevation": {
      "0": { "value": "none", "type": "shadow" },
      "1": { "value": "0 0 0 1px rgba(76, 110, 159, 0.25), 0 1px 3px rgba(0, 0, 0, 0.4)", "type": "shadow" },
      "2": { "value": "0 0 0 1px rgba(76, 110, 159, 0.35), 0 4px 12px rgba(0, 0, 0, 0.5)", "type": "shadow" },
      "3": { "value": "0 0 0 1px rgba(76, 110, 159, 0.45), 0 12px 24px -4px rgba(0, 0, 0, 0.6)", "type": "shadow" }
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
