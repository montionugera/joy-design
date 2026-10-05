import * as React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Close } from '@joymify/icons/react';
import { useOverlay } from './useOverlay.js';
import {
  MONTH_NAMES,
  WEEKDAYS,
  formatDate,
  getMonthMatrix,
  parseDate,
  isSameDay
} from './calendar-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
  allowClear?: boolean;
  onChange?: (date: string) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      min,
      max,
      placeholder = 'Select date',
      disabled = false,
      error = false,
      size = 'md',
      id,
      className = '',
      style,
      allowClear = true,
      onChange,
      ...rest
    },
    forwardedRef
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(defaultValue);
    const [isOpen, setIsOpen] = React.useState(false);

    const currentValue = isControlled ? controlledValue : internalValue;
    const activeDate = parseDate(currentValue);

    const [viewDate, setViewDate] = React.useState<Date>(() => activeDate || new Date());

    React.useEffect(() => {
      if (activeDate) {
        setViewDate(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
      }
    }, [currentValue]);

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(forwardedRef, () => inputRef.current!);

    useOverlay(isOpen, wrapperRef, panelRef, () => {
      setIsOpen(false);
    });

    const minDate = min ? parseDate(min) : null;
    const maxDate = max ? parseDate(max) : null;

    const isDateDisabled = (d: Date) => {
      if (minDate && d < minDate) return true;
      if (maxDate && d > maxDate) return true;
      return false;
    };

    const handleSelect = (dateStr: string, d: Date) => {
      if (isDateDisabled(d)) return;
      if (!isControlled) {
        setInternalValue(dateStr);
      }
      onChange?.(dateStr);
      setIsOpen(false);
      inputRef.current?.focus();
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue('');
      }
      onChange?.('');
      inputRef.current?.focus();
    };

    const handleToday = () => {
      const today = new Date();
      if (isDateDisabled(today)) return;
      const todayStr = formatDate(today);
      handleSelect(todayStr, today);
    };

    const prevYear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
    };

    const nextYear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
    };

    const prevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const days = getMonthMatrix(viewYear, viewMonth);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    return (
      <div
        ref={wrapperRef}
        className={cx(
          'joy-date-picker',
          size && `joy-date-picker--${size}`,
          isOpen && 'joy-date-picker--open',
          disabled && 'joy-date-picker--disabled',
          error && 'joy-date-picker--error',
          className
        )}
        style={style}
        onClick={() => {
          if (!disabled) setIsOpen(prev => !prev);
        }}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="text"
          readOnly
          id={id}
          className="joy-date-picker__input"
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          {...rest}
        />

        <div className="joy-date-picker__actions">
          {allowClear && !!currentValue && !disabled && (
            <button
              type="button"
              className="joy-date-picker__clear"
              aria-label="Clear date"
              onClick={handleClear}
            >
              <Close size={14} />
            </button>
          )}
          <span className="joy-date-picker__icon" aria-hidden="true">
            <Calendar size={16} />
          </span>
        </div>

        {isOpen && (
          <div
            ref={panelRef}
            className="joy-calendar-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Choose date"
            onClick={e => e.stopPropagation()}
          >
            <div className="joy-calendar__pane">
              <div className="joy-calendar__header">
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    type="button"
                    className="joy-calendar__nav-btn"
                    title="Previous Year"
                    aria-label="Previous Year"
                    onClick={prevYear}
                  >
                    <span style={{ display: 'inline-flex', letterSpacing: '-6px' }}>
                      <ChevronLeft size={11} />
                      <ChevronLeft size={11} />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="joy-calendar__nav-btn"
                    title="Previous Month"
                    aria-label="Previous Month"
                    onClick={prevMonth}
                  >
                    <ChevronLeft size={13} />
                  </button>
                </div>

                <div className="joy-calendar__title">
                  <span>{MONTH_NAMES[viewMonth]}</span>
                  <span>{viewYear}</span>
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                  <button
                    type="button"
                    className="joy-calendar__nav-btn"
                    title="Next Month"
                    aria-label="Next Month"
                    onClick={nextMonth}
                  >
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="joy-calendar__nav-btn"
                    title="Next Year"
                    aria-label="Next Year"
                    onClick={nextYear}
                  >
                    <span style={{ display: 'inline-flex', letterSpacing: '-6px' }}>
                      <ChevronRight size={11} />
                      <ChevronRight size={11} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="joy-calendar__grid" role="grid">
                {WEEKDAYS.map(w => (
                  <div key={w} className="joy-calendar__weekday" role="columnheader">
                    {w}
                  </div>
                ))}

                {days.map(day => {
                  const isSelected = isSameDay(activeDate, day.date);
                  const disabledDay = isDateDisabled(day.date);

                  return (
                    <button
                      key={day.dateString}
                      type="button"
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-disabled={disabledDay}
                      disabled={disabledDay}
                      className={cx(
                        'joy-calendar__cell',
                        !day.isCurrentMonth && 'joy-calendar__cell--muted',
                        day.isToday && 'joy-calendar__cell--today',
                        isSelected && 'joy-calendar__cell--selected',
                        disabledDay && 'joy-calendar__cell--disabled'
                      )}
                      onClick={() => handleSelect(day.dateString, day.date)}
                    >
                      {day.dayNumber}
                    </button>
                  );
                })}
              </div>

              <div className="joy-calendar__footer">
                <button
                  type="button"
                  className="joy-calendar__action-btn"
                  onClick={handleToday}
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
