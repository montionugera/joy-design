import test from 'node:test';
import assert from 'node:assert';
import { rovingNextIndex, rovingTabbableIndex } from '../src/lib/roving-utils.ts';

const none = [false, false, false, false];

test('rovingNextIndex: horizontal arrows step and wrap, vertical arrows are ignored', () => {
  assert.strictEqual(rovingNextIndex('ArrowRight', 0, none, 'horizontal'), 1);
  assert.strictEqual(rovingNextIndex('ArrowRight', 3, none, 'horizontal'), 0, 'wraps to first');
  assert.strictEqual(rovingNextIndex('ArrowLeft', 0, none, 'horizontal'), 3, 'wraps to last');
  assert.strictEqual(rovingNextIndex('ArrowLeft', 2, none, 'horizontal'), 1);
  assert.strictEqual(rovingNextIndex('ArrowDown', 0, none, 'horizontal'), -1);
  assert.strictEqual(rovingNextIndex('ArrowUp', 0, none, 'horizontal'), -1);
});

test('rovingNextIndex: vertical uses Up/Down, both accepts all four arrows', () => {
  assert.strictEqual(rovingNextIndex('ArrowDown', 1, none, 'vertical'), 2);
  assert.strictEqual(rovingNextIndex('ArrowUp', 0, none, 'vertical'), 3);
  assert.strictEqual(rovingNextIndex('ArrowRight', 1, none, 'vertical'), -1);
  for (const [k, expected] of [['ArrowRight', 2], ['ArrowDown', 2], ['ArrowLeft', 0], ['ArrowUp', 0]]) {
    assert.strictEqual(rovingNextIndex(k, 1, none, 'both'), expected, k);
  }
});

test('rovingNextIndex: Home/End work in every orientation and skip disabled items', () => {
  const d = [true, false, false, true];
  for (const o of ['horizontal', 'vertical', 'both']) {
    assert.strictEqual(rovingNextIndex('Home', 2, d, o), 1, `${o} Home`);
    assert.strictEqual(rovingNextIndex('End', 1, d, o), 2, `${o} End`);
  }
  assert.strictEqual(rovingNextIndex('ArrowRight', 2, d, 'horizontal'), 1, 'wraps past disabled last and first');
  assert.strictEqual(rovingNextIndex('ArrowLeft', 1, d, 'horizontal'), 2);
});

test('rovingNextIndex: arrows skip runs of disabled items', () => {
  const d = [false, true, true, false, false];
  assert.strictEqual(rovingNextIndex('ArrowRight', 0, d), 3);
  assert.strictEqual(rovingNextIndex('ArrowLeft', 3, d), 0);
});

test('rovingNextIndex: empty, all-disabled and unrelated keys return -1', () => {
  assert.strictEqual(rovingNextIndex('ArrowRight', 0, []), -1);
  assert.strictEqual(rovingNextIndex('Home', 0, [true, true]), -1);
  assert.strictEqual(rovingNextIndex('ArrowRight', 0, [true, true]), -1);
  assert.strictEqual(rovingNextIndex('Enter', 0, none), -1);
  assert.strictEqual(rovingNextIndex('a', 0, none), -1);
});

test('rovingNextIndex: a single enabled item stays put and an unfocused start (-1) lands on the first/last', () => {
  assert.strictEqual(rovingNextIndex('ArrowRight', 1, [true, false, true]), 1);
  assert.strictEqual(rovingNextIndex('ArrowRight', -1, none), 0);
  assert.strictEqual(rovingNextIndex('ArrowLeft', -1, none), 3);
  assert.strictEqual(rovingNextIndex('ArrowRight', 99, none), 0, 'out-of-range current is treated as unfocused');
  assert.strictEqual(rovingNextIndex('ArrowRight', NaN, none), 0);
});

test('rovingTabbableIndex: first valid enabled preferred index, else first enabled, else -1', () => {
  const d = [true, false, false, true];
  assert.strictEqual(rovingTabbableIndex(d, [2, 1]), 2);
  assert.strictEqual(rovingTabbableIndex(d, [0, 3, 2]), 2, 'disabled preferences are skipped');
  assert.strictEqual(rovingTabbableIndex(d, [-1, 9]), 1, 'out of range falls back to first enabled');
  assert.strictEqual(rovingTabbableIndex(d), 1);
  assert.strictEqual(rovingTabbableIndex([true, true], [0]), -1);
  assert.strictEqual(rovingTabbableIndex([], [0]), -1);
});
