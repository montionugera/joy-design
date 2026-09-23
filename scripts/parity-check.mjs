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
  'CandlestickChart'
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
  'Tooltip'
];

export const NORMALISE = {
  onchange: 'onChange',
  oninput: 'onInput',
  onselect: 'onSelect',
  onremove: 'onRemove',
  onsubmit: 'onSubmit',
  onclick: 'onClick',
  class: 'className'
};

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
  const matches = cleaned.match(/\bjoy-[a-z0-9]+(?:[_-]+[a-z0-9]+)*/g) || [];
  return new Set(matches.filter((t) => !t.endsWith('-') && !t.endsWith('--')));
}

export function svelteProps(src) {
  const startIdx = src.indexOf('interface Props');
  const block = startIdx !== -1 ? extractBraceBlock(src, startIdx) : '';
  const names = new Set();
  const re = /^\s*([A-Za-z]+)\??\s*:/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    const raw = m[1];
    names.add(NORMALISE[raw] || raw);
  }
  return names;
}

export function reactPropsExplicit(componentName, src) {
  const declRegex = new RegExp(`export\\s+interface\\s+${componentName}Props\\b`);
  const match = src.match(declRegex);
  const startIdx = match ? match.index : -1;
  const block = startIdx !== -1 ? extractBraceBlock(src, startIdx) : '';
  const names = new Set();
  const re = /^\s*([A-Za-z]+)\??\s*:/gm;
  let m;
  while ((m = re.exec(block)) !== null) {
    const raw = m[1];
    names.add(NORMALISE[raw] || raw);
  }
  return names;
}

export function reactProps(componentName, src) {
  const names = new Set(reactPropsExplicit(componentName, src));
  const extendsRegex = new RegExp(
    `export\\s+interface\\s+${componentName}Props\\s+extends\\s+[^{]*React\\.\\w*HTMLAttributes`
  );
  if (extendsRegex.test(src)) {
    for (const p of HTML_INHERITED) {
      names.add(p);
    }
  }
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

    const contractProps = CONTRACT[comp] || [];

    if (side === 'svelte') {
      const undefinedClasses = [...sClasses].filter((c) => !defined.has(c)).sort();
      const missingContractProps = contractProps.filter((p) => !sProps.has(p)).sort();
      const violationsCount = undefinedClasses.length + missingContractProps.length;
      totalViolations += violationsCount;
      results[comp] = {
        undefinedClasses,
        missingContractProps,
        hasViolations: violationsCount > 0
      };
    } else if (side === 'react') {
      const undefinedClasses = [...rClasses].filter((c) => !defined.has(c)).sort();
      const missingContractProps = contractProps.filter((p) => !rProps.has(p)).sort();
      const violationsCount = undefinedClasses.length + missingContractProps.length;
      totalViolations += violationsCount;
      results[comp] = {
        undefinedClasses,
        missingContractProps,
        hasViolations: violationsCount > 0
      };
    } else {
      const sUndefined = [...sClasses].filter((c) => !defined.has(c)).sort();
      const rUndefined = [...rClasses].filter((c) => !defined.has(c)).sort();
      const sMissing = contractProps.filter((p) => !sProps.has(p)).sort();
      const rMissing = contractProps.filter((p) => !rProps.has(p)).sort();
      const classesOnlySvelte = [...sClasses].filter((c) => !rClasses.has(c)).sort();
      const classesOnlyReact = [...rClasses].filter((c) => !sClasses.has(c)).sort();
      const propsOnlySvelte = [...sProps].filter((p) => !rProps.has(p)).sort();
      const propsOnlyReact = [...rProps]
        .filter((p) => !sProps.has(p))
        .filter((p) => !HTML_INHERITED.includes(p) || rPropsExplicit.has(p))
        .sort();

      const violationsCount =
        sUndefined.length +
        rUndefined.length +
        sMissing.length +
        rMissing.length +
        classesOnlySvelte.length +
        classesOnlyReact.length +
        propsOnlySvelte.length +
        propsOnlyReact.length;

      totalViolations += violationsCount;

      results[comp] = {
        undefinedClasses: { svelte: sUndefined, react: rUndefined },
        missingContractProps: { svelte: sMissing, react: rMissing },
        classesOnlyInSvelte: classesOnlySvelte,
        classesOnlyInReact: classesOnlyReact,
        propsOnlyInSvelte: propsOnlySvelte,
        propsOnlyInReact: propsOnlyReact,
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
    rows.push('| Component | Classes without theme.css rule | CONTRACT props not implemented |');
    rows.push('| :--- | :--- | :--- |');
    for (const [comp, data] of Object.entries(results)) {
      if (!data.hasViolations) continue;
      const undef = data.undefinedClasses.length > 0 ? data.undefinedClasses.join(', ') : '-';
      const missing = data.missingContractProps.length > 0 ? data.missingContractProps.join(', ') : '-';
      rows.push(`| ${comp} | ${undef} | ${missing} |`);
    }
  } else {
    rows.push('### Parity Check (Twin Mode: Svelte vs React)');
    rows.push('');
    rows.push(
      '| Component | Undefined Classes (S / R) | Missing CONTRACT Props (S / R) | Classes Diff (S only / R only) | Props Diff (S only / R only) |'
    );
    rows.push('| :--- | :--- | :--- | :--- | :--- |');
    for (const [comp, data] of Object.entries(results)) {
      if (!data.hasViolations) continue;
      const undef = `S: [${data.undefinedClasses.svelte.join(', ') || '-'}]<br>R: [${data.undefinedClasses.react.join(', ') || '-'}]`;
      const missing = `S: [${data.missingContractProps.svelte.join(', ') || '-'}]<br>R: [${data.missingContractProps.react.join(', ') || '-'}]`;
      const diffClass = `S: [${data.classesOnlyInSvelte.join(', ') || '-'}]<br>R: [${data.classesOnlyInReact.join(', ') || '-'}]`;
      const diffProp = `S: [${data.propsOnlyInSvelte.join(', ') || '-'}]<br>R: [${data.propsOnlyInReact.join(', ') || '-'}]`;
      rows.push(`| ${comp} | ${undef} | ${missing} | ${diffClass} | ${diffProp} |`);
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
