import * as React from 'react';
import { TrendingUp, TrendingDown } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface MetricTileProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricTile = React.forwardRef<HTMLDivElement, MetricTileProps>(
  ({ title, value, change, trend = 'neutral', className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx(`joy-metric-tile joy-metric-tile--${trend}`, className)} {...rest}>
        <div className="joy-metric-tile__title">{title}</div>
        <div className="joy-metric-tile__value">{value}</div>
        {change && (
          <div className="joy-metric-tile__change">
            {trend === 'up' && (
              <>
                <TrendingUp size="1em" />
                <span className="joy-metric-tile__sr">Increase: </span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown size="1em" />
                <span className="joy-metric-tile__sr">Decrease: </span>
              </>
            )}
            <span>{change}</span>
          </div>
        )}
      </div>
    );
  }
);

MetricTile.displayName = 'MetricTile';
