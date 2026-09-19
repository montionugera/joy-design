import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('@joymify/icons exports dual Svelte 5 and React 19 suites', () => {
  const indexFile = fs.readFileSync(path.resolve('./src/index.ts'), 'utf8');
  assert.ok(indexFile.includes('TrendingUp'), 'Index must export TrendingUp');
  assert.ok(indexFile.includes('CandlestickChart'), 'Index must export CandlestickChart');
  assert.ok(indexFile.includes('Wallet'), 'Index must export Wallet');
  assert.ok(indexFile.includes('Zap'), 'Index must export Zap');
  assert.ok(indexFile.includes('ChevronDown'), 'Index must export ChevronDown');
  assert.ok(indexFile.includes('Layers'), 'Index must export Layers');
  assert.ok(indexFile.includes('Sparkles'), 'Index must export Sparkles');

  const svelteIcon = fs.readFileSync(path.resolve('./src/TrendingUp.svelte'), 'utf8');
  assert.ok(svelteIcon.includes('<svg'), 'TrendingUp must contain svg element');
  assert.ok(svelteIcon.includes('$props'), 'TrendingUp must use Svelte 5 $props()');

  const reactEntry = fs.readFileSync(path.resolve('./src/react.ts'), 'utf8');
  assert.ok(reactEntry.includes('TrendingUp'), 'React entry must export TrendingUp');
  assert.ok(reactEntry.includes('Wallet'), 'React entry must export Wallet');

  const reactIcon = fs.readFileSync(path.resolve('./src/react/TrendingUp.tsx'), 'utf8');
  assert.ok(reactIcon.includes('React.FC'), 'React icon must be functional component');
  assert.ok(reactIcon.includes('strokeWidth'), 'React icon must use camelCase strokeWidth');
});
