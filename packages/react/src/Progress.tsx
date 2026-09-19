import React from 'react';

export type ProgressStatus = 'normal' | 'active' | 'success' | 'exception';

export interface ProgressProps {
  percent?: number;
  status?: ProgressStatus;
  showInfo?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  percent = 0,
  status = 'normal',
  showInfo = true,
  strokeWidth = 8,
  strokeColor,
  className = ''
}) => {
  const computedStatus = percent >= 100 ? 'success' : status;

  return (
    <div className={`joy-progress joy-progress--status-${computedStatus} ${className}`}>
      <div className="joy-progress__outer">
        <div className="joy-progress__inner">
          <div
            className="joy-progress__bg"
            style={{
              width: `${percent}%`,
              height: `${strokeWidth}px`,
              backgroundColor: strokeColor || undefined
            }}
          />
        </div>
      </div>
      {showInfo && (
        <span className="joy-progress__text">
          {computedStatus === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : computedStatus === 'exception' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            `${percent}%`
          )}
        </span>
      )}
    </div>
  );
};

Progress.displayName = 'Progress';
