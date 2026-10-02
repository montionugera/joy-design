import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type Outcome = boolean | 'win' | 'loss' | 'neutral';

export interface PerformanceBarsProps extends React.HTMLAttributes<HTMLDivElement> {
  outcomes: Outcome[];
  label?: string;
  className?: string;
}

function getOutcomeType(item: Outcome): 'win' | 'loss' | 'neutral' {
  if (item === true || item === 'win') return 'win';
  if (item === false || item === 'loss') return 'loss';
  return 'neutral';
}

export const PerformanceBars = React.forwardRef<HTMLDivElement, PerformanceBarsProps>(
  ({ outcomes = [], label, className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx('joy-performance-bars', className)} {...rest}>
        {label && <div className="joy-performance-bars__label">{label}</div>}
        <div className="joy-performance-bars__track">
          {outcomes.map((outcome, idx) => {
            const type = getOutcomeType(outcome);
            return (
              <span
                key={idx}
                className={cx('joy-performance-bars__bar', `joy-performance-bars__bar--${type}`)}
                aria-label={type}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

PerformanceBars.displayName = 'PerformanceBars';
