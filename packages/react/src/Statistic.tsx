import React, { forwardRef } from 'react';

export interface StatisticProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'prefix'> {
  title?: string;
  value: number | string;
  precision?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  ({ title, value, precision, prefix, suffix, className = '', ...props }, ref) => {
    const formattedValue =
      typeof value === 'number' && precision !== undefined ? value.toFixed(precision) : String(value);

    return (
      <div ref={ref} className={`joy-statistic ${className}`} {...props}>
        {title && <div className="joy-statistic__title">{title}</div>}
        <div className="joy-statistic__content">
          {prefix && <span className="joy-statistic__prefix">{prefix}</span>}
          <span className="joy-statistic__value">{formattedValue}</span>
          {suffix && <span className="joy-statistic__suffix">{suffix}</span>}
        </div>
      </div>
    );
  }
);

Statistic.displayName = 'Statistic';
