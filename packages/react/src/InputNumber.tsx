import * as React from 'react';

export interface InputNumberProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  onChange?: (value: number) => void;
}

export const InputNumber = React.forwardRef<HTMLDivElement, InputNumberProps>(
  ({
    value: controlledValue,
    defaultValue = 0,
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    disabled = false,
    placeholder = '',
    className = '',
    onChange
  }, ref) => {
    const [internalVal, setInternalVal] = React.useState<number>(
      controlledValue !== undefined ? controlledValue : defaultValue
    );

    const currentVal = controlledValue !== undefined ? controlledValue : internalVal;

    const clamp = (val: number): number => {
      let res = Math.max(min, Math.min(max, val));
      if (precision !== undefined) {
        res = Number(res.toFixed(precision));
      }
      return res;
    };

    const updateValue = (next: number) => {
      const clamped = clamp(next);
      if (controlledValue === undefined) {
        setInternalVal(clamped);
      }
      onChange?.(clamped);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateValue(currentVal + step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateValue(currentVal - step);
      }
    };

    return (
      <div
        ref={ref}
        className={`joy-input-number ${disabled ? 'joy-input-number--disabled' : ''} ${className}`.trim()}
        role="spinbutton"
        aria-valuenow={currentVal}
        aria-valuemin={min !== -Infinity ? min : undefined}
        aria-valuemax={max !== Infinity ? max : undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <input
          type="text"
          className="joy-input-number__input"
          disabled={disabled}
          placeholder={placeholder}
          value={currentVal}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value);
            if (!isNaN(parsed)) {
              updateValue(parsed);
            }
          }}
        />
        <div className="joy-input-number__handler-wrap">
          <button
            type="button"
            className="joy-input-number__handler-up"
            tabIndex={-1}
            aria-label="Increase value"
            disabled={disabled}
            onClick={() => updateValue(currentVal + step)}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="joy-input-number__handler-down"
            tabIndex={-1}
            aria-label="Decrease value"
            disabled={disabled}
            onClick={() => updateValue(currentVal - step)}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber';
