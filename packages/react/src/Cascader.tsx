import * as React from 'react';

export interface CascaderOption {
  value: string;
  label: string;
  disabled?: boolean;
  children?: CascaderOption[];
  isLeaf?: boolean;
}

export interface CascaderProps {
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
      style
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string[]>(defaultValue);
    const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

    // Active column selection path while drilling down
    const [activePath, setActivePath] = React.useState<CascaderOption[]>([]);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    // Sync active path with selectedValue when opened
    React.useEffect(() => {
      if (open) {
        const path: CascaderOption[] = [];
        let currentOptions = options;
        for (const val of selectedValue) {
          const match = currentOptions.find(opt => opt.value === val);
          if (match) {
            path.push(match);
            currentOptions = match.children || [];
          } else {
            break;
          }
        }
        setActivePath(path);
      }
    }, [open, selectedValue, options]);

    // Close on outside click
    React.useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      if (open) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    // Calculate columns based on activePath
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

      const hasChildren = option.children && option.children.length > 0;
      if (!hasChildren || changeOnSelect) {
        const nextValue = nextPath.map(o => o.value);
        setInternalValue(nextValue);
        onChange?.(nextValue, nextPath);
        if (!hasChildren) {
          setOpen(false);
        }
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setInternalValue([]);
      setActivePath([]);
      onChange?.([], []);
    };

    // Calculate display label
    const displayLabel = React.useMemo(() => {
      if (selectedValue.length === 0) return '';
      const labels: string[] = [];
      let currentOptions = options;
      for (const val of selectedValue) {
        const match = currentOptions.find(opt => opt.value === val);
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
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`joy-cascader ${disabled ? 'joy-cascader--disabled' : ''} ${className}`}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          ...style
        }}
      >
        {/* Selector Input Trigger */}
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpen(o => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(o => !o);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 36,
            padding: '4px 10px',
            border: '1px solid var(--joy-border, #23354e)',
            borderRadius: 6,
            backgroundColor: 'var(--joy-surface-card, #14253e)',
            color: 'var(--joy-text-primary, #f8f3e8)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <span style={{ fontSize: 13, color: displayLabel ? 'inherit' : '#94a3b8' }}>
            {displayLabel || placeholder}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {allowClear && selectedValue.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                title="Clear selection"
                aria-label="Clear selection"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                transform: open ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
                color: '#94a3b8'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Multi-column Cascader Panels */}
        {open && (
          <div
            role="listbox"
            aria-label="Cascader option panels"
            className="joy-cascader-menus"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 1000,
              display: 'flex',
              borderRadius: 6,
              backgroundColor: 'var(--joy-surface-card, #14253e)',
              border: '1px solid var(--joy-border, #23354e)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}
          >
            {columns.map((colOptions, colIdx) => (
              <ul
                key={colIdx}
                role="group"
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 4,
                  minWidth: 140,
                  maxHeight: 220,
                  overflowY: 'auto',
                  borderRight: colIdx < columns.length - 1 ? '1px solid var(--joy-border, #23354e)' : 'none'
                }}
              >
                {colOptions.map(option => {
                  const isActive = activePath[colIdx]?.value === option.value;
                  const hasChildren = option.children && option.children.length > 0;

                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelectOption(option, colIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 4,
                        fontSize: 13,
                        cursor: option.disabled ? 'not-allowed' : 'pointer',
                        opacity: option.disabled ? 0.5 : 1,
                        backgroundColor: isActive ? 'rgba(196, 154, 58, 0.15)' : 'transparent',
                        color: isActive ? 'var(--gold-400, #c49a3a)' : 'var(--joy-text-primary, #f8f3e8)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <span>{option.label}</span>
                      {hasChildren && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Cascader.displayName = 'Cascader';
