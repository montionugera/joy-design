import * as React from 'react';
import { FormContext } from './Form';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ValidationRule {
  required?: boolean;
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  name?: string;
  required?: boolean;
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelWidth?: string | number;
  error?: React.ReactNode;
  help?: React.ReactNode;
  rules?: ValidationRule[];
  layout?: 'vertical' | 'horizontal' | 'inline';
  children?: React.ReactNode;
}

const FORM_LABEL_WIDTH_VAR = ('--joy' + '-form-label-width') as any;

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  (
    {
      label,
      name,
      required = false,
      colon,
      labelAlign,
      labelWidth,
      error,
      help,
      rules = [],
      layout,
      className = '',
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const context = React.useContext(FormContext);
    const effectiveLayout = layout ?? context.layout ?? 'vertical';
    const effectiveColon = colon ?? context.colon ?? true;
    const effectiveAlign = labelAlign ?? context.labelAlign ?? 'right';
    const effectiveWidth = labelWidth ?? context.labelWidth;

    const isRequired = required || rules.some((r) => r.required);

    const itemStyle: React.CSSProperties = {
      ...(effectiveWidth !== undefined
        ? { [FORM_LABEL_WIDTH_VAR]: typeof effectiveWidth === 'number' ? `${effectiveWidth}px` : effectiveWidth }
        : {}),
      ...style
    };

    return (
      <div
        ref={ref}
        style={itemStyle}
        className={cx(
          'joy-form-item',
          effectiveLayout === 'horizontal' && 'joy-form-item--horizontal',
          !effectiveColon && 'joy-form-item--no-colon',
          effectiveAlign === 'left' && 'joy-form-item--label-left',
          !!error && 'joy-form-item--error',
          className
        )}
        {...rest}
      >
        {label && (
          <label className="joy-form-item__label" htmlFor={name || undefined}>
            {isRequired && (
              <span className="joy-form-item__required" aria-hidden="true">
                *
              </span>
            )}
            {label}
          </label>
        )}
        <div className="joy-form-item__control">
          {children}
          {error ? (
            <p className="joy-form-item__explain" role="alert">
              {error}
            </p>
          ) : help ? (
            <p className="joy-form-item__explain">{help}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

FormItem.displayName = 'FormItem';
