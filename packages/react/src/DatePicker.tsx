import * as React from 'react';
import { Calendar } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      min,
      max,
      placeholder,
      disabled = false,
      error = false,
      size = 'md',
      id,
      className = '',
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        className={cx(
          'joy-date-picker',
          size && `joy-date-picker--${size}`,
          disabled && 'joy-date-picker--disabled',
          error && 'joy-date-picker--error',
          className
        )}
        style={style}
      >
        <input
          ref={ref}
          type="date"
          id={id}
          className="joy-date-picker__input"
          value={value}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
        <span className="joy-date-picker__icon" aria-hidden="true">
          <Calendar size={16} />
        </span>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
