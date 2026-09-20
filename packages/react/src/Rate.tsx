import * as React from 'react';

export interface RateProps {
  count?: number;
  value?: number;
  defaultValue?: number;
  allowHalf?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}

export const Rate = React.forwardRef<HTMLDivElement, RateProps>(
  ({
    count = 5,
    value: controlledValue,
    defaultValue = 0,
    allowHalf = false,
    disabled = false,
    className = '',
    onChange
  }, ref) => {
    const [internalVal, setInternalVal] = React.useState<number>(
      controlledValue !== undefined ? controlledValue : defaultValue
    );
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const activeValue = controlledValue !== undefined ? controlledValue : internalVal;
    const displayValue = hoverValue !== null ? hoverValue : activeValue;

    const handleClick = (index: number, isHalf: boolean) => {
      if (disabled) return;
      const next = allowHalf && isHalf ? index + 0.5 : index + 1;
      if (controlledValue === undefined) {
        setInternalVal(next);
      }
      onChange?.(next);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
      if (disabled) return;
      if (!allowHalf) {
        setHoverValue(index + 1);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const isHalf = (e.clientX - rect.left) < rect.width / 2;
      setHoverValue(isHalf ? index + 0.5 : index + 1);
    };

    return (
      <div
        ref={ref}
        className={`joy-rate ${disabled ? 'joy-rate--disabled' : ''} ${className}`.trim()}
        role="radiogroup"
        aria-label="Rating"
        onMouseLeave={() => { if (!disabled) setHoverValue(null); }}
      >
        {Array.from({ length: count }, (_, i) => {
          const isFull = displayValue >= i + 1;
          const isHalf = !isFull && displayValue >= i + 0.5;

          return (
            <div
              key={i}
              className={`joy-rate__star ${isFull ? 'joy-rate__star--full' : ''} ${isHalf ? 'joy-rate__star--half' : ''}`}
              role="radio"
              aria-checked={activeValue === i + 1 || (allowHalf && activeValue === i + 0.5)}
              aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
              tabIndex={disabled ? -1 : 0}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onClick={(e) => {
                if (!allowHalf) {
                  handleClick(i, false);
                } else {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const half = (e.clientX - rect.left) < rect.width / 2;
                  handleClick(i, half);
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFull ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            </div>
          );
        })}
      </div>
    );
  }
);

Rate.displayName = 'Rate';
