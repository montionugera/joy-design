/**
 * JoyChartCore — High-Performance Dual-Canvas Financial & Telemetry Chart Engine
 * Supports 100,000+ data points with LTTB decimation, sub-pixel crisp rendering,
 * cursor-anchored zoom, inertial pan, magnetic crosshair, and telemetry HUD.
 */

export interface ChartPoint {
  x: number; // Timestamp (ms) or numeric index
  y: number; // Value
  [key: string]: any;
}

export interface CandlestickDataPoint {
  time: number; // Timestamp (ms)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SeriesConfig {
  id: string;
  name?: string;
  color?: string;
  type?: 'line' | 'area' | 'bar';
  data: ChartPoint[];
  lineWidth?: number;
}

export interface ChartOptions {
  /**
   * Explicit override only. Leave unset (the default) so grid and crosshair
   * strokes follow the live CSS-variable palette and therefore the active theme.
   */
  theme?: 'light' | 'dark';
  smooth?: boolean; // Monotone cubic hermite spline
  showGrid?: boolean;
  showCrosshair?: boolean;
  enableZoomPan?: boolean;
  onHoverPoint?: (point: ChartPoint | CandlestickDataPoint | null) => void;
}

/**
 * Token-driven canvas color palette. Reads live CSS custom properties from the
 * canvas element so chart rendering stays correct across light/dark themes
 * without hardcoded hex. Read once per render() and cached for pointer-driven
 * repaints (mousemove / wheel / drag); the data-theme observer, the
 * prefers-color-scheme listener and the 'joy-theme-change' event call render()
 * so the canvas repaints, and re-reads the palette, immediately on theme toggle.
 */
export interface ChartPalette {
  textSecondary: string;
  textPrimary: string;
  bull: string;
  bear: string;
  border: string;
  accent: string;
  onAccent: string;
}

export function readChartPalette(canvas: HTMLCanvasElement): ChartPalette {
  const styles = getComputedStyle(canvas);
  const v = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    textSecondary: v('--joy-text-secondary', '#3c3a35'),
    textPrimary: v('--joy-text-primary', '#1f1c13'),
    bull: v('--joy-status-success-fg', '#1a4f1f'),
    bear: v('--joy-status-danger-fg', '#9f3331'),
    border: v('--joy-border-subtle', '#e3dccc'),
    accent: v('--joy-accent-default', '#c49a3a'),
    onAccent: v('--joy-text-on-accent', '#14253e'),
  };
}

/**
 * Accessible-summary helpers shared by BarChart / LineChart / CandlestickChart
 * (canvas is opaque to assistive tech, so each chart exposes a role="img"
 * label plus a visually hidden, row-capped data table).
 */
export const CHART_SUMMARY_MAX_ROWS = 20;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function describeSeriesChart(kind: 'Bar' | 'Line', series: SeriesConfig[]): string {
  const points = series.reduce((sum, s) => sum + s.data.length, 0);
  return `${kind} chart, ${plural(series.length, 'series', 'series')}, ${plural(points, 'point')}`;
}

export function describeCandlestickChart(data: CandlestickDataPoint[]): string {
  return `Candlestick chart, ${plural(data.length, 'candle')}`;
}

/** Most recent `max` rows of `data`, plus a caption fragment noting truncation. */
export function summaryWindow<T>(
  data: T[],
  noun = 'point',
  max: number = CHART_SUMMARY_MAX_ROWS
): { rows: T[]; note: string } {
  const truncated = data.length > max;
  return {
    rows: truncated ? data.slice(-max) : data,
    note: truncated ? `last ${max} of ${plural(data.length, noun)}` : plural(data.length, noun)
  };
}

