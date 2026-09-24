#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const COMPONENTS = [
  'Button',
  'Input',
  'InputNumber',
  'Select',
  'Checkbox',
  'Switch',
  'RadioGroup',
  'Slider',
  'Rate',
  'Segmented',
  'Form',
  'FormItem',
  'DatePicker',
  'TimePicker',
  'DateRangePicker',
  'Mentions',
  'Upload',
  'TreeSelect',
  'Cascader',
  'Transfer',
  'MarkdownEditor',
  // Wave 3 (F-038)
  'Alert',
  'Anchor',
  'Avatar',
  'AvatarGroup',
  'Badge',
  'Breadcrumb',
  'Divider',
  'Drawer',
  'Dropdown',
  'EmptyState',
  'Flex',
  'Image',
  'ImagePreview',
  'MarkdownViewer',
  'Menu',
  'Message',
  'MetricTile',
  'Modal',
  'Notification',
  'Pagination',
  'Popconfirm',
  'Progress',
  'Result',
  'Skeleton',
  'Space',
  'Spin',
  'Splitter',
  'StatCard',
  'Statistic',
  'Steps',
  'Table',
  'Tabs',
  'Tag',
  'Timeline',
  'Toast',
  'Tooltip',
  'BarChart',
  'LineChart',
  'CandlestickChart',
  // Wave 4 (F-039)
  'HeroSection',
  'CTASection',
  'PricingCard',
  'PricingMatrix',
  // internal (not exported): the action button both landing twins render; no ref/rest by design
  'LandingAction'
];

// React components that must use React.forwardRef and spread rest props onto a
// JSX element. Notification and Popconfirm are excluded because they already
// use React.forwardRef (they do not spread rest props, but that is out of scope
// for this list).
export const REF_FORWARDING = [
  'Alert',
  'AvatarGroup',
  'Badge',
  'Breadcrumb',
  'Drawer',
  'Dropdown',
  'EmptyState',
  'ImagePreview',
  'MarkdownViewer',
  'MetricTile',
  'Modal',
  'Pagination',
  'Progress',
  'Skeleton',
  'StatCard',
  'Table',
  'Tabs',
  'Toast',
  'Tooltip',
  // Wave 4 (F-039)
  'HeroSection',
  'CTASection',
  'PricingCard',
  'PricingMatrix'
];

// Svelte components that must destructure `ref = $bindable(null)`, spread
// `{...rest}` on the root element and expose the root via `bind:this={ref}`.
// Starts empty: each landing lane appends its own names in the commit that
// makes them clean, so the gate never goes red ahead of the code.
export const SVELTE_REF_REST = [
  // Wave 4 (F-039)
  'HeroSection',
  'CTASection',
  'PricingCard',
  'PricingMatrix'
];

// Non-handler aliases between the twins (Svelte `class` is React `className`).
export const NORMALISE = {
  class: 'className'
};

// Structural hook classes: they exist identically in BOTH twins so consumers can
// target them, but they are intentionally unstyled (no theme.css rule). The
// "undefined class" check skips them only while the class is present in both
// twins, so a hook that drifts into one twin still fails (twin class-diff and
// undefined-class check). Do not add a class here to silence a missing style.
export const STRUCTURAL_CLASSES = new Set([
  'joy-dropdown-trigger',
  'joy-popconfirm__trigger',
  'joy-markdown__pre',
  'joy-markdown__table',
  'joy-menu__item-icon',
  'joy-menu__item-text',
  'joy-message__content',
  'joy-statistic__value',
  'joy-tab-content',
  'joy-tabs-container'
]);

// Canonical prop name used for comparison. Handler props (`onX`) compare
// case-insensitively because Svelte 5 spells them `onclose` and React `onClose`.
export function normaliseProp(name) {
  if (/^on[a-z]/i.test(name)) return name.toLowerCase();
  return NORMALISE[name] || name;
}

export const HTML_INHERITED = [
  'value',
  'placeholder',
  'disabled',
  'readonly',
  'type',
  'name',
  'id',
  'min',
  'max',
  'step',
  'multiple',
  'accept',
  'onChange',
  'onInput',
  'onClick',
  'onSubmit',
  'style',
  'className',
  'children',
  'ref'
];

