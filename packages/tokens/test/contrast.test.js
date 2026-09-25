import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrastRatio } from '../scripts/color.mjs';
import { parseCssTokens } from './helpers/css-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('WCAG 2.2 AA Contrast Gate for Semantic Tokens', () => {
  const cssPath = path.resolve(__dirname, '../dist/theme.css');
  assert.ok(fs.existsSync(cssPath), 'dist/theme.css must exist before running contrast tests');
  const css = fs.readFileSync(cssPath, 'utf8');

  const { light, dark, duplicateDarkVars, mediaDarkVars } = parseCssTokens(css);

  // Assertion: no --joy-* variable may be declared more than once across dark blocks
  assert.strictEqual(
    duplicateDarkVars.length,
    0,
    `Duplicate --joy-* variable declarations found in dark mode blocks:\n${duplicateDarkVars.join('\n')}`
  );

  // Assertion: media prefers-color-scheme: dark must be populated
  assert.ok(
    Object.keys(mediaDarkVars).length > 0,
    'media prefers-color-scheme: dark block must contain semantic token declarations'
  );

  const testPairs = [
    // Light text on surfaces
    { fg: '--joy-text-primary', bg: '--joy-surface-canvas', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-primary', bg: '--joy-surface-card', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-primary', bg: '--joy-surface-raised', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-secondary', bg: '--joy-surface-canvas', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-secondary', bg: '--joy-surface-card', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-muted', bg: '--joy-surface-canvas', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-muted', bg: '--joy-surface-card', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-link', bg: '--joy-surface-canvas', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-link', bg: '--joy-surface-card', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-accent-text', bg: '--joy-surface-canvas', theme: 'Light', role: 'Accent Text / Surface', min: 4.5 },
    { fg: '--joy-accent-text', bg: '--joy-surface-card', theme: 'Light', role: 'Accent Text / Surface', min: 4.5 },
    { fg: '--joy-text-on-accent', bg: '--joy-accent-default', theme: 'Light', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-on-accent', bg: '--joy-accent-gradient-end', theme: 'Light', role: 'Text / Hero Accent', min: 4.5 },

    // Light UI and borders
    { fg: '--joy-border-default', bg: '--joy-surface-canvas', theme: 'Light', role: 'Border / Surface', min: 3.0 },
    { fg: '--joy-border-default', bg: '--joy-surface-card', theme: 'Light', role: 'Border / Surface', min: 3.0 },
    { fg: '--joy-focus-ring', bg: '--joy-surface-canvas', theme: 'Light', role: 'Focus Ring', min: 3.0 },
    { fg: '--joy-focus-ring', bg: '--joy-surface-card', theme: 'Light', role: 'Focus Ring', min: 3.0 },

    // Light status
    { fg: '--joy-status-success-fg', bg: '--joy-status-success-bg', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-success-fg', bg: '--joy-surface-canvas', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-warning-fg', bg: '--joy-status-warning-bg', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-warning-fg', bg: '--joy-surface-canvas', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-fg', bg: '--joy-status-danger-bg', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-bg', bg: '--joy-status-danger-fg', theme: 'Light', role: 'Status Surface / Text', min: 4.5 },
    { fg: '--joy-status-danger-fg', bg: '--joy-surface-canvas', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-solid-fg', bg: '--joy-status-danger-solid-bg', theme: 'Light', role: 'Danger Solid Button', min: 4.5 },
    { fg: '--joy-text-disabled', bg: '--joy-surface-disabled', theme: 'Light', role: 'Disabled Text / Surface', min: 4.5 },
    { fg: '--joy-status-info-fg', bg: '--joy-status-info-bg', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-info-fg', bg: '--joy-surface-canvas', theme: 'Light', role: 'Status Text / Surface', min: 4.5 },

    // Dark text on surfaces
    { fg: '--joy-text-primary', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-primary', bg: '--joy-surface-card', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-primary', bg: '--joy-surface-raised', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-secondary', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-secondary', bg: '--joy-surface-card', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-muted', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-muted', bg: '--joy-surface-card', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-disabled', bg: '--joy-surface-disabled', theme: 'Dark', role: 'Disabled Text / Surface', min: 4.5 },
    { fg: '--joy-text-link', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-link', bg: '--joy-surface-card', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-accent-text', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Accent Text / Surface', min: 4.5 },
    { fg: '--joy-accent-text', bg: '--joy-surface-card', theme: 'Dark', role: 'Accent Text / Surface', min: 4.5 },
    { fg: '--joy-text-on-accent', bg: '--joy-accent-default', theme: 'Dark', role: 'Text / Surface', min: 4.5 },
    { fg: '--joy-text-on-accent', bg: '--joy-accent-gradient-end', theme: 'Dark', role: 'Text / Hero Accent', min: 4.5 },

    // Dark UI and borders
    { fg: '--joy-border-default', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Border / Surface', min: 3.0 },
    { fg: '--joy-border-default', bg: '--joy-surface-card', theme: 'Dark', role: 'Border / Surface', min: 3.0 },
    { fg: '--joy-focus-ring', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Focus Ring', min: 3.0 },
    { fg: '--joy-focus-ring', bg: '--joy-surface-card', theme: 'Dark', role: 'Focus Ring', min: 3.0 },

    // Dark status
    { fg: '--joy-status-success-fg', bg: '--joy-status-success-bg', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-success-fg', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-warning-fg', bg: '--joy-status-warning-bg', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-warning-fg', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-fg', bg: '--joy-status-danger-bg', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-bg', bg: '--joy-status-danger-fg', theme: 'Dark', role: 'Status Surface / Text', min: 4.5 },
    { fg: '--joy-status-danger-fg', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-danger-solid-fg', bg: '--joy-status-danger-solid-bg', theme: 'Dark', role: 'Danger Solid Button', min: 4.5 },
    { fg: '--joy-status-info-fg', bg: '--joy-status-info-bg', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-info-fg', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },

    // F-043 brand
    { fg: '--joy-brand-mark-on-tile', bg: '--joy-brand-tile', theme: 'Light', role: 'Brand mark / Tile', min: 3.0 },
    { fg: '--joy-brand-mark', bg: '--joy-surface-canvas', theme: 'Light', role: 'Brand mark / Canvas', min: 3.0 },
    { fg: '--joy-brand-ink', bg: '--joy-surface-canvas', theme: 'Light', role: 'Brand ink / Canvas', min: 4.5 },
    { fg: '--joy-brand-ink-on-tile', bg: '--joy-brand-tile', theme: 'Light', role: 'Brand ink / Tile', min: 4.5 },
    { fg: '--joy-brand-mark-on-tile', bg: '--joy-brand-tile', theme: 'Dark', role: 'Brand mark / Tile', min: 3.0 },
    { fg: '--joy-brand-mark', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Brand mark / Canvas', min: 3.0 },
    { fg: '--joy-brand-ink', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Brand ink / Canvas', min: 4.5 },
    { fg: '--joy-brand-ink-on-tile', bg: '--joy-brand-tile', theme: 'Dark', role: 'Brand ink / Tile', min: 4.5 },
  ];

  const results = [];
  const failures = [];

  for (const item of testPairs) {
    const store = item.theme === 'Light' ? light : dark;
    const fgVal = store[item.fg];
    const bgVal = store[item.bg];

    if (!fgVal || !bgVal) {
      failures.push(`Missing token: ${item.fg} (${fgVal}) or ${item.bg} (${bgVal}) in ${item.theme} theme`);
      continue;
    }

    const ratio = contrastRatio(fgVal, bgVal);
    const pass = ratio >= item.min;
    results.push({
      pair: `${item.fg} (${fgVal}) on ${item.bg} (${bgVal})`,
      theme: item.theme,
      role: item.role,
      ratio: `${ratio.toFixed(2)}:1`,
      req: `≥ ${item.min}:1`,
      status: pass ? 'PASS' : '**FAIL**'
    });

    if (!pass) {
      failures.push(
        `${item.theme} ${item.role} failure: ${item.fg} (${fgVal}) on ${item.bg} (${bgVal}) ratio ${ratio.toFixed(2)}:1 < ${item.min}:1`
      );
    }
  }

  // Generate markdown table
  let md = '| Pair | Theme | Role | Contrast Ratio | WCAG AA Requirement | Pass/Fail |\n';
  md += '|---|---|---|---|---|---|\n';
  for (const r of results) {
    md += `| ${r.pair} | ${r.theme} | ${r.role} | ${r.ratio} | ${r.req} | ${r.status} |\n`;
  }

  // Write contrast-table-after.md to the research folder
  const searchDirs = [
    path.resolve(__dirname, '../../../.claude/refined_backlog/F-036-wave-1-semantic-token-foundation-light-d/research'),
    path.resolve(__dirname, '../../research'),
    path.resolve(process.cwd(), 'research')
  ];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, 'contrast-table-after.md'), md, 'utf8');
      break;
    }
  }

  assert.strictEqual(failures.length, 0, `WCAG Contrast Gate failures:\n${failures.join('\n')}`);
});
