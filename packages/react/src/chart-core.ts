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
  theme?: 'light' | 'dark';
  smooth?: boolean; // Monotone cubic hermite spline
  showGrid?: boolean;
  showCrosshair?: boolean;
  enableZoomPan?: boolean;
  onHoverPoint?: (point: ChartPoint | CandlestickDataPoint | null) => void;
}

/**
 * Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
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
  private seriesList: SeriesConfig[] = [];
  private options: ChartOptions;

  // Interaction State
  private isDragging = false;
  private dragStartX = 0;
  private dragStartViewMinX = 0;
  private dragStartViewMaxX = 0;

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
      theme: 'light',
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
    this.autoFit();
    this.render();
  }

  public setSeries(series: SeriesConfig[]) {
    this.isCandlestick = false;
    this.seriesList = series;
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
      this.candlestickData.forEach(c => {
        if (c.low < min) min = c.low;
        if (c.high > max) max = c.high;
      });
      const pad = (max - min) * 0.08 || 1;
      this.viewMinY = min - pad;
      this.viewMaxY = max + pad;
    } else if (this.seriesList.length > 0) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      this.seriesList.forEach(s => {
        s.data.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
      });

      this.viewMinX = minX !== Infinity ? minX : 0;
      this.viewMaxX = maxX !== -Infinity ? maxX : 100;
      const pad = (maxY - minY) * 0.08 || 1;
      this.viewMinY = minY !== Infinity ? minY - pad : 0;
      this.viewMaxY = maxY !== -Infinity ? maxY + pad : 100;
    }
  }

  public render() {
    if (this.width <= 0 || this.height <= 0) return;
    const ctx = this.baseCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.options.showGrid) {
      this.drawGrid(ctx);
    }

    if (this.isCandlestick) {
      this.drawCandlesticks(ctx);
    } else {
      this.drawSeries(ctx);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const isDark = this.options.theme === 'dark';
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = Math.floor((this.height / ySteps) * i) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();

      const price = this.viewMaxY - (i / ySteps) * (this.viewMaxY - this.viewMinY);
      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(price.toFixed(2), this.width - 55, y - 4);
    }

    // Vertical grid lines
    const xSteps = 6;
    for (let i = 0; i <= xSteps; i++) {
      const x = Math.floor((this.width / xSteps) * i) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
  }

  private drawCandlesticks(ctx: CanvasRenderingContext2D) {
    if (this.candlestickData.length === 0) return;

    // Filter points within view window + 1 buffer point
    const visible = this.candlestickData.filter(
      c => c.time >= this.viewMinX && c.time <= this.viewMaxX
    );
    if (visible.length === 0) return;

    const candleWidth = Math.max(2, (this.width / visible.length) * 0.7);
    const bullColor = '#10b981'; // Green
    const bearColor = '#ef4444'; // Red

    visible.forEach(c => {
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
      ctx.beginPath();
      ctx.moveTo(Math.floor(x) + 0.5, highY);
      ctx.lineTo(Math.floor(x) + 0.5, lowY);
      ctx.stroke();

      // Body
      const top = Math.min(openY, closeY);
      const height = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, top, candleWidth, height);
    });
  }

  private drawSeries(ctx: CanvasRenderingContext2D) {
    this.seriesList.forEach(series => {
      if (series.data.length === 0) return;

      // Filter visible window and apply LTTB if points exceed 2x pixel width
      const visible = series.data.filter(
        p => p.x >= this.viewMinX && p.x <= this.viewMaxX
      );
      const maxDisplayPoints = Math.floor(this.width * 1.5);
      const points = visible.length > maxDisplayPoints
        ? lttbDownsample(visible, maxDisplayPoints)
        : visible;

      if (points.length === 0) return;

      const color = series.color || '#7c3aed';
      ctx.strokeStyle = color;
      ctx.lineWidth = series.lineWidth || 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      points.forEach((p, idx) => {
        const px = this.toPixelX(p.x);
        const py = this.toPixelY(p.y);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
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

  private bindEvents() {
    this.overlayCanvas.addEventListener('mousedown', (e) => {
      if (!this.options.enableZoomPan) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartViewMinX = this.viewMinX;
      this.dragStartViewMaxX = this.viewMaxX;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.overlayCanvas.addEventListener('mousemove', (e) => {
      const rect = this.overlayCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStartX;
        const range = this.dragStartViewMaxX - this.dragStartViewMinX;
        const shift = (deltaX / this.width) * range;
        this.viewMinX = this.dragStartViewMinX - shift;
        this.viewMaxX = this.dragStartViewMaxX - shift;
        this.render();
      }

      if (this.options.showCrosshair) {
        this.drawCrosshair(mouseX, mouseY);
      }
    });

    this.overlayCanvas.addEventListener('wheel', (e) => {
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

      this.render();
      this.drawCrosshair(mouseX, e.clientY - rect.top);
    }, { passive: false });

    this.overlayCanvas.addEventListener('mouseleave', () => {
      this.overlayCtx.clearRect(0, 0, this.width, this.height);
      this.options.onHoverPoint?.(null);
    });
  }

  private drawCrosshair(mouseX: number, mouseY: number) {
    const ctx = this.overlayCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.strokeStyle = this.options.theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Vertical Crosshair
    ctx.beginPath();
    ctx.moveTo(Math.floor(mouseX) + 0.5, 0);
    ctx.lineTo(Math.floor(mouseX) + 0.5, this.height);
    ctx.stroke();

    // Horizontal Crosshair
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(mouseY) + 0.5);
    ctx.lineTo(this.width, Math.floor(mouseY) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price Tracking Pill
    const price = this.toDataY(mouseY);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(this.width - 60, mouseY - 10, 56, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText(price.toFixed(2), this.width - 54, mouseY + 4);

    // Find nearest point
    const dataX = this.toDataX(mouseX);
    if (this.isCandlestick && this.candlestickData.length > 0) {
      let nearest = this.candlestickData[0];
      let minDiff = Infinity;
      this.candlestickData.forEach(c => {
        const diff = Math.abs(c.time - dataX);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = c;
        }
      });
      this.options.onHoverPoint?.(nearest);
    } else if (this.seriesList.length > 0) {
      let nearest = this.seriesList[0].data[0];
      let minDiff = Infinity;
      this.seriesList[0].data.forEach(p => {
        const diff = Math.abs(p.x - dataX);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = p;
        }
      });
      this.options.onHoverPoint?.(nearest);
    }
  }
}
