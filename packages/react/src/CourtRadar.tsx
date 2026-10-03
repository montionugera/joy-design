import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type CourtSurface = 'clay' | 'grass' | 'hard' | 'indoor';

export interface ShotPoint {
  id?: string | number;
  x: number;
  y: number;
  outcome: 'in' | 'out' | 'net';
}

export interface Trajectory {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface CourtRadarProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: CourtSurface;
  interactive?: boolean;
  title?: string;
  badge?: string;
  shots?: ShotPoint[];
  trajectories?: Trajectory[];
  onCourtClick?: (coords: { x: number; y: number }) => void;
  className?: string;
}

export const CourtRadar = React.forwardRef<HTMLDivElement, CourtRadarProps>(
  (
    {
      surface = 'hard',
      interactive = false,
      title = 'Court Radar',
      badge,
      shots = [],
      trajectories = [],
      onCourtClick,
      className = '',
      ...rest
    },
    ref
  ) => {
    const svgRef = React.useRef<SVGSVGElement | null>(null);

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!interactive || !onCourtClick || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
      onCourtClick({ x, y });
    };

    const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
      if (!interactive || !onCourtClick) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCourtClick({ x: 50, y: 50 });
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-court-radar',
          `joy-court-radar--surface-${surface}`,
          interactive && 'joy-court-radar--interactive',
          className
        )}
        {...rest}
      >
        <div className="joy-court-radar__header">
          <h4 className="joy-court-radar__title">{title}</h4>
          {badge && <span className="joy-court-radar__badge">{badge}</span>}
        </div>

        <div className="joy-court-radar__court-wrap">
          <svg
            ref={svgRef}
            className="joy-court-radar__svg"
            viewBox="0 0 360 480"
            role={interactive ? 'button' : 'img'}
            aria-label={title}
            tabIndex={interactive ? 0 : undefined}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            {/* Court background */}
            <rect x="0" y="0" width="360" height="480" rx="8" className="joy-court-radar__court-bg" />

            {/* Outer doubles boundary */}
            <rect x="40" y="40" width="280" height="400" className="joy-court-radar__line" />

            {/* Singles sidelines */}
            <line x1="75" y1="40" x2="75" y2="440" className="joy-court-radar__line" />
            <line x1="285" y1="40" x2="285" y2="440" className="joy-court-radar__line" />

            {/* Service lines */}
            <line x1="75" y1="130" x2="285" y2="130" className="joy-court-radar__line" />
            <line x1="75" y1="350" x2="285" y2="350" className="joy-court-radar__line" />

            {/* Center service line */}
            <line x1="180" y1="130" x2="180" y2="350" className="joy-court-radar__line" />

            {/* Center marks */}
            <line x1="180" y1="40" x2="180" y2="50" className="joy-court-radar__line" />
            <line x1="180" y1="430" x2="180" y2="440" className="joy-court-radar__line" />

            {/* Net */}
            <line x1="30" y1="240" x2="330" y2="240" className="joy-court-radar__net" />

            {/* Trajectories */}
            {trajectories.map((traj, idx) => (
              <line
                key={idx}
                x1={(traj.from.x / 100) * 360}
                y1={(traj.from.y / 100) * 480}
                x2={(traj.to.x / 100) * 360}
                y2={(traj.to.y / 100) * 480}
                className="joy-court-radar__trajectory"
              />
            ))}

            {/* Shot points */}
            {shots.map((shot, i) => (
              <circle
                key={shot.id ?? i}
                cx={(shot.x / 100) * 360}
                cy={(shot.y / 100) * 480}
                r="5"
                className={cx('joy-court-radar__shot-point', `joy-court-radar__shot-point--${shot.outcome}`)}
              />
            ))}
          </svg>
        </div>
      </div>
    );
  }
);

CourtRadar.displayName = 'CourtRadar';
