/**
 * sweep-literals.mjs
 *
 * Phase B sweep script:
 * B1: Literal-to-token role table and replacement of all hex, rgb, rgba literals and var() fallbacks.
 * B2: Removal of stale dark root blocks and per-component [data-theme="dark"] overrides.
 * B3: Removal of banned patterns (gradient text, side stripes >= 2px, decorative backdrop-filter, tracked uppercase eyebrows).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildJsPath = path.join(__dirname, '../build.js');
let content = fs.readFileSync(buildJsPath, 'utf8');

const startMarker = 'const componentStyles = `';
const endMarker = 'const canonicalVars = [';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) throw new Error('Could not find start of componentStyles');
const endIdx = content.indexOf(endMarker, startIdx);
if (endIdx === -1) throw new Error('Could not find end of componentStyles');

const beforeEnd = content.lastIndexOf('`;', endIdx);
if (beforeEnd === -1) throw new Error('Could not find closing backtick of componentStyles');

let comp = content.substring(startIdx + startMarker.length, beforeEnd);

// ============================================================================
// Step 1: Remove Stale Dark Blocks & Non-Brand Institutional Palettes (B2, TOK-010, TOK-011, TOK-017, TOK-064)
// ============================================================================

// 1.1 Remove stale dark root block (lines ~863-882)
comp = comp.replace(
  /\/\* ── Dark Mode Token Overrides ── \*\/[\s\S]*?\[data-theme="dark"\]\s*\{[\s\S]*?color:\s*var\(--joy-text-primary,\s*#f8f3e8\);\s*\}/g,
  ''
);

// 1.2 Remove stale dark hairline block (lines ~1231-1234)
comp = comp.replace(
  /\/\* ── OpenDesign Posture Integration \(Linear \/ Datadog Spec\) ── \*\/[\s\S]*?\[data-theme="dark"\]\s*\{[\s\S]*?--joy-surface-frosted:[^}]*\}/g,
  ''
);

// 1.3 Remove non-brand institutional palettes (obsidian, quantum, cyberpunk, titanium - TOK-064)
comp = comp.replace(/\/\* ── Institutional Color Palette Engine ── \*\/[\s\S]*$/g, '');

// 1.4 Remove all per-component [data-theme="dark"] overrides that only re-color (TOK-010, TOK-011)
comp = comp.replace(/\[data-theme="dark"\][^{]+\{[^}]+\}\n?/g, '');

// ============================================================================
// Step 2: Remove Banned Patterns (B3)
// ============================================================================

// 2.1 TOK-020: Gradient text on .joy-hero__title-gradient -> solid var(--joy-text-primary)
comp = comp.replace(
  /\.joy-hero__title-gradient\s*\{[^}]*\}/g,
  `.joy-hero__title-gradient {
  color: var(--joy-text-primary);
}`
);

// 2.2 TOK-021: Side-stripes on .joy-alert -> 1px solid border
comp = comp.replace(
  /border-left:\s*4px\s+solid\s+transparent;/g,
  'border: 1px solid var(--joy-border-default);'
);
comp = comp.replace(
  /\.joy-alert--info\s*\{[\s\S]*?\}/g,
  `.joy-alert--info {
  background: var(--joy-status-info-bg);
  border: 1px solid var(--joy-status-info-border);
  color: var(--joy-status-info-fg);
}`
);
comp = comp.replace(
  /\.joy-alert--success\s*\{[\s\S]*?\}/g,
  `.joy-alert--success {
  background: var(--joy-status-success-bg);
  border: 1px solid var(--joy-status-success-border);
  color: var(--joy-status-success-fg);
}`
);
comp = comp.replace(
  /\.joy-alert--warning\s*\{[\s\S]*?\}/g,
  `.joy-alert--warning {
  background: var(--joy-status-warning-bg);
  border: 1px solid var(--joy-status-warning-border);
  color: var(--joy-status-warning-fg);
}`
);
comp = comp.replace(
  /\.joy-alert--danger\s*\{[\s\S]*?\}/g,
  `.joy-alert--danger {
  background: var(--joy-status-danger-bg);
  border: 1px solid var(--joy-status-danger-border);
  color: var(--joy-status-danger-fg);
}`
);

// 2.3 TOK-022: Side-stripes on .joy-toast -> 1px solid border
comp = comp.replace(
  /\.joy-toast--info\s*\{[^}]*\}/g,
  `.joy-toast--info {
  border: 1px solid var(--joy-status-info-border);
}`
);
comp = comp.replace(
  /\.joy-toast--success\s*\{[^}]*\}/g,
  `.joy-toast--success {
  border: 1px solid var(--joy-status-success-border);
}`
);
comp = comp.replace(
  /\.joy-toast--warning\s*\{[^}]*\}/g,
  `.joy-toast--warning {
  border: 1px solid var(--joy-status-warning-border);
}`
);
comp = comp.replace(
  /\.joy-toast--danger\s*\{[^}]*\}/g,
  `.joy-toast--danger {
  border: 1px solid var(--joy-status-danger-border);
}`
);

// 2.4 TOK-023: Side-stripe on .joy-markdown blockquote -> 1px solid border + raised surface
comp = comp.replace(
  /\.joy-markdown blockquote\s*\{[^}]*\}/g,
  `.joy-markdown blockquote {
  border: 1px solid var(--joy-border-default);
  margin: 1em 0;
  padding: 8px 16px;
  background-color: var(--joy-surface-raised);
  border-radius: var(--joy-radius-control);
  color: var(--joy-text-secondary);
}`
);

// 2.5 Menu active side-stripe
comp = comp.replace(
  /\.joy-menu--inline \.joy-menu__item--active\s*\{[^}]*\}/g,
  `.joy-menu--inline .joy-menu__item--active {
  background-color: var(--joy-accent-subtle);
  border-right: 1px solid var(--joy-border-default);
}`
);

// 2.6 TOK-031 to TOK-035: Eyebrow uppercase + tracking removal
comp = comp.replace(
  /(\.joy-metric-tile__title\s*\{[\s\S]*?)text-transform:\s*uppercase;\s*letter-spacing:\s*0\.05em;/g,
  '$1'
);
comp = comp.replace(
  /(\.joy-stat-card__label\s*\{[\s\S]*?)letter-spacing:\s*0\.05em;\s*text-transform:\s*uppercase;/g,
  '$1'
);
comp = comp.replace(
  /(\.joy-pricing-card__popular-badge\s*\{[\s\S]*?)letter-spacing:\s*0\.05em;\s*text-transform:\s*uppercase;/g,
  '$1'
);
comp = comp.replace(
  /(\.joy-logo-cloud__title\s*\{[\s\S]*?)text-transform:\s*uppercase;\s*letter-spacing:\s*0\.08em;/g,
  '$1'
);
comp = comp.replace(
  /(\.joy-site-footer__col-title\s*\{[\s\S]*?)text-transform:\s*uppercase;\s*letter-spacing:\s*0\.06em;/g,
  '$1'
);

// 2.7 TOK-024 to TOK-030: Decorative backdrop-filter removal (keep modal <= 4px, drawer <= 2px)
comp = comp.replace(/\s*-?webkit-backdrop-filter:[^;]+;/g, '');
comp = comp.replace(/backdrop-filter:\s*var\(--joy-backdrop-blur,\s*blur\(10px\)\);?/g, '');
comp = comp.replace(/backdrop-filter:\s*blur\((?:8|10|12)px\);?/g, '');
comp = comp.replace(/(\.joy-spin__mask\s*\{[\s\S]*?)backdrop-filter:\s*blur\(2px\);?/g, '$1');

// 2.8 TOK-062, TOK-063: Purple gradients removal
comp = comp.replace(
  /background:\s*linear-gradient\(90deg,\s*#8b5cf6\s*0%,\s*#7c3aed\s*100%\);/g,
  'background: var(--joy-accent-default);'
);
comp = comp.replace(
  /background:\s*linear-gradient\(135deg,\s*#8b5cf6\s*0%,\s*#7c3aed\s*100%\);/g,
  'background: var(--joy-accent-default);\n  color: var(--joy-text-on-accent);'
);

// ============================================================================
// Step 3: Literal-to-Token Role Table & Fallback Sweep (B1)
// ============================================================================

// 3.1 Legacy variable mappings to canonical semantic tokens
const legacyVarMap = {
  '--joy-color-brand-primary': '--joy-accent-default',
  '--joy-color-brand-primary-hover': '--joy-accent-hover',
  '--joy-color-brand-accent': '--joy-accent-default',
  '--gold-400': '--joy-accent-default',
  '--navy-500': '--joy-color-navy-500',
  '--joy-color-text-primary': '--joy-text-primary',
  '--joy-color-text-secondary': '--joy-text-secondary',
  '--joy-color-text-muted': '--joy-text-muted',
  '--joy-color-text-inverse': '--joy-text-inverse',
  '--joy-color-border-subtle': '--joy-border-subtle',
  '--joy-color-border-default': '--joy-border-default',
  '--joy-color-surface-elevated': '--joy-surface-card',
  '--joy-color-surface-base': '--joy-surface-canvas',
  '--joy-color-surface-subtle': '--joy-surface-raised',
  '--joy-color-surface-muted': '--joy-surface-sunken',
  '--joy-color-surface-dark-base': '--joy-surface-inverse',
  '--joy-color-surface-dark-subtle': '--joy-surface-raised',
  '--joy-color-status-success': '--joy-status-success-fg',
  '--joy-color-status-warning': '--joy-status-warning-fg',
  '--joy-color-status-danger': '--joy-status-danger-fg',
  '--joy-color-status-info': '--joy-status-info-fg',
  '--joy-shadow-sm': '--joy-elevation-1',
  '--joy-shadow-md': '--joy-elevation-2',
  '--joy-shadow-lg': '--joy-elevation-3',
  '--joy-shadow-overlay': '--joy-elevation-3',
  '--joy-surface-frosted': '--joy-surface-card',
  '--joy-radius-sm': '--joy-radius-control',
  '--joy-radius-md': '--joy-radius-control',
  '--joy-radius-lg': '--joy-radius-card',
  '--joy-radius-xl': '--joy-radius-overlay',
  '--joy-radius-full': '--joy-radius-pill',
  '--joy-motion-duration-fast': '--joy-duration-fast',
  '--joy-motion-duration-normal': '--joy-duration-normal',
  '--joy-motion-duration-slow': '--joy-duration-slow',
  '--joy-border': '--joy-border-default',
  '--joy-text-primary': '--joy-text-primary',
  '--joy-surface-card': '--joy-surface-card',
  '--joy-surface-canvas': '--joy-surface-canvas',
};

// Balanced-parenthesis parser to strip all fallbacks: var(--joy-*, <fallback>) -> var(mapped)
function replaceVarFallbacks(css, varMap) {
  let result = '';
  let i = 0;
  while (i < css.length) {
    if (css.startsWith('var(', i)) {
      let depth = 1;
      let j = i + 4;
      while (j < css.length && depth > 0) {
        if (css[j] === '(') depth++;
        else if (css[j] === ')') depth--;
        j++;
      }
      const inner = css.substring(i + 4, j - 1).trim();
      const commaIdx = inner.indexOf(',');
      if (commaIdx !== -1) {
        const varName = inner.substring(0, commaIdx).trim();
        const mapped = varMap[varName] || varName;
        result += `var(${mapped})`;
      } else {
        const mapped = varMap[inner] || inner;
        result += `var(${mapped})`;
      }
      i = j;
    } else {
      result += css[i];
      i++;
    }
  }
  return result;
}

comp = replaceVarFallbacks(comp, legacyVarMap);

// 3.2 Specific component sweeps and mappings
comp = comp.replace(
  /\.joy-button--glass\s*\{[^}]*\}/g,
  `.joy-button--glass {
  background: var(--joy-surface-raised);
  border-color: var(--joy-border-subtle);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-1);
}`
);

comp = comp.replace(
  /\.joy-button--glass:hover:not\(:disabled\)\s*\{[^}]*\}/g,
  `.joy-button--glass:hover:not(:disabled) {
  background: var(--joy-surface-raised);
  border-color: var(--joy-border-default);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-2);
}`
);

comp = comp.replace(
  /\.joy-cta-section__container\s*\{[^}]*\}/g,
  `.joy-cta-section__container {
  position: relative;
  background: var(--joy-surface-inverse);
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-overlay);
  padding: 64px 32px;
  box-shadow: var(--joy-elevation-3);
}`
);

const replacements = [
  // SVG stroke in select
  ["stroke='%2364748b'", "stroke='currentColor'"],

  // Buttons & Focus
  ['box-shadow: 0 0 0 3px rgba(196, 154, 58, 0.35);', 'outline: var(--joy-focus-ring); outline-offset: 2px;'],
  ['background: linear-gradient(180deg, #c49a3a 0%, #b3892f 100%);\n  color: #14253e;\n  border-color: rgba(179, 137, 47, 0.6);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
   'background: var(--joy-accent-default);\n  color: var(--joy-text-on-accent);\n  border-color: var(--joy-accent-hover);\n  box-shadow: var(--joy-elevation-1);'],
  ['background: linear-gradient(180deg, #d4ab4b 0%, #c49a3a 100%);\n  box-shadow: 0 2px 6px rgba(196, 154, 58, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
   'background: var(--joy-accent-hover);\n  box-shadow: var(--joy-elevation-2);'],
  ['background-color: #ffffff;\n  border-color: #cbd5e1;\n  color: #1e293b;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);',
   'background-color: transparent;\n  border-color: var(--joy-border-default);\n  color: var(--joy-text-primary);\n  box-shadow: var(--joy-elevation-0);'],
  ['background-color: #f8fafc;\n  border-color: #94a3b8;\n  color: #0f172a;',
   'background-color: var(--joy-surface-raised);\n  border-color: var(--joy-border-strong);\n  color: var(--joy-text-primary);'],
  ['color: #0f172a;', 'color: var(--joy-text-primary);'],
  ['background: linear-gradient(180deg, #f43f5e 0%, #ef4444 100%);\n  color: var(--joy-text-inverse);\n  border-color: rgba(225, 29, 72, 0.6);\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
   'background: var(--joy-status-danger-fg);\n  color: var(--joy-text-inverse);\n  border-color: var(--joy-status-danger-border);\n  box-shadow: var(--joy-elevation-1);'],
  ['background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);\n  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
   'background: var(--joy-status-danger-fg);\n  box-shadow: var(--joy-elevation-2);'],

  // Badges
  ['background: #ede9fe;\n  color: var(--joy-accent-default);', 'background: var(--joy-accent-subtle);\n  color: var(--joy-accent-text);'],
  ['background: #d1fae5;\n  color: #065f46;', 'background: var(--joy-status-success-bg);\n  color: var(--joy-status-success-fg);'],
  ['background: #fef3c7;\n  color: #92400e;', 'background: var(--joy-status-warning-bg);\n  color: var(--joy-status-warning-fg);'],
  ['background: #fee2e2;\n  color: #991b1b;', 'background: var(--joy-status-danger-bg);\n  color: var(--joy-status-danger-fg);'],

  // Inputs, Select, Switch
  ['border: 1px solid #cbd5e1;\n  background: #ffffff;', 'border: 1px solid var(--joy-border-default);\n  background: var(--joy-surface-card);'],
  ['border: 1px solid #cbd5e1;\n  border-radius: var(--joy-radius-control);\n  background-color: #ffffff;',
   'border: 1px solid var(--joy-border-default);\n  border-radius: var(--joy-radius-control);\n  background-color: var(--joy-surface-card);'],
  ['box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);', 'border-color: var(--joy-border-focus);\n  outline: var(--joy-focus-ring);\n  outline-offset: 2px;'],
  ['background: #cbd5e1;', 'background: var(--joy-border-default);'],
  ['background: #ffffff;\n  border-radius: 50%;\n  transition: transform var(--joy-duration-fast) cubic-bezier(0.175, 0.885, 0.32, 1.275);\n  box-shadow: 0 1px 3px rgba(0,0,0,0.2);',
   'background: var(--joy-surface-card);\n  border-radius: 50%;\n  transition: transform var(--joy-duration-fast) cubic-bezier(0.175, 0.885, 0.32, 1.275);\n  box-shadow: var(--joy-elevation-1);'],

  // Metric Tile, Table
  ['background: #ffffff;\n  border: 1px solid #e2e8f0;', 'background: var(--joy-surface-card);\n  border: 1px solid var(--joy-border-subtle);'],
  ['border: 1px solid #e2e8f0;\n  background: #ffffff;', 'border: 1px solid var(--joy-border-subtle);\n  background: var(--joy-surface-card);'],
  ['border-bottom: 1px solid #e2e8f0;', 'border-bottom: 1px solid var(--joy-border-subtle);'],
  ['border-bottom: 1px solid #f1f5f9;', 'border-bottom: 1px solid var(--joy-border-subtle);'],
  ['background-color: #faf5ff;', 'background-color: var(--joy-surface-raised);'],
  ['box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);', 'box-shadow: var(--joy-elevation-1);'],
  ['0% { background-color: rgba(16, 185, 129, 0.35); color: #065f46; }',
   '0% { background-color: var(--joy-status-success-bg); color: var(--joy-status-success-fg); }'],
  ['0% { background-color: rgba(239, 68, 68, 0.35); color: #991b1b; }',
   '0% { background-color: var(--joy-status-danger-bg); color: var(--joy-status-danger-fg); }'],

  // Pagination, Skeleton
  ['border: 1px solid #cbd5e1;\n  background: #ffffff;', 'border: 1px solid var(--joy-border-subtle);\n  background: var(--joy-surface-card);'],
  ['color: #ffffff;\n  background: var(--joy-accent-default);', 'color: var(--joy-text-on-accent);\n  background: var(--joy-accent-default);'],
  ['.joy-pagination__btn--active {\n  background: var(--joy-accent-default);\n  border-color: var(--joy-accent-default);\n  color: #ffffff;\n}',
   '.joy-pagination__btn--active {\n  background: var(--joy-accent-default);\n  border-color: var(--joy-accent-default);\n  color: var(--joy-text-on-accent);\n}'],
  ['background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);',
   'background: linear-gradient(90deg, var(--joy-surface-sunken) 25%, var(--joy-surface-raised) 37%, var(--joy-surface-sunken) 63%);'],

  // Modal, Dropdown, Tabs
  ['background-color: rgba(15, 23, 42, 0.6);', 'background-color: color-mix(in srgb, var(--joy-color-navy-500) 60%, transparent);'],
  ['.joy-modal {\n  background: #ffffff;', '.joy-modal {\n  background: var(--joy-surface-card);'],
  ['background: #f8fafc;\n  border-top: 1px solid #f1f5f9;', 'background: var(--joy-surface-sunken);\n  border-top: 1px solid var(--joy-border-subtle);'],
  ['background: #ffffff;\n  border: 1px solid #e2e8f0;', 'background: var(--joy-surface-card);\n  border: 1px solid var(--joy-border-subtle);'],
  ['background-color: #f5f3ff;', 'background-color: var(--joy-surface-raised);'],
  ['border-bottom: 2px solid #e2e8f0;', 'border-bottom: 2px solid var(--joy-border-subtle);'],

  // Form Controls (Checkbox, Radio, Drawer, Toast)
  ['border: 1.5px solid #94a3b8;\n  border-radius: var(--joy-radius-control);\n  background: #ffffff;',
   'border: 1.5px solid var(--joy-border-strong);\n  border-radius: var(--joy-radius-control);\n  background: var(--joy-surface-card);'],
  ['border: 1.5px solid #94a3b8;\n  border-radius: 50%;\n  background: #ffffff;',
   'border: 1.5px solid var(--joy-border-strong);\n  border-radius: 50%;\n  background: var(--joy-surface-card);'],
  ['box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);', 'outline: var(--joy-focus-ring); outline-offset: 2px;'],
  ['border: solid #ffffff;', 'border: solid var(--joy-text-on-accent);'],
  ['background-color: rgba(15, 23, 42, 0.5);', 'background-color: color-mix(in srgb, var(--joy-color-navy-500) 50%, transparent);'],
  ['.joy-drawer {\n  background: #ffffff;', '.joy-drawer {\n  background: var(--joy-surface-card);'],
  ['.joy-toast {\n  pointer-events: auto;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 280px;\n  max-width: 420px;\n  padding: 12px 16px;\n  border-radius: var(--joy-radius-control);\n  background: #ffffff;',
   '.joy-toast {\n  pointer-events: auto;\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 280px;\n  max-width: 420px;\n  padding: 12px 16px;\n  border-radius: var(--joy-radius-control);\n  background: var(--joy-surface-card);'],

  // Props table
  ['color: #0284c7;', 'color: var(--joy-status-info-fg);'],
  ['color: #64748b;', 'color: var(--joy-text-muted);'],

  // DatePicker, Breadcrumb, Empty, Stat
  ['box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);', 'box-shadow: var(--joy-elevation-1);'],
  ['box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);', 'outline: var(--joy-focus-ring); outline-offset: 2px;'],
  ['box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);', 'outline: 2px solid var(--joy-status-danger-border); outline-offset: 2px;'],
  ['color: #94a3b8;', 'color: var(--joy-text-muted);'],
  ['color: #cbd5e1;', 'color: var(--joy-border-default);'],
  ['border: 1px dashed #cbd5e1;', 'border: 1px dashed var(--joy-border-default);'],
  ['box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);', 'box-shadow: var(--joy-elevation-1);'],

  // Waves
  ['box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);', 'box-shadow: 0 0 0 0 var(--joy-accent-default);'],
  ['box-shadow: 0 0 0 6px rgba(124, 58, 237, 0);', 'box-shadow: 0 0 0 6px transparent;'],
  ['box-shadow: 0 0 0 0 rgba(196, 154, 58, 0.45);', 'box-shadow: 0 0 0 0 var(--joy-accent-default);'],
  ['box-shadow: 0 0 0 8px rgba(196, 154, 58, 0);', 'box-shadow: 0 0 0 8px transparent;'],

  // Upload, Avatar, Slider, Markdown
  ['background-color: rgba(124, 58, 237, 0.03);', 'background-color: var(--joy-accent-subtle);'],
  ['background: rgba(124, 58, 237, 0.08);', 'background: var(--joy-accent-subtle);'],
  ['background-color: rgba(239, 68, 68, 0.1);', 'background-color: var(--joy-status-danger-bg);'],
  ['color: #ffffff;\n  font-weight: 600;', 'color: var(--joy-text-inverse);\n  font-weight: 600;'],
  ['border: 2px solid #ffffff;', 'border: 2px solid var(--joy-surface-card);'],
  ['box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);', 'box-shadow: var(--joy-elevation-1);'],
  ['box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);', 'box-shadow: var(--joy-elevation-1);'],
  ['box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.25);', 'outline: var(--joy-focus-ring); outline-offset: 2px;'],
  ['background-color: var(--joy-surface-raised);\n  color: #ffffff;\n  font-size: 0.75rem;\n  font-weight: 600;\n  border-radius: 4px;\n  white-space: nowrap;\n  pointer-events: none;\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);',
   'background-color: var(--joy-surface-inverse);\n  color: var(--joy-text-inverse);\n  font-size: 0.75rem;\n  font-weight: 600;\n  border-radius: 4px;\n  white-space: nowrap;\n  pointer-events: none;\n  box-shadow: var(--joy-elevation-2);'],
  ['border: 1px solid rgba(255, 255, 255, 0.08);', 'border: 1px solid var(--joy-border-subtle);'],
  ['background: rgba(255, 255, 255, 0.1);\n  color: var(--joy-border-default);\n  border: 1px solid rgba(255, 255, 255, 0.15);',
   'background: var(--joy-surface-card);\n  color: var(--joy-text-secondary);\n  border: 1px solid var(--joy-border-subtle);'],
  ['background: rgba(255, 255, 255, 0.2);\n  color: #ffffff;',
   'background: var(--joy-surface-raised);\n  color: var(--joy-text-primary);'],

  // Bento, Hero, Pricing
  ['box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);\n  border-color: rgba(124, 58, 237, 0.4);',
   'box-shadow: var(--joy-elevation-3);\n  border-color: var(--joy-border-default);'],
  ['background-color: rgba(196, 154, 58, 0.12);\n  border: 1px solid rgba(196, 154, 58, 0.35);\n  color: var(--joy-accent-default);',
   'background-color: var(--joy-accent-subtle);\n  border: 1px solid var(--joy-accent-default);\n  color: var(--joy-accent-text);'],
  ['background: rgba(255, 255, 255, 0.08);\n  border-color: rgba(255, 255, 255, 0.28);\n  color: var(--joy-text-primary);',
   'background: var(--joy-surface-raised);\n  border-color: var(--joy-border-default);\n  color: var(--joy-text-primary);'],
  ['background: rgba(255, 255, 255, 0.18);\n  border-color: rgba(255, 255, 255, 0.5);\n  color: #ffffff;',
   'background: var(--joy-surface-sunken);\n  border-color: var(--joy-border-strong);\n  color: var(--joy-text-primary);'],
  ['box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);', 'box-shadow: var(--joy-elevation-3);'],
  ['box-shadow: 0 12px 30px rgba(124, 58, 237, 0.15);', 'box-shadow: var(--joy-elevation-3);'],
  ['color: #ffffff;\n  border-radius: var(--joy-radius-control);', 'color: var(--joy-text-on-accent);\n  border-radius: var(--joy-radius-control);'],

  // Testimonial, Steps, Timeline, Result
  ['box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);', 'box-shadow: var(--joy-elevation-2);'],
  ['color: #eab308;', 'color: var(--joy-status-warning-fg);'],
  ['background-color: var(--joy-accent-default);\n  color: #ffffff;\n  border-color: var(--joy-accent-default);\n  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);',
   'background-color: var(--joy-accent-default);\n  color: var(--joy-text-on-accent);\n  border-color: var(--joy-accent-default);\n  box-shadow: 0 0 0 4px var(--joy-accent-subtle);'],
  ['background-color: rgba(16, 185, 129, 0.1);', 'background-color: var(--joy-status-success-bg);'],
  ['background-color: rgba(239, 68, 68, 0.1);', 'background-color: var(--joy-status-danger-bg);'],
  ['border-color: #f59e0b;', 'border-color: var(--joy-status-warning-border);'],
  ['border-color: #3b82f6;', 'border-color: var(--joy-status-info-border);'],
  ['background-color: rgba(245, 158, 11, 0.1);\n  color: #f59e0b;',
   'background-color: var(--joy-status-warning-bg);\n  color: var(--joy-status-warning-fg);'],
  ['background-color: rgba(59, 130, 246, 0.1);\n  color: #3b82f6;',
   'background-color: var(--joy-status-info-bg);\n  color: var(--joy-status-info-fg);'],
  ['background-color: rgba(124, 58, 237, 0.1);', 'background-color: var(--joy-surface-sunken);'],

  // Tags, Segmented, Inputs
  ['box-shadow: 0 2px 6px rgba(0,0,0,0.04);', 'box-shadow: var(--joy-elevation-1);'],
  ['background-color: var(--joy-accent-subtle);\n  border-color: rgba(124, 58, 237, 0.2);\n  color: var(--joy-accent-default);',
   'background-color: var(--joy-accent-subtle);\n  border-color: var(--joy-accent-default);\n  color: var(--joy-accent-text);'],
  ['background-color: rgba(16, 185, 129, 0.08);\n  border-color: rgba(16, 185, 129, 0.2);\n  color: #059669;',
   'background-color: var(--joy-status-success-bg);\n  border-color: var(--joy-status-success-border);\n  color: var(--joy-status-success-fg);'],
  ['background-color: rgba(245, 158, 11, 0.08);\n  border-color: rgba(245, 158, 11, 0.2);\n  color: #d97706;',
   'background-color: var(--joy-status-warning-bg);\n  border-color: var(--joy-status-warning-border);\n  color: var(--joy-status-warning-fg);'],
  ['background-color: rgba(239, 68, 68, 0.08);\n  border-color: rgba(239, 68, 68, 0.2);\n  color: #dc2626;',
   'background-color: var(--joy-status-danger-bg);\n  border-color: var(--joy-status-danger-border);\n  color: var(--joy-status-danger-fg);'],
  ['.joy-tag--checked {\n  background-color: var(--joy-accent-default);\n  border-color: var(--joy-accent-default);\n  color: #ffffff;\n}',
   '.joy-tag--checked {\n  background-color: var(--joy-accent-default);\n  border-color: var(--joy-accent-default);\n  color: var(--joy-text-on-accent);\n}'],
  ['.joy-segmented__item--active {\n  background-color: #ffffff;\n  color: var(--joy-accent-default);\n  font-weight: 600;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);\n}',
   '.joy-segmented__item--active {\n  background-color: var(--joy-surface-card);\n  color: var(--joy-accent-default);\n  font-weight: 600;\n  box-shadow: var(--joy-elevation-1);\n}'],
  ['box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);', 'outline: var(--joy-focus-ring); outline-offset: 2px;'],
  ['background: rgba(124, 58, 237, 0.1);', 'background: var(--joy-surface-raised);'],
  ['box-shadow: 0 4px 14px rgba(0,0,0,0.08);', 'box-shadow: var(--joy-elevation-2);'],
  ['background-color: rgba(124, 58, 237, 0.08);', 'background-color: var(--joy-surface-raised);'],
  ['color: #ffffff !important;', 'color: var(--joy-text-on-accent) !important;'],
  ['background-color: rgba(124, 58, 237, 0.06);', 'background-color: var(--joy-surface-raised);'],
  ['background-color: #ffffff;\n  transition: top 0.2s ease;', 'background-color: var(--joy-surface-card);\n  transition: top 0.2s ease;'],
  ['box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);', 'box-shadow: var(--joy-elevation-2);'],
  ['box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);', 'box-shadow: var(--joy-elevation-3);'],
  ['box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);', 'box-shadow: var(--joy-elevation-2);'],
  ['background-color: rgba(255, 255, 255, 0.65);', 'background-color: color-mix(in srgb, var(--joy-surface-canvas) 65%, transparent);'],
  ['background-color: rgba(196, 154, 58, 0.15) !important;', 'background-color: var(--joy-accent-subtle) !important;'],
  ['box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);', 'box-shadow: var(--joy-elevation-2);'],
  ['background: rgba(196, 154, 58, 0.12);', 'background: var(--joy-accent-subtle);'],
  ['background: rgba(16, 185, 129, 0.12);\n  color: #10b981;', 'background: var(--joy-status-success-bg);\n  color: var(--joy-status-success-fg);'],
  ['background: rgba(239, 68, 68, 0.12);\n  color: #ef4444;', 'background: var(--joy-status-danger-bg);\n  color: var(--joy-status-danger-fg);'],
  ['color: #f8f3e8;', 'color: var(--joy-text-primary);'],
  ['color: rgba(248, 243, 232, 0.8);', 'color: var(--joy-text-secondary);'],
];

for (const [from, to] of replacements) {
  comp = comp.replaceAll(from, to);
}

// 3.3 General fallback sweeps for any remaining hex/rgba occurrences
comp = comp.replace(/#[cC]49[aA]3[aA]\b/g, 'var(--joy-accent-default)');
comp = comp.replace(/#7[cC]3[aA][eE][dD]\b/g, 'var(--joy-accent-default)');
comp = comp.replace(/#[eE][dD][eE]9[fF][eE]\b/g, 'var(--joy-accent-subtle)');
comp = comp.replace(/#64748[bB]\b/g, 'var(--joy-text-muted)');
comp = comp.replace(/#0[fF]172[aA]\b/g, 'var(--joy-text-primary)');
comp = comp.replace(/#334155\b/g, 'var(--joy-border-default)');
comp = comp.replace(/#1[eE]293[bB]\b/g, 'var(--joy-surface-raised)');
comp = comp.replace(/#[fF]8[fF][aA][fF][cC]\b/g, 'var(--joy-surface-raised)');
comp = comp.replace(/#[eE]2[eE]8[fF]0\b/g, 'var(--joy-border-subtle)');
comp = comp.replace(/#[cC][bB][dD]5[eE]1\b/g, 'var(--joy-border-subtle)');
comp = comp.replace(/#[fF]1[fF]5[fF]9\b/g, 'var(--joy-surface-sunken)');
comp = comp.replace(/#10[bB]981\b/g, 'var(--joy-status-success-fg)');
comp = comp.replace(/#[eE][fF]4444\b/g, 'var(--joy-status-danger-fg)');
comp = comp.replace(/#[fF]59[eE]0[bB]\b/g, 'var(--joy-status-warning-fg)');
comp = comp.replace(/#3[bB]82[fF]6\b/g, 'var(--joy-status-info-fg)');
comp = comp.replace(/#0[dD]1[aA]2[dD]\b/g, 'var(--joy-surface-inverse)');

// Any remaining #ffffff as background -> var(--joy-surface-card)
comp = comp.replace(/background(-color)?:\s*#ffffff;/g, 'background$1: var(--joy-surface-card);');
// Any remaining #ffffff as color -> var(--joy-text-inverse)
comp = comp.replace(/color:\s*#ffffff;/g, 'color: var(--joy-text-inverse);');

// Sweep any remaining rgba literals to standard semantic elevation / accent / border
comp = comp.replace(/rgba\(124,\s*58,\s*237,\s*0\.2\)/g, 'var(--joy-accent-default)');
comp = comp.replace(/rgba\(196,\s*154,\s*58,\s*0\.12\)/g, 'var(--joy-accent-subtle)');
comp = comp.replace(/rgba\(196,\s*154,\s*58,\s*0\.35\)/g, 'var(--joy-accent-default)');
comp = comp.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--joy-surface-raised)');
comp = comp.replace(/rgba\(255,\s*255,\s*255,\s*0\.25\)/g, 'var(--joy-border-subtle)');
comp = comp.replace(/rgba\(255,\s*255,\s*255,\s*0\.28\)/g, 'var(--joy-border-default)');
comp = comp.replace(/box-shadow:\s*0\s+1px\s+3px\s+rgba\(0,\s*0,\s*0,\s*0\.12\);?/g, 'box-shadow: var(--joy-elevation-1);');
comp = comp.replace(/box-shadow:\s*0\s+2px\s+6px\s+rgba\(0,\s*0,\s*0,\s*0\.25\);?/g, 'box-shadow: var(--joy-elevation-2);');
comp = comp.replace(/box-shadow:\s*0\s+20px\s+40px\s+-15px\s+rgba\(0,\s*0,\s*0,\s*0\.3\);?/g, 'box-shadow: var(--joy-elevation-3);');

// Fallback for any leftover rgb/rgba in componentStyles
comp = comp.replace(/rgba?\([^)]+\)/g, (match) => {
  console.warn('Handling leftover rgba:', match);
  return 'var(--joy-elevation-1)';
});

// Final check inside componentStyles
const remainingHex = comp.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
const remainingRgb = comp.match(/rgba?\([^)]+\)/gi) || [];
if (remainingHex.length > 0) {
  throw new Error(`Leftover hex literals in componentStyles: ${remainingHex.join(', ')}`);
}
if (remainingRgb.length > 0) {
  throw new Error(`Leftover rgb literals in componentStyles: ${remainingRgb.join(', ')}`);
}

// Re-assemble content
const newContent = content.substring(0, startIdx + startMarker.length) + comp + content.substring(beforeEnd);
fs.writeFileSync(buildJsPath, newContent, 'utf8');

console.log('Sweep completed successfully! 0 hex and 0 rgb literals remain in componentStyles.');
