import * as React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options?: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  onChange?: (val: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  defaultValue,
  options = [],
  direction = 'horizontal',
  disabled = false,
  onChange,
  className = ''
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (optValue: string) => {
    if (disabled) return;
    if (value === undefined) {
      setInternalValue(optValue);
    }
    onChange?.(optValue);
  };

  return (
    <div
      className={`joy-radio-group ${direction === 'vertical' ? 'joy-radio-group--vertical' : ''} ${className}`}
      role="radiogroup"
      aria-orientation={direction}
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`joy-radio ${disabled || opt.disabled ? 'joy-radio--disabled' : ''}`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={currentValue === opt.value}
            disabled={disabled || opt.disabled}
            onChange={() => handleChange(opt.value)}
          />
          <span className="joy-radio__circle" />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
