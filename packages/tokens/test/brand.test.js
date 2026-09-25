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
