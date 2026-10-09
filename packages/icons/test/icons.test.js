import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('@montionugera/joy-icons exports dual Svelte 5 and React 19 suites', () => {
  const indexFile = fs.readFileSync(path.resolve('./src/index.ts'), 'utf8');
  assert.ok(indexFile.includes('TrendingUp'), 'Index must export TrendingUp');
  assert.ok(indexFile.includes('CandlestickChart'), 'Index must export CandlestickChart');
  assert.ok(indexFile.includes('Wallet'), 'Index must export Wallet');
  assert.ok(indexFile.includes('Zap'), 'Index must export Zap');
  assert.ok(indexFile.includes('ChevronDown'), 'Index must export ChevronDown');
  assert.ok(indexFile.includes('Layers'), 'Index must export Layers');
  assert.ok(indexFile.includes('Sparkles'), 'Index must export Sparkles');
  assert.ok(indexFile.includes('Server'), 'Index must export Server');
  assert.ok(indexFile.includes('Database'), 'Index must export Database');
  assert.ok(indexFile.includes('Terminal'), 'Index must export Terminal');
  assert.ok(indexFile.includes('CreditCard'), 'Index must export CreditCard');
  assert.ok(indexFile.includes('Play'), 'Index must export Play');
  assert.ok(indexFile.includes('Pause'), 'Index must export Pause');

  const svelteIcon = fs.readFileSync(path.resolve('./src/TrendingUp.svelte'), 'utf8');
  assert.ok(svelteIcon.includes('<svg'), 'TrendingUp must contain svg element');
  assert.ok(svelteIcon.includes('$props'), 'TrendingUp must use Svelte 5 $props()');

  const svelteServer = fs.readFileSync(path.resolve('./src/Server.svelte'), 'utf8');
  assert.ok(svelteServer.includes('<svg'), 'Server must contain svg element');
  assert.ok(svelteServer.includes('$props'), 'Server must use Svelte 5 $props()');

  const reactEntry = fs.readFileSync(path.resolve('./src/react.ts'), 'utf8');
  assert.ok(reactEntry.includes('TrendingUp'), 'React entry must export TrendingUp');
  assert.ok(reactEntry.includes('Wallet'), 'React entry must export Wallet');
  assert.ok(reactEntry.includes('Server'), 'React entry must export Server');
  assert.ok(reactEntry.includes('Database'), 'React entry must export Database');
  assert.ok(reactEntry.includes('Play'), 'React entry must export Play');
  assert.ok(reactEntry.includes('Pause'), 'React entry must export Pause');

  const reactIcon = fs.readFileSync(path.resolve('./src/react/TrendingUp.tsx'), 'utf8');
  assert.ok(reactIcon.includes('React.FC'), 'React icon must be functional component');
  assert.ok(reactIcon.includes('strokeWidth'), 'React icon must use camelCase strokeWidth');

  const reactServer = fs.readFileSync(path.resolve('./src/react/Server.tsx'), 'utf8');
  assert.ok(reactServer.includes('React.FC'), 'React Server icon must be functional component');
  assert.ok(reactServer.includes('strokeWidth'), 'React Server icon must use camelCase strokeWidth');
  assert.ok(reactServer.includes('aria-hidden="true"'), 'React icon must have aria-hidden by default');
  assert.ok(reactServer.includes('focusable="false"'), 'React icon must have focusable=false by default');

  assert.ok(svelteServer.includes('aria-hidden="true"'), 'Svelte icon must have aria-hidden by default');
  assert.ok(svelteServer.includes('focusable="false"'), 'Svelte icon must have focusable=false by default');

  // Provenance verification
  const provenance = fs.readFileSync(path.resolve('./PROVENANCE.md'), 'utf8');
  assert.ok(provenance.includes('Provenance & Attribution Manifest'), 'PROVENANCE.md must exist and document lineage');
  assert.ok(provenance.includes('Lucide Icons'), 'Provenance must cite Lucide upstream');
  assert.ok(provenance.includes('Feather Icons'), 'Provenance must cite Feather upstream');
});


test('React icon sources contain no unbraced JSX attribute values (e.g. stroke=color is a syntax error in a real bundler)', () => {
  const dir = path.resolve('./src/react');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));
  assert.ok(files.length > 100, 'expected the full React icon set');
  // An attribute followed directly by a bare identifier: name=identifier (quoted strings and {expressions} are fine).
  const bare = /[\s"'}]([A-Za-z][\w:-]*)=[A-Za-z_$]/;
  const offenders = files.filter((f) => bare.test(fs.readFileSync(path.join(dir, f), 'utf8')));
  assert.deepStrictEqual(offenders, [], `unbraced attribute values in: ${offenders.join(', ')}`);
});
