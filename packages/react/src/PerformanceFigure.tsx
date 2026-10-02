import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface PerformanceFigureProps extends React.HTMLAttributes<HTMLDivElement> {
  figure: string | number;
  unit?: string;
  tally?: string;
  label?: string;
  className?: string;
}

export const PerformanceFigure = React.forwardRef<HTMLDivElement, PerformanceFigureProps>(
  ({ figure, unit, tally, label, className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx('joy-performance-figure', className)} {...rest}>
        {label && <span className="joy-performance-figure__label">{label}</span>}
        <div className="joy-performance-figure__val-row">
          <span className="joy-performance-figure__figure">{figure}</span>
          {unit && <span className="joy-performance-figure__unit">{unit}</span>}
          {tally && <span className="joy-performance-figure__tally">{tally}</span>}
        </div>
      </div>
    );
  }
);

PerformanceFigure.displayName = 'PerformanceFigure';
