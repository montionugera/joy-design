import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SegmentedOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: (string | SegmentedOption)[];
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: string) => void;
}

export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      disabled = false,
      size = 'md',
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const normalizedOptions: SegmentedOption[] = options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? { ...opt, value: String(opt.value) }
        : { label: String(opt), value: String(opt), disabled: false }
    );

    const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
    const currentValue = value !== undefined ? value : internalValue;

    const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

    const enabledIndices = normalizedOptions
      .map((opt, i) => (!disabled && !opt.disabled ? i : -1))
      .filter((i) => i !== -1);

    const selectedIndex = normalizedOptions.findIndex((opt) => opt.value === currentValue);
    const activeIndex = enabledIndices.includes(selectedIndex)
      ? selectedIndex
      : (enabledIndices[0] ?? -1);

    const selectOption = (val: string, focusIdx?: number) => {
      if (value === undefined) {
        setInternalValue(val);
      }
      onChange?.(val);
      if (focusIdx !== undefined && buttonRefs.current[focusIdx]) {
        buttonRefs.current[focusIdx]?.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || enabledIndices.length === 0) return;
      const currentPos = enabledIndices.indexOf(activeIndex);
      let nextPos = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextPos = currentPos === -1 ? 0 : (currentPos + 1) % enabledIndices.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextPos =
          currentPos === -1
            ? enabledIndices.length - 1
            : (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextPos = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextPos = enabledIndices.length - 1;
      }

      if (nextPos !== -1) {
        const nextIdx = enabledIndices[nextPos];
        selectOption(normalizedOptions[nextIdx].value, nextIdx);
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-segmented',
          size === 'sm' && 'joy-segmented--sm',
          className
        )}
        role="radiogroup"
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {normalizedOptions.map((opt, i) => {
          const isItemDisabled = disabled || Boolean(opt.disabled);
          const isActive = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              ref={(node) => {
                buttonRefs.current[i] = node;
              }}
              type="button"
              className={cx(
                'joy-segmented__item',
                isActive && 'joy-segmented__item--active'
              )}
              role="radio"
              aria-checked={isActive}
              tabIndex={i === activeIndex ? 0 : -1}
              disabled={isItemDisabled}
              onClick={() => {
                if (!isItemDisabled) selectOption(opt.value, i);
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }
);

Segmented.displayName = 'Segmented';
