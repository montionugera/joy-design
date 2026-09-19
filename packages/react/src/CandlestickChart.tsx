import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { JoyChartCore, type CandlestickDataPoint } from './chart-core.js';

export interface CandlestickChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: CandlestickDataPoint[];
  height?: number;
  theme?: 'light' | 'dark';
}

export const CandlestickChart = forwardRef<HTMLDivElement, CandlestickChartProps>(
  ({ data = [], height = 420, theme = 'light', className = '', style, ...props }, ref) => {
    const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<JoyChartCore | null>(null);
    const [hoveredCandle, setHoveredCandle] = useState<CandlestickDataPoint | null>(null);

    useEffect(() => {
      if (!baseCanvasRef.current || !overlayCanvasRef.current) return;

      const chart = new JoyChartCore(baseCanvasRef.current, overlayCanvasRef.current, {
        theme,
        onHoverPoint: (p) => setHoveredCandle(p as CandlestickDataPoint | null)
      });
      chart.setCandlesticks(data);
      chartInstanceRef.current = chart;

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (chartInstanceRef.current && data) {
        chartInstanceRef.current.setCandlesticks(data);
      }
    }, [data]);

    const deltaPercent = hoveredCandle
      ? ((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100
      : 0;

    return (
      <div
        ref={ref}
        className={`joy-chart ${className}`}
        style={{ height: `${height}px`, ...style }}
        role="region"
        aria-label="Interactive Candlestick Financial Chart"
        {...props}
      >
        {hoveredCandle && (
          <div className="joy-chart__hud">
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
                style={{ color: hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#ef4444' }}
              >
                {hoveredCandle.close.toFixed(2)}
              </span>
            </div>
            <div className="joy-chart__hud-item">
              <span className="joy-chart__hud-label">Chg:</span>
              <span
                className="joy-chart__hud-value"
                style={{ color: deltaPercent >= 0 ? '#10b981' : '#ef4444' }}
              >
                {deltaPercent >= 0 ? '+' : ''}{deltaPercent.toFixed(2)}%
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

CandlestickChart.displayName = 'CandlestickChart';
