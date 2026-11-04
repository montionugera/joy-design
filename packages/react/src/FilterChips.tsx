import * as React from 'react';
import { Close, Filter } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface FilterChipItem {
  key: string;
  label: string;
  value: string;
}

export interface FilterChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  chips: FilterChipItem[];
  clearLabel?: string;
  onRemove?: (key: string) => void;
  onClear?: () => void;
  className?: string;
}

export const FilterChips = React.forwardRef<HTMLDivElement, FilterChipsProps>(
  ({ chips = [], clearLabel = 'Clear all', onRemove, onClear, className = '', ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cx(
          'joy-filter-chips',
          chips.length === 0 && 'joy-filter-chips--empty',
          className
        )}
        role="region"
        aria-label="Active filters"
        {...rest}
      >
        <span className="joy-filter-chips__icon" aria-hidden="true">
          <Filter size="0.875rem" />
        </span>

        <div className="joy-filter-chips__list">
          {chips.map((chip) => (
            <span key={chip.key} className="joy-filter-chips__chip">
              <span className="joy-filter-chips__label">{chip.label}:</span>
              <strong className="joy-filter-chips__value">{chip.value}</strong>
              <button
                type="button"
                className="joy-filter-chips__remove"
                aria-label={`Remove ${chip.label} filter`}
                onClick={() => onRemove?.(chip.key)}
              >
                <Close size="0.75rem" />
              </button>
            </span>
          ))}
        </div>

        {chips.length > 0 && onClear ? (
          <button type="button" className="joy-filter-chips__clear" onClick={() => onClear()}>
            {clearLabel}
          </button>
        ) : null}
      </div>
    );
  }
);

FilterChips.displayName = 'FilterChips';
