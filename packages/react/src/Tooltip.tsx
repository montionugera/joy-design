import * as React from 'react';

export interface TooltipProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  className = ''
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className={`joy-tooltip-wrapper ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="joy-tooltip" role="tooltip">
          {title}
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';
