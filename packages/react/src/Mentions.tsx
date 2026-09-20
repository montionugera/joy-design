import * as React from 'react';

export interface MentionOption {
  value: string;
  label?: string;
}

export interface MentionsProps {
  value?: string;
  defaultValue?: string;
  prefix?: string;
  options?: MentionOption[];
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onSelect?: (option: MentionOption) => void;
}

export const Mentions = React.forwardRef<HTMLDivElement, MentionsProps>(
  ({
    value: controlledValue,
    defaultValue = '',
    prefix = '@',
    options = [],
    placeholder = '',
    rows = 3,
    disabled = false,
    className = '',
    onChange,
    onSelect
  }, ref) => {
    const [internalVal, setInternalVal] = React.useState<string>(
      controlledValue !== undefined ? controlledValue : defaultValue
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [filterText, setFilterText] = React.useState('');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const currentVal = controlledValue !== undefined ? controlledValue : internalVal;

    const filteredOptions = options.filter(opt =>
      opt.value.toLowerCase().includes(filterText.toLowerCase()) ||
      (opt.label && opt.label.toLowerCase().includes(filterText.toLowerCase()))
    );

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (controlledValue === undefined) {
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
        if (controlledValue === undefined) {
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

    return (
      <div ref={ref} className={`joy-mentions ${className}`.trim()}>
        <textarea
          ref={textareaRef}
          className="joy-mentions__textarea"
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          value={currentVal}
          onChange={handleInput}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {isOpen && filteredOptions.length > 0 && (
          <div className="joy-mentions__dropdown" role="listbox">
            {filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="joy-mentions__item"
                role="option"
                aria-selected="false"
                tabIndex={-1}
                onMouseDown={() => selectOption(opt)}
              >
                <span className="joy-mentions__item-label">{opt.label || opt.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Mentions.displayName = 'Mentions';
