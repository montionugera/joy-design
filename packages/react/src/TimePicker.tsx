import * as React from 'react';
import { Clock } from '@montionugera/joy-icons/react';
import { useOverlay } from './useOverlay.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  onChange?: (time: string) => void;
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      format = 'HH:mm:ss',
      placeholder = 'Select time',
      disabled = false,
      id,
      className = '',
      onChange,
      ...rest
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalVal, setInternalVal] = React.useState<string>(defaultValue);
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeCol, setActiveCol] = React.useState<number>(0);

    const triggerRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);

    useOverlay(isOpen, triggerRef, panelRef, () => {
      setIsOpen(false);
    });

    const currentVal = isControlled ? controlledValue : internalVal;
    const showSeconds = format.includes('ss');

    const split = currentVal ? currentVal.split(':') : ['00', '00', '00'];
    const parts = {
      hour: split[0] || '00',
      minute: split[1] || '00',
      second: split[2] || '00'
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const selectPart = (type: 'hour' | 'minute' | 'second', val: string) => {
      const next = { ...parts, [type]: val };
      const formatted = showSeconds
        ? `${next.hour}:${next.minute}:${next.second}`
        : `${next.hour}:${next.minute}`;

      if (!isControlled) {
        setInternalVal(formatted);
      }
      onChange?.(formatted);
    };

    const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const colCount = showSeconds ? 3 : 2;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveCol((col) => (col + 1) % colCount);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveCol((col) => (col - 1 + colCount) % colCount);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeCol === 0) {
          const nextH = (parseInt(parts.hour, 10) + 1) % 24;
          selectPart('hour', String(nextH).padStart(2, '0'));
        } else if (activeCol === 1) {
          const nextM = (parseInt(parts.minute, 10) + 1) % 60;
          selectPart('minute', String(nextM).padStart(2, '0'));
        } else if (activeCol === 2 && showSeconds) {
          const nextS = (parseInt(parts.second, 10) + 1) % 60;
          selectPart('second', String(nextS).padStart(2, '0'));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeCol === 0) {
          const nextH = (parseInt(parts.hour, 10) - 1 + 24) % 24;
          selectPart('hour', String(nextH).padStart(2, '0'));
        } else if (activeCol === 1) {
          const nextM = (parseInt(parts.minute, 10) - 1 + 60) % 60;
          selectPart('minute', String(nextM).padStart(2, '0'));
        } else if (activeCol === 2 && showSeconds) {
          const nextS = (parseInt(parts.second, 10) - 1 + 60) % 60;
          selectPart('second', String(nextS).padStart(2, '0'));
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    return (
      <div
        ref={ref}
        id={id}
        className={cx('joy-time-picker', disabled && 'joy-time-picker--disabled', className)}
        {...rest}
      >
        <div
          ref={triggerRef}
          className={cx('joy-input-wrapper', disabled && 'joy-input-wrapper--disabled')}
          onClick={() => {
            if (!disabled) setIsOpen((prev) => !prev);
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
              e.preventDefault();
              setIsOpen(true);
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <input
            type="text"
            className="joy-input"
            readOnly
            disabled={disabled}
            placeholder={placeholder}
            value={currentVal}
            tabIndex={-1}
          />
          <span className="joy-input-wrapper__suffix">
            <Clock />
          </span>
        </div>

        {isOpen && (
          <div
            ref={panelRef}
            className="joy-time-picker__panel"
            role="listbox"
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
          >
            <div className="joy-time-picker__column" aria-label="Hours">
              {hours.map((h) => {
                const isSelected = parts.hour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={activeCol === 0 && isSelected ? 0 : -1}
                    className={cx('joy-time-picker__cell', isSelected && 'joy-time-picker__cell--selected')}
                    onClick={() => selectPart('hour', h)}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
            <div className="joy-time-picker__column" aria-label="Minutes">
              {minutes.map((m) => {
                const isSelected = parts.minute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={activeCol === 1 && isSelected ? 0 : -1}
                    className={cx('joy-time-picker__cell', isSelected && 'joy-time-picker__cell--selected')}
                    onClick={() => selectPart('minute', m)}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            {showSeconds && (
              <div className="joy-time-picker__column" aria-label="Seconds">
                {seconds.map((s) => {
                  const isSelected = parts.second === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={activeCol === 2 && isSelected ? 0 : -1}
                      className={cx('joy-time-picker__cell', isSelected && 'joy-time-picker__cell--selected')}
                      onClick={() => selectPart('second', s)}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';
