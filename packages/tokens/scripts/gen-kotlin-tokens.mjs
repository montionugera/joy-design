import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCheck = process.argv.includes('--check');
const tokensPath = path.join(__dirname, '../src/tokens.json');
const targetFile = path.join(
  __dirname,
  '../../kotlin/src/main/kotlin/com/joymify/design/JoyTokens.g.kt',
);

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

function toKotlinColor(rawColor) {
  const str = String(rawColor).trim();
  if (str.startsWith('#')) {
    let hex = str.slice(1).toUpperCase();
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    } else if (hex.length === 4) {
      const [r, g, b, a] = hex.split('');
      return `Color(0x${a}${a}${r}${r}${g}${g}${b}${b})`;
    }
    if (hex.length === 6) {
      return `Color(0xFF${hex})`;
    }
    if (hex.length === 8) {
      const r = hex.slice(0, 2);
      const g = hex.slice(2, 4);
      const b = hex.slice(4, 6);
      const a = hex.slice(6, 8);
      return `Color(0x${a}${r}${g}${b})`;
    }
  }
  const rgbaMatch = str.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([-\d.]+)\s*)?\)$/,
  );
  if (rgbaMatch) {
    const rHex = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0').toUpperCase();
    const gHex = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0').toUpperCase();
    const bHex = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0').toUpperCase();
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1.0;
    const aHex = Math.round(Math.max(0, Math.min(1, a)) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
    return `Color(0x${aHex}${rHex}${gHex}${bHex})`;
  }
  throw new Error(`Unsupported color format for Kotlin: ${rawColor}`);
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

function toKotlinFloat(num) {
  return `${num}f`;
}

// 1. Primitive Color Ramps from tokens.json
const primitiveLines = [];
for (const [rampName, rampObj] of Object.entries(tokens.color || {})) {
  if (rampName === 'status') {
    for (const [statusKind, statusSteps] of Object.entries(rampObj)) {
      for (const [step, token] of Object.entries(statusSteps)) {
        const val = resolveRef(token.value, tokens);
        const expr = toKotlinColor(val);
        primitiveLines.push(`    val status${capitalize(statusKind)}${step} = ${expr}`);
        primitiveLines.push(`    val ${statusKind}${step} = status${capitalize(statusKind)}${step}`);
      }
    }
  } else {
    for (const [step, token] of Object.entries(rampObj)) {
      const val = resolveRef(token.value, tokens);
      const expr = toKotlinColor(val);
      primitiveLines.push(`    val ${rampName}${step} = ${expr}`);
    }
  }
}

// 2. Semantic Light & Dark tokens (including I-108 modern)
function extractSemantic(mode, presetKey = null) {
  const raw = tokens.semantic[mode];
  const overrides = presetKey ? tokens.preset?.[presetKey]?.[mode] || {} : {};
  const get = (group, key) => {
    const flatKey = `${group}-${key}`;
    if (flatKey in overrides) {
      return toKotlinColor(resolveRef(overrides[flatKey], tokens));
    }
    return toKotlinColor(resolveRef(raw[group][key].value, tokens));
  };
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
const modernLightSem = extractSemantic('light', 'modern');
const modernDarkSem = extractSemantic('dark', 'modern');

const modernPreset = tokens.preset?.modern;
if (!modernPreset?.light || !modernPreset?.dark) {
  throw new Error('tokens.preset.modern (light and dark) is required for Kotlin token generation');
}

function parseGradientStops(stopsStr) {
  return String(stopsStr)
    .split(',')
    .map((entry) => entry.trim())
    .map((entry) => {
      const m = entry.match(/^(#[0-9A-Fa-f]{6})\s+([\d.]+)%$/);
      if (!m) {
        throw new Error(`Invalid First Light stop entry: ${entry}`);
      }
      return {
        color: toKotlinColor(m[1]),
        position: `${(parseFloat(m[2]) / 100).toFixed(2)}f`,
      };
    });
}

function renderSemanticInstance(name, sem, isDark) {
  return `        val ${name}: JoyThemeTokens = JoyThemeTokens(
            surfaceCanvas = ${sem.surfaceCanvas},
            surfaceCard = ${sem.surfaceCard},
            surfaceElevated = ${sem.surfaceElevated},
            surfaceSunken = ${sem.surfaceSunken},
            textPrimary = ${sem.textPrimary},
            textSecondary = ${sem.textSecondary},
            textMuted = ${sem.textMuted},
            textOnAccent = ${sem.textOnAccent},
            borderSubtle = ${sem.borderSubtle},
            borderDefault = ${sem.borderDefault},
            borderStrong = ${sem.borderStrong},
            accentBase = ${sem.accentBase},
            accentHover = ${sem.accentHover},
            accentSubtle = ${sem.accentSubtle},
            statusSuccessFg = ${sem.statusSuccessFg},
            statusWarningFg = ${sem.statusWarningFg},
            statusDangerFg = ${sem.statusDangerFg},
            statusInfoFg = ${sem.statusInfoFg},
            isDark = ${isDark},
        )`;
}

function renderModernModeInstance(name, modeMap, isDark) {
  const c = (key) => toKotlinColor(resolveRef(modeMap[key], tokens));
  const stops = parseGradientStops(modeMap['sky-stops'])
    .map((s) => `            JoyGradientStop(color = ${s.color}, position = ${s.position}),`)
    .join('\n');
  return `    val ${name}: JoyModernModeTokens = JoyModernModeTokens(
        canvas = ${c('surface-canvas')},
        card = ${c('surface-card')},
        hover = ${c('surface-hover')},
        tile = ${c('brand-tile')},
        border = ${c('border-subtle')},
        borderControl = ${c('border-default')},
        title = ${c('text-primary')},
        text = ${c('text-secondary')},
        textPrimary = ${c('text-primary')},
        textSecondary = ${c('text-secondary')},
        muted = ${c('text-muted')},
        mutedTint = ${c('text-muted')},
        skyInk = ${c('sky-text')},
        skyText = ${c('sky-text')},
        button = ${c('accent-default')},
        buttonText = ${c('text-on-accent')},
        buttonEdge = ${c('action-edge')},
        action = ${c('accent-default')},
        actionHover = ${c('accent-hover')},
        actionFg = ${c('text-on-accent')},
        actionEdge = ${c('action-edge')},
        solid = ${c('solid')},
        solidHover = ${c('solid-hover')},
        solidFg = ${c('solid-fg')},
        porcelain = ${c('brand-cream')},
        porcelainText = ${c('brand-ink')},
        mast = ${c('mast')},
        mastHover = ${c('mast-hover')},
        mastText = ${c('mast-text')},
        mastCtl = ${c('mast-ctl')},
        live = ${c('live')},
        mark = ${c('brand-mark-on-tile')},
        tileEdge = ${c('tile-edge')},
        successTint = ${c('status-success-fg')},
        warningTint = ${c('status-warning-fg')},
        errorTint = ${c('status-danger-fg')},
        infoTint = ${c('status-info-fg')},
        ok = ${c('status-success-fg')},
        warn = ${c('status-warning-fg')},
        bad = ${c('status-danger-fg')},
        info = ${c('status-info-fg')},
        seamMid = ${c('seam-a')},
        seamEdge = ${c('seam-b')},
        seamA = ${c('seam-a')},
        seamB = ${c('seam-b')},
        ivoryCore = ${c('brand-mark-contrast')},
        pill = ${c('pill')},
        pillFg = ${c('pill-fg')},
        sun = ${c('sun')},
        firstLightStops = listOf(
${stops}
        ),
        isDark = ${isDark},
    )`;
}

// 3. Spacing, Radii, and Typography constants (plain numeric Float/Int, zero extra Compose imports)
const spaceLines = ['    const val s0: Float = 0f'];
for (const [k, v] of Object.entries(tokens.space || {})) {
  const prop = 's' + k.replace('.', '_');
  spaceLines.push(`    const val ${prop}: Float = ${toKotlinFloat(parsePx(v.value))}`);
}
spaceLines.push('    const val xs: Float = s1');
spaceLines.push('    const val sm: Float = s2');
spaceLines.push('    const val md: Float = s4');
spaceLines.push('    const val lg: Float = s6');
spaceLines.push('    const val xl: Float = s8');
spaceLines.push('    const val xxl: Float = s12');
for (const [k, v] of Object.entries(tokens['control-height'] || {})) {
  spaceLines.push(`    const val control${capitalize(k)}: Float = ${toKotlinFloat(parsePx(v.value))}`);
}

const radiusLines = ['    const val none: Float = 0f'];
for (const [k, v] of Object.entries(tokens.radius || {})) {
  const prop = kebabToCamel(k);
  radiusLines.push(`    const val ${prop}: Float = ${toKotlinFloat(parsePx(v.value))}`);
}
radiusLines.push(
  `    const val modernControl: Float = ${toKotlinFloat(parsePx(modernPreset.light['radius-control']))}`,
);
radiusLines.push(
  `    const val modernCard: Float = ${toKotlinFloat(parsePx(modernPreset.light['radius-card']))}`,
);

const typographyLines = [];
for (const [k, v] of Object.entries(tokens['font-size'] || {})) {
  const prop = kebabToCamel(k).replace(/^(\d)/, 'n$1');
  typographyLines.push(`    const val ${prop}: Float = ${toKotlinFloat(parsePx(v.value))}`);
}
for (const [k, v] of Object.entries(tokens['line-height'] || {})) {
  const prop = `lineHeight${capitalize(kebabToCamel(k))}`;
  typographyLines.push(`    const val ${prop}: Float = ${toKotlinFloat(parseFloat(v.value))}`);
}
for (const [k, v] of Object.entries(tokens['font-weight'] || {})) {
  const prop = `weight${capitalize(kebabToCamel(k))}`;
  typographyLines.push(`    const val ${prop}: Int = ${parseInt(v.value, 10)}`);
}
for (const [k, v] of Object.entries(tokens['letter-spacing'] || {})) {
  const prop = `letterSpacing${capitalize(kebabToCamel(k))}Em`;
  typographyLines.push(`    const val ${prop}: Float = ${toKotlinFloat(parseFloat(v.value))}`);
}

const code = `// DO NOT EDIT — generated by packages/tokens/scripts/gen-kotlin-tokens.mjs
// Source: packages/tokens/src/tokens.json

package com.joymify.design

import androidx.compose.ui.graphics.Color

/** Primitive color ramps generated from tokens.json. */
object JoyPalette {
${primitiveLines.join('\n')}
}

/** Semantic theme tokens for Light, Dark, and I-108 Modern modes. */
data class JoyThemeTokens(
    val surfaceCanvas: Color,
    val surfaceCard: Color,
    val surfaceElevated: Color,
    val surfaceSunken: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val textOnAccent: Color,
    val borderSubtle: Color,
    val borderDefault: Color,
    val borderStrong: Color,
    val accentBase: Color,
    val accentHover: Color,
    val accentSubtle: Color,
    val statusSuccessFg: Color,
    val statusWarningFg: Color,
    val statusDangerFg: Color,
    val statusInfoFg: Color,
    val isDark: Boolean,
) {
    companion object {
${renderSemanticInstance('light', lightSem, false)}

${renderSemanticInstance('dark', darkSem, true)}

${renderSemanticInstance('modernLight', modernLightSem, false)}

${renderSemanticInstance('modernDark', modernDarkSem, true)}

        fun modern(isDark: Boolean = false): JoyThemeTokens =
            if (isDark) modernDark else modernLight
    }
}

/** Color stop for Compose linear gradients (position normalized in 0f..1f). */
data class JoyGradientStop(
    val color: Color,
    val position: Float,
)

/** Complete I-108 Modern theme mode tokens (Midnight Brass, First Light, Kintsugi seams). */
data class JoyModernModeTokens(
    val canvas: Color,
    val card: Color,
    val hover: Color,
    val tile: Color,
    val border: Color,
    val borderControl: Color,
    val title: Color,
    val text: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val muted: Color,
    val mutedTint: Color,
    val skyInk: Color,
    val skyText: Color,
    val button: Color,
    val buttonText: Color,
    val buttonEdge: Color,
    val action: Color,
    val actionHover: Color,
    val actionFg: Color,
    val actionEdge: Color,
    val solid: Color,
    val solidHover: Color,
    val solidFg: Color,
    val porcelain: Color,
    val porcelainText: Color,
    val mast: Color,
    val mastHover: Color,
    val mastText: Color,
    val mastCtl: Color,
    val live: Color,
    val mark: Color,
    val tileEdge: Color,
    val successTint: Color,
    val warningTint: Color,
    val errorTint: Color,
    val infoTint: Color,
    val ok: Color,
    val warn: Color,
    val bad: Color,
    val info: Color,
    val seamMid: Color,
    val seamEdge: Color,
    val seamA: Color,
    val seamB: Color,
    val ivoryCore: Color,
    val pill: Color,
    val pillFg: Color,
    val sun: Color,
    val firstLightStops: List<JoyGradientStop>,
    val isDark: Boolean,
)

/** Generated I-108 Modern theme tokens (Midnight Brass, First Light, Kintsugi seam). */
object JoyModernTokens {
    const val radiusControl: Float = ${toKotlinFloat(parsePx(modernPreset.light['radius-control']))}
    const val radiusCard: Float = ${toKotlinFloat(parsePx(modernPreset.light['radius-card']))}
    const val seamWidth: Float = ${toKotlinFloat(parsePx(modernPreset.light['seam-width']))}
    const val firstLightAngleDeg: Float = ${toKotlinFloat(parseFloat(modernPreset.light['sky-angle']))}

    val sky1: Color = ${toKotlinColor(modernPreset.dark['sky-1'])}
    val sky2: Color = ${toKotlinColor(modernPreset.dark['sky-2'])}
    val sky3: Color = ${toKotlinColor(modernPreset.dark['sky-3'])}
    val sky4: Color = ${toKotlinColor(modernPreset.dark['sky-4'])}
    val sky5: Color = ${toKotlinColor(modernPreset.dark['sky-5'])}
    val sky6: Color = ${toKotlinColor(modernPreset.dark['sky-6'])}

${renderModernModeInstance('light', modernPreset.light, false)}

${renderModernModeInstance('dark', modernPreset.dark, true)}

    val canvas: Color = dark.canvas
    val card: Color = dark.card
    val tile: Color = dark.tile
    val border: Color = dark.border
    val title: Color = dark.title
    val text: Color = dark.text
    val skyInk: Color = dark.skyInk
    val button: Color = dark.button
    val buttonText: Color = dark.buttonText
    val buttonEdge: Color = dark.buttonEdge
    val porcelain: Color = dark.porcelain
    val porcelainText: Color = dark.porcelainText
    val mutedTint: Color = dark.mutedTint
    val successTint: Color = dark.successTint
    val warningTint: Color = dark.warningTint
    val errorTint: Color = dark.errorTint
    val infoTint: Color = dark.infoTint
    val seamMid: Color = dark.seamMid
    val seamEdge: Color = dark.seamEdge
    val ivoryCore: Color = dark.ivoryCore
    val mast: Color = dark.mast
    val mastHover: Color = dark.mastHover
    val mastText: Color = dark.mastText
    val mastCtl: Color = dark.mastCtl
    val live: Color = dark.live
    val mark: Color = dark.mark
    val tileEdge: Color = dark.tileEdge
    val pill: Color = dark.pill
    val pillFg: Color = dark.pillFg
    val sun: Color = dark.sun

    val firstLightStopsLight: List<JoyGradientStop> = light.firstLightStops
    val firstLightStopsDark: List<JoyGradientStop> = dark.firstLightStops
    val firstLightStops: List<JoyGradientStop> = dark.firstLightStops

    fun mode(isDark: Boolean = false): JoyModernModeTokens =
        if (isDark) dark else light
}

/** Spacing scale constants in dp (raw Float values for zero-import Compose ergonomics). */
object JoySpacing {
${spaceLines.join('\n')}
}

/** Corner radius constants in dp (raw Float values). */
object JoyRadii {
${radiusLines.join('\n')}
}

/** Typography scale constants in sp / multipliers / weights (raw Float and Int values). */
object JoyTypography {
${typographyLines.join('\n')}
}
`;

if (isCheck) {
  if (!fs.existsSync(targetFile)) {
    console.error(
      `Error: ${targetFile} does not exist. Run "node packages/tokens/scripts/gen-kotlin-tokens.mjs"`,
    );
    process.exit(1);
  }
  const existing = fs.readFileSync(targetFile, 'utf8');
  if (existing !== code) {
    console.error(
      `Error: ${targetFile} is out of date. Run "node packages/tokens/scripts/gen-kotlin-tokens.mjs"`,
    );
    process.exit(1);
  }
  console.log('Kotlin tokens are up to date.');
  process.exit(0);
} else {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log(`Generated ${targetFile} successfully.`);
}
