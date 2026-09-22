import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  readonly?: boolean;
  readOnly?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: number | null) => void;
}

export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      defaultValue = 0,
      min,
      max,
      step = 1,
      precision,
      disabled = false,
      readonly,
      readOnly,
      error = false,
      size = 'md',
      placeholder = '',
      id,
      name,
      className = '',
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const isReadOnly = readOnly ?? readonly ?? false;
    const [internalValue, setInternalValue] = React.useState<number | null>(
      value !== undefined ? value : defaultValue
    );
    const currentValue = value !== undefined ? value : internalValue;

    const clamp = (val: number): number => {
      let res = val;
      if (min !== undefined) res = Math.max(min, res);
      if (max !== undefined) res = Math.min(max, res);
      if (precision !== undefined) {
        res = Number(res.toFixed(precision));
      }
      return res;
    };

    const updateValue = (next: number | null) => {
      const nextVal = next !== null ? clamp(next) : null;
      if (value === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
    };

    const [inputStr, setInputStr] = React.useState<string>(
      currentValue !== null && currentValue !== undefined ? String(currentValue) : ''
    );

    React.useEffect(() => {
      if (currentValue !== null && currentValue !== undefined) {
        setInputStr(String(currentValue));
      } else {
        setInputStr('');
      }
    }, [currentValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setInputStr(text);
      if (text.trim() === '') {
        updateValue(null);
      } else {
        const parsed = parseFloat(text);
        if (!isNaN(parsed)) {
          updateValue(parsed);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled || isReadOnly) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const base = currentValue ?? (min !== undefined ? min : 0);
        updateValue(base + step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const base = currentValue ?? (min !== undefined ? min : 0);
        updateValue(base - step);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (currentValue !== null && currentValue !== undefined) {
        setInputStr(String(currentValue));
      } else {
        setInputStr('');
      }
      rest.onBlur?.(e);
    };

    return (
      <div
        className={cx(
          'joy-input-number',
          size && `joy-input-number--${size}`,
          disabled && 'joy-input-number--disabled',
          isReadOnly && 'joy-input-number--readonly',
          error && 'joy-input-number--error',
          className
        )}
        style={style}
      >
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          id={id}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadOnly}
          className="joy-input-number__input"
          value={inputStr}
          aria-valuenow={currentValue !== null && currentValue !== undefined ? currentValue : undefined}
          aria-valuemin={min !== undefined ? min : undefined}
          aria-valuemax={max !== undefined ? max : undefined}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          {...rest}
        />
        <div className="joy-input-number__handler-wrap">
          <button
            type="button"
            className="joy-input-number__handler-up"
            tabIndex={-1}
            aria-label="Increase"
            disabled={disabled || isReadOnly}
            onClick={() => {
              if (disabled || isReadOnly) return;
              const base = currentValue ?? (min !== undefined ? min : 0);
              updateValue(base + step);
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            type="button"
            className="joy-input-number__handler-down"
            tabIndex={-1}
            aria-label="Decrease"
            disabled={disabled || isReadOnly}
            onClick={() => {
              if (disabled || isReadOnly) return;
              const base = currentValue ?? (min !== undefined ? min : 0);
              updateValue(base - step);
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

InputNumber.displayName = 'InputNumber';
