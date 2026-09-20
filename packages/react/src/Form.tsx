import * as React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: 'vertical' | 'horizontal' | 'inline';
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ layout = 'vertical', className = '', children, ...rest }, ref) => {
    return (
      <form
        ref={ref}
        className={`joy-form joy-form--${layout} ${className}`.trim()}
        {...rest}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';
