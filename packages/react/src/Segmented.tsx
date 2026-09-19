import React, { forwardRef } from 'react';

export interface SegmentedOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: (string | number | SegmentedOption)[];
  value?: string | number;
  onChange?: (value: string | number) => void;
}

export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(
  ({ options = [], value, onChange, className = '', ...props }, ref) => {
    const normalizedOptions: SegmentedOption[] = options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? opt
        : { label: String(opt), value: opt, disabled: false }
    );

    return (
      <div ref={ref} className={`joy-segmented ${className}`} role="radiogroup" {...props}>
        {normalizedOptions.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            className={`joy-segmented__item ${value === opt.value ? 'joy-segmented__item--active' : ''}`}
            role="radio"
            aria-checked={value === opt.value}
            disabled={opt.disabled}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }
);

Segmented.displayName = 'Segmented';
