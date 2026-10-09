import * as React from 'react';
import { ChevronRight, ChevronLeft } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

export interface TransferProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  dataSource: TransferItem[];
  targetKeys?: string[];
  titles?: [string, string];
  disabled?: boolean;
  onChange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  (
    {
      dataSource = [],
      targetKeys: controlledTargetKeys,
      titles = ['Source', 'Target'],
      disabled = false,
      className = '',
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const [internalTargetKeys, setInternalTargetKeys] = React.useState<string[]>([]);
    const [sourceSelected, setSourceSelected] = React.useState<string[]>([]);
    const [targetSelected, setTargetSelected] = React.useState<string[]>([]);

    const targetKeys = controlledTargetKeys !== undefined ? controlledTargetKeys : internalTargetKeys;

    const sourceItems = dataSource.filter((item) => !targetKeys.includes(item.key));
    const targetItems = dataSource.filter((item) => targetKeys.includes(item.key));

    const toggleSource = (key: string) => {
      if (disabled) return;
      setSourceSelected((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const toggleTarget = (key: string) => {
      if (disabled) return;
      setTargetSelected((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const selectableSourceKeys = sourceItems.filter((i) => !i.disabled).map((i) => i.key);
    const selectableTargetKeys = targetItems.filter((i) => !i.disabled).map((i) => i.key);

    const allSourceSelected =
      selectableSourceKeys.length > 0 &&
      selectableSourceKeys.every((k) => sourceSelected.includes(k));

    const allTargetSelected =
      selectableTargetKeys.length > 0 &&
      selectableTargetKeys.every((k) => targetSelected.includes(k));

    const toggleAllSource = () => {
      if (disabled) return;
      if (allSourceSelected) {
        setSourceSelected((prev) => prev.filter((k) => !selectableSourceKeys.includes(k)));
      } else {
        setSourceSelected((prev) => Array.from(new Set([...prev, ...selectableSourceKeys])));
      }
    };

    const toggleAllTarget = () => {
      if (disabled) return;
      if (allTargetSelected) {
        setTargetSelected((prev) => prev.filter((k) => !selectableTargetKeys.includes(k)));
      } else {
        setTargetSelected((prev) => Array.from(new Set([...prev, ...selectableTargetKeys])));
      }
    };

    const moveToTarget = () => {
      if (disabled || sourceSelected.length === 0) return;
      const moveKeys = [...sourceSelected];
      const next = [...targetKeys, ...moveKeys];
      if (controlledTargetKeys === undefined) {
        setInternalTargetKeys(next);
      }
      setSourceSelected([]);
      onChange?.(next, 'right', moveKeys);
    };

    const moveToSource = () => {
      if (disabled || targetSelected.length === 0) return;
      const moveKeys = [...targetSelected];
      const next = targetKeys.filter((k) => !moveKeys.includes(k));
      if (controlledTargetKeys === undefined) {
        setInternalTargetKeys(next);
      }
      setTargetSelected([]);
      onChange?.(next, 'left', moveKeys);
    };

    return (
      <div
        ref={ref}
        className={cx('joy-transfer', disabled && 'joy-transfer--disabled', className)}
        style={style}
        {...rest}
      >
        {/* Source List */}
        <div className="joy-transfer__list">
          <div className="joy-transfer__header">
            <input
              type="checkbox"
              checked={allSourceSelected}
              disabled={disabled || selectableSourceKeys.length === 0}
              onChange={toggleAllSource}
              aria-label={`Select all ${titles[0]}`}
            />
            <span className="joy-transfer__header-title">{titles[0]}</span>
            <span className="joy-transfer__header-count">
              {sourceSelected.length}/{sourceItems.length} items
            </span>
          </div>
          <div className="joy-transfer__body">
            {sourceItems.map((item) => {
              const isSelected = sourceSelected.includes(item.key);
              return (
                <label
                  key={item.key}
                  className={cx(
                    'joy-transfer__item',
                    isSelected && 'joy-transfer__item--selected'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled || item.disabled}
                    onChange={() => toggleSource(item.key)}
                  />
                  <span className="joy-transfer__item-text">{item.title}</span>
                </label>
              );
            })}
            {sourceItems.length === 0 && (
              <div className="joy-transfer__empty">No items</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="joy-transfer__operations">
          <button
            type="button"
            className="joy-button joy-button--solid joy-button--sm joy-button--icon-only"
            disabled={disabled || sourceSelected.length === 0}
            onClick={moveToTarget}
            aria-label="Move right"
          >
            <ChevronRight width={14} height={14} />
          </button>
          <button
            type="button"
            className="joy-button joy-button--solid joy-button--sm joy-button--icon-only"
            disabled={disabled || targetSelected.length === 0}
            onClick={moveToSource}
            aria-label="Move left"
          >
            <ChevronLeft width={14} height={14} />
          </button>
        </div>

        {/* Target List */}
        <div className="joy-transfer__list">
          <div className="joy-transfer__header">
            <input
              type="checkbox"
              checked={allTargetSelected}
              disabled={disabled || selectableTargetKeys.length === 0}
              onChange={toggleAllTarget}
              aria-label={`Select all ${titles[1]}`}
            />
            <span className="joy-transfer__header-title">{titles[1]}</span>
            <span className="joy-transfer__header-count">
              {targetSelected.length}/{targetItems.length} items
            </span>
          </div>
          <div className="joy-transfer__body">
            {targetItems.map((item) => {
              const isSelected = targetSelected.includes(item.key);
              return (
                <label
                  key={item.key}
                  className={cx(
                    'joy-transfer__item',
                    isSelected && 'joy-transfer__item--selected'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled || item.disabled}
                    onChange={() => toggleTarget(item.key)}
                  />
                  <span className="joy-transfer__item-text">{item.title}</span>
                </label>
              );
            })}
            {targetItems.length === 0 && (
              <div className="joy-transfer__empty">No items</div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Transfer.displayName = 'Transfer';
