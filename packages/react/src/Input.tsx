import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...rest }, ref) => {
    return (
      <div className={`joy-input-wrapper ${error ? 'joy-input-wrapper--error' : ''}`}>
        <input ref={ref} className={`joy-input ${className}`} {...rest} />
      </div>
    );
  }
);

Input.displayName = 'Input';
