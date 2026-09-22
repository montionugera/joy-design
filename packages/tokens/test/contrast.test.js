import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hexToRgb,
  srgbToLinear,
  relativeLuminance,
  contrastRatio as computeContrast
} from '../scripts/color.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseCssTokens(css) {
  const lightVars = {};
  const darkVars = {};
  const darkVarCounts = {};
  const duplicateDarkVars = [];

  // 1. Extract and parse all :root blocks in document order
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  let rootMatch;
  while ((rootMatch = rootRegex.exec(css)) !== null) {
    const lines = rootMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        lightVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  // 2. Extract and parse ALL [data-theme="dark"] blocks in document order (last wins)
  const darkBlockRegex = /\[data-theme="dark"\]\s*\{([^}]+)\}/g;
  let darkMatch;
  let darkBlockCount = 0;
  while ((darkMatch = darkBlockRegex.exec(css)) !== null) {
    darkBlockCount++;
    const lines = darkMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        const varName = match[1].trim();
        const varVal = match[2].trim();
        if (varName.startsWith('--joy-')) {
          darkVarCounts[varName] = (darkVarCounts[varName] || 0) + 1;
        }
        darkVars[varName] = varVal;
      }
    }
  }

  for (const [varName, count] of Object.entries(darkVarCounts)) {
    if (count > 1) {
      duplicateDarkVars.push(`${varName} (declared ${count} times in dark theme)`);
    }
  }

  // 3. Extract and parse @media (prefers-color-scheme: dark) block
  const mediaDarkRegex = /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/g;
  let mediaMatch;
  const mediaDarkVars = {};
  while ((mediaMatch = mediaDarkRegex.exec(css)) !== null) {
    const lines = mediaMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        mediaDarkVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  function resolveValue(val, store, depth = 0) {
    if (depth > 10 || !val) return val;
    val = val.trim();
    // Handle focus ring: "2px solid #xxx" or "#xxx"
    const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
    const varMatch = val.match(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/);
    if (varMatch) {
      const ref = varMatch[1];
      const fallback = varMatch[2];
      if (store[ref]) {
        return resolveValue(store[ref], store, depth + 1);
      } else if (lightVars[ref]) {
        return resolveValue(lightVars[ref], lightVars, depth + 1);
      } else if (fallback) {
        return resolveValue(fallback, store, depth + 1);
      }
    }
    if (hexMatch) {
      return hexMatch[0];
    }
    return val;
  }

  const resolveStore = (vars) => {
    const resolved = {};
    for (const k of Object.keys(vars)) {
      resolved[k] = resolveValue(vars[k], vars);
    }
    return resolved;
  };

  const resolvedLight = resolveStore(lightVars);
  // Dark inherits from light unless overridden
  const combinedDark = { ...lightVars, ...darkVars };
  const resolvedDark = resolveStore(combinedDark);

  return {
    light: resolvedLight,
    dark: resolvedDark,
    darkBlockCount,
    duplicateDarkVars,
    mediaDarkVars
  };
}

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
    { fg: '--joy-status-info-fg', bg: '--joy-status-info-bg', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
    { fg: '--joy-status-info-fg', bg: '--joy-surface-canvas', theme: 'Dark', role: 'Status Text / Surface', min: 4.5 },
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

    const ratio = computeContrast(fgVal, bgVal);
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
