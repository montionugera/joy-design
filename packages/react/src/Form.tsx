import * as React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: 'vertical' | 'horizontal' | 'inline';
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelWidth?: string | number;
}

export const FormContext = React.createContext<{
  layout: 'vertical' | 'horizontal' | 'inline';
  colon: boolean;
  labelAlign: 'left' | 'right';
  labelWidth?: string | number;
}>({
  layout: 'vertical',
  colon: true,
  labelAlign: 'right'
});

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ layout = 'vertical', colon = true, labelAlign = 'right', labelWidth, className = '', style, children, ...rest }, ref) => {
    const inlineStyle: React.CSSProperties = {
      ...(labelWidth ? { ['--joy-form-label-width' as any]: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth } : {}),
      ...style
    };

    return (
      <FormContext.Provider value={{ layout, colon, labelAlign, labelWidth }}>
        <form
          ref={ref}
          className={`joy-form joy-form--${layout} ${!colon ? 'joy-form--no-colon' : ''} ${labelAlign === 'left' ? 'joy-form--label-left' : ''} ${className}`.trim()}
          style={inlineStyle}
          {...rest}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';
