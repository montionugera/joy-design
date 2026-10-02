import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface EmblemProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  ringText?: string;
  centerText?: string;
  className?: string;
}

export const Emblem = React.forwardRef<SVGSVGElement, EmblemProps>(
  ({ size = 64, ringText = 'JOYMIFY DESSAU • 1919', centerText = 'DS', className = '', ...rest }, ref) => {
    return (
      <svg
        ref={ref}
        className={cx('joy-emblem', className)}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label={ringText || centerText || 'Emblem'}
        {...rest}
      >
        <defs>
          <path id="emblem-circle-path" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
        </defs>
        <circle className="joy-emblem__field" cx="50" cy="50" r="48" />
        <circle className="joy-emblem__ring" cx="50" cy="50" r="44" strokeWidth="1.5" />
        <circle className="joy-emblem__disc" cx="50" cy="50" r="22" />
        {ringText && (
          <text className="joy-emblem__text">
            <textPath href="#emblem-circle-path" startOffset="50%" textAnchor="middle">
              {ringText}
            </textPath>
          </text>
        )}
        {centerText && (
          <text className="joy-emblem__text" x="50" y="54" textAnchor="middle" fontWeight="700" fontSize="12">
            {centerText}
          </text>
        )}
      </svg>
    );
  }
);

Emblem.displayName = 'Emblem';
