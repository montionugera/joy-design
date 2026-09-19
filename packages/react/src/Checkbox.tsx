import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, children, disabled, className = '', ...rest }, ref) => {
    return (
      <label className={`joy-checkbox ${disabled ? 'joy-checkbox--disabled' : ''} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          role="checkbox"
          disabled={disabled}
          {...rest}
        />
        <span className="joy-checkbox__box" />
        {children || (label && <span>{label}</span>)}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
