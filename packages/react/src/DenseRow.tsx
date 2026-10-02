import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type DenseRowTone = 'positive' | 'critical' | 'info' | 'neutral';

export interface DenseRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  figure: string | number;
  delta?: string;
  tone?: DenseRowTone;
  className?: string;
}

export const DenseRow = React.forwardRef<HTMLDivElement, DenseRowProps>(
  ({ label, figure, delta, tone = 'neutral', className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx('joy-dense-row', className)} {...rest}>
        <span className="joy-dense-row__label">{label}</span>
        <div className="joy-dense-row__right">
          <span className="joy-dense-row__figure">{figure}</span>
          {delta && (
            <span className={cx('joy-dense-row__delta', `joy-dense-row__delta--${tone}`)}>
              {delta}
            </span>
          )}
        </div>
      </div>
    );
  }
);

DenseRow.displayName = 'DenseRow';
