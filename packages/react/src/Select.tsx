import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
  className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options = [], placeholder, className = '', children, ...rest }, ref) => {
    return (
      <div className="joy-select-wrapper">
        <select
          ref={ref}
          className={`joy-select ${className}`}
          aria-label={placeholder}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled selected={!rest.value && !rest.defaultValue}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
