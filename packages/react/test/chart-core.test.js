import test from 'node:test';
import assert from 'node:assert';
import {
  findVisibleRange,
  ohlcBinning,
  binarySearchNearest,
  snapToPhysicalPixel,
  RingBuffer,
  readChartPalette,
  describeSeriesChart,
  describeCandlestickChart,
  summaryWindow,
  formatCandleTime,
  CHART_SUMMARY_MAX_ROWS,
  JoyChartCore
} from '../src/chart-core.ts';

function stubGetComputedStyle(values) {
  const original = globalThis.getComputedStyle;
  globalThis.getComputedStyle = () => ({
    getPropertyValue: (name) => values[name] ?? ''
  });
  return () => {
    globalThis.getComputedStyle = original;
  };
}

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

// readChartPalette only needs something getComputedStyle(...) accepts, so a
// plain object stands in for the canvas (no jsdom / real canvas required).
const PALETTE_VARS = {
  textSecondary: '--joy-text-secondary',
  textPrimary: '--joy-text-primary',
  bull: '--joy-status-success-fg',
  bear: '--joy-status-danger-fg',
  border: '--joy-border-subtle',
  accent: '--joy-accent-default',
  onAccent: '--joy-text-on-accent'
};

const THEME_PALETTES = {
  light: {
    textSecondary: '#3c3a35',
    textPrimary: '#1f1c13',
    bull: '#1a4f1f',
    bear: '#9f3331',
    border: '#e3dccc',
    accent: '#b8862c',
    onAccent: '#1f1c13'
  },
  dark: {
    textSecondary: '#c9c4b8',
    textPrimary: '#f8f3e8',
    bull: '#5fbf6a',
    bear: '#e2635f',
    border: '#3c3a35',
    accent: '#d4ac5f',
    onAccent: '#14253e'
  }
};

for (const [theme, expected] of Object.entries(THEME_PALETTES)) {
  test(`readChartPalette resolves colors from CSS variables in ${theme} theme`, () => {
    const cssVars = Object.fromEntries(
      Object.entries(PALETTE_VARS).map(([key, name]) => [name, expected[key]])
    );
    const restore = stubGetComputedStyle(cssVars);
    try {
      assert.deepStrictEqual(readChartPalette({}), expected);
    } finally {
      restore();
    }
  });
}

// Regression: the bar-series branch used `color` before its `const` declaration
// (TDZ ReferenceError on every bar render). Drives JoyChartCore.render() through
// fake canvases/contexts so the bar path actually executes.
function fakeChartCanvas() {
  const fills = [];
  const state = {};
  const ctx = new Proxy(state, {
    get(target, prop) {
      if (prop === 'fillRect') return () => fills.push(target.fillStyle);
      if (prop in target) return target[prop];
      return () => ({ addColorStop() {} });
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    }
  });
  const canvas = {
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: 200, height: 100, left: 0, top: 0 }),
    addEventListener() {},
    removeEventListener() {}
  };
  return { canvas, fills };
}

function renderBarSeries(seriesColor) {
  const restoreStyle = stubGetComputedStyle({ '--joy-accent-default': '#b8862c' });
  const originalWindow = globalThis.window;
  globalThis.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 };
  try {
    const base = fakeChartCanvas();
    const overlay = fakeChartCanvas();
    const chart = new JoyChartCore(base.canvas, overlay.canvas, { showGrid: false });
    const series = { id: 'bars', type: 'bar', data: [{ x: 1, y: 5 }, { x: 2, y: 8 }, { x: 3, y: 3 }] };
    if (seriesColor) series.color = seriesColor;
    chart.setSeries([series]);
    return base.fills;
  } finally {
    globalThis.window = originalWindow;
    restoreStyle();
  }
}

test('bar series renders without throwing and defaults to the palette accent color', () => {
  const fills = renderBarSeries();
  assert.ok(fills.length >= 3, 'one fillRect per bar');
  assert.ok(fills.every((f) => f === '#b8862c'), 'bars use palette.accent when series.color is unset');
});

test('bar series honors an explicit series color', () => {
  const fills = renderBarSeries('#123456');
  assert.ok(fills.length >= 3);
  assert.ok(fills.every((f) => f === '#123456'));
});

// Theme-change repaint: JoyChartCore observes the root data-theme attribute and
// prefers-color-scheme itself, so no consumer has to dispatch 'joy-theme-change'.
function withThemeEnv(fn) {
  const cssVars = { '--joy-accent-default': '#b8862c' };
  const restoreStyle = stubGetComputedStyle(cssVars);
  const original = {
    window: globalThis.window,
    document: globalThis.document,
    MutationObserver: globalThis.MutationObserver
  };
  const env = { observers: [], mediaListeners: [], removedMedia: [], windowListeners: {}, cssVars };
  globalThis.MutationObserver = class {
    constructor(cb) {
      this.cb = cb;
      this.observed = null;
      this.disconnected = false;
      env.observers.push(this);
    }
    observe(target, options) {
      this.observed = { target, options };
    }
    disconnect() {
      this.disconnected = true;
    }
  };
  globalThis.document = { documentElement: { tag: 'html' } };
  globalThis.window = {
    devicePixelRatio: 1,
    addEventListener(event, handler) {
      env.windowListeners[event] = handler;
    },
    removeEventListener(event) {
      delete env.windowListeners[event];
    },
    matchMedia(query) {
      env.mediaQuery = query;
      return {
        addEventListener: (type, handler) => env.mediaListeners.push([type, handler]),
        removeEventListener: (type, handler) => env.removedMedia.push([type, handler])
      };
    }
  };
  try {
    return fn(env);
  } finally {
    globalThis.window = original.window;
    globalThis.document = original.document;
    globalThis.MutationObserver = original.MutationObserver;
    restoreStyle();
  }
}

