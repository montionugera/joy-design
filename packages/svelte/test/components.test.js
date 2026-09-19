import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Svelte 5 components have correct rune syntax and tokens bindings', () => {
  const btn = fs.readFileSync(path.resolve('./src/lib/Button.svelte'), 'utf8');
  assert.ok(btn.includes('$props()'), 'Button must use Svelte 5 $props()');
  assert.ok(btn.includes('--joy-color-brand-primary'), 'Button must bind --joy-color-brand-primary');

  const metric = fs.readFileSync(path.resolve('./src/lib/MetricTile.svelte'), 'utf8');
  assert.ok(metric.includes('$props()'), 'MetricTile must use Svelte 5 $props()');
  assert.ok(metric.includes('--joy-font-family-mono'), 'MetricTile must bind mono font for quant stats');
});
