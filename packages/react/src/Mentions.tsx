import * as React from 'react';
import { useOverlay } from './useOverlay.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface MentionOption {
  value: string;
  label?: string;
}

export interface MentionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  value?: string;
  defaultValue?: string;
  prefix?: string;
  options?: MentionOption[];
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: MentionOption) => void;
}

export const Mentions = React.forwardRef<HTMLDivElement, MentionsProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      prefix = '@',
      options = [],
      placeholder = '',
      rows = 3,
      disabled = false,
      className = '',
      id,
      onChange,
      onSelect,
      ...rest
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalVal, setInternalVal] = React.useState<string>(defaultValue);
    const [isOpen, setIsOpen] = React.useState(false);
    const [filterText, setFilterText] = React.useState('');
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const dropdownRef = React.useRef<HTMLUListElement>(null);

    const generatedId = React.useId();
    const dropdownId = `${id || generatedId}-listbox`;

    const currentVal = isControlled ? controlledValue : internalVal;

    const filteredOptions = options.filter(
      (opt) =>
        opt.value.toLowerCase().includes(filterText.toLowerCase()) ||
        (opt.label && opt.label.toLowerCase().includes(filterText.toLowerCase()))
    );

    useOverlay(isOpen && filteredOptions.length > 0, textareaRef, dropdownRef, () => {
      setIsOpen(false);
    });

    React.useEffect(() => {
      if (isOpen && filteredOptions.length > 0) {
        setActiveIndex(0);
      } else {
        setActiveIndex(-1);
      }
    }, [isOpen, filterText]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (!isControlled) {
        setInternalVal(val);
      }
      onChange?.(val);

      const cursorPos = e.target.selectionStart || 0;
      const textBefore = val.slice(0, cursorPos);
      const lastPrefixIndex = textBefore.lastIndexOf(prefix);

      if (lastPrefixIndex !== -1 && (lastPrefixIndex === 0 || /\s/.test(textBefore[lastPrefixIndex - 1]))) {
        setFilterText(textBefore.slice(lastPrefixIndex + prefix.length));
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    const selectOption = (opt: MentionOption) => {
      if (!textareaRef.current) return;
      const cursorPos = textareaRef.current.selectionStart || 0;
      const textBefore = currentVal.slice(0, cursorPos);
      const textAfter = currentVal.slice(cursorPos);
      const lastPrefixIndex = textBefore.lastIndexOf(prefix);

      if (lastPrefixIndex !== -1) {
        const nextVal = textBefore.slice(0, lastPrefixIndex) + prefix + opt.value + ' ' + textAfter;
        if (!isControlled) {
          setInternalVal(nextVal);
        }
        onChange?.(nextVal);
        onSelect?.(opt);
        setIsOpen(false);

        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const nextPos = lastPrefixIndex + prefix.length + opt.value.length + 1;
            textareaRef.current.setSelectionRange(nextPos, nextPos);
          }
        }, 0);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isOpen || filteredOptions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
      }
    };

    return (
      <div
        ref={ref}
        id={id}
        className={cx('joy-mentions', disabled && 'joy-mentions--disabled', className)}
        {...rest}
      >
        <textarea
          ref={textareaRef}
          className="joy-textarea joy-mentions__textarea"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          value={currentVal}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls={isOpen ? dropdownId : undefined}
        />
        {isOpen && filteredOptions.length > 0 && (
          <ul
            ref={dropdownRef}
            id={dropdownId}
            className="joy-mentions__dropdown"
            role="listbox"
          >
            {filteredOptions.map((opt, index) => {
              const isSelected = index === activeIndex;
              return (
                <li
                  key={opt.value}
                  className={cx('joy-mentions__item', isSelected && 'joy-mentions__item--active')}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                >
                  <span className="joy-mentions__item-label">{opt.label || opt.value}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);

Mentions.displayName = 'Mentions';
