import * as React from 'react';

export interface MetricTileProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  className = ''
}) => {
  return (
    <div className={`joy-metric-tile joy-metric-tile--${trend} ${className}`}>
      <div className="joy-metric-tile__title">{title}</div>
      <div className="joy-metric-tile__value">{value}</div>
      {change && (
        <div className="joy-metric-tile__change">
          {trend === 'up' && '▲ '}
          {trend === 'down' && '▼ '}
          {change}
        </div>
      )}
    </div>
  );
};

MetricTile.displayName = 'MetricTile';
