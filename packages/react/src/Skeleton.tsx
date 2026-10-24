import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
  /** Purely visual: aria-hidden, no role/aria-busy. */
  decorative?: boolean;
  className?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'text', width, height, lines = 1, decorative = false, className = '', style, ...rest }, ref) => {
    const formatDim = (d?: string | number) => (typeof d === 'number' ? `${d}px` : d);

    // Default is role="progressbar" + aria-busy; decorative swaps both for aria-hidden.
    const a11y = decorative
      ? ({ 'aria-hidden': true } as const)
      : ({ role: 'progressbar', 'aria-busy': true } as const);

    // lines > 1: one wrapper (ref, className, style, rest, one progressbar) around N plain lines.
    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={className} style={style} {...a11y} {...rest}>
          {Array.from({ length: lines }).map((_, idx) => (
            <div
              key={idx}
              className="joy-skeleton joy-skeleton--text"
              style={{
                width: width && idx === lines - 1 ? '70%' : formatDim(width),
                height: formatDim(height)
              }}
            />
          ))}
        </div>
      );
    }

    // Consumer style is merged after the computed width/height: consumer wins per property.
    return (
      <div
        ref={ref}
        className={cx('joy-skeleton', `joy-skeleton--${variant}`, className)}
        style={{ width: formatDim(width), height: formatDim(height), ...style }}
        {...a11y}
        {...rest}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
