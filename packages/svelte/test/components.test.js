import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Svelte 5 standard library components implement Runes and enterprise contracts', () => {
  const badge = fs.readFileSync(path.resolve('./src/lib/Badge.svelte'), 'utf8');
  assert.ok(badge.includes('$props()'), 'Badge must use Svelte 5 $props()');
  assert.ok(badge.includes('joy-badge--{variant}'), 'Badge must support variants');

  const input = fs.readFileSync(path.resolve('./src/lib/Input.svelte'), 'utf8');
  assert.ok(input.includes('$bindable'), 'Input must support two-way binding');
  assert.ok(input.includes('joy-input-wrapper--error'), 'Input must support error states');

  const sw = fs.readFileSync(path.resolve('./src/lib/Switch.svelte'), 'utf8');
  assert.ok(sw.includes('role="switch"'), 'Switch must have accessible ARIA switch role');

  const tbl = fs.readFileSync(path.resolve('./src/lib/Table.svelte'), 'utf8');
  assert.ok(tbl.includes('joy-table--{density}'), 'Table must support high-density trading layouts');

  const alert = fs.readFileSync(path.resolve('./src/lib/Alert.svelte'), 'utf8');
  assert.ok(alert.includes('role="alert"'), 'Alert must have accessible role');
});
