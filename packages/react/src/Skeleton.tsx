import * as React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = ''
}) => {
  const formatDim = (d?: string | number) => (typeof d === 'number' ? `${d}px` : d);

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className} role="progressbar" aria-busy="true">
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

  return (
    <div
      className={`joy-skeleton joy-skeleton--${variant} ${className}`}
      style={{
        width: formatDim(width),
        height: formatDim(height)
      }}
      role="progressbar"
      aria-busy="true"
    />
  );
};

Skeleton.displayName = 'Skeleton';
