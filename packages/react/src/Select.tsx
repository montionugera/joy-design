import * as React from 'react';
import { useOverlay } from './useOverlay.js';
import { FormContext } from './Form.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onChange' | 'size'> {
  value?: string;
  defaultValue?: string;
  options?: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  message?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  id?: string;
  searchable?: boolean | 'auto';
  searchPlaceholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      defaultValue = '',
      options = [],
      placeholder,
      disabled = false,
      error = false,
      message,
      size = 'md',
      name,
      id,
      searchable = 'auto',
      searchPlaceholder = 'Search options...',
      className = '',
      style,
      onChange,
      children,
      ...rest
    },
    ref
  ) => {
    const formContext = React.useContext(FormContext);
    const effectiveDisabled = disabled || (formContext?.disabled ?? false);

    const [internalValue, setInternalValue] = React.useState<string>(
      value !== undefined ? value : defaultValue
    );
    const currentValue = value !== undefined ? value : internalValue;

    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [searchQuery, setSearchQuery] = React.useState('');

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);

    const isSearchable = searchable === true || (searchable === 'auto' && options.length >= 6);
    const filteredOptions =
      isSearchable && searchQuery.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        : options;

    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

    useOverlay(open, triggerRef, listRef, () => {
      setOpen(false);
      setActiveIndex(-1);
      setSearchQuery('');
    });

    React.useEffect(() => {
      if (open && isSearchable) {
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }, [open, isSearchable]);

    const generatedId = React.useId();
    const selectId = id || generatedId;
    const listboxId = `${selectId}-listbox`;
    const messageId = `${selectId}-message`;

    const activeDescendantId =
      open && activeIndex >= 0 && activeIndex < filteredOptions.length
        ? `${listboxId}-opt-${activeIndex}`
        : undefined;

    const selectedOption = options.find((opt) => opt.value === currentValue);

    const handleSelectOption = (opt: SelectOption) => {
      if (opt.disabled) return;
      if (value === undefined) {
        setInternalValue(opt.value);
      }
      onChange?.(opt.value);
      setOpen(false);
      setActiveIndex(-1);
      setSearchQuery('');
      triggerRef.current?.focus();
    };

    const handleClick = () => {
      if (effectiveDisabled) return;
      setOpen((prev) => !prev);
      if (!open) {
        setSearchQuery('');
        const currIdx = filteredOptions.findIndex((o) => o.value === currentValue);
        const firstEnabled = filteredOptions.findIndex((o) => !o.disabled);
        setActiveIndex(currIdx >= 0 ? currIdx : firstEnabled);
      } else {
        setActiveIndex(-1);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (effectiveDisabled) return;
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen(true);
          const firstEnabled = options.findIndex((o) => !o.disabled);
          const currIdx = options.findIndex((o) => o.value === currentValue);
          setActiveIndex(currIdx >= 0 ? currIdx : firstEnabled);
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        let next = activeIndex + 1;
        while (next < options.length && options[next].disabled) {
          next++;
        }
        if (next < options.length) {
          setActiveIndex(next);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        let prev = activeIndex - 1;
        while (prev >= 0 && options[prev].disabled) {
          prev--;
        }
        if (prev >= 0) {
          setActiveIndex(prev);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        const first = options.findIndex((o) => !o.disabled);
        if (first >= 0) setActiveIndex(first);
      } else if (e.key === 'End') {
        e.preventDefault();
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setActiveIndex(i);
            break;
          }
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length && !options[activeIndex].disabled) {
          handleSelectOption(options[activeIndex]);
        }
      }
    };

    return (
      <div
        className={cx(
          'joy-select-wrapper',
          size && `joy-select-wrapper--${size}`,
          error && 'joy-select-wrapper--error',
          effectiveDisabled && 'joy-select-wrapper--disabled',
          open && 'joy-select-wrapper--open'
        )}
        style={style}
      >
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          aria-invalid={error ? true : undefined}
          disabled={effectiveDisabled}
          className={cx('joy-select', className)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {selectedOption ? (
            <span className="joy-select__value">{selectedOption.label}</span>
          ) : (
            <span className="joy-select__placeholder">{placeholder ?? ''}</span>
          )}
          <span className="joy-select__arrow" aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
        <input type="hidden" name={name} value={currentValue ?? ''} />
        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            className="joy-select__listbox joy-overlay"
            tabIndex={-1}
          >
            {isSearchable && (
              <li className="joy-select__search-wrapper" role="presentation">
                <input
                  ref={searchInputRef}
                  type="search"
                  className="joy-select__search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    const matched = q.trim()
                      ? options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()))
                      : options;
                    const first = matched.findIndex((o) => !o.disabled);
                    setActiveIndex(first);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      let next = activeIndex + 1;
                      while (next < filteredOptions.length && filteredOptions[next].disabled) next++;
                      if (next < filteredOptions.length) setActiveIndex(next);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      let prev = activeIndex - 1;
                      while (prev >= 0 && filteredOptions[prev].disabled) prev--;
                      if (prev >= 0) setActiveIndex(prev);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (
                        activeIndex >= 0 &&
                        activeIndex < filteredOptions.length &&
                        !filteredOptions[activeIndex].disabled
                      ) {
                        handleSelectOption(filteredOptions[activeIndex]);
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setOpen(false);
                      triggerRef.current?.focus();
                    }
                  }}
                  role="searchbox"
                  aria-label={searchPlaceholder}
                />
              </li>
            )}
            {filteredOptions.length === 0 ? (
              <li className="joy-select__empty" role="presentation">
                No options found
              </li>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSelected = opt.value === currentValue;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={opt.value}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    className={cx(
                      'joy-select__option',
                      isActive && 'joy-select__option--active',
                      opt.disabled && 'joy-select__option--disabled'
                    )}
                    onClick={() => handleSelectOption(opt)}
                    onMouseEnter={() => {
                      if (!opt.disabled) setActiveIndex(i);
                    }}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        )}
        {message && (
          <p className="joy-select-wrapper__message" id={messageId}>
            {message}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
