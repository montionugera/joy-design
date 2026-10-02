import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TrendLineProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'points'> {
  points: number[];
  label?: string;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

export const TrendLine = React.forwardRef<SVGSVGElement, TrendLineProps>(
  ({ points = [], label = 'Trend line', height = 24, strokeWidth = 2, className = '', ...rest }, ref) => {
    const width = 80;
    const padding = 2;

    const d = React.useMemo(() => {
      if (!points || points.length === 0) return '';
      if (points.length === 1) return `M 0 ${height / 2} L ${width} ${height / 2}`;
      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max === min ? 1 : max - min;
      return points
        .map((p, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - padding - ((p - min) / range) * (height - 2 * padding);
          return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');
    }, [points, height, width]);

    return (
      <svg
        ref={ref}
        className={cx('joy-trend-line', className)}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
        {...rest}
      >
        <path className="joy-trend-line__path" d={d} strokeWidth={strokeWidth} />
      </svg>
    );
  }
);

TrendLine.displayName = 'TrendLine';
