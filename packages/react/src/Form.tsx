import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface FormContextValue {
  layout?: 'vertical' | 'horizontal' | 'inline';
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelWidth?: string | number;
  disabled?: boolean;
}

export const FormContext = React.createContext<FormContextValue>({
  layout: 'vertical',
  colon: true,
  labelAlign: 'right',
  disabled: false
});

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  layout?: 'vertical' | 'horizontal' | 'inline';
  colon?: boolean;
  labelAlign?: 'left' | 'right';
  labelWidth?: string | number;
  disabled?: boolean;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  children?: React.ReactNode;
}

const FORM_LABEL_WIDTH_VAR = ('--joy' + '-form-label-width') as any;

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      layout = 'vertical',
      colon = true,
      labelAlign = 'right',
      labelWidth,
      disabled = false,
      onSubmit,
      className = '',
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const inlineStyle: React.CSSProperties = {
      ...(labelWidth !== undefined
        ? { [FORM_LABEL_WIDTH_VAR]: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }
        : {}),
      ...style
    };

    return (
      <FormContext.Provider value={{ layout, colon, labelAlign, labelWidth, disabled }}>
        <form
          ref={ref}
          className={cx(
            'joy-form',
            // Same hook as the Svelte twin: joy-form--horizontal | --vertical | --inline (only horizontal is styled).
            layout && `joy-form--${layout}`,
            !colon && 'joy-form--no-colon',
            labelAlign === 'left' && 'joy-form--label-left',
            className
          )}
          style={inlineStyle}
          onSubmit={onSubmit}
          {...rest}
        >
          {children}
        </form>
      </FormContext.Provider>
    );
  }
);

Form.displayName = 'Form';
