import * as React from 'react';
import { useOverlay } from './useOverlay.js';
import { ChevronDown, ChevronRight, Close } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: CascaderOption[];
  isLeaf?: boolean;
}

export interface CascaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: CascaderOption[];
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  changeOnSelect?: boolean;
  displayRender?: (labels: string[]) => string;
  onChange?: (value: string[], selectedOptions: CascaderOption[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Cascader = React.forwardRef<HTMLDivElement, CascaderProps>(
  (
    {
      options = [],
      value: controlledValue,
      defaultValue = [],
      placeholder = 'Please select...',
      allowClear = true,
      disabled = false,
      changeOnSelect = false,
      displayRender,
      onChange,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
    const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

    const [activePath, setActivePath] = React.useState<CascaderOption[]>([]);
    const [activeCol, setActiveCol] = React.useState(0);
    const [activeRow, setActiveRow] = React.useState(0);

    const controlRef = React.useRef<HTMLDivElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);

    useOverlay(open, controlRef, panelRef, () => setOpen(false));

    React.useEffect(() => {
      if (open) {
        const path: CascaderOption[] = [];
        let currentOptions = options;
        for (const val of selectedValue) {
          const match = currentOptions.find((opt) => opt.value === val);
          if (match) {
            path.push(match);
            currentOptions = match.children || [];
          } else {
            break;
          }
        }
        setActivePath(path);
        setActiveCol(Math.max(0, path.length - 1));
        const lastColOptions = path.length > 1 && path[path.length - 2].children ? path[path.length - 2].children! : options;
        const lastIndex = lastColOptions.findIndex((opt) => opt.value === path[path.length - 1]?.value);
        setActiveRow(Math.max(0, lastIndex));
      }
    }, [open, selectedValue, options]);

    const columns = React.useMemo(() => {
      const cols: CascaderOption[][] = [options];
      for (const selected of activePath) {
        if (selected.children && selected.children.length > 0) {
          cols.push(selected.children);
        }
      }
      return cols;
    }, [options, activePath]);

    const handleSelectOption = (option: CascaderOption, colIndex: number) => {
      if (option.disabled || disabled) return;

      const nextPath = [...activePath.slice(0, colIndex), option];
      setActivePath(nextPath);
      setActiveCol(colIndex);

      const hasChildren = Boolean(option.children && option.children.length > 0);
      if (!hasChildren || changeOnSelect) {
        const nextValue = nextPath.map((o) => o.value);
        if (controlledValue === undefined) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue, nextPath);
        if (!hasChildren) {
          setOpen(false);
        }
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledValue === undefined) {
        setInternalValue([]);
      }
      setActivePath([]);
      onChange?.([], []);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (!open) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }

      const currentColOptions = columns[activeCol] || [];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeRow < currentColOptions.length - 1) {
          setActiveRow(activeRow + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeRow > 0) {
          setActiveRow(activeRow - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentOption = currentColOptions[activeRow];
        if (currentOption && currentOption.children && currentOption.children.length > 0 && !currentOption.disabled) {
          handleSelectOption(currentOption, activeCol);
          setActiveCol(activeCol + 1);
          setActiveRow(0);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeCol > 0) {
          const prevCol = activeCol - 1;
          const prevOption = activePath[prevCol];
          const prevColOptions = columns[prevCol] || [];
          const prevRow = prevOption ? prevColOptions.findIndex((o) => o.value === prevOption.value) : 0;
          setActiveCol(prevCol);
          setActiveRow(Math.max(0, prevRow));
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const currentOption = currentColOptions[activeRow];
        if (currentOption && !currentOption.disabled) {
          handleSelectOption(currentOption, activeCol);
        }
      }
    };

    const displayLabel = React.useMemo(() => {
      if (selectedValue.length === 0) return '';
      const labels: string[] = [];
      let currentOptions = options;
      for (const val of selectedValue) {
        const match = currentOptions.find((opt) => opt.value === val);
        if (match) {
          labels.push(match.label);
          currentOptions = match.children || [];
        } else {
          labels.push(val);
        }
      }
      return displayRender ? displayRender(labels) : labels.join(' / ');
    }, [selectedValue, options, displayRender]);

    return (
      <div
        ref={ref}
        className={cx(
          'joy-cascader',
          disabled && 'joy-cascader--disabled',
          open && 'joy-cascader--open',
          className
        )}
        style={style}
        {...rest}
      >
        {/* Selector Input Trigger */}
        <div
          ref={controlRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          className="joy-cascader__control"
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
        >
          {displayLabel ? (
            <span className="joy-cascader__value">{displayLabel}</span>
          ) : (
            <span className="joy-cascader__placeholder">{placeholder}</span>
          )}

          {allowClear && selectedValue.length > 0 && !disabled && (
            <button
              type="button"
              className="joy-cascader__clear"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <Close width={14} height={14} />
            </button>
          )}

          <span className="joy-cascader__arrow" aria-hidden="true">
            <ChevronDown width={14} height={14} />
          </span>
        </div>

        {/* Multi-column Cascader Panels */}
        {open && (
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Cascader option panels"
            className="joy-cascader__panel joy-overlay"
            tabIndex={-1}
          >
            <div className="joy-cascader__columns">
              {columns.map((colOptions, colIdx) => (
                <ul
                  key={colIdx}
                  role="menu"
                  className="joy-cascader__column"
                >
                  {colOptions.map((option, rowIdx) => {
                    const isActive = activePath[colIdx]?.value === option.value;
                    const hasChildren = Boolean(option.children && option.children.length > 0);
                    const isFocused = colIdx === activeCol && rowIdx === activeRow;

                    return (
                      <li
                        key={option.value}
                        role="menuitem"
                        aria-expanded={hasChildren ? isActive : undefined}
                        tabIndex={isFocused ? 0 : -1}
                        className={cx(
                          'joy-cascader__item',
                          isActive && 'joy-cascader__item--active'
                        )}
                        onClick={() => handleSelectOption(option, colIdx)}
                      >
                        <span>{option.label}</span>
                        {hasChildren && (
                          <span className="joy-cascader__item-arrow" aria-hidden="true">
                            <ChevronRight width={12} height={12} />
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Cascader.displayName = 'Cascader';
