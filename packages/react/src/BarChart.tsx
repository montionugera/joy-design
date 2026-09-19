import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { JoyChartCore, type SeriesConfig, type ChartPoint } from './chart-core.js';

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: SeriesConfig[];
  height?: number;
  theme?: 'light' | 'dark';
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  ({ series = [], height = 360, theme = 'light', className = '', style, ...props }, ref) => {
    const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<JoyChartCore | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

    useEffect(() => {
      if (!baseCanvasRef.current || !overlayCanvasRef.current) return;

      const chart = new JoyChartCore(baseCanvasRef.current, overlayCanvasRef.current, {
        theme,
        smooth: false,
        onHoverPoint: (p) => setHoveredPoint(p as ChartPoint | null)
      });
      chart.setSeries(series);
      chartInstanceRef.current = chart;

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (chartInstanceRef.current && series) {
        chartInstanceRef.current.setSeries(series);
      }
    }, [series]);

    return (
      <div
        ref={ref}
        className={`joy-chart ${className}`}
        style={{ height: `${height}px`, ...style }}
        role="region"
        aria-label="Interactive Bar Chart"
        {...props}
      >
        {hoveredPoint && (
          <div className="joy-chart__hud">
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Category:</span>
              <span className="joy-chart__hud-value">{hoveredPoint.x}</span>
            </div>
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Value:</span>
              <span className="joy-chart__hud-value" style={{ color: 'var(--joy-color-brand-primary, #7c3aed)' }}>
                {hoveredPoint.y.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="joy-chart__canvas-container">
          <canvas ref={baseCanvasRef} className="joy-chart__canvas-base" />
          <canvas ref={overlayCanvasRef} className="joy-chart__canvas-overlay" />
        </div>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';
