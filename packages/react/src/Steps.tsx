import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface StepItem {
  title: string;
  description?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

export interface StepsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  current?: number;
  items?: StepItem[];
  direction?: 'horizontal' | 'vertical';
  onChange?: (step: number) => void;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      current = 0,
      items = [],
      direction = 'horizontal',
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const getItemStatus = (item: StepItem, index: number): 'wait' | 'process' | 'finish' | 'error' => {
      if (item.status) return item.status;
      if (index < current) return 'finish';
      if (index === current) return 'process';
      return 'wait';
    };

    return (
      <div
        ref={ref}
        className={cx('joy-steps', `joy-steps--${direction}`, className)}
        role="navigation"
        aria-label="Steps progress"
        {...rest}
      >
        {items.map((item, index) => {
          const status = getItemStatus(item, index);
          return (
            <div
              key={index}
              className={`joy-steps__item joy-steps__item--${status}`}
              role="button"
              tabIndex={0}
              onClick={() => onChange?.(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange?.(index);
                }
              }}
              aria-current={index === current ? 'step' : undefined}
            >
              <div className="joy-steps__icon">
                {status === 'finish' ? (
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : status === 'error' ? (
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="joy-steps__content">
                <div className="joy-steps__title">{item.title}</div>
                {item.description && <div className="joy-steps__desc">{item.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

Steps.displayName = 'Steps';
