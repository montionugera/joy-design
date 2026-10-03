import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface LapRecord {
  lap: number;
  split: string;
  overall: string;
}

export interface ChronometerDialProps extends React.HTMLAttributes<HTMLDivElement> {
  time?: string;
  progress?: number;
  running?: boolean;
  label?: string;
  laps?: LapRecord[];
  startText?: string;
  stopText?: string;
  resetText?: string;
  lapText?: string;
  onToggle?: () => void;
  onLap?: () => void;
  onReset?: () => void;
  className?: string;
}

export const ChronometerDial = React.forwardRef<HTMLDivElement, ChronometerDialProps>(
  (
    {
      time = '00:00.00',
      progress = 0,
      running = false,
      label = 'SPLIT LAP',
      laps = [],
      startText = 'Start',
      stopText = 'Stop',
      resetText = 'Reset',
      lapText = 'Lap',
      onToggle,
      onLap,
      onReset,
      className = '',
      ...rest
    },
    ref
  ) => {
    const radius = 96;
    const circumference = 2 * Math.PI * radius; // ~603.185
    const strokeDashoffset = circumference * (1 - Math.max(0, Math.min(100, progress)) / 100);

    return (
      <div ref={ref} className={cx('joy-chronometer-dial', className)} {...rest}>
        <div className="joy-chronometer-dial__dial-wrap">
          <svg className="joy-chronometer-dial__svg" viewBox="0 0 220 220" role="img" aria-label="Stopwatch dial">
            {/* Background Track */}
            <circle
              className="joy-chronometer-dial__track"
              cx="110"
              cy="110"
              r={radius}
            />
            {/* Progress Ring */}
            <circle
              className="joy-chronometer-dial__progress"
              cx="110"
              cy="110"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="joy-chronometer-dial__center">
            <span className="joy-chronometer-dial__time">{time}</span>
            <span className="joy-chronometer-dial__label">{label}</span>
          </div>
        </div>

        <div className="joy-chronometer-dial__controls">
          {running ? (
            <>
              <button
                type="button"
                className="joy-chronometer-dial__btn joy-chronometer-dial__btn--secondary"
                onClick={onLap}
              >
                {lapText}
              </button>
              <button
                type="button"
                className="joy-chronometer-dial__btn joy-chronometer-dial__btn--primary"
                onClick={onToggle}
              >
                {stopText}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="joy-chronometer-dial__btn joy-chronometer-dial__btn--secondary"
                onClick={onReset}
              >
                {resetText}
              </button>
              <button
                type="button"
                className="joy-chronometer-dial__btn joy-chronometer-dial__btn--primary"
                onClick={onToggle}
              >
                {startText}
              </button>
            </>
          )}
        </div>

        {laps.length > 0 && (
          <div className="joy-chronometer-dial__laps">
            {laps.map((lapItem) => (
              <div key={lapItem.lap} className="joy-chronometer-dial__lap-item">
                <span>Lap {lapItem.lap}</span>
                <span>+{lapItem.split}</span>
                <span>{lapItem.overall}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ChronometerDial.displayName = 'ChronometerDial';
