import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { JoyChartCore, type CandlestickDataPoint } from './chart-core.js';

export interface CandlestickChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: CandlestickDataPoint[];
  height?: number;
  theme?: 'light' | 'dark';
}

export const CandlestickChart = forwardRef<HTMLDivElement, CandlestickChartProps>(
  ({ data = [], height = 420, theme = 'light', className = '', style, onKeyDown, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<JoyChartCore | null>(null);
    const [hoveredCandle, setHoveredCandle] = useState<CandlestickDataPoint | null>(null);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    useEffect(() => {
      if (!baseCanvasRef.current || !overlayCanvasRef.current) return;

      const chart = new JoyChartCore(baseCanvasRef.current, overlayCanvasRef.current, {
        theme,
        onHoverPoint: (p) => setHoveredCandle(p as CandlestickDataPoint | null)
      });
      chart.setCandlesticks(data);
      chartInstanceRef.current = chart;

      const ro = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => chart.resize())
        : null;

      if (containerRef.current && ro) {
        ro.observe(containerRef.current);
      }

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        ro?.disconnect();
        chart.destroy();
      };
    }, []);

    useEffect(() => {
      if (chartInstanceRef.current && data) {
        chartInstanceRef.current.setCandlesticks(data);
      }
    }, [data]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!chartInstanceRef.current) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        chartInstanceRef.current.pan(0.05);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        chartInstanceRef.current.pan(-0.05);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        chartInstanceRef.current.zoom(0.85);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        chartInstanceRef.current.zoom(1.15);
      } else if (e.key === '0') {
        e.preventDefault();
        chartInstanceRef.current.autoFit();
        chartInstanceRef.current.render();
      }
    };

    const deltaPercent = hoveredCandle
      ? ((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100
      : 0;

    return (
      <div
        ref={setRefs}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`joy-chart ${className}`}
        style={{ height: `${height}px`, ...style }}
        role="region"
        aria-label="Interactive Candlestick Financial Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
        {...props}
      >
        <div className="joy-chart__hud" aria-live="polite">
          {hoveredCandle ? (
            <>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">O:</span>
                <span className="joy-chart__hud-value">{hoveredCandle.open.toFixed(2)}</span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">H:</span>
                <span className="joy-chart__hud-value">{hoveredCandle.high.toFixed(2)}</span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">L:</span>
                <span className="joy-chart__hud-value">{hoveredCandle.low.toFixed(2)}</span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">C:</span>
                <span
                  className="joy-chart__hud-value"
                  style={{
                    color:
                      hoveredCandle.close >= hoveredCandle.open
                        ? 'var(--joy-color-success, #10b981)'
                        : 'var(--joy-color-error, #f43f5e)'
                  }}
                >
                  {hoveredCandle.close.toFixed(2)}
                </span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">Chg:</span>
                <span
                  className="joy-chart__hud-value"
                  style={{
                    color:
                      deltaPercent >= 0
                        ? 'var(--joy-color-success, #10b981)'
                        : 'var(--joy-color-error, #f43f5e)'
                  }}
                >
                  {deltaPercent >= 0 ? '+' : ''}
                  {deltaPercent.toFixed(2)}%
                </span>
              </div>
            </>
          ) : (
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Interactive</span>
              <span className="joy-chart__hud-value" style={{ color: 'var(--navy-500, #14253e)' }}>Candlestick Feed</span>
            </div>
          )}
        </div>

        <div className="joy-chart__canvas-container">
          <canvas ref={baseCanvasRef} className="joy-chart__canvas-base" />
          <canvas ref={overlayCanvasRef} className="joy-chart__canvas-overlay" />
        </div>
      </div>
    );
  }
);

CandlestickChart.displayName = 'CandlestickChart';
