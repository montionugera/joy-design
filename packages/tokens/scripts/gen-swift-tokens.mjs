import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCheck = process.argv.includes('--check');
const tokensPath = path.join(__dirname, '../src/tokens.json');
const targetFile = path.join(__dirname, '../../swift/Sources/JoyDesign/JoyTokens.g.swift');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

function resolveRef(val, rootTokens) {
  if (typeof val !== 'string') return val;
  return val.replace(/\{([^}]+)\}/g, (_, refPath) => {
    const parts = refPath.split('.');
    let cur = rootTokens;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        throw new Error(`Unresolved token reference: {${refPath}}`);
      }
    }
    const raw = cur && typeof cur === 'object' && 'value' in cur ? cur.value : cur;
    return resolveRef(raw, rootTokens);
  });
}

function toSwiftColor(rawColor) {
  const str = String(rawColor).trim();
  if (str.startsWith('#')) {
    let hex = str.slice(1).toUpperCase();
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      return `Color(joyHex: 0x${hex})`;
    }
    if (hex.length === 8) {
      const r = hex.slice(0, 2);
      const g = hex.slice(2, 4);
      const b = hex.slice(4, 6);
      const a = (parseInt(hex.slice(6, 8), 16) / 255).toFixed(4);
      return `Color(joyHex: 0x${r}${g}${b}, alpha: ${a})`;
    }
  }
  const rgbaMatch = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([-\d.]+)\s*)?\)$/);
  if (rgbaMatch) {
    const rHex = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0').toUpperCase();
    const gHex = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0').toUpperCase();
    const bHex = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0').toUpperCase();
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1.0;
    if (a >= 0.999) {
      return `Color(joyHex: 0x${rHex}${gHex}${bHex})`;
    }
    return `Color(joyHex: 0x${rHex}${gHex}${bHex}, alpha: ${a})`;
  }
  throw new Error(`Unsupported color format for Swift: ${rawColor}`);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function kebabToCamel(str) {
  return str.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function parsePx(val) {
  const str = String(val).trim();
  if (str === '9999px') return 9999;
  const clampMatch = str.match(/^clamp\(\s*([\d.]+)rem/);
  if (clampMatch) {
    return Math.round(parseFloat(clampMatch[1]) * 16 * 1000) / 1000;
  }
  if (str.endsWith('rem')) {
    return Math.round(parseFloat(str) * 16 * 1000) / 1000;
  }
  return parseFloat(str);
}

// 1. Primitive Color Ramps from tokens.json
const primitiveLines = [];
for (const [rampName, rampObj] of Object.entries(tokens.color || {})) {
  if (rampName === 'status') {
    for (const [statusKind, statusSteps] of Object.entries(rampObj)) {
      for (const [step, token] of Object.entries(statusSteps)) {
        const val = resolveRef(token.value, tokens);
        const expr = toSwiftColor(val);
        primitiveLines.push(`    public static let status${capitalize(statusKind)}${step} = ${expr}`);
        primitiveLines.push(`    public static let ${statusKind}${step} = status${capitalize(statusKind)}${step}`);
      }
    }
  } else {
    for (const [step, token] of Object.entries(rampObj)) {
      const val = resolveRef(token.value, tokens);
      const expr = toSwiftColor(val);
      primitiveLines.push(`    public static let ${rampName}${step} = ${expr}`);
    }
  }
}

// 2. Semantic Light & Dark tokens from tokens.json
function extractSemantic(mode) {
  const raw = tokens.semantic[mode];
  const get = (group, key) => toSwiftColor(resolveRef(raw[group][key].value, tokens));
  return {
    surfaceCanvas: get('surface', 'canvas'),
    surfaceCard: get('surface', 'card'),
    surfaceElevated: get('surface', 'raised'),
    surfaceSunken: get('surface', 'sunken'),
    textPrimary: get('text', 'primary'),
    textSecondary: get('text', 'secondary'),
    textMuted: get('text', 'muted'),
    textOnAccent: get('text', 'on-accent'),
    borderSubtle: get('border', 'subtle'),
    borderDefault: get('border', 'default'),
    borderStrong: get('border', 'strong'),
    accentBase: get('accent', 'default'),
    accentHover: get('accent', 'hover'),
    accentSubtle: get('accent', 'subtle'),
    statusSuccessFg: get('status', 'success-fg'),
    statusWarningFg: get('status', 'warning-fg'),
    statusDangerFg: get('status', 'danger-fg'),
    statusInfoFg: get('status', 'info-fg'),
  };
}

const lightSem = extractSemantic('light');
const darkSem = extractSemantic('dark');

function renderSemanticInstance(name, sem, isDark) {
  return `    public static let ${name} = JoyThemeTokens(
        surfaceCanvas: ${sem.surfaceCanvas},
        surfaceCard: ${sem.surfaceCard},
        surfaceElevated: ${sem.surfaceElevated},
        surfaceSunken: ${sem.surfaceSunken},
        textPrimary: ${sem.textPrimary},
        textSecondary: ${sem.textSecondary},
        textMuted: ${sem.textMuted},
        textOnAccent: ${sem.textOnAccent},
        borderSubtle: ${sem.borderSubtle},
        borderDefault: ${sem.borderDefault},
        borderStrong: ${sem.borderStrong},
        accentBase: ${sem.accentBase},
        accentHover: ${sem.accentHover},
        accentSubtle: ${sem.accentSubtle},
        statusSuccessFg: ${sem.statusSuccessFg},
        statusWarningFg: ${sem.statusWarningFg},
        statusDangerFg: ${sem.statusDangerFg},
        statusInfoFg: ${sem.statusInfoFg},
        isDark: ${isDark}
    )`;
}

const spaceLines = [];
for (const [k, v] of Object.entries(tokens.space || {})) {
  const prop = 's' + k.replace('.', '_');
  spaceLines.push(`    public static let ${prop}: CGFloat = ${parsePx(v.value)}`);
}

const radiusLines = [];
for (const [k, v] of Object.entries(tokens.radius || {})) {
  const prop = kebabToCamel(k);
  radiusLines.push(`    public static let ${prop}: CGFloat = ${parsePx(v.value)}`);
}

const fontSizeLines = [];
for (const [k, v] of Object.entries(tokens['font-size'] || {})) {
  const prop = kebabToCamel(k).replace(/^(\d)/, 'n$1');
  fontSizeLines.push(`    public static let ${prop}: CGFloat = ${parsePx(v.value)}`);
}

const code = `// GENERATED CODE - DO NOT MODIFY BY HAND
// Source: packages/tokens/src/tokens.json
// Generator: packages/tokens/scripts/gen-swift-tokens.mjs

import Foundation
import SwiftUI

public extension Color {
    init(joyHex: UInt32, alpha: Double = 1.0) {
        let r = Double((joyHex >> 16) & 0xFF) / 255.0
        let g = Double((joyHex >> 8) & 0xFF) / 255.0
        let b = Double(joyHex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}

/// Generated primitive color ramps from tokens.json.
public enum JoyColorRamps {
${primitiveLines.join('\n')}
}

/// Generated spacing tokens from tokens.json.
public enum JoySpaceTokens {
${spaceLines.join('\n')}
}

/// Generated corner radius tokens from tokens.json.
public enum JoyRadiusTokens {
${radiusLines.join('\n')}
}

/// Generated font-size tokens from tokens.json.
public enum JoyFontSizeTokens {
${fontSizeLines.join('\n')}
}

/// Semantic theme tokens for Light and Dark modes.
public struct JoyThemeTokens: Sendable {
    public let surfaceCanvas: Color
    public let surfaceCard: Color
    public let surfaceElevated: Color
    public let surfaceSunken: Color
    public let textPrimary: Color
    public let textSecondary: Color
    public let textMuted: Color
    public let textOnAccent: Color
    public let borderSubtle: Color
    public let borderDefault: Color
    public let borderStrong: Color
    public let accentBase: Color
    public let accentHover: Color
    public let accentSubtle: Color
    public let statusSuccessFg: Color
    public let statusWarningFg: Color
    public let statusDangerFg: Color
    public let statusInfoFg: Color
    public let isDark: Bool

${renderSemanticInstance('light', lightSem, false)}

${renderSemanticInstance('dark', darkSem, true)}
}

/// Canonical JoyDesign namespace shared across macOS & iOS SwiftUI tools.
public enum JoyDesign {
    public enum Palette {
        public static let navy950 = JoyColorRamps.navy950
        public static let navy900 = Color(joyHex: 0x0F1320)
        public static let navy800 = Color(joyHex: 0x1A2036)
        public static let navy700 = Color(joyHex: 0x232A45)
        public static let navy600 = Color(joyHex: 0x2E3757)
        public static let navy500 = Color(joyHex: 0x3A4468)

        public static let gold400 = Color(joyHex: 0xFFE24D)
        public static let gold500 = Color(joyHex: 0xFFD700)
        public static let gold600 = Color(joyHex: 0xE6C200)

        public static let bronze400 = Color(joyHex: 0xDDA05A)
        public static let bronze500 = Color(joyHex: 0xCD7F32)
        public static let bronze600 = Color(joyHex: 0xA9662A)

        public static let sand50  = Color(joyHex: 0xF5EFE0)
        public static let sand200 = Color(joyHex: 0xD8CFBB)
        public static let sand400 = Color(joyHex: 0xA89F8B)
        public static let sand600 = Color(joyHex: 0x6B6355)

        public static let success = Color(joyHex: 0x4ADE80)
        public static let danger  = Color(joyHex: 0xF87171)
        public static let warn    = Color(joyHex: 0xFBBF24)
        public static let info    = Color(joyHex: 0x60A5FA)
    }

    public enum Colors {
        public static let background     = Palette.navy800
        public static let surface        = Palette.navy700
        public static let surfaceVariant = Palette.navy600
        public static let well           = Palette.navy900
        public static let scrim          = Palette.navy900.opacity(0.72)

        public static let primary        = Palette.gold500
        public static let primaryHover   = Palette.gold400
        public static let primaryPressed = Palette.gold600
        public static let onPrimary      = Palette.navy900

        public static let secondary      = Palette.bronze500
        public static let secondaryHover = Palette.bronze400

        public static let textPrimary    = Palette.sand50
        public static let textSecondary  = Palette.sand400
        public static let textMuted      = Palette.sand600
        public static let textDisabled   = Palette.sand400.opacity(0.45)

        public static let border         = Palette.navy500
        public static let borderStrong   = Palette.bronze500
        public static let focusRing      = Palette.gold500

        public static let success        = Palette.success
        public static let danger         = Palette.danger
        public static let warn           = Palette.warn
        public static let info           = Palette.info
    }

    public enum Space {
        public static let s1: CGFloat = 4
        public static let s2: CGFloat = 8
        public static let s3: CGFloat = 12
        public static let s4: CGFloat = 16
        public static let s5: CGFloat = 24
        public static let s6: CGFloat = 32
    }

    public enum Radius {
        public static let r1: CGFloat = 6
        public static let r2: CGFloat = 10
        public static let r3: CGFloat = 16
    }

    public enum Typography {
        public static let display  = Font.system(size: 32, weight: .heavy, design: .rounded)
        public static let h1       = Font.system(size: 22, weight: .bold, design: .rounded)
        public static let h2       = Font.system(size: 16, weight: .bold, design: .rounded)
        public static let body     = Font.system(size: 14, weight: .regular, design: .default)
        public static let caption  = Font.system(size: 12, weight: .medium, design: .default)
        public static let value    = Font.system(size: 15, weight: .semibold, design: .monospaced)
        public static let mono     = Font.system(size: 12, weight: .regular, design: .monospaced)
        public static let monoBold = Font.system(size: 12, weight: .bold, design: .monospaced)
    }
}
`;

if (isCheck) {
  if (!fs.existsSync(targetFile)) {
    console.error(`Error: ${targetFile} does not exist. Run "node packages/tokens/scripts/gen-swift-tokens.mjs"`);
    process.exit(1);
  }
  const existing = fs.readFileSync(targetFile, 'utf8');
  if (existing !== code) {
    console.error(`Error: ${targetFile} is out of date. Run "node packages/tokens/scripts/gen-swift-tokens.mjs"`);
    process.exit(1);
  }
  console.log('Swift tokens are up to date.');
  process.exit(0);
} else {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log(`Generated ${targetFile} successfully.`);
}