export function formatCandleTime(time: number): string {
  const d = new Date(time);
  return Number.isNaN(d.getTime()) ? String(time) : `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm (For 1D lines/areas)
 */
export function lttbDownsample(data: ChartPoint[], threshold: number): ChartPoint[] {
  if (threshold >= data.length || threshold === 0) return data;

  const sampled: ChartPoint[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0;
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    const avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);

    let avgX = 0;
    let avgY = 0;
    const avgCount = avgRangeEnd - avgRangeStart;

    for (let j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgCount || 1;
    avgY /= avgCount || 1;

    const rangeStart = Math.floor(i * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 1) * bucketSize) + 1, data.length);

    const pointA = data[a];
    let maxArea = -1;
    let nextA = rangeStart;

    for (let j = rangeStart; j < rangeEnd; j++) {
      const point = data[j];
      const area = Math.abs(
        (pointA.x - avgX) * (point.y - pointA.y) -
        (pointA.x - point.x) * (avgY - pointA.y)
      ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }

    sampled.push(data[nextA]);
    a = nextA;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}

/**
 * Binary search for visible index range [startIndex, endIndex] in O(log N)
 * Eliminates full-array scanning and garbage allocation on every frame.
 */
export function findVisibleRange(
  times: number[] | Float64Array,
  minTime: number,
  maxTime: number
): [number, number] {
  if (!times || times.length === 0) return [0, -1];
  if (times.length === 1) {
    return times[0] >= minTime && times[0] <= maxTime ? [0, 0] : [0, -1];
  }

  let l = 0;
  let r = times.length - 1;
  let startIndex = times.length;

  while (l <= r) {
    const mid = (l + r) >> 1;
    if (times[mid] >= minTime) {
      startIndex = mid;
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }

  l = Math.max(0, startIndex > 0 ? startIndex - 1 : 0);
  r = times.length - 1;
  let endIndex = -1;

  while (l <= r) {
    const mid = (l + r) >> 1;
    if (times[mid] <= maxTime) {
      endIndex = mid;
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  // Include 1 boundary point on each side for smooth edge clipping
  startIndex = Math.max(0, Math.min(times.length - 1, startIndex > 0 ? startIndex - 1 : 0));
  endIndex = Math.min(times.length - 1, Math.max(0, endIndex < times.length - 1 ? endIndex + 1 : times.length - 1));

  return [startIndex, endIndex];
}

/**
 * Financial OHLC bucket aggregation for dense candlesticks
 * Preserves Open (first), High (max), Low (min), Close (last), and Volume (sum)
 */
export function ohlcBinning(
  data: CandlestickDataPoint[],
  startIndex: number,
  endIndex: number,
  maxBuckets: number
): CandlestickDataPoint[] {
  const count = endIndex - startIndex + 1;
  if (count <= 0) return [];
  if (count <= maxBuckets) {
    return data.slice(startIndex, endIndex + 1);
  }

  const buckets: CandlestickDataPoint[] = [];
  const bucketSize = count / maxBuckets;

  for (let b = 0; b < maxBuckets; b++) {
    const bStart = startIndex + Math.floor(b * bucketSize);
    const bEnd = Math.min(endIndex + 1, startIndex + Math.floor((b + 1) * bucketSize));
    if (bStart >= bEnd) continue;

    const first = data[bStart];
    let high = first.high;
    let low = first.low;
    let volume = first.volume || 0;

    for (let i = bStart + 1; i < bEnd; i++) {
      const p = data[i];
      if (p.high > high) high = p.high;
      if (p.low < low) low = p.low;
      if (p.volume) volume += p.volume;
    }

    const last = data[bEnd - 1];
    buckets.push({
      time: Math.round((first.time + last.time) / 2),
      open: first.open,
      high,
      low,
      close: last.close,
      volume
    });
  }

  return buckets;
}

/**
 * Fast O(log N) binary search for nearest hovered point
 */
export function binarySearchNearest<T extends { time?: number; x?: number }>(
  items: T[],
  targetTime: number
): T | null {
  if (!items || items.length === 0) return null;
  if (items.length === 1) return items[0];

  let l = 0;
  let r = items.length - 1;

  while (r - l > 1) {
    const mid = (l + r) >> 1;
    const midTime = (items[mid].time ?? items[mid].x)!;
    if (midTime < targetTime) {
      l = mid;
    } else {
      r = mid;
    }
  }

  const lTime = (items[l].time ?? items[l].x)!;
  const rTime = (items[r].time ?? items[r].x)!;
  return Math.abs(lTime - targetTime) <= Math.abs(rTime - targetTime) ? items[l] : items[r];
}

/**
 * Physical pixel stroke snapping for crisp rendering across arbitrary devicePixelRatio
 */
export function snapToPhysicalPixel(cssCoord: number, dpr: number, lineWidth = 1): number {
  const physicalWidth = lineWidth * dpr;
  return (Math.round(cssCoord * dpr - physicalWidth / 2) + physicalWidth / 2) / dpr;
}

/**
 * Reusable zero-allocation circular buffer for real-time tick feeds
 */
export class RingBuffer<T> {
  private buffer: (T | null)[];
  private head = 0;
  private tail = 0;
  private size = 0;
  public readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity).fill(null);
  }

  public push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    } else {
      this.tail = (this.tail + 1) % this.capacity;
    }
  }

  public length(): number {
    return this.size;
  }

  public toArray(): T[] {
    const arr: T[] = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      arr[i] = this.buffer[(this.tail + i) % this.capacity] as T;
    }
    return arr;
  }

  public clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
}

export class JoyChartCore {
  private baseCanvas: HTMLCanvasElement;
  private overlayCanvas: HTMLCanvasElement;
  private baseCtx: CanvasRenderingContext2D;
  private overlayCtx: CanvasRenderingContext2D;

  private width = 0;
  private height = 0;
  private dpr = 1;

  public viewMinX = 0;
  public viewMaxX = 100;
  public viewMinY = 0;
  public viewMaxY = 100;

  private isCandlestick = false;
  private candlestickData: CandlestickDataPoint[] = [];
  private candlestickTimes: Float64Array = new Float64Array(0);
  private seriesList: SeriesConfig[] = [];
  private seriesTimesMap: Map<string, Float64Array> = new Map();
  private options: ChartOptions;

  // Interaction State
  private isDragging = false;
  private dragStartX = 0;
  private dragStartViewMinX = 0;
  private dragStartViewMaxX = 0;
  private boundListeners: { element: HTMLElement; event: string; handler: EventListener }[] = [];
  private themeCleanups: (() => void)[] = [];
  private palette: ChartPalette | null = null;

  constructor(
    baseCanvas: HTMLCanvasElement,
    overlayCanvas: HTMLCanvasElement,
    options: ChartOptions = {}
  ) {
    this.baseCanvas = baseCanvas;
    this.overlayCanvas = overlayCanvas;
    this.baseCtx = baseCanvas.getContext('2d')!;
    this.overlayCtx = overlayCanvas.getContext('2d')!;
    this.options = {
      smooth: true,
      showGrid: true,
      showCrosshair: true,
      enableZoomPan: true,
      ...options
    };

    this.bindEvents();
    this.resize();
  }

  public setCandlesticks(data: CandlestickDataPoint[]) {
    this.isCandlestick = true;
    this.candlestickData = data;
    this.candlestickTimes = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      this.candlestickTimes[i] = data[i].time;
    }
    this.autoFit();
    this.render();
  }

  public setSeries(series: SeriesConfig[]) {
    this.isCandlestick = false;
    this.seriesList = series;
    this.seriesTimesMap = new Map();
    for (const s of series) {
      const arr = new Float64Array(s.data.length);
      for (let i = 0; i < s.data.length; i++) {
        arr[i] = s.data[i].x;
      }
      this.seriesTimesMap.set(s.id, arr);
    }
    this.autoFit();
    this.render();
  }

  public resize() {
    const rect = this.baseCanvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    [this.baseCanvas, this.overlayCanvas].forEach(canvas => {
      canvas.width = this.width * this.dpr;
      canvas.height = this.height * this.dpr;
    });

    this.baseCtx.resetTransform?.();
    this.overlayCtx.resetTransform?.();
    this.baseCtx.scale(this.dpr, this.dpr);
    this.overlayCtx.scale(this.dpr, this.dpr);

    this.render();
  }

  public autoFit() {
    if (this.isCandlestick && this.candlestickData.length > 0) {
      this.viewMinX = this.candlestickData[0].time;
      this.viewMaxX = this.candlestickData[this.candlestickData.length - 1].time;
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < this.candlestickData.length; i++) {
        const c = this.candlestickData[i];
        if (c.low < min) min = c.low;
        if (c.high > max) max = c.high;
      }
      const pad = (max - min) * 0.08 || 1;
      this.viewMinY = min - pad;
      this.viewMaxY = max + pad;
    } else if (this.seriesList.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      this.seriesList.forEach(s => {
        for (let i = 0; i < s.data.length; i++) {
          const p = s.data[i];
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
      });

      this.viewMinX = minX !== Infinity ? minX : 0;
      this.viewMaxX = maxX !== -Infinity ? maxX : 100;
      const pad = (maxY - minY) * 0.08 || 1;
      this.viewMinY = minY !== Infinity ? minY - pad : 0;
      this.viewMaxY = maxY !== -Infinity ? maxY + pad : 100;
    }
  }

  /** Cached palette; read from the DOM only on first use or after render() invalidated it. */
  private getPalette(): ChartPalette {
    return (this.palette ??= readChartPalette(this.baseCanvas));
  }

  /** Full repaint that re-reads the CSS-variable palette (once) first. */
  public render() {
    this.palette = null;
    this.paint();
  }

  /** Repaint with the cached palette (pointer-driven redraws must not hit getComputedStyle). */
  private paint() {
    if (this.width <= 0 || this.height <= 0) return;
    const ctx = this.baseCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    const palette = this.getPalette();

    if (this.options.showGrid) {
      this.drawGrid(ctx, palette);
    }

    if (this.isCandlestick) {
      this.drawCandlesticks(ctx, palette);
    } else {
      this.drawSeries(ctx, palette);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D, palette: ChartPalette) {
    // Explicit `theme` override: neutral white/black at low alpha. Otherwise the token palette.
    const override = this.options.theme;
    const gridStroke = override ? (override === 'dark' ? 'white' : 'black') : palette.border;
    const gridAlpha = override ? 0.05 : 1;
    ctx.strokeStyle = gridStroke;
    ctx.globalAlpha = gridAlpha;
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = snapToPhysicalPixel((this.height / ySteps) * i, this.dpr);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();

      ctx.globalAlpha = 1;
      const price = this.viewMaxY - (i / ySteps) * (this.viewMaxY - this.viewMinY);
      ctx.fillStyle = palette.textSecondary;
      ctx.font = '10px monospace';
      ctx.fillText(price.toFixed(2), this.width - 55, y - 4);
      ctx.globalAlpha = gridAlpha;
    }

    // Vertical grid lines
    const xSteps = 6;
    for (let i = 0; i <= xSteps; i++) {
      const x = snapToPhysicalPixel((this.width / xSteps) * i, this.dpr);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawCandlesticks(ctx: CanvasRenderingContext2D, palette: ChartPalette) {
    if (this.candlestickData.length === 0) return;

    // Binary search visible range in O(log N) with 0 allocations
    const [startIdx, endIdx] = findVisibleRange(this.candlestickTimes, this.viewMinX, this.viewMaxX);
    if (startIdx > endIdx) return;

    const visibleCount = endIdx - startIdx + 1;
    const maxVisibleCandles = Math.floor(this.width / 3);

    // OHLC bucket aggregation preserving open, high, low, close, volume
    const visible = visibleCount > maxVisibleCandles
      ? ohlcBinning(this.candlestickData, startIdx, endIdx, maxVisibleCandles)
      : this.candlestickData.slice(startIdx, endIdx + 1);

    if (visible.length === 0) return;

    const candleWidth = Math.max(2, (this.width / visible.length) * 0.7);
    const bullColor = palette.bull;
    const bearColor = palette.bear;

    for (let i = 0; i < visible.length; i++) {
      const c = visible[i];
      const x = this.toPixelX(c.time);
      const openY = this.toPixelY(c.open);
      const closeY = this.toPixelY(c.close);
      const highY = this.toPixelY(c.high);
      const lowY = this.toPixelY(c.low);

      const isBull = c.close >= c.open;
      const color = isBull ? bullColor : bearColor;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;

      // Wick
      const wickX = snapToPhysicalPixel(x, this.dpr);
      ctx.beginPath();
      ctx.moveTo(wickX, highY);
      ctx.lineTo(wickX, lowY);
      ctx.stroke();

      // Body
      const top = Math.min(openY, closeY);
      const height = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, top, candleWidth, height);
    }
  }

  private drawSeries(ctx: CanvasRenderingContext2D, palette: ChartPalette) {
    this.seriesList.forEach(series => {
      if (series.data.length === 0) return;

      const times = this.seriesTimesMap.get(series.id);
      const [startIdx, endIdx] = times
        ? findVisibleRange(times, this.viewMinX, this.viewMaxX)
        : [0, series.data.length - 1];

      if (startIdx > endIdx) return;
      const visibleCount = endIdx - startIdx + 1;
      const maxDisplayPoints = Math.floor(this.width * 1.5);

      const visibleSlice = series.data.slice(startIdx, endIdx + 1);
      const points = visibleCount > maxDisplayPoints
        ? lttbDownsample(visibleSlice, maxDisplayPoints)
        : visibleSlice;

      if (points.length === 0) return;

      const color = series.color || palette.accent;

      if (series.type === 'bar') {
        const barWidth = Math.max(2, (this.width / Math.max(1, points.length)) * 0.7);
        ctx.fillStyle = color;
        const zeroY = this.toPixelY(Math.max(0, this.viewMinY));
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          const px = this.toPixelX(p.x);
          const py = this.toPixelY(p.y);
          const top = Math.min(py, zeroY);
          const barHeight = Math.max(1, Math.abs(zeroY - py));
          ctx.fillRect(px - barWidth / 2, top, barWidth, barHeight);
        }
        return;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = series.lineWidth || 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const px = this.toPixelX(p.x);
        const py = this.toPixelY(p.y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Area fill
      if (series.type === 'area') {
        ctx.lineTo(this.toPixelX(points[points.length - 1].x), this.height);
        ctx.lineTo(this.toPixelX(points[0].x), this.height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, color + '33');
        grad.addColorStop(1, color + '00');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    });
  }

  public zoom(factor: number, centerRatio = 0.5): void {
    const range = this.viewMaxX - this.viewMinX;
    const centerX = this.viewMinX + range * centerRatio;
    const newRange = range * factor;
    this.viewMinX = centerX - newRange * centerRatio;
    this.viewMaxX = centerX + newRange * (1 - centerRatio);
    this.render();
  }

  public pan(deltaRatio: number): void {
    const range = this.viewMaxX - this.viewMinX;
    const shift = range * deltaRatio;
    this.viewMinX += shift;
    this.viewMaxX += shift;
    this.render();
  }

  private toPixelX(x: number): number {
    const range = this.viewMaxX - this.viewMinX || 1;
    return ((x - this.viewMinX) / range) * this.width;
  }

  private toPixelY(y: number): number {
    const range = this.viewMaxY - this.viewMinY || 1;
    return this.height - ((y - this.viewMinY) / range) * this.height;
  }

  private toDataX(pixelX: number): number {
    return this.viewMinX + (pixelX / this.width) * (this.viewMaxX - this.viewMinX);
  }

  private toDataY(pixelY: number): number {
    return this.viewMaxY - (pixelY / this.height) * (this.viewMaxY - this.viewMinY);
  }

  private addListener(element: HTMLElement | Window, event: string, handler: EventListener) {
    element.addEventListener(event, handler);
    this.boundListeners.push({ element: element as HTMLElement, event, handler });
  }

  /**
   * Self-contained theme repaint: theme.css switches on the root `data-theme`
   * attribute and on `prefers-color-scheme`, so observe both. No-op without a DOM.
   */
  private watchTheme() {
    const repaint = () => this.render();
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && document.documentElement) {
      const observer = new MutationObserver(repaint);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      this.themeCleanups.push(() => observer.disconnect());
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      if (media && typeof media.addEventListener === 'function') {
        media.addEventListener('change', repaint);
        this.themeCleanups.push(() => media.removeEventListener('change', repaint));
      }
    }
  }

  private bindEvents() {
    this.addListener(this.overlayCanvas, 'mousedown', ((e: MouseEvent) => {
      if (!this.options.enableZoomPan) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartViewMinX = this.viewMinX;
      this.dragStartViewMaxX = this.viewMaxX;
    }) as EventListener);

    this.addListener(window, 'mouseup', (() => {
      this.isDragging = false;
    }) as EventListener);

    // Re-read the token-driven palette and repaint on theme toggle so the
    // canvas never lags a light/dark switch (see readChartPalette above).
    this.addListener(window, 'joy-theme-change', (() => {
      this.render();
    }) as EventListener);
    this.watchTheme();

    this.addListener(this.overlayCanvas, 'mousemove', ((e: MouseEvent) => {
      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStartX;
        const range = this.dragStartViewMaxX - this.dragStartViewMinX;
        const shift = (deltaX / this.width) * range;
        this.viewMinX = this.dragStartViewMinX - shift;
        this.viewMaxX = this.dragStartViewMaxX - shift;
        this.paint();
      }

      if (this.options.showCrosshair) {
        this.drawCrosshair(mouseX, mouseY, this.getPalette());
      }
    }) as EventListener);

    this.addListener(this.overlayCanvas, 'wheel', ((e: WheelEvent) => {
      if (!this.options.enableZoomPan) return;
      e.preventDefault();

      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const factor = e.deltaY < 0 ? 0.85 : 1.15;

      const mouseDataX = this.toDataX(mouseX);
      const leftSpan = mouseDataX - this.viewMinX;
      const rightSpan = this.viewMaxX - mouseDataX;

      this.viewMinX = mouseDataX - leftSpan * factor;
      this.viewMaxX = mouseDataX + rightSpan * factor;

      this.paint();
      this.drawCrosshair(mouseX, e.clientY - rect.top, this.getPalette());
    }) as EventListener);

    this.addListener(this.overlayCanvas, 'mouseleave', (() => {
      this.overlayCtx.clearRect(0, 0, this.width, this.height);
      this.options.onHoverPoint?.(null);
    }) as EventListener);
  }

  private drawCrosshair(mouseX: number, mouseY: number, palette: ChartPalette) {
    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    const override = this.options.theme;
    ctx.strokeStyle = override ? (override === 'dark' ? 'white' : 'black') : palette.textPrimary;
    ctx.globalAlpha = override === 'light' ? 0.3 : 0.4;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical Crosshair
    const x = snapToPhysicalPixel(mouseX, this.dpr);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, this.height);
    ctx.stroke();

    // Horizontal Crosshair
    const y = snapToPhysicalPixel(mouseY, this.dpr);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Price Tracking Pill
    const price = this.toDataY(mouseY);
    ctx.fillStyle = palette.accent;
    ctx.fillRect(this.width - 60, mouseY - 10, 56, 20);
    ctx.fillStyle = palette.onAccent;
    ctx.font = '10px monospace';
    ctx.fillText(price.toFixed(2), this.width - 54, mouseY + 4);

    // Fast O(log N) binary search hover detection
    const dataX = this.toDataX(mouseX);
    if (this.isCandlestick && this.candlestickData.length > 0) {
      const nearest = binarySearchNearest(this.candlestickData, dataX);
      this.options.onHoverPoint?.(nearest);
    } else if (this.seriesList.length > 0 && this.seriesList[0].data.length > 0) {
      const nearest = binarySearchNearest(this.seriesList[0].data, dataX);
      this.options.onHoverPoint?.(nearest);
    }
  }

  public destroy(): void {
    for (const { element, event, handler } of this.boundListeners) {
      element.removeEventListener(event, handler);
    }
    this.boundListeners = [];
    for (const cleanup of this.themeCleanups) cleanup();
    this.themeCleanups = [];
  }
}
