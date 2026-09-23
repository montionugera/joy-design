import test from 'node:test';
import assert from 'node:assert';
import {
  SPLIT_STEP,
  SPLIT_STEP_LARGE,
  barOrientation,
  clampSplit,
  resolveBounds,
  effectiveLayout,
  splitFromPointer,
  splitKeyNext
} from '../src/splitter-utils.ts';

test('clampSplit keeps a value inside [min, max]', () => {
  assert.strictEqual(clampSplit(50, 10, 90), 50);
  assert.strictEqual(clampSplit(5, 10, 90), 10);
  assert.strictEqual(clampSplit(95, 10, 90), 90);
  assert.strictEqual(clampSplit(10, 10, 90), 10);
  assert.strictEqual(clampSplit(90, 10, 90), 90);
});

test('clampSplit edge cases: NaN, infinities, reversed and out-of-range bounds', () => {
  assert.strictEqual(clampSplit(NaN, 10, 90), 50, 'NaN falls back to the middle of the range');
  assert.strictEqual(clampSplit(Infinity, 10, 90), 90);
  assert.strictEqual(clampSplit(-Infinity, 10, 90), 10);
  assert.strictEqual(clampSplit(50, 90, 10), 50, 'reversed bounds are repaired, not thrown on');
  assert.strictEqual(clampSplit(5, 90, 10), 10);
  assert.strictEqual(clampSplit(150, -20, 300), 100, 'bounds are limited to 0..100');
  assert.strictEqual(clampSplit(-5, -20, 300), 0);
  assert.strictEqual(clampSplit(50, NaN, NaN), 50, 'non-finite bounds become 0..100');
  assert.strictEqual(clampSplit(30, 40, 40), 40, 'min == max pins the value');
});

test('effectiveLayout stacks the panes on a narrow viewport and otherwise keeps the prop', () => {
  assert.strictEqual(effectiveLayout('horizontal', false), 'horizontal');
  assert.strictEqual(effectiveLayout('horizontal', true), 'vertical');
  assert.strictEqual(effectiveLayout('vertical', false), 'vertical');
  assert.strictEqual(effectiveLayout('vertical', true), 'vertical');
});

test('barOrientation is perpendicular to the split axis', () => {
  assert.strictEqual(barOrientation('horizontal'), 'vertical');
  assert.strictEqual(barOrientation('vertical'), 'horizontal');
});

test('splitFromPointer converts a pointer offset to a clamped percentage', () => {
  assert.strictEqual(splitFromPointer(400, 800, 10, 90), 50);
  assert.strictEqual(splitFromPointer(200, 800, 10, 90), 25);
  assert.strictEqual(splitFromPointer(-30, 800, 10, 90), 10, 'before the start edge clamps to min');
  assert.strictEqual(splitFromPointer(900, 800, 10, 90), 90, 'past the end edge clamps to max');
  assert.strictEqual(splitFromPointer(150, 300, 0, 100), 50);
});

test('splitFromPointer returns null when there is nothing to compute', () => {
  assert.strictEqual(splitFromPointer(10, 0, 10, 90), null, 'zero-size container');
  assert.strictEqual(splitFromPointer(10, -5, 10, 90), null);
  assert.strictEqual(splitFromPointer(NaN, 800, 10, 90), null);
  assert.strictEqual(splitFromPointer(10, NaN, 10, 90), null);
  assert.strictEqual(splitFromPointer(Infinity, 800, 10, 90), null);
});

test('splitKeyNext: side-by-side panes use Left/Right, by SPLIT_STEP or SPLIT_STEP_LARGE', () => {
  assert.strictEqual(SPLIT_STEP, 5);
  assert.strictEqual(SPLIT_STEP_LARGE, 10);
  assert.strictEqual(splitKeyNext('ArrowRight', 50, 'horizontal', 10, 90), 55);
  assert.strictEqual(splitKeyNext('ArrowLeft', 50, 'horizontal', 10, 90), 45);
  assert.strictEqual(splitKeyNext('ArrowRight', 50, 'horizontal', 10, 90, true), 60);
  assert.strictEqual(splitKeyNext('ArrowLeft', 50, 'horizontal', 10, 90, true), 40);
  assert.strictEqual(splitKeyNext('ArrowUp', 50, 'horizontal', 10, 90), null, 'Up/Down are not the split axis');
  assert.strictEqual(splitKeyNext('ArrowDown', 50, 'horizontal', 10, 90), null);
});

test('splitKeyNext: stacked panes use Up/Down', () => {
  assert.strictEqual(splitKeyNext('ArrowDown', 50, 'vertical', 10, 90), 55);
  assert.strictEqual(splitKeyNext('ArrowUp', 50, 'vertical', 10, 90), 45);
  assert.strictEqual(splitKeyNext('ArrowDown', 50, 'vertical', 10, 90, true), 60);
  assert.strictEqual(splitKeyNext('ArrowLeft', 50, 'vertical', 10, 90), null);
  assert.strictEqual(splitKeyNext('ArrowRight', 50, 'vertical', 10, 90), null);
});

test('splitKeyNext: Home/End jump to min/max on either axis, and stepping never leaves the range', () => {
  for (const layout of ['horizontal', 'vertical']) {
    assert.strictEqual(splitKeyNext('Home', 50, layout, 10, 90), 10);
    assert.strictEqual(splitKeyNext('End', 50, layout, 10, 90), 90);
  }
  assert.strictEqual(splitKeyNext('ArrowRight', 88, 'horizontal', 10, 90), 90, 'clamped at max');
  assert.strictEqual(splitKeyNext('ArrowRight', 90, 'horizontal', 10, 90), 90, 'already at max stays put (still handled)');
  assert.strictEqual(splitKeyNext('ArrowLeft', 12, 'horizontal', 10, 90), 10, 'clamped at min');
  assert.strictEqual(splitKeyNext('ArrowLeft', NaN, 'horizontal', 10, 90), 50, 'NaN current falls back to the middle of the range');
});

test('splitKeyNext returns null for keys it does not handle, so callers only preventDefault when handled', () => {
  for (const key of ['Enter', ' ', 'Tab', 'a', 'PageUp', 'Escape', 'Shift']) {
    assert.strictEqual(splitKeyNext(key, 50, 'horizontal', 10, 90), null, key);
    assert.strictEqual(splitKeyNext(key, 50, 'vertical', 10, 90), null, key);
  }
});

test('resolveBounds returns the ordered, finite, 0..100 pair that clampSplit enforces (for aria-valuemin/max)', () => {
  assert.deepStrictEqual(resolveBounds(10, 90), [10, 90]);
  assert.deepStrictEqual(resolveBounds(90, 10), [10, 90], 'reversed bounds are swapped');
  assert.deepStrictEqual(resolveBounds(-5, 300), [0, 100], 'out-of-range bounds are limited to 0..100');
  assert.deepStrictEqual(resolveBounds(NaN, NaN), [0, 100], 'non-finite bounds become 0..100');
  assert.deepStrictEqual(resolveBounds(NaN, 40), [0, 40]);
  assert.deepStrictEqual(resolveBounds(40, 40), [40, 40]);
  for (const [min, max] of [[90, 10], [-5, 300], [NaN, 40]]) {
    const [lo, hi] = resolveBounds(min, max);
    assert.strictEqual(clampSplit(-1000, min, max), lo, 'clampSplit floor is the reported min');
    assert.strictEqual(clampSplit(1000, min, max), hi, 'clampSplit ceiling is the reported max');
  }
});
