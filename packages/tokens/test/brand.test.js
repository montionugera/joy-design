import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCssTokens } from './helpers/css-tokens.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
const BRAND = ['tile', 'mark', 'mark-on-tile', 'mark-contrast', 'ink', 'ink-on-tile'].map((k) => `--joy-brand-${k}`);

test('F-043: brand vars are emitted for light and dark', () => {
  const { light, dark } = parseCssTokens(css);
  for (const v of BRAND) {
    assert.match(light[v] ?? '', /^#[0-9a-f]{6}$/i, `${v} light`);
    assert.match(dark[v] ?? '', /^#[0-9a-f]{6}$/i, `${v} dark`);
  }
});

test('F-043: display font family var is emitted', () => {
  assert.match(css, /--joy-font-family-display:\s*"Cormorant Garamond"/);
});

// Fix round 1: I1 (code-reviewer) — the shape-only test above would pass
// even if a brand var were mapped to the wrong ramp step (e.g. gold-500
// instead of gold-600). Pin each brand var to the exact primitive it must
// resolve to, by comparing against the --joy-color-* values in the same
// theme.css (primitives are declared once, in :root/light, per F-036).
test('F-043: brand vars resolve to the exact expected primitive', () => {
  const { light, dark } = parseCssTokens(css);

  const expectedLight = {
    tile: '--joy-color-navy-500',
    mark: '--joy-color-gold-600',
    'mark-on-tile': '--joy-color-gold-400',
    'mark-contrast': '--joy-color-cream-50',
    ink: '--joy-color-navy-500',
    'ink-on-tile': '--joy-color-cream-100'
  };
  const expectedDark = {
    ...expectedLight,
    mark: '--joy-color-gold-300',
    ink: '--joy-color-cream-100'
  };

  for (const [key, primitiveVar] of Object.entries(expectedLight)) {
    const brandVar = `--joy-brand-${key}`;
    assert.strictEqual(
      light[brandVar],
      light[primitiveVar],
      `light ${brandVar} should equal ${primitiveVar} (${light[primitiveVar]}), got ${light[brandVar]}`
    );
  }

  for (const [key, primitiveVar] of Object.entries(expectedDark)) {
    const brandVar = `--joy-brand-${key}`;
    assert.strictEqual(
      dark[brandVar],
      light[primitiveVar],
      `dark ${brandVar} should equal ${primitiveVar} (${light[primitiveVar]}), got ${dark[brandVar]}`
    );
  }
});
