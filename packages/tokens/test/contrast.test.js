import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ];
  }
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function computeContrast(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function parseCssTokens(css) {
  const lightVars = {};
  const darkVars = {};

  // Extract :root block
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (rootMatch) {
    const lines = rootMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        lightVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  // Extract [data-theme="dark"] block
  const darkMatch = css.match(/\[data-theme="dark"\]\s*\{([^}]+)\}/);
  if (darkMatch) {
    const lines = darkMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        darkVars[match[1].trim()] = match[2].trim();
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

  return { light: resolvedLight, dark: resolvedDark };
}

test('WCAG 2.2 AA Contrast Gate for Semantic Tokens', () => {
  const cssPath = path.resolve(__dirname, '../dist/theme.css');
  assert.ok(fs.existsSync(cssPath), 'dist/theme.css must exist before running contrast tests');
  const css = fs.readFileSync(cssPath, 'utf8');

  const { light, dark } = parseCssTokens(css);

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
