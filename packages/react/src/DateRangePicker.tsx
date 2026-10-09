import * as React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Close, ArrowRight } from '@joymify/icons/react';
import { useOverlay } from './useOverlay.js';
import {
  MONTH_NAMES,
  WEEKDAYS,
  formatDate,
  getMonthMatrix,
  parseDate,
  isSameDay,
  isBetweenDays,
  getStandardPresets,
  type DateRangePreset,
  checkDateDisabled,
  rangeContainsDisabledDate,
  type DisabledDateFn,
  type DateRangeTuple
} from './calendar-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  min?: string;
  max?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  startId?: string;
  endId?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  allowClear?: boolean;
  presets?: DateRangePreset[];
  disabledDate?: (current: Date, info?: { from?: Date }) => boolean;
  blackoutDates?: string[];
  blackoutRanges?: Array<[string, string]>;
  forbidCrossBlackout?: boolean;
  className?: string;
  onChange?: (value: DateRangeValue) => void;
}

export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue = { start: '', end: '' },
      min,
      max,
      disabled = false,
      error = false,
      size = 'md',
      startId,
      endId,
      startPlaceholder = 'Start date',
      endPlaceholder = 'End date',
      allowClear = true,
      presets = getStandardPresets(),
      disabledDate,
      blackoutDates,
      blackoutRanges,
      forbidCrossBlackout = false,
      className = '',
      style,
      onChange,
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<DateRangeValue>(defaultValue);
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeInput, setActiveInput] = React.useState<'start' | 'end'>('start');
    const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

    const currentValue = isControlled ? value : internalValue;

    const startDate = parseDate(currentValue?.start);
    const endDate = parseDate(currentValue?.end);

    const [leftMonthDate, setLeftMonthDate] = React.useState<Date>(() => {
      if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      return new Date();
    });

    React.useEffect(() => {
      if (startDate) {
        setLeftMonthDate(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
      }
    }, [currentValue?.start]);

    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);

    useOverlay(isOpen, wrapperRef, panelRef, () => {
      setIsOpen(false);
      setHoverDate(null);
    });

    const isSingleDateDisabled = (d: Date, fromDate?: Date) => {
      return checkDateDisabled(d, {
        min,
        max,
        disabledDate,
        blackoutDates,
        blackoutRanges,
        from: fromDate
      });
    };

    const isDateDisabled = (d: Date) => {
      const isPickingEnd = currentValue?.start && !currentValue?.end && startDate;
      if (isSingleDateDisabled(d, isPickingEnd ? startDate : undefined)) {
        return true;
      }
      if (forbidCrossBlackout && isPickingEnd) {
        if (
          rangeContainsDisabledDate(startDate, d, {
            min,
            max,
            disabledDate,
            blackoutDates,
            blackoutRanges
          })
        ) {
          return true;
        }
      }
      return false;
    };

    const commit = (next: DateRangeValue) => {
      let resolved = next;
      if (next.start && next.end && next.start > next.end) {
        resolved = { start: next.end, end: next.start };
      }
      if (!isControlled) {
        setInternalValue(resolved);
      }
      onChange?.(resolved);
    };

    const handleSelectDay = (dateStr: string, d: Date) => {
      if (isDateDisabled(d)) return;

      if (!currentValue.start || (currentValue.start && currentValue.end)) {
        // Start picking range
        commit({ start: dateStr, end: '' });
        setActiveInput('end');
      } else {
        // Complete range
        if (
          forbidCrossBlackout &&
          startDate &&
          rangeContainsDisabledDate(startDate, d, {
            min,
            max,
            disabledDate,
            blackoutDates,
            blackoutRanges
          })
        ) {
          return;
        }
        commit({ start: currentValue.start, end: dateStr });
        setIsOpen(false);
        setHoverDate(null);
        setActiveInput('start');
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      const empty = { start: '', end: '' };
      commit(empty);
      setHoverDate(null);
    };

    const handlePreset = (preset: DateRangePreset) => {
      const pStart = parseDate(preset.value[0]);
      const pEnd = parseDate(preset.value[1]);
      if (pStart && isSingleDateDisabled(pStart)) return;
      if (pEnd && isSingleDateDisabled(pEnd)) return;
      if (
        forbidCrossBlackout &&
        pStart &&
        pEnd &&
        rangeContainsDisabledDate(pStart, pEnd, {
          min,
          max,
          disabledDate,
          blackoutDates,
          blackoutRanges
        })
      ) {
        return;
      }
      commit({ start: preset.value[0], end: preset.value[1] });
      setIsOpen(false);
      setHoverDate(null);
    };

    // Navigation for dual calendar
    const prevYear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLeftMonthDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
    };

    const nextYear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLeftMonthDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
    };

    const prevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLeftMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setLeftMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const leftYear = leftMonthDate.getFullYear();
    const leftMonth = leftMonthDate.getMonth();
    const leftDays = getMonthMatrix(leftYear, leftMonth);

    const rightMonthDate = new Date(leftYear, leftMonth + 1, 1);
    const rightYear = rightMonthDate.getFullYear();
    const rightMonth = rightMonthDate.getMonth();
    const rightDays = getMonthMatrix(rightYear, rightMonth);

    const isDayInRange = (d: Date) => {
      if (startDate && endDate) {
        return isBetweenDays(d, startDate, endDate);
      }
      if (startDate && !endDate && hoverDate) {
        return isBetweenDays(d, startDate, hoverDate);
      }
      return false;
    };

    const isRangeStart = (d: Date) => {
      if (!startDate) return false;
      return isSameDay(d, startDate);
    };

    const isRangeEnd = (d: Date) => {
      if (endDate) return isSameDay(d, endDate);
      if (startDate && hoverDate && hoverDate > startDate) return isSameDay(d, hoverDate);
      return false;
    };

    return (
      <div
        ref={node => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cx(
          'joy-date-range-picker',
          size && `joy-date-range-picker--${size}`,
          isOpen && 'joy-date-range-picker--open',
          disabled && 'joy-date-range-picker--disabled',
          error && 'joy-date-range-picker--error',
          className
        )}
        style={style}
        onClick={() => {
          if (!disabled) setIsOpen(prev => !prev);
        }}
        {...rest}
      >
        <input
          type="text"
          readOnly
          id={startId}
          placeholder={startPlaceholder}
          value={currentValue.start}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={cx(
            'joy-date-range-picker__input',
            activeInput === 'start' && isOpen && 'joy-date-range-picker__input--active'
          )}
          onClick={e => {
            e.stopPropagation();
            setActiveInput('start');
            if (!disabled) setIsOpen(true);
          }}
        />

        <span className="joy-date-range-picker__sep joy-date-range-picker__separator" aria-hidden="true">
          <ArrowRight size={13} />
        </span>

        <input
          type="text"
          readOnly
          id={endId}
          placeholder={endPlaceholder}
          value={currentValue.end}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={cx(
            'joy-date-range-picker__input',
            activeInput === 'end' && isOpen && 'joy-date-range-picker__input--active'
          )}
          onClick={e => {
            e.stopPropagation();
            setActiveInput('end');
            if (!disabled) setIsOpen(true);
          }}
        />

        <div className="joy-date-range-picker__actions">
          {allowClear && (!!currentValue.start || !!currentValue.end) && !disabled && (
            <button
              type="button"
              className="joy-date-range-picker__clear"
              aria-label="Clear range"
              onClick={handleClear}
            >
              <Close size={14} />
            </button>
          )}
          <span className="joy-date-range-picker__icon" aria-hidden="true">
            <Calendar size={16} />
          </span>
        </div>

        {isOpen && (
          <div
            ref={panelRef}
            className="joy-calendar-overlay joy-calendar-overlay--dual"
            role="dialog"
            aria-modal="true"
            aria-label="Choose date range"
            onClick={e => e.stopPropagation()}
          >
            <div className="joy-calendar__body">
              {/* Left Month Pane */}
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
                    <span>{MONTH_NAMES[leftMonth]}</span>
                    <span>{leftYear}</span>
                  </div>
                  <div style={{ width: '24px' }} />
                </div>

                <div className="joy-calendar__grid" role="grid">
                  {WEEKDAYS.map(w => (
                    <div key={w} className="joy-calendar__weekday" role="columnheader">
                      {w}
                    </div>
                  ))}
                  {leftDays.map(day => {
                    const isStart = isRangeStart(day.date);
                    const isEnd = isRangeEnd(day.date);
                    const inRange = isDayInRange(day.date);
                    const disabledDay = isDateDisabled(day.date);

                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        role="gridcell"
                        aria-selected={isStart || isEnd}
                        aria-disabled={disabledDay}
                        disabled={disabledDay}
                        className={cx(
                          'joy-calendar__cell',
                          !day.isCurrentMonth && 'joy-calendar__cell--muted',
                          day.isToday && 'joy-calendar__cell--today',
                          isStart && 'joy-calendar__cell--selected joy-calendar__cell--range-start',
                          isEnd && 'joy-calendar__cell--selected joy-calendar__cell--range-end',
                          inRange && !isStart && !isEnd && 'joy-calendar__cell--in-range',
                          disabledDay && 'joy-calendar__cell--disabled'
                        )}
                        onMouseEnter={() => {
                          if (currentValue.start && !currentValue.end && !disabledDay) {
                            setHoverDate(day.date);
                          }
                        }}
                        onClick={() => handleSelectDay(day.dateString, day.date)}
                      >
                        {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Month Pane */}
              <div className="joy-calendar__pane">
                <div className="joy-calendar__header">
                  <div style={{ width: '24px' }} />
                  <div className="joy-calendar__title">
                    <span>{MONTH_NAMES[rightMonth]}</span>
                    <span>{rightYear}</span>
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
                  {rightDays.map(day => {
                    const isStart = isRangeStart(day.date);
                    const isEnd = isRangeEnd(day.date);
                    const inRange = isDayInRange(day.date);
                    const disabledDay = isDateDisabled(day.date);

                    return (
                      <button
                        key={day.dateString}
                        type="button"
                        role="gridcell"
                        aria-selected={isStart || isEnd}
                        aria-disabled={disabledDay}
                        disabled={disabledDay}
                        className={cx(
                          'joy-calendar__cell',
                          !day.isCurrentMonth && 'joy-calendar__cell--muted',
                          day.isToday && 'joy-calendar__cell--today',
                          isStart && 'joy-calendar__cell--selected joy-calendar__cell--range-start',
                          isEnd && 'joy-calendar__cell--selected joy-calendar__cell--range-end',
                          inRange && !isStart && !isEnd && 'joy-calendar__cell--in-range',
                          disabledDay && 'joy-calendar__cell--disabled'
                        )}
                        onMouseEnter={() => {
                          if (currentValue.start && !currentValue.end && !disabledDay) {
                            setHoverDate(day.date);
                          }
                        }}
                        onClick={() => handleSelectDay(day.dateString, day.date)}
                      >
                        {day.dayNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {presets && presets.length > 0 && (
              <div className="joy-calendar__footer">
                <div className="joy-calendar__presets">
                  {presets.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      className="joy-calendar__preset-btn"
                      onClick={() => handlePreset(p)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DateRangePicker.displayName = 'DateRangePicker';
