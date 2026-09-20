import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { JoyChartCore, type SeriesConfig, type ChartPoint } from './chart-core.js';

export interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: SeriesConfig[];
  height?: number;
  smooth?: boolean;
  theme?: 'light' | 'dark';
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  ({ series = [], height = 360, smooth = true, theme = 'light', className = '', style, onKeyDown, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<JoyChartCore | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

    // Merge internal ref with forwarded ref
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
        smooth,
        onHoverPoint: (p) => setHoveredPoint(p as ChartPoint | null)
      });
      chart.setSeries(series);
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
      if (chartInstanceRef.current && series) {
        chartInstanceRef.current.setSeries(series);
      }
    }, [series]);

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

    return (
      <div
        ref={setRefs}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`joy-chart ${className}`}
        style={{ height: `${height}px`, ...style }}
        role="region"
        aria-label="Interactive Line Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
        {...props}
      >
        <div className="joy-chart__hud" aria-live="polite">
          {hoveredPoint ? (
            <>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">Index:</span>
                <span className="joy-chart__hud-value">{hoveredPoint.x}</span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">Value:</span>
                <span className="joy-chart__hud-value" style={{ color: 'var(--gold-400, #c49a3a)' }}>
                  {hoveredPoint.y.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Interactive</span>
              <span className="joy-chart__hud-value" style={{ color: 'var(--navy-500, #14253e)' }}>Pan/Zoom Enabled</span>
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

LineChart.displayName = 'LineChart';
