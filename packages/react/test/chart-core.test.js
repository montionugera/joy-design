import test from 'node:test';
import assert from 'node:assert';
import {
  findVisibleRange,
  ohlcBinning,
  binarySearchNearest,
  snapToPhysicalPixel,
  RingBuffer
} from '../src/chart-core.ts';

test('findVisibleRange binary search locates window indices in O(log N)', () => {
  const times = new Float64Array([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]);

  // Window inside dataset
  const [start1, end1] = findVisibleRange(times, 350, 750);
  assert.strictEqual(start1, 2, 'Start index should include boundary point before 350');
  assert.strictEqual(end1, 7, 'End index should include boundary point after 750');

  // Window before dataset
  const [start2, end2] = findVisibleRange(times, 10, 50);
  assert.strictEqual(start2, 0);

  // Empty array
  const [startEmpty, endEmpty] = findVisibleRange(new Float64Array(0), 100, 200);
  assert.strictEqual(startEmpty, 0);
  assert.strictEqual(endEmpty, -1);

  // Single point
  const [startSingle, endSingle] = findVisibleRange(new Float64Array([500]), 400, 600);
  assert.strictEqual(startSingle, 0);
  assert.strictEqual(endSingle, 0);
});

test('ohlcBinning downsamples dense candles preserving financial OHLC integrity', () => {
  const candles = [];
  for (let i = 0; i < 100; i++) {
    candles.push({
      time: 1000 + i * 60,
      open: 100 + (i % 5),
      high: 120 + (i % 10),
      low: 80 - (i % 7),
      close: 105 + (i % 4),
      volume: 50
    });
  }

  const binned = ohlcBinning(candles, 0, 99, 10);
  assert.strictEqual(binned.length, 10, 'Should downsample 100 candles into exactly 10 buckets');

  // First bucket corresponds to candles 0..9
  const firstBucket = binned[0];
  assert.strictEqual(firstBucket.open, candles[0].open, 'Open must match first candle open in bucket');
  assert.strictEqual(firstBucket.close, candles[9].close, 'Close must match last candle close in bucket');

  let maxHigh = -Infinity;
  let minLow = Infinity;
  let expectedVolume = 0;
  for (let i = 0; i < 10; i++) {
    if (candles[i].high > maxHigh) maxHigh = candles[i].high;
    if (candles[i].low < minLow) minLow = candles[i].low;
    expectedVolume += candles[i].volume;
  }
  assert.strictEqual(firstBucket.high, maxHigh, 'High must preserve true window maximum');
  assert.strictEqual(firstBucket.low, minLow, 'Low must preserve true window minimum');
  assert.strictEqual(firstBucket.volume, expectedVolume, 'Volume must be the exact sum across the window');
});

test('binarySearchNearest locates target timestamp in O(log N)', () => {
  const count = 10000;
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({ time: i * 100, value: i });
  }

  const match = binarySearchNearest(items, 4523);
  assert.ok(match, 'Nearest point must be found');
  assert.strictEqual(match.time, 4500, '4523 is closest to 4500');

  const match2 = binarySearchNearest(items, 4580);
  assert.strictEqual(match2.time, 4600, '4580 is closest to 4600');
});

test('snapToPhysicalPixel calculates integer physical stroke alignment', () => {
  // DPR 1.0, 1px line -> 0.5 offset
  const snap1 = snapToPhysicalPixel(10, 1.0, 1);
  assert.strictEqual(snap1, 10.5);

  // DPR 2.0, 1px line (2 physical px) -> integer boundary
  const snap2 = snapToPhysicalPixel(10, 2.0, 1);
  assert.strictEqual(snap2, 10);
});

test('RingBuffer supports circular zero-allocation push and rollover', () => {
  const rb = new RingBuffer(3);
  assert.strictEqual(rb.length(), 0);

  rb.push(1);
  rb.push(2);
  rb.push(3);
  assert.strictEqual(rb.length(), 3);
  assert.deepStrictEqual(rb.toArray(), [1, 2, 3]);

  // Push 4th item: should evict 1
  rb.push(4);
  assert.strictEqual(rb.length(), 3);
  assert.deepStrictEqual(rb.toArray(), [2, 3, 4]);

  rb.push(5);
  assert.deepStrictEqual(rb.toArray(), [3, 4, 5]);

  rb.clear();
  assert.strictEqual(rb.length(), 0);
  assert.deepStrictEqual(rb.toArray(), []);
});