// Extra attributes inherited only from React.ImgHTMLAttributes (kept out of HTML_INHERITED
// so a div-based component cannot satisfy a Svelte `src`/`alt` prop by accident).
const IMG_INHERITED = ['alt', 'src'];

const HTML_INHERITED_NORMALISED = new Set(HTML_INHERITED.map(normaliseProp));

export const CONTRACT = {
  Button: [
    'variant',
    'size',
    'disabled',
    'loading',
    'block',
    'iconOnly',
    'type',
    'iconStart',
    'iconEnd',
    'onClick',
    'children',
    'className',
    'ref'
  ],
  Input: [
    'value',
    'placeholder',
    'disabled',
    'readonly',
    'error',
    'success',
    'message',
    'size',
    'type',
    'id',
    'name',
    'prefix',
    'suffix',
    'onInput',
    'onChange'
  ],
  InputNumber: [
    'value',
    'min',
    'max',
    'step',
    'precision',
    'disabled',
    'readonly',
    'error',
    'size',
    'placeholder',
    'id',
    'name',
    'onChange'
  ],
  Select: [
    'value',
    'options',
    'placeholder',
    'disabled',
    'error',
    'message',
    'size',
    'name',
    'id',
    'onChange'
  ],
  Checkbox: [
    'checked',
    'indeterminate',
    'disabled',
    'name',
    'id',
    'value',
    'label',
    'onChange',
    'children'
  ],
  Switch: ['checked', 'disabled', 'label', 'size', 'id', 'name', 'onChange'],
  RadioGroup: [
    'name',
    'value',
    'options',
    'direction',
    'disabled',
    'error',
    'message',
    'onChange'
  ],
  Slider: [
    'value',
    'min',
    'max',
    'step',
    'disabled',
    'showTooltip',
    'label',
    'onChange'
  ],
  Rate: [
    'count',
    'value',
    'allowHalf',
    'disabled',
    'readonly',
    'label',
    'onChange'
  ],
  Segmented: ['options', 'value', 'disabled', 'size', 'onChange'],
  Form: [
    'layout',
    'colon',
    'labelAlign',
    'labelWidth',
    'disabled',
    'onSubmit',
    'children'
  ],
  FormItem: [
    'label',
    'name',
    'required',
    'colon',
    'labelAlign',
    'labelWidth',
    'error',
    'help',
    'rules',
    'layout',
    'children'
  ],
  DatePicker: [
    'value',
    'min',
    'max',
    'placeholder',
    'disabled',
    'error',
    'size',
    'id',
    'onChange'
  ],
  TimePicker: ['value', 'format', 'placeholder', 'disabled', 'id', 'onChange'],
  DateRangePicker: [
    'value',
    'min',
    'max',
    'disabled',
    'error',
    'startId',
    'endId',
    'onChange'
  ],
  Mentions: [
    'value',
    'prefix',
    'options',
    'placeholder',
    'rows',
    'disabled',
    'onChange',
    'onSelect'
  ],
  Upload: [
    'fileList',
    'dragger',
    'accept',
    'multiple',
    'disabled',
    'title',
    'hint',
    'onChange',
    'onRemove'
  ],
  TreeSelect: [
    'treeData',
    'value',
    'defaultValue',
    'multiple',
    'placeholder',
    'allowClear',
    'disabled',
    'treeDefaultExpandAll',
    'onChange'
  ],
  Cascader: [
    'options',
    'value',
    'defaultValue',
    'placeholder',
    'allowClear',
    'disabled',
    'changeOnSelect',
    'displayRender',
    'onChange'
  ],
  Transfer: ['dataSource', 'targetKeys', 'titles', 'disabled', 'onChange'],
  MarkdownEditor: [
    'value',
    'defaultValue',
    'height',
    'mode',
    'placeholder',
    'readOnly',
    'onChange'
  ]
};

function extractBraceBlock(src, startIdx) {
  const openBrace = src.indexOf('{', startIdx);
  if (openBrace === -1) return '';
  let depth = 1;
  let i = openBrace + 1;
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  return src.slice(openBrace + 1, i - 1);
}

