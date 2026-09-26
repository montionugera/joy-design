import test from 'node:test';
import assert from 'node:assert';
import {
  findVisibleRange,
  ohlcBinning,
  lttbDownsample,
  binarySearchNearest,
  RingBuffer,
  snapToPhysicalPixel
} from '../src/chart-core.ts';

// A single timed call is at the mercy of the scheduler: one GC pause or a busy neighbour under
// `pnpm -r test` turns a 0.02ms search into 9ms. Each budget below is judged on the MEDIAN of
// several runs after a warm-up, so a real regression (every run slow) still fails while one
// stalled run does not. Budgets are unchanged.
const RUNS = 9;
function medianMs(fn) {
  fn(); // warm-up: JIT + caches
  const samples = [];
  let result;
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    result = fn();
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  return { elapsed: samples[Math.floor(RUNS / 2)], result };
}

test('Benchmark: 100,000 candles OHLC binning executes in < 25ms (60fps budget)', () => {
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

  const { elapsed, result: binned } = medianMs(() => ohlcBinning(data, 0, count - 1, 500));

  assert.strictEqual(binned.length, 500);
  assert.ok(elapsed < 25, `OHLC binning took ${elapsed.toFixed(2)}ms, which exceeds 25ms budget`);
  console.log(`[BENCHMARK] 100,000 candles -> 500 bins in ${elapsed.toFixed(2)}ms`);
});

test('Benchmark: 100,000 points binary search range culling executes in < 5ms', () => {
  const count = 100000;
  const times = new Float64Array(count);
  const base = 1700000000000;
  for (let i = 0; i < count; i++) {
    times[i] = base + i * 1000;
  }

  const minTime = times[25000];
  const maxTime = times[75000];

  const { elapsed, result: range } = medianMs(() => findVisibleRange(times, minTime, maxTime));
  const [start, end] = range;

  assert.ok(start <= 25000 && start >= 24998);
  assert.ok(end >= 75000 && end <= 75002);
  assert.ok(elapsed < 5, `findVisibleRange took ${elapsed.toFixed(3)}ms, should be < 5ms`);
  console.log(`[BENCHMARK] 100,000 timestamps findVisibleRange in ${elapsed.toFixed(4)}ms`);
});

test('Benchmark: 10,000 points LTTB downsampling executes in < 25ms', () => {
  const count = 10000;
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = { x: i, y: Math.sin(i / 50) * 50 + 100 };
  }

  const { elapsed, result: downsampled } = medianMs(() => lttbDownsample(data, 300));

  assert.strictEqual(downsampled.length, 300);
  assert.ok(elapsed < 25, `LTTB downsampling took ${elapsed.toFixed(2)}ms, should be < 25ms`);
  console.log(`[BENCHMARK] 10,000 points LTTB -> 300 in ${elapsed.toFixed(2)}ms`);
});

test('Benchmark: RingBuffer pushes 100,000 ticks in < 30ms with zero rollover leaks', () => {
  const { elapsed, result: ring } = medianMs(() => {
    const buffer = new RingBuffer(1000);
    for (let i = 0; i < 100000; i++) {
      buffer.push({ tick: i, price: 100 + (i % 20) });
    }
    return buffer;
  });

  assert.strictEqual(ring.length(), 1000);
  const snapshot = ring.toArray();
  assert.strictEqual(snapshot.length, 1000);
  assert.strictEqual(snapshot[snapshot.length - 1].tick, 99999);
  assert.ok(elapsed < 30, `RingBuffer took ${elapsed.toFixed(2)}ms for 100k items`);
  console.log(`[BENCHMARK] RingBuffer 100,000 pushes in ${elapsed.toFixed(2)}ms`);
});
