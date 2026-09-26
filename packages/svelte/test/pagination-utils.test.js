import test from 'node:test';
import assert from 'node:assert';
import { pageWindow, pageItems, clampPage, pageCount } from '../src/lib/pagination-utils.ts';

const S = 'start-ellipsis';
const E = 'end-ellipsis';

test('pageWindow returns every page when the total fits the window', () => {
  assert.deepStrictEqual(pageWindow(1, 1), [1]);
  assert.deepStrictEqual(pageWindow(3, 5), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(pageWindow(4, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test('pageWindow windows a large total with ellipses and a constant 7 slots', () => {
  assert.deepStrictEqual(pageWindow(1, 100), [1, 2, 3, 4, 5, E, 100]);
  assert.deepStrictEqual(pageWindow(4, 100), [1, 2, 3, 4, 5, E, 100]);
  assert.deepStrictEqual(pageWindow(5, 100), [1, S, 4, 5, 6, E, 100]);
  assert.deepStrictEqual(pageWindow(50, 100), [1, S, 49, 50, 51, E, 100]);
  assert.deepStrictEqual(pageWindow(96, 100), [1, S, 95, 96, 97, E, 100]);
  assert.deepStrictEqual(pageWindow(97, 100), [1, S, 96, 97, 98, 99, 100]);
  assert.deepStrictEqual(pageWindow(100, 100), [1, S, 96, 97, 98, 99, 100]);
  for (let c = 1; c <= 100; c++) assert.strictEqual(pageWindow(c, 100).length, 7, `page ${c} keeps 7 slots`);
});

test('pageWindow never elides a single page and always keeps the current page', () => {
  for (const total of [8, 9, 10, 25, 100]) {
    for (let c = 1; c <= total; c++) {
      const w = pageWindow(c, total);
      assert.ok(w.includes(c), `total ${total}: current ${c} is shown`);
      assert.strictEqual(w[0], 1);
      assert.strictEqual(w[w.length - 1], total);
      const nums = w.filter((x) => typeof x === 'number');
      for (let i = 1; i < nums.length; i++) assert.ok(nums[i] > nums[i - 1], 'ascending, no duplicates');
      w.forEach((x, i) => {
        if (typeof x === 'number') return;
        assert.ok(w[i + 1] - w[i - 1] >= 3, `total ${total} page ${c}: an ellipsis hides at least two pages`);
      });
    }
  }
});

test('pageWindow honours siblings and clamps bad input', () => {
  assert.deepStrictEqual(pageWindow(50, 100, 2), [1, S, 48, 49, 50, 51, 52, E, 100]);
  assert.deepStrictEqual(pageWindow(50, 100, 0), [1, S, 50, E, 100]);
  assert.deepStrictEqual(pageWindow(0, 20), pageWindow(1, 20));
  assert.deepStrictEqual(pageWindow(999, 20), pageWindow(20, 20));
  assert.deepStrictEqual(pageWindow(NaN, NaN), [1]);
  assert.deepStrictEqual(pageWindow(1, 0), [1]);
  assert.deepStrictEqual(pageWindow(1, -5), [1]);
});

test('pageItems compact rule shows only the current page, clamped', () => {
  assert.deepStrictEqual(pageItems(4, 100, true), [4]);
  assert.deepStrictEqual(pageItems(400, 100, true), [100]);
  assert.deepStrictEqual(pageItems(0, 100, true), [1]);
  assert.deepStrictEqual(pageItems(NaN, 100, true), [1]);
  assert.deepStrictEqual(pageItems(4, 100, false), pageWindow(4, 100));
});

test('clampPage keeps current inside [1, totalPages] and survives NaN/negative/oversized input', () => {
  assert.strictEqual(clampPage(3, 10), 3);
  assert.strictEqual(clampPage(0, 10), 1);
  assert.strictEqual(clampPage(-4, 10), 1);
  assert.strictEqual(clampPage(50, 30), 30);
  assert.strictEqual(clampPage(NaN, 30), 1);
  assert.strictEqual(clampPage(Infinity, 30), 1);
  assert.strictEqual(clampPage(2.7, 30), 2);
  assert.strictEqual(clampPage(5, 0), 1);
  assert.strictEqual(clampPage(5, NaN), 1);
  assert.strictEqual(clampPage(5, 3.9), 3);
});

test('pageCount is at least 1 and never NaN/Infinity', () => {
  assert.strictEqual(pageCount(100, 10), 10);
  assert.strictEqual(pageCount(101, 10), 11);
  assert.strictEqual(pageCount(0, 10), 1);
  assert.strictEqual(pageCount(-5, 10), 1);
  assert.strictEqual(pageCount(NaN, 10), 1);
  assert.strictEqual(pageCount(50, 0), 1);
  assert.strictEqual(pageCount(50, NaN), 1);
});
