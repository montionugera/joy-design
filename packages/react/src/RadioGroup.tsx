import * as React from 'react';
import { FormContext } from './Form';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string;
  value?: string;
  defaultValue?: string;
  options?: RadioOption[];
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  error?: boolean;
  message?: React.ReactNode;
  onChange?: (val: string) => void;
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options = [],
      direction = 'horizontal',
      disabled = false,
      error = false,
      message,
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const formContext = React.useContext(FormContext);
    const effectiveDisabled = disabled || (formContext?.disabled ?? false);

    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
    const currentValue = value !== undefined ? value : internalValue;

    const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

    const enabledIndices = options
      .map((opt, i) => (!effectiveDisabled && !opt.disabled ? i : -1))
      .filter((i) => i !== -1);

    const selectedIndex = options.findIndex((opt) => opt.value === currentValue);
    const activeIndex = enabledIndices.includes(selectedIndex)
      ? selectedIndex
      : (enabledIndices[0] ?? -1);

    const selectOption = (optValue: string, focusIdx?: number) => {
      if (value === undefined) {
        setInternalValue(optValue);
      }
      onChange?.(optValue);
      if (focusIdx !== undefined && inputRefs.current[focusIdx]) {
        inputRefs.current[focusIdx]?.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (effectiveDisabled || enabledIndices.length === 0) return;
      const currentPos = enabledIndices.indexOf(activeIndex);
      let nextPos = -1;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextPos = currentPos === -1 ? 0 : (currentPos + 1) % enabledIndices.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextPos = currentPos === -1 ? enabledIndices.length - 1 : (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextPos = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextPos = enabledIndices.length - 1;
      }

      if (nextPos !== -1) {
        const nextIdx = enabledIndices[nextPos];
        selectOption(options[nextIdx].value, nextIdx);
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-radio-group',
          direction === 'vertical' && 'joy-radio-group--vertical',
          error && 'joy-radio-group--error',
          className
        )}
        role="radiogroup"
        aria-orientation={direction}
        aria-invalid={error ? true : undefined}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {options.map((opt, i) => {
          const isOptDisabled = effectiveDisabled || Boolean(opt.disabled);
          const isChecked = currentValue === opt.value;
          return (
            <label
              key={opt.value}
              className={cx('joy-radio', isOptDisabled && 'joy-radio--disabled')}
            >
              <input
                ref={(node) => {
                  inputRefs.current[i] = node;
                }}
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
                disabled={isOptDisabled}
                tabIndex={i === activeIndex ? 0 : -1}
                onChange={() => selectOption(opt.value, i)}
              />
              <span className="joy-radio__circle" />
              <span>{opt.label}</span>
            </label>
          );
        })}
        {message && <p className="joy-radio-group__message">{message}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';
