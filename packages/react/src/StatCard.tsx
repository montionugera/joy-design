import * as React from 'react';
import { TrendingUp, TrendingDown } from '@joymify/icons/react';
import { deltaDirection } from './delta-utils.js';

export type StatCardTone = 'positive' | 'critical' | 'info' | 'neutral';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: StatCardTone;
  /** Arrow direction. Derived from the delta's leading sign when omitted; tone only sets colour. */
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, delta, deltaTone = 'positive', trend, className = '', ...rest }, ref) => {
    const direction = trend ?? deltaDirection(delta);

    return (
      <div ref={ref} className={`joy-stat-card ${className}`} {...rest}>
        <div className="joy-stat-card__label">{label}</div>
        <div className="joy-stat-card__value">{value}</div>
        {delta && (
          <div className={`joy-stat-card__delta joy-stat-card__delta--${deltaTone}`}>
            {direction === 'up' && (
              <>
                <TrendingUp size="1em" />
                <span className="joy-stat-card__sr">Increase: </span>
              </>
            )}
            {direction === 'down' && (
              <>
                <TrendingDown size="1em" />
                <span className="joy-stat-card__sr">Decrease: </span>
              </>
            )}
            <span>{delta}</span>
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
