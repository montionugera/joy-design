import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TelemetryMetric {
  label: string;
  value: string | number;
  unit?: string;
  zone?: string;
}

export interface TelemetryStripProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics: TelemetryMetric[];
  className?: string;
}

export const TelemetryStrip = React.forwardRef<HTMLDivElement, TelemetryStripProps>(
  ({ metrics = [], className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx('joy-telemetry-strip', className)} {...rest}>
        {metrics.map((item, idx) => (
          <div key={item.label + idx} className="joy-telemetry-strip__item">
            <span className="joy-telemetry-strip__label">{item.label}</span>
            <span className="joy-telemetry-strip__metric">
              {item.value}
              {item.unit ? ` ${item.unit}` : ''}
            </span>
            {item.zone && <span className="joy-telemetry-strip__zone">{item.zone}</span>}
          </div>
        ))}
      </div>
    );
  }
);

TelemetryStrip.displayName = 'TelemetryStrip';
