#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const tokensPath = path.join(repoRoot, 'packages/tokens/src/tokens.json');
const targetFile = path.join(repoRoot, 'packages/flutter/lib/src/tokens/joy_tokens.g.dart');

const isCheck = process.argv.includes('--check');

if (!fs.existsSync(tokensPath)) {
  console.error(`Error: tokens.json not found at ${tokensPath}`);
  process.exit(1);
}

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Resolve reference like "{color.gold.600}"
function resolveRef(refStr, rootTokens, depth = 0, seen = new Set()) {
  if (typeof refStr !== 'string') return refStr;
  const match = refStr.match(/^\{([^}]+)\}$/);
  if (!match) return refStr;
  const refPath = match[1];
  if (seen.has(refPath) || depth > 15) {
    throw new Error(`Cyclic token reference detected: ${refStr}`);
  }
  seen.add(refPath);
  const parts = refPath.split('.');
  let current = rootTokens;
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      throw new Error(`Unknown token reference: ${refStr} at part '${part}'`);
    }
    current = current[part];
  }
  if (!current) {
    throw new Error(`Unknown token reference: ${refStr}`);
  }
  if (typeof current === 'object' && 'value' in current) {
    return resolveRef(current.value, rootTokens, depth + 1, seen);
  }
  if (typeof current === 'string') {
    return resolveRef(current, rootTokens, depth + 1, seen);
  }
  throw new Error(`Token reference does not resolve to a token value: ${refStr}`);
}

function toDartColor(rawColor) {
  if (!rawColor || typeof rawColor !== 'string') {
    throw new Error(`Invalid color string: ${rawColor}`);
  }
  const str = rawColor.trim();
  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    } else if (hex.length === 4) {
      const [r, g, b, a] = hex.split('');
      hex = a + a + r + r + g + g + b + b;
      return `Color(0x${hex.toUpperCase()})`;
    } else if (hex.length === 8) {
      const rr = hex.slice(0, 2);
      const gg = hex.slice(2, 4);
      const bb = hex.slice(4, 6);
      const aa = hex.slice(6, 8);
      return `Color(0x${aa.toUpperCase()}${rr.toUpperCase()}${gg.toUpperCase()}${bb.toUpperCase()})`;
    }
    return `Color(0xFF${hex.toUpperCase()})`;
  }
  const rgbaMatch = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([-\d.]+)\s*)?\)$/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1.0;
    const aHex = Math.round(a * 255).toString(16).padStart(2, '0').toUpperCase();
    const rHex = r.toString(16).padStart(2, '0').toUpperCase();
    const gHex = g.toString(16).padStart(2, '0').toUpperCase();
    const bHex = b.toString(16).padStart(2, '0').toUpperCase();
    return `Color(0x${aHex}${rHex}${gHex}${bHex})`;
  }
  throw new Error(`Unsupported color format: ${rawColor}`);
}

