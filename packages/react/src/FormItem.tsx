import * as React from 'react';
import { FormContext } from './Form';

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
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelWidth?: string | number;
  error?: string;
  rules?: ValidationRule[];
  layout?: 'vertical' | 'horizontal' | 'inline';
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({
    label,
    name,
    required = false,
    colon,
    labelAlign,
    labelWidth,
    error,
    rules = [],
    layout,
    className = '',
    style,
    children
  }, ref) => {
    const context = React.useContext(FormContext);
    const effectiveLayout = layout ?? context.layout ?? 'vertical';
    const effectiveColon = colon ?? context.colon ?? true;
    const effectiveAlign = labelAlign ?? context.labelAlign ?? 'right';
    const effectiveWidth = labelWidth ?? context.labelWidth;

    const isRequired = required || rules.some(r => r.required);

    const itemStyle: React.CSSProperties = {
      ...(effectiveWidth ? { ['--joy-form-label-width' as any]: typeof effectiveWidth === 'number' ? `${effectiveWidth}px` : effectiveWidth } : {}),
      ...style
    };

    return (
      <div
        ref={ref}
        style={itemStyle}
        className={`joy-form-item joy-form-item--${effectiveLayout} ${!effectiveColon ? 'joy-form-item--no-colon' : ''} ${effectiveAlign === 'left' ? 'joy-form-item--label-left' : ''} ${error ? 'joy-form-item--error' : ''} ${className}`.trim()}
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