function barChartForTheme() {
  const base = fakeChartCanvas();
  const overlay = fakeChartCanvas();
  const chart = new JoyChartCore(base.canvas, overlay.canvas, { showGrid: false });
  chart.setSeries([{ id: 'bars', type: 'bar', data: [{ x: 1, y: 5 }, { x: 2, y: 8 }] }]);
  return { chart, base };
}

test('JoyChartCore observes the root data-theme attribute and prefers-color-scheme on attach', () => {
  withThemeEnv((env) => {
    barChartForTheme();
    assert.strictEqual(env.observers.length, 1, 'one MutationObserver');
    assert.strictEqual(env.observers[0].observed.target, globalThis.document.documentElement);
    assert.deepStrictEqual(env.observers[0].observed.options, { attributes: true, attributeFilter: ['data-theme'] });
    assert.strictEqual(env.mediaQuery, '(prefers-color-scheme: dark)');
    assert.strictEqual(env.mediaListeners.length, 1);
    assert.strictEqual(env.mediaListeners[0][0], 'change');
    assert.strictEqual(typeof env.windowListeners['joy-theme-change'], 'function', 'legacy event listener kept');
  });
});

test('JoyChartCore repaints with the new palette when data-theme changes', () => {
  withThemeEnv((env) => {
    const { base } = barChartForTheme();
    const before = base.fills.length;
    assert.ok(before >= 2);
    env.cssVars['--joy-accent-default'] = '#d4ac5f';
    env.observers[0].cb([{ type: 'attributes', attributeName: 'data-theme' }]);
    assert.ok(base.fills.length > before, 'repainted');
    assert.strictEqual(base.fills[base.fills.length - 1], '#d4ac5f', 'uses the new theme palette');
  });
});

test('JoyChartCore repaints when the OS colour scheme changes', () => {
  withThemeEnv((env) => {
    const { base } = barChartForTheme();
    const before = base.fills.length;
    env.mediaListeners[0][1]();
    assert.ok(base.fills.length > before);
  });
});

test('JoyChartCore.destroy disconnects the theme observer and media listener', () => {
  withThemeEnv((env) => {
    const { chart } = barChartForTheme();
    chart.destroy();
    assert.strictEqual(env.observers[0].disconnected, true);
    assert.deepStrictEqual(env.removedMedia, [env.mediaListeners[0]]);
    assert.strictEqual(env.windowListeners['joy-theme-change'], undefined);
  });
});

test('JoyChartCore stays SSR/no-DOM safe: no MutationObserver or matchMedia is not an error', () => {
  const restoreStyle = stubGetComputedStyle({});
  const original = { window: globalThis.window, MutationObserver: globalThis.MutationObserver };
  globalThis.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 };
  delete globalThis.MutationObserver;
  try {
    const chart = new JoyChartCore(fakeChartCanvas().canvas, fakeChartCanvas().canvas, {});
    chart.destroy();
  } finally {
    globalThis.window = original.window;
    if (original.MutationObserver) globalThis.MutationObserver = original.MutationObserver;
    restoreStyle();
  }
});

test('chart accessible-summary helpers describe the chart and cap the data window', () => {
  assert.strictEqual(describeSeriesChart('Bar', [{ id: 'a', data: [{ x: 1, y: 1 }] }]), 'Bar chart, 1 series, 1 point');
  assert.strictEqual(
    describeSeriesChart('Line', [{ id: 'a', data: [{ x: 1, y: 1 }, { x: 2, y: 2 }] }, { id: 'b', data: [] }]),
    'Line chart, 2 series, 2 points'
  );
  assert.strictEqual(describeSeriesChart('Line', []), 'Line chart, 0 series, 0 points');
  const candle = (time) => ({ time, open: 1, high: 2, low: 0, close: 1 });
  assert.strictEqual(describeCandlestickChart([candle(0)]), 'Candlestick chart, 1 candle');
  assert.strictEqual(describeCandlestickChart([candle(0), candle(1)]), 'Candlestick chart, 2 candles');

  const small = summaryWindow([1, 2, 3], 'candle');
  assert.deepStrictEqual(small, { rows: [1, 2, 3], note: '3 candles' });
  const big = Array.from({ length: CHART_SUMMARY_MAX_ROWS + 5 }, (_, i) => i);
  const win = summaryWindow(big);
  assert.strictEqual(win.rows.length, CHART_SUMMARY_MAX_ROWS);
  assert.strictEqual(win.rows[win.rows.length - 1], big[big.length - 1], 'keeps the most recent rows');
  assert.strictEqual(win.note, `last ${CHART_SUMMARY_MAX_ROWS} of ${big.length} points`);
});

test('formatCandleTime renders UTC timestamps and tolerates invalid input', () => {
  assert.strictEqual(formatCandleTime(Date.UTC(2026, 0, 2, 3, 4)), '2026-01-02 03:04 UTC');
  assert.strictEqual(formatCandleTime(NaN), 'NaN');
});
