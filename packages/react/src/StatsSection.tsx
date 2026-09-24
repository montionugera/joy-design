import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface StatsSectionProps extends React.HTMLAttributes<HTMLElement> {
  stats: StatItem[];
}

export const StatsSection = React.forwardRef<HTMLElement, StatsSectionProps>(({
  stats,
  className = '',
  ...props
}, ref) => {
  return (
    <section ref={ref} className={`joy-stats-section ${className}`} {...props}>
      <div className="joy-stats-grid">
        {stats.map((item, idx) => (
          <div key={`${idx}-${item.label}`} className="joy-stat-item">
            <div className="joy-stat-item__value">{item.value}</div>
            <div className="joy-stat-item__label">{item.label}</div>
            {item.description && (
              <p className="joy-stat-item__desc">{item.description}</p>
            )}
            {item.change && (
              <div
                className={[
                  'joy-stat-item__change',
                  item.trend === 'up' && 'joy-stat-item__change--positive',
                  item.trend === 'down' && 'joy-stat-item__change--negative'
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {(item.trend === 'up' || item.trend === 'down') && (
                  <>
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points={item.trend === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                    </svg>
                    <span className="joy-stat-item__sr">{item.trend === 'up' ? 'Trend up:' : 'Trend down:'}</span>
                  </>
                )}
                {item.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
});

StatsSection.displayName = 'StatsSection';
