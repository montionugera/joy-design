import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('@joymify/icons exports vector icon components and index', () => {
  const indexFile = fs.readFileSync(path.resolve('./src/index.ts'), 'utf8');
  assert.ok(indexFile.includes('ArrowLeft'), 'Index must export ArrowLeft');
  assert.ok(indexFile.includes('Search'), 'Index must export Search');
  assert.ok(indexFile.includes('User'), 'Index must export User');

  const arrow = fs.readFileSync(path.resolve('./src/ArrowLeft.svelte'), 'utf8');
  assert.ok(arrow.includes('<svg'), 'ArrowLeft must contain svg element');
  assert.ok(arrow.includes('$props'), 'ArrowLeft must use Svelte 5 $props()');
});
