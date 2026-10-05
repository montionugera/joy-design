/**
 * Shared Calendar Utilities for DatePicker & DateRangePicker
 * Enforces byte-identical parity between Svelte 5 and React 19 twins.
 */

export interface CalendarDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const;

export function padZero(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = padZero(date.getMonth() + 1);
  const d = padZero(date.getDate());
  return `${y}-${m}-${d}`;
}

export function parseDate(str?: string | null): Date | null {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const date = new Date(y, m, d);
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function isSameDay(d1?: Date | null, d2?: Date | null): boolean {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isBeforeDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 < t2;
}

export function isAfterDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  return t1 > t2;
}

export function isBetweenDays(d: Date, start: Date, end: Date): boolean {
  return (
    (isAfterDay(d, start) && isBeforeDay(d, end)) ||
    (isAfterDay(d, end) && isBeforeDay(d, start))
  );
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Builds a 42-day matrix (6 rows x 7 cols) for a calendar month.
 * Includes preceding trailing days from previous month and following days.
 */
export function getMonthMatrix(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const todayStr = formatDate(today);

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  const cells: CalendarDay[] = [];

  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    const dateString = formatDate(date);
    cells.push({
      date,
      dateString,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateString === todayStr
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const date = new Date(year, month, d);
    const dateString = formatDate(date);
    cells.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr
    });
  }

  // Remaining days from next month to reach 42
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const dateString = formatDate(date);
    cells.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: false,
      isToday: dateString === todayStr
    });
  }

  return cells;
}

export interface DateRangePreset {
  label: string;
  value: [string, string];
}

export function getStandardPresets(baseDate = new Date()): DateRangePreset[] {
  const todayStr = formatDate(baseDate);

  const d7 = new Date(baseDate);
  d7.setDate(d7.getDate() - 6);

  const d30 = new Date(baseDate);
  d30.setDate(d30.getDate() - 29);

  const mtd = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const ytd = new Date(baseDate.getFullYear(), 0, 1);

  return [
    { label: 'Today', value: [todayStr, todayStr] },
    { label: 'Last 7 Days', value: [formatDate(d7), todayStr] },
    { label: 'Last 30 Days', value: [formatDate(d30), todayStr] },
    { label: 'Month to Date', value: [formatDate(mtd), todayStr] },
    { label: 'Year to Date', value: [formatDate(ytd), todayStr] }
  ];
}

export function isSameOrBeforeDay(d1: Date, d2: Date): boolean {
  return isSameDay(d1, d2) || isBeforeDay(d1, d2);
}

export function isSameOrAfterDay(d1: Date, d2: Date): boolean {
  return isSameDay(d1, d2) || isAfterDay(d1, d2);
}

export function isDateWithinRange(d: Date, start: Date, end: Date): boolean {
  const [s, e] = isBeforeDay(start, end) ? [start, end] : [end, start];
  return isSameOrAfterDay(d, s) && isSameOrBeforeDay(d, e);
}

export type DisabledDateFn = (current: Date, info?: { from?: Date }) => boolean;
export type DateRangeTuple = [string, string];

export interface DisabledDateOptions {
  min?: string;
  max?: string;
  disabledDate?: (current: Date, info?: { from?: Date }) => boolean;
  blackoutDates?: string[];
  blackoutRanges?: Array<[string, string]>;
  from?: Date;
}

export function checkDateDisabled(d: Date, options?: DisabledDateOptions): boolean {
  if (!options) return false;

  if (options.min) {
    const minD = parseDate(options.min);
    if (minD && isBeforeDay(d, minD)) return true;
  }

  if (options.max) {
    const maxD = parseDate(options.max);
    if (maxD && isAfterDay(d, maxD)) return true;
  }

  if (options.blackoutDates && options.blackoutDates.length > 0) {
    const dStr = formatDate(d);
    if (options.blackoutDates.includes(dStr)) return true;
  }

  if (options.blackoutRanges && options.blackoutRanges.length > 0) {
    for (const [rStart, rEnd] of options.blackoutRanges) {
      const s = parseDate(rStart);
      const e = parseDate(rEnd);
      if (s && e && isDateWithinRange(d, s, e)) {
        return true;
      }
    }
  }

  if (options.disabledDate) {
    if (options.disabledDate(d, { from: options.from })) return true;
  }

  return false;
}

export function rangeContainsDisabledDate(
  start: Date,
  end: Date,
  options?: DisabledDateOptions
): boolean {
  if (!options) return false;
  const [s, e] = isBeforeDay(start, end) ? [start, end] : [end, start];
  const cur = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 1);
  const endLimit = new Date(e.getFullYear(), e.getMonth(), e.getDate());
  while (cur.getTime() < endLimit.getTime()) {
    if (checkDateDisabled(cur, options)) {
      return true;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}