function toDartBoxShadowList(shadowStr) {
  if (!shadowStr || shadowStr === 'none') {
    return '<BoxShadow>[]';
  }
  const parts = shadowStr.split(/,(?![^(]*\))/).map(s => s.trim());
  const shadows = parts.map(part => {
    const isInset = part.startsWith('inset ');
    const cleanPart = isInset ? part.replace(/^inset\s+/, '') : part;
    const match = cleanPart.match(/^([-\d.]+px|[0-9]+)\s+([-\d.]+px|[0-9]+)(?:\s+([-\d.]+px|[0-9]+))?(?:\s+([-\d.]+px|[0-9]+))?\s+(rgba?\([^)]+\)|#[0-9a-fA-F]+)$/);
    if (!match) {
      throw new Error(`Unable to parse shadow part: ${part}`);
    }
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    const blur = match[3] ? parseFloat(match[3]) : 0;
    const spread = match[4] ? parseFloat(match[4]) : 0;
    const colorExpr = toDartColor(match[5]);
    return `BoxShadow(color: ${colorExpr}, offset: Offset(${x}, ${y}), blurRadius: ${blur}, spreadRadius: ${spread})`;
  });
  return `<BoxShadow>[\n      ${shadows.join(',\n      ')},\n    ]`;
}

function parseFocusRing(val, rootTokens) {
  const resolved = resolveRef(val, rootTokens);
  const match = resolved.match(/^([\d.]+)px\s+(\w+)\s+(.+)$/);
  if (match) {
    const width = parseFloat(match[1]);
    const style = match[2];
    const colorExpr = toDartColor(match[3]);
    return { width, style, colorExpr };
  }
  return { width: 2.0, style: 'solid', colorExpr: toDartColor(resolved) };
}

// 1. Primitive colors
const primitiveColorLines = [];
if (tokens.color) {
  for (const [rampName, rampObj] of Object.entries(tokens.color)) {
    if (rampName === 'status') {
      for (const [statusKind, statusSteps] of Object.entries(rampObj)) {
        for (const [step, token] of Object.entries(statusSteps)) {
          const val = resolveRef(token.value, tokens);
          const color = toDartColor(val);
          primitiveColorLines.push(`  static const Color status${capitalize(statusKind)}${step} = ${color};`);
          primitiveColorLines.push(`  static const Color ${statusKind}${step} = status${capitalize(statusKind)}${step};`);
        }
      }
    } else {
      for (const [step, token] of Object.entries(rampObj)) {
        const val = resolveRef(token.value, tokens);
        const color = toDartColor(val);
        primitiveColorLines.push(`  static const Color ${rampName}${step} = ${color};`);
      }
    }
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function kebabToCamel(str) {
  return str.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

// Extract base semantic map
function extractSemanticMode(mode) {
  const raw = tokens.semantic[mode];
  const surface = {};
  for (const [k, v] of Object.entries(raw.surface)) {
    const cleanKey = kebabToCamel(k);
    surface[cleanKey] = resolveRef(v.value, tokens);
  }

  const text = {};
  for (const [k, v] of Object.entries(raw.text)) {
    const cleanKey = kebabToCamel(k);
    text[cleanKey] = resolveRef(v.value, tokens);
  }

  const border = {};
  for (const [k, v] of Object.entries(raw.border)) {
    const cleanKey = k === 'default' ? 'base' : kebabToCamel(k);
    border[cleanKey] = resolveRef(v.value, tokens);
  }

  const accent = {};
  for (const [k, v] of Object.entries(raw.accent)) {
    const cleanKey = k === 'default' ? 'base' : kebabToCamel(k);
    accent[cleanKey] = resolveRef(v.value, tokens);
  }

  const status = {
    success: {
      fg: resolveRef(raw.status['success-fg'].value, tokens),
      bg: resolveRef(raw.status['success-bg'].value, tokens),
      border: resolveRef(raw.status['success-border'].value, tokens),
    },
    warning: {
      fg: resolveRef(raw.status['warning-fg'].value, tokens),
      bg: resolveRef(raw.status['warning-bg'].value, tokens),
      border: resolveRef(raw.status['warning-border'].value, tokens),
    },
    danger: {
      fg: resolveRef(raw.status['danger-fg'].value, tokens),
      bg: resolveRef(raw.status['danger-bg'].value, tokens),
      border: resolveRef(raw.status['danger-border'].value, tokens),
      solidBg: resolveRef(raw.status['danger-solid-bg'].value, tokens),
      solidFg: resolveRef(raw.status['danger-solid-fg'].value, tokens),
      solidBorder: resolveRef(raw.status['danger-solid-border'].value, tokens),
    },
    info: {
      fg: resolveRef(raw.status['info-fg'].value, tokens),
      bg: resolveRef(raw.status['info-bg'].value, tokens),
      border: resolveRef(raw.status['info-border'].value, tokens),
    },
  };

  const elevation = {};
  for (const [k, v] of Object.entries(raw.elevation)) {
    let cleanKey = k;
    if (k === '0') cleanKey = 'level0';
    else if (k === '1') cleanKey = 'level1';
    else if (k === '2') cleanKey = 'level2';
    else if (k === '3') cleanKey = 'level3';
    else cleanKey = kebabToCamel(k);
    elevation[cleanKey] = resolveRef(v.value, tokens);
  }

  const focusRing = parseFocusRing(raw['focus-ring'].value, tokens);

  return { surface, text, border, accent, status, elevation, focusRing };
}

const baseLight = extractSemanticMode('light');
const baseDark = extractSemanticMode('dark');

// Apply preset overrides on base
function buildPreset(presetKey, isDark) {
  const base = isDark ? baseDark : baseLight;
  const modeKey = isDark ? 'dark' : 'light';
  const presetDef = tokens.preset?.[presetKey];
  const overrides = presetDef?.[modeKey] || {};

  const surface = { ...base.surface };
  const text = { ...base.text };
  const border = { ...base.border };
  const accent = { ...base.accent };
  const status = { ...base.status };
  const elevation = { ...base.elevation };
  let focusRing = { ...base.focusRing };

  for (const [k, v] of Object.entries(overrides)) {
    const val = resolveRef(v, tokens);
    if (k.startsWith('surface-')) {
      const prop = kebabToCamel(k.replace('surface-', ''));
      surface[prop] = val;
    } else if (k.startsWith('text-')) {
      const prop = kebabToCamel(k.replace('text-', ''));
      text[prop] = val;
    } else if (k.startsWith('border-')) {
      let prop = k.replace('border-', '');
      if (prop === 'default') prop = 'base';
      else prop = kebabToCamel(prop);
      border[prop] = val;
      if (prop === 'focus') {
        focusRing = { ...focusRing, colorExpr: toDartColor(val) };
      }
    } else if (k.startsWith('accent-')) {
      let prop = k.replace('accent-', '');
      if (prop === 'default') prop = 'base';
      else prop = kebabToCamel(prop);
      accent[prop] = val;
    }
  }

  return { surface, text, border, accent, status, elevation, focusRing };
}

function generatePresetTokenInstance(presetKey, isDark) {
  const p = buildPreset(presetKey, isDark);
  const varPrefix = `${kebabToCamel(presetKey)}${isDark ? 'Dark' : 'Light'}`;

  const surfaceFields = Object.entries(p.surface)
    .map(([k, v]) => `    ${k}: ${toDartColor(v)},`)
    .join('\n');
  const textFields = Object.entries(p.text)
    .map(([k, v]) => `    ${k}: ${toDartColor(v)},`)
    .join('\n');
  const borderFields = Object.entries(p.border)
    .map(([k, v]) => `    ${k}: ${toDartColor(v)},`)
    .join('\n');
  const accentFields = Object.entries(p.accent)
    .map(([k, v]) => `    ${k}: ${toDartColor(v)},`)
    .join('\n');

  const statusSuccess = `    success: JoyStatusLevelTokens(
      fg: ${toDartColor(p.status.success.fg)},
      bg: ${toDartColor(p.status.success.bg)},
      border: ${toDartColor(p.status.success.border)},
    ),`;
  const statusWarning = `    warning: JoyStatusLevelTokens(
      fg: ${toDartColor(p.status.warning.fg)},
      bg: ${toDartColor(p.status.warning.bg)},
      border: ${toDartColor(p.status.warning.border)},
    ),`;
  const statusDanger = `    danger: JoyStatusDangerTokens(
      fg: ${toDartColor(p.status.danger.fg)},
      bg: ${toDartColor(p.status.danger.bg)},
      border: ${toDartColor(p.status.danger.border)},
      solidBg: ${toDartColor(p.status.danger.solidBg)},
      solidFg: ${toDartColor(p.status.danger.solidFg)},
      solidBorder: ${toDartColor(p.status.danger.solidBorder)},
    ),`;
  const statusInfo = `    info: JoyStatusLevelTokens(
      fg: ${toDartColor(p.status.info.fg)},
      bg: ${toDartColor(p.status.info.bg)},
      border: ${toDartColor(p.status.info.border)},
    ),`;

  const elevationFields = Object.entries(p.elevation)
    .map(([k, v]) => `    ${k}: ${toDartBoxShadowList(v)},`)
    .join('\n');

  return `  static const JoyThemeTokens ${varPrefix} = JoyThemeTokens(
    isDark: ${isDark},
    palette: '${presetKey}',
    surface: JoySurfaceTokens(
${surfaceFields}
    ),
    text: JoyTextTokens(
${textFields}
    ),
    border: JoyBorderTokens(
${borderFields}
    ),
    accent: JoyAccentTokens(
${accentFields}
    ),
    status: JoyStatusTokens(
${statusSuccess}
${statusWarning}
${statusDanger}
${statusInfo}
    ),
    elevation: JoyElevationTokens(
${elevationFields}
    ),
    focusRing: JoyFocusRingTokens(
      color: ${p.focusRing.colorExpr},
      width: ${p.focusRing.width.toFixed(1)},
      style: '${p.focusRing.style}',
    ),
  );`;
}

// Preset enum & helpers
const presets = ['classic', 'bauhaus-primary', 'clay-court', 'nordic-slate', 'verdant-lawn', 'outdoor'];

const presetInstances = [];
for (const pk of presets) {
  presetInstances.push(generatePresetTokenInstance(pk, false));
  presetInstances.push(generatePresetTokenInstance(pk, true));
}

// Assembly of joy_tokens.g.dart
const code = `// GENERATED CODE - DO NOT MODIFY BY HAND
// Source: packages/tokens/src/tokens.json

import 'dart:ui' as ui;
import 'package:flutter/material.dart';

/// Primitive color constants compiled from tokens.json color ramps.
abstract final class JoyColorRamps {
  JoyColorRamps._();

${primitiveColorLines.join('\n')}
}

/// Alias for [JoyColorRamps].
typedef JoyColors = JoyColorRamps;

/// Spacing constants with ordinal and pixel-based aliases.
abstract final class JoySpacing {
  JoySpacing._();

  static const double s0 = 0.0;
  static const double s2 = 2.0;
  static const double s4 = 4.0;
  static const double s8 = 8.0;
  static const double s12 = 12.0;
  static const double s16 = 16.0;
  static const double s20 = 20.0;
  static const double s24 = 24.0;
  static const double s32 = 32.0;
  static const double s40 = 40.0;
  static const double s48 = 48.0;
  static const double s64 = 64.0;
  static const double s80 = 80.0;
  static const double s96 = 96.0;

  // Ordinal step aliases
  static const double space0_5 = s2;
  static const double space1 = s4;
  static const double space2 = s8;
  static const double space3 = s12;
  static const double space4 = s16;
  static const double space5 = s20;
  static const double space6 = s24;
  static const double space8 = s32;
  static const double space10 = s40;
  static const double space12 = s48;
  static const double space16 = s64;
  static const double space20 = s80;
  static const double space24 = s96;
}

/// Border radius scale constants.
abstract final class JoyRadius {
  JoyRadius._();

  static const double none = 0.0;
  static const double sm = 4.0;
  static const double control = 6.0;
  static const double md = 8.0;
  static const double card = 12.0;
  static const double lg = 12.0;
  static const double overlay = 16.0;
  static const double xl = 16.0;
  static const double pill = 9999.0;
  static const double full = 9999.0;
}

/// Surface semantic tokens.
@immutable
class JoySurfaceTokens {
  final Color canvas;
  final Color card;
  final Color raised;
  final Color sunken;
  final Color disabled;
  final Color overlay;
  final Color inverse;
  final Color thumb;
  final Color clayBg;
  final Color clayFg;
  final Color hardBg;
  final Color hardFg;
  final Color grassBg;
  final Color grassFg;
  final Color indoorBg;
  final Color indoorFg;

  const JoySurfaceTokens({
    required this.canvas,
    required this.card,
    required this.raised,
    required this.sunken,
    required this.disabled,
    required this.overlay,
    required this.inverse,
    required this.thumb,
    required this.clayBg,
    required this.clayFg,
    required this.hardBg,
    required this.hardFg,
    required this.grassBg,
    required this.grassFg,
    required this.indoorBg,
    required this.indoorFg,
  });

  Color get base => canvas;

  JoySurfaceTokens copyWith({
    Color? canvas,
    Color? card,
    Color? raised,
    Color? sunken,
    Color? disabled,
    Color? overlay,
    Color? inverse,
    Color? thumb,
    Color? clayBg,
    Color? clayFg,
    Color? hardBg,
    Color? hardFg,
    Color? grassBg,
    Color? grassFg,
    Color? indoorBg,
    Color? indoorFg,
  }) {
    return JoySurfaceTokens(
      canvas: canvas ?? this.canvas,
      card: card ?? this.card,
      raised: raised ?? this.raised,
      sunken: sunken ?? this.sunken,
      disabled: disabled ?? this.disabled,
      overlay: overlay ?? this.overlay,
      inverse: inverse ?? this.inverse,
      thumb: thumb ?? this.thumb,
      clayBg: clayBg ?? this.clayBg,
      clayFg: clayFg ?? this.clayFg,
      hardBg: hardBg ?? this.hardBg,
      hardFg: hardFg ?? this.hardFg,
      grassBg: grassBg ?? this.grassBg,
      grassFg: grassFg ?? this.grassFg,
      indoorBg: indoorBg ?? this.indoorBg,
      indoorFg: indoorFg ?? this.indoorFg,
    );
  }

  JoySurfaceTokens lerp(JoySurfaceTokens? other, double t) {
    if (other == null) return this;
    return JoySurfaceTokens(
      canvas: Color.lerp(canvas, other.canvas, t) ?? canvas,
      card: Color.lerp(card, other.card, t) ?? card,
      raised: Color.lerp(raised, other.raised, t) ?? raised,
      sunken: Color.lerp(sunken, other.sunken, t) ?? sunken,
      disabled: Color.lerp(disabled, other.disabled, t) ?? disabled,
      overlay: Color.lerp(overlay, other.overlay, t) ?? overlay,
      inverse: Color.lerp(inverse, other.inverse, t) ?? inverse,
      thumb: Color.lerp(thumb, other.thumb, t) ?? thumb,
      clayBg: Color.lerp(clayBg, other.clayBg, t) ?? clayBg,
      clayFg: Color.lerp(clayFg, other.clayFg, t) ?? clayFg,
      hardBg: Color.lerp(hardBg, other.hardBg, t) ?? hardBg,
      hardFg: Color.lerp(hardFg, other.hardFg, t) ?? hardFg,
      grassBg: Color.lerp(grassBg, other.grassBg, t) ?? grassBg,
      grassFg: Color.lerp(grassFg, other.grassFg, t) ?? grassFg,
      indoorBg: Color.lerp(indoorBg, other.indoorBg, t) ?? indoorBg,
      indoorFg: Color.lerp(indoorFg, other.indoorFg, t) ?? indoorFg,
    );
  }
}

/// Text semantic tokens.
@immutable
class JoyTextTokens {
  final Color primary;
  final Color secondary;
  final Color muted;
  final Color disabled;
  final Color inverse;
  final Color link;
  final Color onAccent;

  const JoyTextTokens({
    required this.primary,
    required this.secondary,
    required this.muted,
    required this.disabled,
    required this.inverse,
    required this.link,
    required this.onAccent,
  });

  JoyTextTokens copyWith({
    Color? primary,
    Color? secondary,
    Color? muted,
    Color? disabled,
    Color? inverse,
    Color? link,
    Color? onAccent,
  }) {
    return JoyTextTokens(
      primary: primary ?? this.primary,
      secondary: secondary ?? this.secondary,
      muted: muted ?? this.muted,
      disabled: disabled ?? this.disabled,
      inverse: inverse ?? this.inverse,
      link: link ?? this.link,
      onAccent: onAccent ?? this.onAccent,
    );
  }

  JoyTextTokens lerp(JoyTextTokens? other, double t) {
    if (other == null) return this;
    return JoyTextTokens(
      primary: Color.lerp(primary, other.primary, t) ?? primary,
      secondary: Color.lerp(secondary, other.secondary, t) ?? secondary,
      muted: Color.lerp(muted, other.muted, t) ?? muted,
      disabled: Color.lerp(disabled, other.disabled, t) ?? disabled,
      inverse: Color.lerp(inverse, other.inverse, t) ?? inverse,
      link: Color.lerp(link, other.link, t) ?? link,
      onAccent: Color.lerp(onAccent, other.onAccent, t) ?? onAccent,
    );
  }
}

/// Border semantic tokens. Note: 'default' is mapped to [base].
@immutable
class JoyBorderTokens {
  final Color subtle;
  final Color base;
  final Color strong;
  final Color focus;
  final Color disabled;

  const JoyBorderTokens({
    required this.subtle,
    required this.base,
    required this.strong,
    required this.focus,
    required this.disabled,
  });

  JoyBorderTokens copyWith({
    Color? subtle,
    Color? base,
    Color? strong,
    Color? focus,
    Color? disabled,
  }) {
    return JoyBorderTokens(
      subtle: subtle ?? this.subtle,
      base: base ?? this.base,
      strong: strong ?? this.strong,
      focus: focus ?? this.focus,
      disabled: disabled ?? this.disabled,
    );
  }

  JoyBorderTokens lerp(JoyBorderTokens? other, double t) {
    if (other == null) return this;
    return JoyBorderTokens(
      subtle: Color.lerp(subtle, other.subtle, t) ?? subtle,
      base: Color.lerp(base, other.base, t) ?? base,
      strong: Color.lerp(strong, other.strong, t) ?? strong,
      focus: Color.lerp(focus, other.focus, t) ?? focus,
      disabled: Color.lerp(disabled, other.disabled, t) ?? disabled,
    );
  }
}

/// Accent semantic tokens. Note: 'default' is mapped to [base].
@immutable
class JoyAccentTokens {
  final Color base;
  final Color hover;
  final Color active;
  final Color subtle;
  final Color text;
  final Color gradientEnd;
  final Color highlight;

  const JoyAccentTokens({
    required this.base,
    required this.hover,
    required this.active,
    required this.subtle,
    required this.text,
    required this.gradientEnd,
    required this.highlight,
  });

  Color get primary => base;

  JoyAccentTokens copyWith({
    Color? base,
    Color? hover,
    Color? active,
    Color? subtle,
    Color? text,
    Color? gradientEnd,
    Color? highlight,
  }) {
    return JoyAccentTokens(
      base: base ?? this.base,
      hover: hover ?? this.hover,
      active: active ?? this.active,
      subtle: subtle ?? this.subtle,
      text: text ?? this.text,
      gradientEnd: gradientEnd ?? this.gradientEnd,
      highlight: highlight ?? this.highlight,
    );
  }

  JoyAccentTokens lerp(JoyAccentTokens? other, double t) {
    if (other == null) return this;
    return JoyAccentTokens(
      base: Color.lerp(base, other.base, t) ?? base,
      hover: Color.lerp(hover, other.hover, t) ?? hover,
      active: Color.lerp(active, other.active, t) ?? active,
      subtle: Color.lerp(subtle, other.subtle, t) ?? subtle,
      text: Color.lerp(text, other.text, t) ?? text,
      gradientEnd: Color.lerp(gradientEnd, other.gradientEnd, t) ?? gradientEnd,
      highlight: Color.lerp(highlight, other.highlight, t) ?? highlight,
    );
  }
}

/// Standard 3-level status tokens (fg, bg, border).
@immutable
class JoyStatusLevelTokens {
  final Color fg;
  final Color bg;
  final Color border;

  const JoyStatusLevelTokens({
    required this.fg,
    required this.bg,
    required this.border,
  });

  JoyStatusLevelTokens copyWith({Color? fg, Color? bg, Color? border}) {
    return JoyStatusLevelTokens(
      fg: fg ?? this.fg,
      bg: bg ?? this.bg,
      border: border ?? this.border,
    );
  }

  JoyStatusLevelTokens lerp(JoyStatusLevelTokens? other, double t) {
    if (other == null) return this;
    return JoyStatusLevelTokens(
      fg: Color.lerp(fg, other.fg, t) ?? fg,
      bg: Color.lerp(bg, other.bg, t) ?? bg,
      border: Color.lerp(border, other.border, t) ?? border,
    );
  }
}

/// Danger status tokens including solid variants.
@immutable
class JoyStatusDangerTokens {
  final Color fg;
  final Color bg;
  final Color border;
  final Color solidBg;
  final Color solidFg;
  final Color solidBorder;

  const JoyStatusDangerTokens({
    required this.fg,
    required this.bg,
    required this.border,
    required this.solidBg,
    required this.solidFg,
    required this.solidBorder,
  });

  JoyStatusDangerTokens copyWith({
    Color? fg,
    Color? bg,
    Color? border,
    Color? solidBg,
    Color? solidFg,
    Color? solidBorder,
  }) {
    return JoyStatusDangerTokens(
      fg: fg ?? this.fg,
      bg: bg ?? this.bg,
      border: border ?? this.border,
      solidBg: solidBg ?? this.solidBg,
      solidFg: solidFg ?? this.solidFg,
      solidBorder: solidBorder ?? this.solidBorder,
    );
  }

  JoyStatusDangerTokens lerp(JoyStatusDangerTokens? other, double t) {
    if (other == null) return this;
    return JoyStatusDangerTokens(
      fg: Color.lerp(fg, other.fg, t) ?? fg,
      bg: Color.lerp(bg, other.bg, t) ?? bg,
      border: Color.lerp(border, other.border, t) ?? border,
      solidBg: Color.lerp(solidBg, other.solidBg, t) ?? solidBg,
      solidFg: Color.lerp(solidFg, other.solidFg, t) ?? solidFg,
      solidBorder: Color.lerp(solidBorder, other.solidBorder, t) ?? solidBorder,
    );
  }
}

/// Status semantic tokens.
@immutable
class JoyStatusTokens {
  final JoyStatusLevelTokens success;
  final JoyStatusLevelTokens warning;
  final JoyStatusDangerTokens danger;
  final JoyStatusLevelTokens info;

  const JoyStatusTokens({
    required this.success,
    required this.warning,
    required this.danger,
    required this.info,
  });

  Color get successFg => success.fg;
  Color get successBg => success.bg;
  Color get successBorder => success.border;

  Color get warningFg => warning.fg;
  Color get warningBg => warning.bg;
  Color get warningBorder => warning.border;

  Color get dangerFg => danger.fg;
  Color get dangerBg => danger.bg;
  Color get dangerBorder => danger.border;
  Color get dangerSolidBg => danger.solidBg;
  Color get dangerSolidFg => danger.solidFg;
  Color get dangerSolidBorder => danger.solidBorder;

  Color get infoFg => info.fg;
  Color get infoBg => info.bg;
  Color get infoBorder => info.border;

  JoyStatusTokens copyWith({
    JoyStatusLevelTokens? success,
    JoyStatusLevelTokens? warning,
    JoyStatusDangerTokens? danger,
    JoyStatusLevelTokens? info,
  }) {
    return JoyStatusTokens(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
      info: info ?? this.info,
    );
  }

  JoyStatusTokens lerp(JoyStatusTokens? other, double t) {
    if (other == null) return this;
    return JoyStatusTokens(
      success: success.lerp(other.success, t),
      warning: warning.lerp(other.warning, t),
      danger: danger.lerp(other.danger, t),
      info: info.lerp(other.info, t),
    );
  }
}

/// Elevation box shadow tokens.
@immutable
class JoyElevationTokens {
  final List<BoxShadow> level0;
  final List<BoxShadow> level1;
  final List<BoxShadow> level2;
  final List<BoxShadow> level3;
  final List<BoxShadow> accent1;
  final List<BoxShadow> accent2;
  final List<BoxShadow> accentInset;
  final List<BoxShadow> bevel;

  const JoyElevationTokens({
    required this.level0,
    required this.level1,
    required this.level2,
    required this.level3,
    required this.accent1,
    required this.accent2,
    required this.accentInset,
    required this.bevel,
  });

  List<BoxShadow> get e0 => level0;
  List<BoxShadow> get e1 => level1;
  List<BoxShadow> get e2 => level2;
  List<BoxShadow> get e3 => level3;

  JoyElevationTokens copyWith({
    List<BoxShadow>? level0,
    List<BoxShadow>? level1,
    List<BoxShadow>? level2,
    List<BoxShadow>? level3,
    List<BoxShadow>? accent1,
    List<BoxShadow>? accent2,
    List<BoxShadow>? accentInset,
    List<BoxShadow>? bevel,
  }) {
    return JoyElevationTokens(
      level0: level0 ?? this.level0,
      level1: level1 ?? this.level1,
      level2: level2 ?? this.level2,
      level3: level3 ?? this.level3,
      accent1: accent1 ?? this.accent1,
      accent2: accent2 ?? this.accent2,
      accentInset: accentInset ?? this.accentInset,
      bevel: bevel ?? this.bevel,
    );
  }

  JoyElevationTokens lerp(JoyElevationTokens? other, double t) {
    if (other == null) return this;
    return JoyElevationTokens(
      level0: BoxShadow.lerpList(level0, other.level0, t) ?? level0,
      level1: BoxShadow.lerpList(level1, other.level1, t) ?? level1,
      level2: BoxShadow.lerpList(level2, other.level2, t) ?? level2,
      level3: BoxShadow.lerpList(level3, other.level3, t) ?? level3,
      accent1: BoxShadow.lerpList(accent1, other.accent1, t) ?? accent1,
      accent2: BoxShadow.lerpList(accent2, other.accent2, t) ?? accent2,
      accentInset: BoxShadow.lerpList(accentInset, other.accentInset, t) ?? accentInset,
      bevel: BoxShadow.lerpList(bevel, other.bevel, t) ?? bevel,
    );
  }
}

/// Focus ring tokens.
@immutable
class JoyFocusRingTokens {
  final Color color;
  final double width;
  final String style;

  const JoyFocusRingTokens({
    required this.color,
    this.width = 2.0,
    this.style = 'solid',
  });

  JoyFocusRingTokens copyWith({
    Color? color,
    double? width,
    String? style,
  }) {
    return JoyFocusRingTokens(
      color: color ?? this.color,
      width: width ?? this.width,
      style: style ?? this.style,
    );
  }

  JoyFocusRingTokens lerp(JoyFocusRingTokens? other, double t) {
    if (other == null) return this;
    return JoyFocusRingTokens(
      color: Color.lerp(color, other.color, t) ?? color,
      width: ui.lerpDouble(width, other.width, t) ?? width,
      style: t < 0.5 ? style : other.style,
    );
  }
}

/// Palette preset identifiers supported by Joymify Design System.
enum JoyPalettePreset {
  classic,
  bauhausPrimary,
  clayCourt,
  nordicSlate,
  verdantLawn,
  outdoor;

  String get id {
    switch (this) {
      case JoyPalettePreset.classic: return 'classic';
      case JoyPalettePreset.bauhausPrimary: return 'bauhaus-primary';
      case JoyPalettePreset.clayCourt: return 'clay-court';
      case JoyPalettePreset.nordicSlate: return 'nordic-slate';
      case JoyPalettePreset.verdantLawn: return 'verdant-lawn';
      case JoyPalettePreset.outdoor: return 'outdoor';
    }
  }

  JoyThemeTokens tokens({bool isDark = false}) =>
      JoyThemeTokens.preset(this, isDark: isDark);
}

/// Primary Joymify design tokens theme extension.
@immutable
class JoyThemeTokens extends ThemeExtension<JoyThemeTokens> {
  final JoySurfaceTokens surface;
  final JoyTextTokens text;
  final JoyBorderTokens border;
  final JoyAccentTokens accent;
  final JoyStatusTokens status;
  final JoyElevationTokens elevation;
  final JoyFocusRingTokens focusRing;
  final bool isDark;
  final String palette;

  const JoyThemeTokens({
    required this.surface,
    required this.text,
    required this.border,
    required this.accent,
    required this.status,
    required this.elevation,
    required this.focusRing,
    this.isDark = false,
    this.palette = 'classic',
  });

  Color get focusRingColor => focusRing.color;

  // Static instances
  static const JoyThemeTokens light = classicLight;
  static const JoyThemeTokens dark = classicDark;

${presetInstances.join('\n\n')}

  static JoyThemeTokens classic({bool isDark = false}) =>
      isDark ? classicDark : classicLight;
  static JoyThemeTokens bauhausPrimary({bool isDark = false}) =>
      isDark ? bauhausPrimaryDark : bauhausPrimaryLight;
  static JoyThemeTokens clayCourt({bool isDark = false}) =>
      isDark ? clayCourtDark : clayCourtLight;
  static JoyThemeTokens nordicSlate({bool isDark = false}) =>
      isDark ? nordicSlateDark : nordicSlateLight;
  static JoyThemeTokens verdantLawn({bool isDark = false}) =>
      isDark ? verdantLawnDark : verdantLawnLight;
  static JoyThemeTokens outdoor({bool isDark = false}) =>
      isDark ? outdoorDark : outdoorLight;

  static JoyThemeTokens preset(dynamic preset, {bool isDark = false}) {
    if (preset is JoyPalettePreset) {
      switch (preset) {
        case JoyPalettePreset.classic: return classic(isDark: isDark);
        case JoyPalettePreset.bauhausPrimary: return bauhausPrimary(isDark: isDark);
        case JoyPalettePreset.clayCourt: return clayCourt(isDark: isDark);
        case JoyPalettePreset.nordicSlate: return nordicSlate(isDark: isDark);
        case JoyPalettePreset.verdantLawn: return verdantLawn(isDark: isDark);
        case JoyPalettePreset.outdoor: return outdoor(isDark: isDark);
      }
    }
    final key = preset.toString().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '');
    if (key.contains('bauhaus')) return bauhausPrimary(isDark: isDark);
    if (key.contains('clay')) return clayCourt(isDark: isDark);
    if (key.contains('nordic')) return nordicSlate(isDark: isDark);
    if (key.contains('verdant')) return verdantLawn(isDark: isDark);
    if (key.contains('outdoor')) return outdoor(isDark: isDark);
    return classic(isDark: isDark);
  }

  static JoyThemeTokens fromPreset(String name, {bool isDark = false}) =>
      preset(name, isDark: isDark);

  @override
  JoyThemeTokens copyWith({
    JoySurfaceTokens? surface,
    JoyTextTokens? text,
    JoyBorderTokens? border,
    JoyAccentTokens? accent,
    JoyStatusTokens? status,
    JoyElevationTokens? elevation,
    JoyFocusRingTokens? focusRing,
    bool? isDark,
    String? palette,
  }) {
    return JoyThemeTokens(
      surface: surface ?? this.surface,
      text: text ?? this.text,
      border: border ?? this.border,
      accent: accent ?? this.accent,
      status: status ?? this.status,
      elevation: elevation ?? this.elevation,
      focusRing: focusRing ?? this.focusRing,
      isDark: isDark ?? this.isDark,
      palette: palette ?? this.palette,
    );
  }

  @override
  JoyThemeTokens lerp(ThemeExtension<JoyThemeTokens>? other, double t) {
    if (other is! JoyThemeTokens) return this;
    return JoyThemeTokens(
      surface: surface.lerp(other.surface, t),
      text: text.lerp(other.text, t),
      border: border.lerp(other.border, t),
      accent: accent.lerp(other.accent, t),
      status: status.lerp(other.status, t),
      elevation: elevation.lerp(other.elevation, t),
      focusRing: focusRing.lerp(other.focusRing, t),
      isDark: t < 0.5 ? isDark : other.isDark,
      palette: t < 0.5 ? palette : other.palette,
    );
  }

  ThemeData toThemeData() => JoyTheme.themeData(this);
}

/// Factory for creating [ThemeData] integrating [JoyThemeTokens].
abstract final class JoyTheme {
  JoyTheme._();

  static ThemeData themeData(JoyThemeTokens tokens) {
    final isDark = tokens.isDark;
    final colorScheme = ColorScheme(
      brightness: isDark ? Brightness.dark : Brightness.light,
      primary: tokens.accent.base,
      onPrimary: tokens.text.onAccent,
      secondary: tokens.accent.hover,
      onSecondary: tokens.text.primary,
      error: tokens.status.danger.fg,
      onError: tokens.status.danger.solidFg,
      surface: tokens.surface.card,
      onSurface: tokens.text.primary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: isDark ? Brightness.dark : Brightness.light,
      scaffoldBackgroundColor: tokens.surface.canvas,
      cardColor: tokens.surface.card,
      dividerColor: tokens.border.subtle,
      colorScheme: colorScheme,
      extensions: <ThemeExtension<dynamic>>[tokens],
    );
  }

  static ThemeData light() => themeData(JoyThemeTokens.light);
  static ThemeData dark() => themeData(JoyThemeTokens.dark);
}

/// Convenience extension to retrieve [JoyThemeTokens] from [BuildContext].
extension JoyThemeContext on BuildContext {
  JoyThemeTokens get joyTheme =>
      Theme.of(this).extension<JoyThemeTokens>() ?? JoyThemeTokens.light;
}
`;

if (isCheck) {
  if (!fs.existsSync(targetFile)) {
    console.error(`Error: ${targetFile} does not exist. Run 'node packages/tokens/scripts/gen-dart-tokens.mjs'`);
    process.exit(1);
  }
  const existing = fs.readFileSync(targetFile, 'utf8');
  if (existing !== code) {
    console.error(`Error: ${targetFile} is out of date. Run 'node packages/tokens/scripts/gen-dart-tokens.mjs'`);
    process.exit(1);
  }
  console.log('Dart tokens are up to date.');
  process.exit(0);
} else {
  const dir = path.dirname(targetFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log(`Generated ${targetFile} successfully.`);
}
