import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface RateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  count?: number;
  value?: number;
  defaultValue?: number;
  allowHalf?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  label?: string;
  onChange?: (value: number) => void;
}

export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  (
    {
      count = 5,
      value: controlledValue,
      defaultValue = 0,
      allowHalf = false,
      disabled = false,
      readonly = false,
      readOnly = false,
      label,
      className = '',
      onChange,
      ...rest
    },
    ref
  ) => {
    const isReadOnly = readonly || readOnly;
    const isInteractive = !disabled && !isReadOnly;

    const [internalVal, setInternalVal] = React.useState<number>(
      controlledValue !== undefined ? controlledValue : defaultValue
    );
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const activeValue = controlledValue !== undefined ? controlledValue : internalVal;
    const displayValue = hoverValue !== null ? hoverValue : activeValue;

    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const activeFocusStar = Math.max(1, Math.min(count, Math.ceil(activeValue || 1)));

    const updateValue = (next: number, focusStar?: number) => {
      if (!isInteractive) return;
      if (controlledValue === undefined) {
        setInternalVal(next);
      }
      onChange?.(next);
      if (focusStar !== undefined && buttonRefs.current[focusStar - 1]) {
        buttonRefs.current[focusStar - 1]?.focus();
      }
    };

    const handleClick = (starNumber: number, isHalf: boolean) => {
      if (!isInteractive) return;
      const next = allowHalf && isHalf ? starNumber - 0.5 : starNumber;
      updateValue(next, starNumber);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, starNumber: number) => {
      if (!isInteractive) return;
      if (!allowHalf) {
        setHoverValue(starNumber);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const isHalf = e.clientX - rect.left < rect.width / 2;
      setHoverValue(isHalf ? starNumber - 0.5 : starNumber);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      const step = allowHalf ? 0.5 : 1;
      let nextVal = activeValue;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextVal = Math.min(activeValue + step, count);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextVal = Math.max(activeValue - step, 0);
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextVal = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextVal = count;
      } else {
        return;
      }

      const nextFocus = Math.max(1, Math.min(count, Math.ceil(nextVal || 1)));
      updateValue(nextVal, nextFocus);
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-rate',
          disabled && 'joy-rate--disabled',
          isReadOnly && 'joy-rate--readonly',
          className
        )}
        role="radiogroup"
        aria-label={label || 'Rating'}
        aria-readonly={isReadOnly ? true : undefined}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => {
          if (isInteractive) setHoverValue(null);
        }}
        {...rest}
      >
        {Array.from({ length: count }, (_, i) => {
          const starNumber = i + 1;
          const isFull = displayValue >= starNumber;
          const isHalf = !isFull && displayValue >= starNumber - 0.5;

          return (
            <button
              key={i}
              ref={(node) => {
                buttonRefs.current[i] = node;
              }}
              type="button"
              className={cx(
                'joy-rate__star',
                isFull && 'joy-rate__star--full',
                isHalf && 'joy-rate__star--half'
              )}
              role="radio"
              aria-checked={
                activeValue === starNumber || (allowHalf && activeValue === starNumber - 0.5)
              }
              aria-label={`${starNumber} of ${count}`}
              tabIndex={disabled ? -1 : starNumber === activeFocusStar ? 0 : -1}
              disabled={disabled}
              onMouseMove={(e) => handleMouseMove(e, starNumber)}
              onClick={(e) => {
                if (!allowHalf) {
                  handleClick(starNumber, false);
                } else {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const half = e.clientX - rect.left < rect.width / 2;
                  handleClick(starNumber, half);
                }
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={isFull ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isHalf ? (
                  <>
                    <defs>
                      <linearGradient id={`react-star-grad-${i}`}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill={`url(#react-star-grad-${i})`}
                    />
                  </>
                ) : (
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                )}
              </svg>
            </button>
          );
        })}
      </div>
    );
  }
);

Rate.displayName = 'Rate';
