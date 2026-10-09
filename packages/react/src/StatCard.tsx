import * as React from 'react';
import { TrendingUp, TrendingDown } from '@montionugera/joy-icons/react';
import { deltaDirection } from './delta-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type StatCardTone = 'positive' | 'critical' | 'info' | 'neutral';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string;
  delta?: string;
  deltaTone?: StatCardTone;
  /** Arrow direction. Derived from the delta's leading sign when omitted; tone only sets colour. */
  trend?: 'up' | 'down' | 'flat';
  eyebrow?: string;
  figure?: string | number;
  unit?: string;
  qualifier?: string;
  progress?: number;
  note?: string;
  variant?: 'default' | 'editorial';
  className?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label = '',
      value = '',
      delta,
      deltaTone = 'positive',
      trend,
      eyebrow,
      figure,
      unit,
      qualifier,
      progress,
      note,
      variant = 'default',
      className = '',
      ...rest
    },
    ref
  ) => {
    const direction = trend ?? deltaDirection(delta);

    return (
      <div
        ref={ref}
        className={cx('joy-stat-card', variant === 'editorial' && 'joy-stat-card--editorial', className)}
        {...rest}
      >
        {variant === 'editorial' ? (
          <>
            {eyebrow && <div className="joy-stat-card__eyebrow">{eyebrow}</div>}
            <div className="joy-stat-card__row">
              <div className="joy-stat-card__figure">{figure ?? value}</div>
              {unit && <span className="joy-stat-card__unit">{unit}</span>}
              {qualifier && <span className="joy-stat-card__qualifier">{qualifier}</span>}
            </div>
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
            {progress !== undefined && (
              <div className="joy-stat-card__progress-wrap">
                <div
                  className="joy-stat-card__progress-bar"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
            {note && <div className="joy-stat-card__note">{note}</div>}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
