import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  value?: string | number | readonly string[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  readonly?: boolean;
  error?: boolean;
  success?: boolean;
  message?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  type?: string;
  id?: string;
  name?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onInput?: React.FormEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      placeholder,
      disabled = false,
      readOnly,
      readonly,
      error = false,
      success = false,
      message,
      size = 'md',
      type = 'text',
      id,
      name,
      prefix,
      suffix,
      onInput,
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isReadOnly = readOnly ?? readonly ?? false;
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div
        className={cx(
          'joy-input-wrapper',
          size && `joy-input-wrapper--${size}`,
          error && 'joy-input-wrapper--error',
          success && 'joy-input-wrapper--success',
          disabled && 'joy-input-wrapper--disabled',
          isReadOnly && 'joy-input-wrapper--readonly'
        )}
      >
        {prefix && <span className="joy-input-wrapper__prefix">{prefix}</span>}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={cx('joy-input', className)}
          onInput={onInput}
          onChange={onChange}
          {...rest}
        />
        {suffix && <span className="joy-input-wrapper__suffix">{suffix}</span>}
        {message && (
          <p className="joy-input-wrapper__message" id={messageId}>
            {message}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
