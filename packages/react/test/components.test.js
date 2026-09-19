import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('React components have correct forwardRef, props, and className bindings', () => {
  const btn = fs.readFileSync(path.resolve('./src/Button.tsx'), 'utf8');
  assert.ok(btn.includes('React.forwardRef'), 'Button must use forwardRef');
  assert.ok(btn.includes('joy-button--${variant}'), 'Button must construct variant classes');

  const metric = fs.readFileSync(path.resolve('./src/MetricTile.tsx'), 'utf8');
  assert.ok(metric.includes('MetricTileProps'), 'MetricTile must define TypeScript props');
  assert.ok(metric.includes('joy-metric-tile--${trend}'), 'MetricTile must bind trend styles');
});
