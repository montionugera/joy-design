import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('compiled tokens exist and contain critical joy variables', () => {
  const css = fs.readFileSync(path.resolve('./dist/theme.css'), 'utf8');
  assert.ok(css.includes('--joy-color-brand-primary: #7c3aed;'), 'brand primary must exist');
  assert.ok(css.includes('--joy-spacing-4: 16px;'), 'spacing-4 must exist');
  assert.ok(css.includes('--joy-radius-md: 8px;'), 'radius-md must exist');
  assert.ok(css.includes('--joy-motion-duration-fast: 150ms;'), 'motion fast duration must exist');
  assert.ok(css.includes('--joy-shadow-overlay:'), 'shadow overlay must exist');
  assert.ok(css.includes('.joy-modal'), 'modal styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-dropdown'), 'dropdown styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-tabs'), 'tabs styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-tooltip'), 'tooltip styles must be compiled into theme.css');
});
