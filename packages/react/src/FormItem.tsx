import * as React from 'react';

export interface ValidationRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface FormItemProps {
  label?: React.ReactNode;
  name?: string;
  required?: boolean;
  error?: string;
  rules?: ValidationRule[];
  layout?: 'vertical' | 'horizontal' | 'inline';
  className?: string;
  children?: React.ReactNode;
}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({
    label,
    name,
    required = false,
    error,
    rules = [],
    layout = 'vertical',
    className = '',
    children
  }, ref) => {
    const isRequired = required || rules.some(r => r.required);

    return (
      <div
        ref={ref}
        className={`joy-form-item joy-form-item--${layout} ${error ? 'joy-form-item--error' : ''} ${className}`.trim()}
      >
        {label && (
          <label className="joy-form-item__label" htmlFor={name}>
            {isRequired && <span className="joy-form-item__required" aria-hidden="true">*</span>}
            {label}
          </label>
        )}
        <div className="joy-form-item__control">
          {children}
          {error && (
            <div className="joy-form-item__explain" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormItem.displayName = 'FormItem';
