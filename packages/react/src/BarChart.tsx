import React, { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  JoyChartCore,
  describeSeriesChart,
  summaryWindow,
  type SeriesConfig,
  type ChartPoint
} from './chart-core.js';

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: SeriesConfig[];
  height?: number;
  theme?: 'light' | 'dark';
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  ({ series = [], height = 360, theme, className = '', style, onKeyDown, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<JoyChartCore | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

    // Unset colors fall through to the token-driven palette accent in chart-core.
    const barSeries = useMemo(() => series.map((s) => ({ ...s, type: 'bar' as const })), [series]);
    const chartLabel = describeSeriesChart('Bar', barSeries);

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
        smooth: false,
        onHoverPoint: (p) => setHoveredPoint(p as ChartPoint | null)
      });
      chart.setSeries(barSeries);
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
      if (chartInstanceRef.current && barSeries) {
        chartInstanceRef.current.setSeries(barSeries);
      }
    }, [barSeries]);

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
        aria-label="Interactive Bar Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
        {...props}
      >
        <div className="joy-chart__hud" aria-live="polite">
          {hoveredPoint ? (
            <>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">Category:</span>
                <span className="joy-chart__hud-value">{hoveredPoint.x}</span>
              </div>
              <div className="joy-chart__hud-item">
                <span className="joy-chart__hud-label">Value:</span>
                <span className="joy-chart__hud-value joy-chart__hud-value--accent">
                  {hoveredPoint.y.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Interactive</span>
              <span className="joy-chart__hud-value">Bar Series</span>
            </div>
          )}
        </div>

        <div className="joy-chart__canvas-container" role="img" aria-label={chartLabel}>
          <canvas ref={baseCanvasRef} className="joy-chart__canvas-base" />
          <canvas ref={overlayCanvasRef} className="joy-chart__canvas-overlay" />
        </div>

        <div className="joy-chart__sr">
          {series.map((s) => {
            if (s.data.length === 0) return null;
            const win = summaryWindow(s.data);
            return (
              <table key={s.id}>
                <caption>{s.name || s.id}: {win.note}</caption>
                <thead>
                  <tr><th scope="col">Category</th><th scope="col">Value</th></tr>
                </thead>
                <tbody>
                  {win.rows.map((pt, i) => (
                    <tr key={i}><th scope="row">{pt.x}</th><td>{pt.y.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
            );
          })}
        </div>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';
