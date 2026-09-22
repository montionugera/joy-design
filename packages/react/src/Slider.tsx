import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showTooltip?: boolean;
  label?: string;
  onChange?: (val: number) => void;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      showTooltip = true,
      label,
      className = '',
      onChange,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [isDragging, setIsDragging] = React.useState(false);
    const railRef = React.useRef<HTMLDivElement | null>(null);

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
    const clamped = Math.min(Math.max(currentValue, min), max);
    const percentage = max > min ? ((clamped - min) / (max - min)) * 100 : 0;

    const updateFromPointer = (clientX: number) => {
      const el = railRef.current;
      if (disabled || !el) return;
      const rect = el.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
      const stepped = Math.round(raw / step) * step;
      const nextVal = Math.min(Math.max(stepped, min), max);
      if (controlledValue === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (disabled) return;
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      updateFromPointer(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      updateFromPointer(e.clientX);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      let nextVal = currentValue;
      const largeStep = step * 10;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextVal = Math.min(currentValue + step, max);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextVal = Math.max(currentValue - step, min);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        nextVal = Math.min(currentValue + largeStep, max);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        nextVal = Math.max(currentValue - largeStep, min);
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextVal = min;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextVal = max;
      } else {
        return;
      }

      if (controlledValue === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
    };

    return (
      <div
        ref={ref}
        className={cx('joy-slider', disabled && 'joy-slider--disabled', className)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        role="presentation"
        {...rest}
      >
        <div ref={railRef} className="joy-slider__rail">
          <div className="joy-slider__track" style={{ width: `${percentage}%` }} />
          <div
            className="joy-slider__handle"
            style={{ left: `${percentage}%` }}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={currentValue}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-disabled={disabled}
            aria-label={label}
            onKeyDown={handleKeyDown}
          >
            {showTooltip && isDragging && (
              <span className="joy-slider__tooltip">{currentValue}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
