import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolveRef } from '../build.js';
import { hexToOklch } from '../scripts/color.mjs';

const tokensPath = path.resolve('src/tokens.json');

test('dark surfaces use distinct navy steps rather than a near-black literal', () => {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const surface = tokens.semantic.dark.surface;

  assert.equal(surface.sunken.value, '{color.navy.950}');
  assert.equal(surface.canvas.value, '{color.navy.900}');
  assert.equal(surface.card.value, '{color.navy.800}');
  assert.equal(surface.raised.value, '{color.navy.500}');
});

test('navy-950 retains a visible navy floor for sunken dark surfaces', () => {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const navy950 = tokens.color.navy['950'].value;
  const navy900 = tokens.color.navy['900'].value;

  assert.ok(hexToOklch(navy950).L >= 0.18, `${navy950} must not collapse toward black`);
  assert.ok(hexToOklch(navy950).L < hexToOklch(navy900).L, 'navy-950 must remain below navy-900');
});

test('resolveRef rejects references to a token group', () => {
  assert.throws(
    () => resolveRef('{color.navy}', { color: { navy: { '500': { value: '#14253e' } } } }),
    /does not resolve to a token value/
  );
});