export function classes(src) {
  const cleaned = src
    .replace(/\$\{[^"'`}]*\}/g, '*')
    .replace(/\{[^"'`}]*\}/g, '*');
  // Two kinds of token are extracted besides plain classes so a ONE-twin difference still
  // shows in the twin class diff, but neither needs a theme.css rule (see needsThemeRule):
  //  - CSS custom properties, kept with their leading dashes: `--joy-space-gap`
  //  - dynamic prefixes (a match followed by `-`, `_` or a template hole), kept with a trailing
  //    `*`: `joy-progress--status-${x}` -> `joy-progress--status-*`
  const re = /(?<![\w-])(?:--)?joy-[a-z0-9]+(?:[_-]+[a-z0-9]+)*/g;
  const out = new Set();
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const next = cleaned[m.index + m[0].length];
    if (next === '-' || next === '_') out.add(`${m[0]}${next}*`);
    else if (next === '*') out.add(`${m[0]}*`);
    else out.add(m[0]);
  }
  return out;
}

// Only real, fully spelled class names need a `.joy-*` rule in theme.css.
export function needsThemeRule(token) {
  return !token.startsWith('--') && !token.endsWith('*');
}

// Raw (un-normalised) names declared in `interface Props` / `export interface <X>Props`.
const propNames = (block) => [...block.matchAll(/^\s*([A-Za-z]+)\??\s*:/gm)].map((m) => m[1]);

export function svelteRawProps(src) {
  const startIdx = src.indexOf('interface Props');
  return propNames(startIdx !== -1 ? extractBraceBlock(src, startIdx) : '');
}

export function reactRawProps(componentName, src) {
  const declRegex = new RegExp(`export\\s+interface\\s+${componentName}Props\\b`);
  const match = src.match(declRegex);
  return propNames(match ? extractBraceBlock(src, match.index) : '');
}

export function svelteProps(src) {
  return new Set(svelteRawProps(src).map(normaliseProp));
}

export function reactPropsExplicit(componentName, src) {
  return new Set(reactRawProps(componentName, src).map(normaliseProp));
}

// Handler casing convention (per side). The twins compare handlers case-insensitively, but each
// side keeps its own spelling: Svelte handler props are all lower-case (`onclose`), React handler
// props are camelCase (`onClose`). Returns the declared handler props that break the convention.
export function handlerCasingViolations(side, rawNames) {
  return rawNames
    .filter((n) => /^on[a-z]/i.test(n))
    .filter((n) => (side === 'svelte' ? n !== n.toLowerCase() : !/^on[A-Z]/.test(n)))
    .filter((n) => !HANDLER_CASING_EXCEPTIONS.has(n))
    .sort();
}

// Narrow, documented exceptions to the handler casing convention: prop names that look like a
// handler by pattern but are not event handlers. Keep this empty unless a real case needs it.
export const HANDLER_CASING_EXCEPTIONS = new Set([]);

export function reactProps(componentName, src) {
  const names = new Set(reactPropsExplicit(componentName, src));
  const extendsClause = (base) =>
    new RegExp(
      `export\\s+interface\\s+${componentName}Props(?:<[^{]*?>)?\\s+extends\\s+[^{]*React\\.${base}`
    ).test(src);
  if (extendsClause('\\w*HTMLAttributes')) {
    for (const p of HTML_INHERITED) names.add(normaliseProp(p));
  }
  if (extendsClause('ImgHTMLAttributes')) {
    for (const p of IMG_INHERITED) names.add(p);
  }
  // React `ref` arrives through forwardRef, not through props.
  if (hasForwardRef(src)) names.add('ref');
  return names;
}

export function getDefinedClasses(themeCss) {
  const stripped = themeCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const matches = stripped.match(/\.joy-[a-z0-9]+(?:[_-]+[a-z0-9]+)*/g) || [];
  return new Set(matches.map((s) => s.slice(1)));
}

// Drops block comments and line comments. A `//` directly after `:` (as in a
// URL) is kept so string literals like 'https://x' are not truncated.
export function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1');
}

// React.forwardRef(...) or a bare named-import forwardRef(...) / forwardRef<...>(...).
export function hasForwardRef(src) {
  return /\bforwardRef\s*[<(]/.test(stripComments(src));
}

// A JSX spread of the props/rest binding, e.g. {...rest}, {...props}, {...restProps}.
export function hasRestSpread(src) {
  return /\{\s*\.\.\.(?:props|\w*[Rr]est\w*)\s*\}/.test(stripComments(src));
}

export function checkRefForwarding(rootDir = process.cwd()) {
  const failures = [];
  for (const component of REF_FORWARDING) {
    const file = path.resolve(rootDir, `packages/react/src/${component}.tsx`);
    if (!fs.existsSync(file)) {
      failures.push({ component, missing: ['file'] });
      continue;
    }
    const src = fs.readFileSync(file, 'utf8');
    const missing = [];
    if (!hasForwardRef(src)) missing.push('forwardRef');
    if (!hasRestSpread(src)) missing.push('restSpread');
    if (missing.length > 0) failures.push({ component, missing });
  }
  return failures;
}

// Splits a .svelte file into comment-free script text (JS comments stripped) and
// comment-free markup (<script> blocks removed, HTML comments stripped), so a
// `{...rest}` object spread or a string in the script can never satisfy a markup
// check, and a "<!--" string in the script cannot swallow the markup.
// Limitation: a <script> tag written inside an HTML comment is read as a script.
export function splitSvelteSource(src) {
  const scripts = [];
  const rest = src.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g, (_, body) => {
    scripts.push(body);
    return '';
  });
  return {
    script: stripComments(scripts.join('\n')),
    markup: rest.replace(/<!--[\s\S]*?-->/g, '')
  };
}

// Svelte twin of checkRefForwarding: every listed component must destructure a
// bindable `ref`, spread `{...rest}` and bind the root element to `ref`.
// Failure shape: { component, missing: ['ref' | 'restSpread' | 'bindThis'] }
// (or ['file'] when the component file does not exist).
export function checkSvelteRefRest(rootDir = process.cwd(), names = SVELTE_REF_REST) {
  const failures = [];
  for (const component of names) {
    const file = path.resolve(rootDir, `packages/svelte/src/lib/${component}.svelte`);
    if (!fs.existsSync(file)) {
      failures.push({ component, missing: ['file'] });
      continue;
    }
    const { script, markup } = splitSvelteSource(fs.readFileSync(file, 'utf8'));
    const missing = [];
    // The destructure lives in <script>; the spread and the binding must be on markup.
    if (!/\bref\s*=\s*\$bindable\s*(?:<[^()]*>)?\s*\(\s*null\s*\)/.test(script)) missing.push('ref');
    if (!/\{\s*\.\.\.(?:props|\w*[Rr]est\w*)\s*\}/.test(markup)) missing.push('restSpread');
    if (!/\bbind:this=\{\s*ref\s*\}/.test(markup)) missing.push('bindThis');
    if (missing.length > 0) failures.push({ component, missing });
  }
  return failures;
}

export function runParityCheck(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const themeCssPath = path.resolve(rootDir, 'packages/tokens/dist/theme.css');
  const themeCss = fs.readFileSync(themeCssPath, 'utf8');
  const defined = getDefinedClasses(themeCss);

  const side = options.side || null; // 'svelte' | 'react' | null (twin mode)
  const results = {};
  const checks = []; // structural checks: { component, check, status }
  let totalViolations = 0;

  for (const comp of COMPONENTS) {
    const svelteFile = path.resolve(rootDir, `packages/svelte/src/lib/${comp}.svelte`);
    const reactFile = path.resolve(rootDir, `packages/react/src/${comp}.tsx`);

    const absent = [];
    if (side !== 'react' && !fs.existsSync(svelteFile)) absent.push('svelte');
    if (side !== 'svelte' && !fs.existsSync(reactFile)) absent.push('react');
    if (absent.length > 0) {
      for (const which of absent) {
        checks.push({ component: comp, check: `${which} file exists`, status: 'FAIL' });
        totalViolations += 1;
      }
      continue;
    }

    // In lane mode only the checked side must exist; the other side may be absent.
    const readIfPresent = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');
    const svelteSrc = readIfPresent(svelteFile);
    const reactSrc = readIfPresent(reactFile);

    const sClasses = classes(svelteSrc);
    const rClasses = classes(reactSrc);

    const sProps = svelteProps(svelteSrc);
    const rProps = reactProps(comp, reactSrc);
    const rPropsExplicit = reactPropsExplicit(comp, reactSrc);
    const sHandlerCasing = handlerCasingViolations('svelte', svelteRawProps(svelteSrc));
    const rHandlerCasing = handlerCasingViolations('react', reactRawProps(comp, reactSrc));

    const contractProps = (CONTRACT[comp] || []).map(normaliseProp);
    // A structural hook is exempt from the theme.css rule only while both twins carry it.
    const isUndefined = (c, other) =>
      needsThemeRule(c) && !defined.has(c) && !(STRUCTURAL_CLASSES.has(c) && other.has(c));

    if (side === 'svelte') {
      const undefinedClasses = [...sClasses].filter((c) => isUndefined(c, rClasses)).sort();
      const missingContractProps = contractProps.filter((p) => !sProps.has(p)).sort();
      const violationsCount = undefinedClasses.length + missingContractProps.length + sHandlerCasing.length;
      totalViolations += violationsCount;
      results[comp] = {
        undefinedClasses,
        missingContractProps,
        handlerCasing: sHandlerCasing,
        hasViolations: violationsCount > 0
      };
    } else if (side === 'react') {
      const undefinedClasses = [...rClasses].filter((c) => isUndefined(c, sClasses)).sort();
      const missingContractProps = contractProps.filter((p) => !rProps.has(p)).sort();
      const violationsCount = undefinedClasses.length + missingContractProps.length + rHandlerCasing.length;
      totalViolations += violationsCount;
      results[comp] = {
        undefinedClasses,
        missingContractProps,
        handlerCasing: rHandlerCasing,
        hasViolations: violationsCount > 0
      };
    } else {
      const sUndefined = [...sClasses].filter((c) => isUndefined(c, rClasses)).sort();
      const rUndefined = [...rClasses].filter((c) => isUndefined(c, sClasses)).sort();
      const sMissing = contractProps.filter((p) => !sProps.has(p)).sort();
      const rMissing = contractProps.filter((p) => !rProps.has(p)).sort();
      const classesOnlySvelte = [...sClasses].filter((c) => !rClasses.has(c)).sort();
      const classesOnlyReact = [...rClasses].filter((c) => !sClasses.has(c)).sort();
      const propsOnlySvelte = [...sProps].filter((p) => !rProps.has(p)).sort();
      const propsOnlyReact = [...rProps]
        .filter((p) => !sProps.has(p))
        // `className` is never exempt: a React twin that takes it needs a Svelte `class` prop.
        .filter((p) => !HTML_INHERITED_NORMALISED.has(p) || rPropsExplicit.has(p) || p === 'className')
        .sort();

      const violationsCount =
        sUndefined.length +
        rUndefined.length +
        sMissing.length +
        rMissing.length +
        classesOnlySvelte.length +
        classesOnlyReact.length +
        propsOnlySvelte.length +
        propsOnlyReact.length +
        sHandlerCasing.length +
        rHandlerCasing.length;

      totalViolations += violationsCount;

      results[comp] = {
        undefinedClasses: { svelte: sUndefined, react: rUndefined },
        missingContractProps: { svelte: sMissing, react: rMissing },
        classesOnlyInSvelte: classesOnlySvelte,
        classesOnlyInReact: classesOnlyReact,
        propsOnlyInSvelte: propsOnlySvelte,
        propsOnlyInReact: propsOnlyReact,
        handlerCasing: { svelte: sHandlerCasing, react: rHandlerCasing },
        hasViolations: violationsCount > 0
      };
    }
  }

  if (side !== 'svelte') {
    for (const { component, missing } of checkRefForwarding(rootDir)) {
      // A missing React file is already reported once by the file-exists check above.
      if (missing.includes('file')) continue;
      checks.push({ component, check: `ref forwarding (${missing.join(', ')})`, status: 'FAIL' });
      totalViolations += 1;
    }
  }

  if (side !== 'react') {
    for (const { component, missing } of checkSvelteRefRest(rootDir)) {
      // A missing Svelte file of a COMPONENTS entry is already reported by the file-exists check above.
      if (missing.includes('file') && COMPONENTS.includes(component)) continue;
      checks.push({ component, check: `Svelte ref/rest (${missing.join(', ')})`, status: 'FAIL' });
      totalViolations += 1;
    }
  }

  return {
    side: side || 'twin',
    passed: totalViolations === 0,
    totalViolations,
    results,
    checks
  };
}

export function formatMarkdownTable(checkResult) {
  const { side, results, passed, totalViolations, checks = [] } = checkResult;
  const rows = [];

  if (side === 'svelte' || side === 'react') {
    rows.push(`### Parity Check (${side})`);
    rows.push('');
    rows.push('| Component | Classes without theme.css rule | CONTRACT props not implemented | Handler casing |');
    rows.push('| :--- | :--- | :--- | :--- |');
    for (const [comp, data] of Object.entries(results)) {
      if (!data.hasViolations) continue;
      const undef = data.undefinedClasses.length > 0 ? data.undefinedClasses.join(', ') : '-';
      const missing = data.missingContractProps.length > 0 ? data.missingContractProps.join(', ') : '-';
      const casing = data.handlerCasing.length > 0 ? data.handlerCasing.join(', ') : '-';
      rows.push(`| ${comp} | ${undef} | ${missing} | ${casing} |`);
    }
  } else {
    rows.push('### Parity Check (Twin Mode: Svelte vs React)');
    rows.push('');
    rows.push(
      '| Component | Undefined Classes (S / R) | Missing CONTRACT Props (S / R) | Classes Diff (S only / R only) | Props Diff (S only / R only) | Handler Casing (S / R) |'
    );
    rows.push('| :--- | :--- | :--- | :--- | :--- | :--- |');
    for (const [comp, data] of Object.entries(results)) {
      if (!data.hasViolations) continue;
      const undef = `S: [${data.undefinedClasses.svelte.join(', ') || '-'}]<br>R: [${data.undefinedClasses.react.join(', ') || '-'}]`;
      const missing = `S: [${data.missingContractProps.svelte.join(', ') || '-'}]<br>R: [${data.missingContractProps.react.join(', ') || '-'}]`;
      const diffClass = `S: [${data.classesOnlyInSvelte.join(', ') || '-'}]<br>R: [${data.classesOnlyInReact.join(', ') || '-'}]`;
      const diffProp = `S: [${data.propsOnlyInSvelte.join(', ') || '-'}]<br>R: [${data.propsOnlyInReact.join(', ') || '-'}]`;
      const casing = `S: [${data.handlerCasing.svelte.join(', ') || '-'}]<br>R: [${data.handlerCasing.react.join(', ') || '-'}]`;
      rows.push(`| ${comp} | ${undef} | ${missing} | ${diffClass} | ${diffProp} | ${casing} |`);
    }
  }

  if (checks.length > 0) {
    rows.push('');
    rows.push('| Component | Check | Status |');
    rows.push('| :--- | :--- | :--- |');
    for (const { component, check, status } of checks) {
      rows.push(`| ${component} | ${check} | ${status} |`);
    }
  }

  rows.push('');
  if (passed) {
    rows.push(`**Status:** PASSED (0 violations)`);
  } else {
    rows.push(`**Status:** FAILED (${totalViolations} violations found)`);
  }

  return rows.join('\n');
}

// CLI runner
const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  const args = process.argv.slice(2);
  let side = null;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--side' && args[i + 1]) {
      side = args[++i];
    } else if (args[i].startsWith('--side=')) {
      side = args[i].slice('--side='.length);
    } else if (args[i] === '--json') {
      jsonOutput = true;
    }
  }

  const result = runParityCheck({ side });

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatMarkdownTable(result));
  }

  process.exit(result.passed ? 0 : 1);
}
