import React from 'react';
import { DatePicker } from './DatePicker.js';

export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangePickerProps {
  value?: DateRangeValue;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  onChange?: (value: DateRangeValue) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { start: '', end: '' },
  min,
  max,
  disabled = false,
  error = false,
  className = '',
  onChange
}) => {
  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...value, start: e.target.value };
    if (next.start && next.end && next.start > next.end) {
      onChange?.({ start: next.end, end: next.start });
    } else {
      onChange?.(next);
    }
  };

  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...value, end: e.target.value };
    if (next.start && next.end && next.start > next.end) {
      onChange?.({ start: next.end, end: next.start });
    } else {
      onChange?.(next);
    }
  };

  return (
    <div className={`joy-date-range-picker ${disabled ? 'joy-date-range-picker--disabled' : ''} ${className}`}>
      <DatePicker
        value={value.start}
        min={min}
        max={value.end || max}
        disabled={disabled}
        error={error}
        onChange={handleStart}
      />
      <span className="joy-date-range-picker__sep" aria-hidden="true">→</span>
      <DatePicker
        value={value.end}
        min={value.start || min}
        max={max}
        disabled={disabled}
        error={error}
        onChange={handleEnd}
      />
    </div>
  );
};

DateRangePicker.displayName = 'DateRangePicker';
