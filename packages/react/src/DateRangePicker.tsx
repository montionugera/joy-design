import * as React from 'react';
import { DatePicker } from './DatePicker.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: boolean;
  startId?: string;
  endId?: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: DateRangeValue) => void;
}

export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue = { start: '', end: '' },
      min,
      max,
      disabled = false,
      error = false,
      startId,
      endId,
      className = '',
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<DateRangeValue>(
      value !== undefined ? value : defaultValue
    );
    const currentValue = value !== undefined ? value : internalValue;

    const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...currentValue, start: e.target.value };
      const resolved =
        next.start && next.end && next.start > next.end
          ? { start: next.end, end: next.start }
          : next;
      if (value === undefined) {
        setInternalValue(resolved);
      }
      onChange?.(resolved);
    };

    const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...currentValue, end: e.target.value };
      const resolved =
        next.start && next.end && next.start > next.end
          ? { start: next.end, end: next.start }
          : next;
      if (value === undefined) {
        setInternalValue(resolved);
      }
      onChange?.(resolved);
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-date-range-picker',
          disabled && 'joy-date-range-picker--disabled',
          className
        )}
        style={style}
        {...rest}
      >
        <DatePicker
          id={startId}
          value={currentValue.start}
          min={min}
          max={currentValue.end || max}
          disabled={disabled}
          error={error}
          onChange={handleStart}
        />
        <span className="joy-date-range-picker__sep" aria-hidden="true">to</span>
        <DatePicker
          id={endId}
          value={currentValue.end}
          min={currentValue.start || min}
          max={max}
          disabled={disabled}
          error={error}
          onChange={handleEnd}
        />
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';
