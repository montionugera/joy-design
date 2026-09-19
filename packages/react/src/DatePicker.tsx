import React from 'react';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  error?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value = '', error = false, disabled = false, className = '', onChange, ...rest }, ref) => {
    return (
      <div
        className={`joy-date-picker ${disabled ? 'joy-date-picker--disabled' : ''} ${error ? 'joy-date-picker--error' : ''} ${className}`}
      >
        <input
          ref={ref}
          type="date"
          className="joy-date-picker__input"
          value={value}
          disabled={disabled}
          onChange={onChange}
          {...rest}
        />
        <span className="joy-date-picker__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
