import test from 'node:test';
import assert from 'node:assert';
import {
  findVisibleRange,
  ohlcBinning,
  lttbDownsample,
  binarySearchNearest,
  RingBuffer,
  snapToPhysicalPixel
} from '../src/lib/chart-core.ts';

test('Benchmark: 100,000 candles OHLC binning executes in < 16ms (60fps budget)', () => {
  const count = 100000;
  const data = new Array(count);
  const startTime = Date.now() - count * 60000;

  let price = 100;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.49) * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    data[i] = {
      time: startTime + i * 60000,
      open,
      high,
      low,
      close,
      volume: 1000 + Math.random() * 500
    };
    price = close;
  }

  const t0 = performance.now();
  const binned = ohlcBinning(data, 0, count - 1, 500);
  const elapsed = performance.now() - t0;

  assert.strictEqual(binned.length, 500);
  assert.ok(elapsed < 16, `OHLC binning took ${elapsed.toFixed(2)}ms, which exceeds 16ms budget`);
  console.log(`[BENCHMARK] 100,000 candles -> 500 bins in ${elapsed.toFixed(2)}ms`);
});

test('Benchmark: 100,000 points binary search range culling executes in < 1ms', () => {
  const count = 100000;
  const times = new Float64Array(count);
  const base = 1700000000000;
  for (let i = 0; i < count; i++) {
    times[i] = base + i * 1000;
  }

  const minTime = times[25000];
  const maxTime = times[75000];

  const t0 = performance.now();
  const [start, end] = findVisibleRange(times, minTime, maxTime);
  const elapsed = performance.now() - t0;

  assert.ok(start <= 25000 && start >= 24998);
  assert.ok(end >= 75000 && end <= 75002);
  assert.ok(elapsed < 1, `findVisibleRange took ${elapsed.toFixed(3)}ms, should be < 1ms`);
  console.log(`[BENCHMARK] 100,000 timestamps findVisibleRange in ${elapsed.toFixed(4)}ms`);
});

test('Benchmark: 10,000 points LTTB downsampling executes in < 10ms', () => {
  const count = 10000;
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = { x: i, y: Math.sin(i / 50) * 50 + 100 };
  }

  const t0 = performance.now();
  const downsampled = lttbDownsample(data, 300);
  const elapsed = performance.now() - t0;

  assert.strictEqual(downsampled.length, 300);
  assert.ok(elapsed < 10, `LTTB downsampling took ${elapsed.toFixed(2)}ms, should be < 10ms`);
  console.log(`[BENCHMARK] 10,000 points LTTB -> 300 in ${elapsed.toFixed(2)}ms`);
});

test('Benchmark: RingBuffer pushes 100,000 ticks in < 15ms with zero rollover leaks', () => {
  const ring = new RingBuffer(1000);
  const t0 = performance.now();
  for (let i = 0; i < 100000; i++) {
    ring.push({ tick: i, price: 100 + (i % 20) });
  }
  const elapsed = performance.now() - t0;

  assert.strictEqual(ring.length(), 1000);
  const snapshot = ring.toArray();
  assert.strictEqual(snapshot.length, 1000);
  assert.strictEqual(snapshot[snapshot.length - 1].tick, 99999);
  assert.ok(elapsed < 15, `RingBuffer took ${elapsed.toFixed(2)}ms for 100k items`);
  console.log(`[BENCHMARK] RingBuffer 100,000 pushes in ${elapsed.toFixed(2)}ms`);
});
