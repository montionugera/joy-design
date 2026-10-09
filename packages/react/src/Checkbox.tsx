import * as React from 'react';
import { FormContext } from './Form.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  value?: string | number | readonly string[];
  label?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      indeterminate = false,
      disabled = false,
      name,
      id,
      value,
      label,
      onChange,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const formContext = React.useContext(FormContext);
    const effectiveDisabled = disabled || (formContext?.disabled ?? false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    return (
      <label className={cx('joy-checkbox', effectiveDisabled && 'joy-checkbox--disabled', className)}>
        <input
          ref={setRef}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={checked}
          disabled={effectiveDisabled}
          onChange={onChange}
          {...rest}
        />
        <span className="joy-checkbox__box" />
        {children || (label && <span>{label}</span>)}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
