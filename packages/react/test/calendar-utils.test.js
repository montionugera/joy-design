import test from 'node:test';
import assert from 'node:assert';
import {
  formatDate,
  parseDate,
  isBeforeDay,
  isAfterDay,
  isSameDay,
  isBetweenDays,
  isSameOrBeforeDay,
  isSameOrAfterDay,
  isDateWithinRange,
  checkDateDisabled,
  rangeContainsDisabledDate
} from '../src/calendar-utils.ts';

test('calendar-utils: min and max boundary clamping', () => {
  const min = '2026-03-10';
  const max = '2026-03-20';

  // Day before min is disabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 9), { min, max }), true);
  // Min day itself is enabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 10), { min, max }), false);
  // Between min and max is enabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 15), { min, max }), false);
  // Max day itself is enabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 20), { min, max }), false);
  // Day after max is disabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 21), { min, max }), true);
});

test('calendar-utils: blackoutDates', () => {
  const blackoutDates = ['2026-03-15', '2026-03-25'];

  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 15), { blackoutDates }), true);
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 25), { blackoutDates }), true);
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 16), { blackoutDates }), false);
});

test('calendar-utils: blackoutRanges', () => {
  const blackoutRanges = [['2026-03-05', '2026-03-08']];

  // March 4 enabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 4), { blackoutRanges }), false);
  // March 5-8 disabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 5), { blackoutRanges }), true);
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 6), { blackoutRanges }), true);
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 7), { blackoutRanges }), true);
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 8), { blackoutRanges }), true);
  // March 9 enabled
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 9), { blackoutRanges }), false);
});

test('calendar-utils: disabledDate custom predicate (e.g. weekends)', () => {
  // Disable Saturday (6) and Sunday (0)
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

  // 2026-03-07 is Saturday
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 7), { disabledDate: isWeekend }), true);
  // 2026-03-08 is Sunday
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 8), { disabledDate: isWeekend }), true);
  // 2026-03-09 is Monday
  assert.strictEqual(checkDateDisabled(new Date(2026, 2, 9), { disabledDate: isWeekend }), false);
});

test('calendar-utils: rangeContainsDisabledDate for cross-blackout validation', () => {
  const blackoutDates = ['2026-03-05'];

  const start = new Date(2026, 2, 1);
  const endCross = new Date(2026, 2, 10);
  const endBefore = new Date(2026, 2, 4);

  // Range [March 1 - March 10] spans across March 5 blackout
  assert.strictEqual(rangeContainsDisabledDate(start, endCross, { blackoutDates }), true);

  // Range [March 1 - March 4] does not span across March 5
  assert.strictEqual(rangeContainsDisabledDate(start, endBefore, { blackoutDates }), false);
});
