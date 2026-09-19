import * as React from 'react';

export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  label,
  onChange,
  className = ''
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`joy-switch ${checked ? 'joy-switch--checked' : ''} ${className}`}
    >
      <span className="joy-switch__thumb" />
      {label && <span className="joy-switch__label">{label}</span>}
    </button>
  );
};

Switch.displayName = 'Switch';
