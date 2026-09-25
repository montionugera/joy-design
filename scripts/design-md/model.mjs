// Pure extraction for scripts/gen-design-md.mjs: tokens.json + generated theme.css + index.d.ts
// in, a plain data model out. No file IO here, so tests can feed fixtures.
import { contrastRatio } from '../../packages/tokens/scripts/color.mjs';

const HEX = /^#[0-9a-fA-F]{3,8}$/;

/** Primary block class when it is not `joy-` + kebab(Name). Variants are read from the primary block only. */
export const CLASS_OVERRIDES = {
  TreeSelect: 'joy-treeselect',
  ImagePreview: 'joy-image-preview-mask',
  MarkdownViewer: 'joy-markdown',
  BarChart: 'joy-chart', // the three charts share one chart shell
  LineChart: 'joy-chart',
  CandlestickChart: 'joy-chart',
  HeroSection: 'joy-hero',
  LandingAction: 'joy-button' // internal helper of HeroSection/CTASection; renders a Button
};

export const SIZE_NAMES = ['xs', 'sm', 'md', 'lg', 'xl'];

// Ordered so the rendered state list reads the same way for every component.
export const STATE_RULES = [
  ['hover', [/:hover\b/, /--demo-hover\b/]],
  ['focus-visible', [/:focus-visible\b/, /:focus-within\b/]],
  ['active', [/:active\b/, /--active\b/, /\[aria-pressed/]],
  ['disabled', [/:disabled\b/, /--disabled\b/, /\[aria-disabled/, /\[disabled\]/]],
  ['loading', [/--loading\b/, /\[aria-busy/]],
  ['error', [/--error\b/, /\[aria-invalid/]],
  ['selected', [/--selected\b/, /\[aria-selected/, /:checked\b/, /\[aria-checked/, /--checked\b/, /\[aria-current/]],
  ['open', [/--open\b/, /\[aria-expanded="true"\]/, /\[open\]/]]
];
const STATE_MODIFIERS = new Set(['active', 'disabled', 'loading', 'error', 'selected', 'checked', 'open', 'focused']);

export function kebab(name) {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

export function primaryClass(name) {
  return Object.hasOwn(CLASS_OVERRIDES, name) ? CLASS_OVERRIDES[name] : `joy-${kebab(name)}`;
}

/** Block classes (no --modifier, no __element) a component's source emits, e.g. `joy-input-wrapper--${size}`. */
export function blocksInSource(source) {
  return [...new Set([...source.matchAll(/(?<![\w-])joy-[a-z0-9]+(?:-[a-z0-9]+)*/g)].map((m) => m[0]))];
}

/** Resolve `{color.navy.500}` style references through the tokens tree. */
export function resolveRef(tokens, value) {
  let v = value;
  for (let i = 0; i < 10 && typeof v === 'string' && /^\{[\w.-]+\}$/.test(v); i++) {
    const node = v
      .slice(1, -1)
      .split('.')
      .reduce((o, k) => (o == null ? undefined : o[k]), tokens);
    if (!node || node.value === undefined) throw new Error(`gen-design-md: unresolved token reference ${v}`);
    v = node.value;
  }
  return v;
}

const values = (group) => Object.entries(group).map(([k, t]) => [k, t.value]);

function semanticTheme(tokens, theme) {
  const out = {};
  for (const [group, roles] of Object.entries(tokens.semantic[theme])) {
    if (roles.value !== undefined) {
      out[group] = { '': { cssVar: `--joy-${group}`, value: resolveRef(tokens, roles.value) } };
      continue;
    }
    out[group] = {};
    for (const [role, t] of Object.entries(roles)) {
      out[group][role] = { cssVar: `--joy-${group}-${role}`, value: resolveRef(tokens, t.value) };
    }
  }
  return out;
}

// Pairs the renderer reports. `min` is the WCAG 2.2 AA floor for that use; rows without a
// minimum are informative (the role is not body text on that surface).
export const CONTRAST_PAIRS = [
  ...['primary', 'secondary', 'muted', 'link'].flatMap((role) =>
    ['canvas', 'card'].map((surface) => ({ fg: ['text', role], bg: ['surface', surface], min: 4.5 }))
  ),
  { fg: ['text', 'primary'], bg: ['surface', 'raised'], min: 4.5 },
  { fg: ['text', 'inverse'], bg: ['surface', 'inverse'], min: 4.5 },
  { fg: ['text', 'on-accent'], bg: ['accent', 'default'], min: 4.5 },
  { fg: ['accent', 'text'], bg: ['surface', 'canvas'], min: 4.5 },
  { fg: ['border', 'strong'], bg: ['surface', 'canvas'], min: 3 },
  ...['success', 'warning', 'danger', 'info'].map((s) => ({ fg: ['status', `${s}-fg`], bg: ['status', `${s}-bg`], min: 4.5 })),
  { fg: ['text', 'disabled'], bg: ['surface', 'canvas'], min: null }
];

export function contrastRows(semantic) {
  const rows = [];
  for (const theme of ['light', 'dark']) {
    for (const { fg, bg, min } of CONTRAST_PAIRS) {
      const f = semantic[theme][fg[0]]?.[fg[1]];
      const b = semantic[theme][bg[0]]?.[bg[1]];
      if (!f || !b) throw new Error(`gen-design-md: missing semantic role ${fg.join('.')} or ${bg.join('.')} in ${theme}`);
      // A CONTRAST_PAIRS role that doesn't resolve to hex is a token authoring bug, not something
      // to render around: silently skipping it used to drop the pair from DESIGN.md with no signal.
      if (!HEX.test(f.value) || !HEX.test(b.value)) {
        throw new Error(
          `gen-design-md: ${theme} contrast pair ${fg.join('.')} vs ${bg.join('.')} did not resolve to hex ` +
          `(${f.cssVar}=${JSON.stringify(f.value)}, ${b.cssVar}=${JSON.stringify(b.value)}) — fix the token, don't skip the pair`
        );
      }
      const ratio = Math.round(contrastRatio(f.value, b.value) * 100) / 100;
      rows.push({ theme, fg: f.cssVar, bg: b.cssVar, ratio, min, pass: min === null ? null : ratio >= min });
    }
  }
  return rows;
}

/** Every selector (comma-split) in a stylesheet, comments and at-rule preludes removed. */
export function selectorsOf(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  for (const m of clean.matchAll(/([^{}]+)\{/g)) {
    const prelude = m[1].trim();
    if (!prelude || prelude.startsWith('@')) continue;
    for (const s of prelude.split(',')) out.push(s.trim());
  }
  return out;
}

const esc = (cls) => cls.replace(/-/g, '\\-');
const underBlock = (cls) => new RegExp(`\\.${esc(cls)}(?![\\w-])|\\.${esc(cls)}(?:--|__)`);

/**
 * One state-matrix row. Scope = every block class the component's source emits that theme.css
 * styles; sizes and states come from all of them, variants from the primary block only.
 */
export function componentMatrixRow(name, selectors, source) {
  const primary = primaryClass(name);
  const blocks = blocksInSource(source).filter((b) => selectors.some((s) => underBlock(b).test(s)));
  if (!blocks.includes(primary)) {
    throw new Error(`gen-design-md: ${name} source does not emit a styled .${primary}; fix CLASS_OVERRIDES`);
  }
  const mine = selectors.filter((s) => blocks.some((b) => underBlock(b).test(s)));
  const modifiersOf = (b) => new Set(mine.flatMap((s) => [...s.matchAll(new RegExp(`\\.${esc(b)}--([a-z0-9-]+)`, 'g'))].map((m) => m[1])));
  const allModifiers = new Set(blocks.flatMap((b) => [...modifiersOf(b)]));
  const sizes = SIZE_NAMES.filter((n) => allModifiers.has(n));
  const variants = [...modifiersOf(primary)]
    .filter((m) => !SIZE_NAMES.includes(m) && !STATE_MODIFIERS.has(m) && !m.startsWith('demo-'))
    .sort();
  const states = STATE_RULES.filter(([, res]) => mine.some((s) => res.some((re) => re.test(s)))).map(([state]) => state);
  return { component: name, cls: primary, sizes, variants, states };
}

/** `@deprecated` aliases from the generated index.d.ts, in declaration order. */
export function deprecatedAliases(dts) {
  const out = [];
  for (const m of dts.matchAll(/@deprecated ([^\n]*?)\s*\n\s*\*\/\s*\n\s*'([\w-]+)'/g)) {
    const target = m[1].match(/^Use '([\w-]+)' instead/);
    out.push({ alias: `--joy-${m[2]}`, target: target ? `--joy-${target[1]}` : null });
  }
  return out;
}

/** `sources` maps component name to its Svelte source text. */
export function buildModel({ tokens, themeCss, dts, components, sources }) {
  const semantic = { light: semanticTheme(tokens, 'light'), dark: semanticTheme(tokens, 'dark') };
  const primitive = {};
  for (const [ramp, steps] of Object.entries(tokens.color)) {
    if (ramp === 'status') {
      for (const [s, st] of Object.entries(steps)) primitive[`status-${s}`] = Object.fromEntries(values(st));
    } else {
      primitive[ramp] = Object.fromEntries(values(steps));
    }
  }
  const selectors = selectorsOf(themeCss);
  return {
    primitive,
    semantic,
    contrast: contrastRows(semantic),
    fontSize: values(tokens['font-size']),
    lineHeight: values(tokens['line-height']),
    fontWeight: values(tokens['font-weight']),
    letterSpacing: values(tokens['letter-spacing']),
    fontFamily: values(tokens.font.family),
    space: values(tokens.space),
    radius: values(tokens.radius),
    z: values(tokens.z).sort((a, b) => Number(a[1]) - Number(b[1])),
    duration: values(tokens.duration),
    ease: values(tokens.ease),
    controlHeight: values(tokens['control-height']),
    componentMatrix: components.map((c) => componentMatrixRow(c, selectors, sources[c])),
    deprecatedAliases: deprecatedAliases(dts)
  };
}
