import * as React from 'react';
import { FormContext } from './Form';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'size'> {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  name?: string;
  onChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      disabled = false,
      label,
      size = 'md',
      id,
      name,
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const formContext = React.useContext(FormContext);
    const effectiveDisabled = disabled || (formContext?.disabled ?? false);

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={effectiveDisabled}
        id={id}
        name={name}
        onClick={() => {
          if (!effectiveDisabled) onChange?.(!checked);
        }}
        className={cx(
          'joy-switch',
          checked && 'joy-switch--checked',
          effectiveDisabled && 'joy-switch--disabled',
          size === 'sm' && 'joy-switch--sm',
          className
        )}
        {...rest}
      >
        <span className="joy-switch__thumb" />
        {label && <span className="joy-switch__label">{label}</span>}
      </button>
    );
  }
);

Switch.displayName = 'Switch';
