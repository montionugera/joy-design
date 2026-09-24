import test from 'node:test';
import assert from 'node:assert';
import { ariaSort, isSortActivationKey, nextSort } from '../src/lib/table-utils.ts';

test('ariaSort reports the direction on the active column and none everywhere else', () => {
  assert.strictEqual(ariaSort('name', 'asc', 'name'), 'ascending');
  assert.strictEqual(ariaSort('name', 'desc', 'name'), 'descending');
  assert.strictEqual(ariaSort('name', 'asc', 'qty'), 'none');
  assert.strictEqual(ariaSort('name', 'desc', 'qty'), 'none');
  assert.strictEqual(ariaSort('', 'asc', 'name'), 'none', 'nothing sorted yet');
});

test('nextSort: a new column starts ascending, the active column toggles', () => {
  assert.strictEqual(nextSort('', 'asc', 'name'), 'asc');
  assert.strictEqual(nextSort('', 'desc', 'name'), 'asc', 'a leftover direction does not leak into a new column');
  assert.strictEqual(nextSort('qty', 'desc', 'name'), 'asc');
  assert.strictEqual(nextSort('name', 'asc', 'name'), 'desc');
  assert.strictEqual(nextSort('name', 'desc', 'name'), 'asc');
});

test('isSortActivationKey accepts Enter and Space (incl. legacy Spacebar) only', () => {
  for (const k of ['Enter', ' ', 'Spacebar']) assert.ok(isSortActivationKey(k), JSON.stringify(k));
  for (const k of ['Tab', 'a', 'ArrowDown', 'Escape', '', 'enter']) assert.ok(!isSortActivationKey(k), JSON.stringify(k));
});
