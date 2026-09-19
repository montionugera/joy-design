import React from 'react';

export type StatCardTone = 'positive' | 'critical' | 'info' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: StatCardTone;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  deltaTone = 'positive',
  className = ''
}) => {
  return (
    <div className={`joy-stat-card ${className}`}>
      <div className="joy-stat-card__label">{label}</div>
      <div className="joy-stat-card__value">{value}</div>
      {delta && (
        <div className={`joy-stat-card__delta joy-stat-card__delta--${deltaTone}`}>
          {delta}
        </div>
      )}
    </div>
  );
};

StatCard.displayName = 'StatCard';
