import React, { forwardRef } from 'react';

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  status?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  items?: TimelineItem[];
}

export const Timeline = forwardRef<HTMLUListElement, TimelineProps>(
  ({ items = [], className = '', ...props }, ref) => {
    return (
      <ul ref={ref} className={`joy-timeline ${className}`} role="list" {...props}>
        {items.map((item, idx) => (
          <li key={idx} className="joy-timeline__item">
            <div className={`joy-timeline__dot joy-timeline__dot--${item.status || 'primary'}`} />
            <div className="joy-timeline__content">
              <div className="joy-timeline__title">{item.title}</div>
              {item.description && <div className="joy-timeline__description">{item.description}</div>}
              {item.time && <div className="joy-timeline__time">{item.time}</div>}
            </div>
          </li>
        ))}
      </ul>
    );
  }
);

Timeline.displayName = 'Timeline';
