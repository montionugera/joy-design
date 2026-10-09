<script lang="ts" module>
  export interface DateRangeValue {
    start: string;
    end: string;
  }
</script>

<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Close, ArrowRight } from '@montionugera/joy-icons';
  import { openOverlay } from './overlay-utils.js';
  import {
    MONTH_NAMES,
    WEEKDAYS,
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

  interface Props {
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
    onchange?: (v: DateRangeValue) => void;
    class?: string;
    style?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    defaultValue = { start: '', end: '' },
    value = $bindable(defaultValue),
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
    onchange,
    class: className = '',
    style = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let isOpen = $state(false);
  let activeInput = $state<'start' | 'end'>('start');
  let hoverDate = $state<Date | null>(null);

  let startDate = $derived(parseDate(value?.start));
  let endDate = $derived(parseDate(value?.end));

  let leftMonthDate = $state<Date>(new Date());

  $effect(() => {
    if (startDate) {
      leftMonthDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
  });

  let wrapperEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!isOpen || !wrapperEl || !panelEl) return;
    const h = openOverlay({
      anchor: wrapperEl,
      panel: panelEl,
      onClose: () => {
        isOpen = false;
        hoverDate = null;
      }
    });
    return () => h.dispose();
  });

  function isSingleDateDisabled(d: Date, fromDate?: Date) {
    return checkDateDisabled(d, {
      min,
      max,
      disabledDate,
      blackoutDates,
      blackoutRanges,
      from: fromDate
    });
  }

  function isDateDisabled(d: Date) {
    const isPickingEnd = value?.start && !value?.end && startDate;
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
  }

  function commit(next: DateRangeValue) {
    let resolved = next;
    if (next.start && next.end && next.start > next.end) {
      resolved = { start: next.end, end: next.start };
    }
    value = resolved;
    onchange?.(resolved);
  }

  function handleSelectDay(dateStr: string, d: Date) {
    if (isDateDisabled(d)) return;

    if (!value.start || (value.start && value.end)) {
      commit({ start: dateStr, end: '' });
      activeInput = 'end';
    } else {
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
      commit({ start: value.start, end: dateStr });
      isOpen = false;
      hoverDate = null;
      activeInput = 'start';
    }
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    commit({ start: '', end: '' });
    hoverDate = null;
  }

  function handlePreset(p: DateRangePreset) {
    const pStart = parseDate(p.value[0]);
    const pEnd = parseDate(p.value[1]);
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
    commit({ start: p.value[0], end: p.value[1] });
    isOpen = false;
    hoverDate = null;
  }

  function prevYear(e: MouseEvent) {
    e.stopPropagation();
    leftMonthDate = new Date(leftMonthDate.getFullYear() - 1, leftMonthDate.getMonth(), 1);
  }

  function nextYear(e: MouseEvent) {
    e.stopPropagation();
    leftMonthDate = new Date(leftMonthDate.getFullYear() + 1, leftMonthDate.getMonth(), 1);
  }

  function prevMonth(e: MouseEvent) {
    e.stopPropagation();
    leftMonthDate = new Date(leftMonthDate.getFullYear(), leftMonthDate.getMonth() - 1, 1);
  }

  function nextMonth(e: MouseEvent) {
    e.stopPropagation();
    leftMonthDate = new Date(leftMonthDate.getFullYear(), leftMonthDate.getMonth() + 1, 1);
  }

  const leftYear = $derived(leftMonthDate.getFullYear());
  const leftMonth = $derived(leftMonthDate.getMonth());
  const leftDays = $derived(getMonthMatrix(leftYear, leftMonth));

  const rightMonthDate = $derived(new Date(leftYear, leftMonth + 1, 1));
  const rightYear = $derived(rightMonthDate.getFullYear());
  const rightMonth = $derived(rightMonthDate.getMonth());
  const rightDays = $derived(getMonthMatrix(rightYear, rightMonth));

  function isDayInRange(d: Date) {
    if (startDate && endDate) {
      return isBetweenDays(d, startDate, endDate);
    }
    if (startDate && !endDate && hoverDate) {
      return isBetweenDays(d, startDate, hoverDate);
    }
    return false;
  }

  function isRangeStart(d: Date) {
    if (!startDate) return false;
    return isSameDay(d, startDate);
  }

  function isRangeEnd(d: Date) {
    if (endDate) return isSameDay(d, endDate);
    if (startDate && hoverDate && hoverDate > startDate) return isSameDay(d, hoverDate);
    return false;
  }
</script>

<div
  bind:this={ref}
  class="joy-date-range-picker joy-date-range-picker--{size} {isOpen ? 'joy-date-range-picker--open' : ''} {disabled ? 'joy-date-range-picker--disabled' : ''} {error ? 'joy-date-range-picker--error' : ''} {className}"
  {style}
  role="presentation"
  onclick={() => {
    if (!disabled) isOpen = !isOpen;
  }}
  {...rest}
>
  <input
    type="text"
    readonly
    id={startId}
    placeholder={startPlaceholder}
    value={value.start}
    {disabled}
    tabindex={disabled ? -1 : 0}
    class="joy-date-range-picker__input {activeInput === 'start' && isOpen ? 'joy-date-range-picker__input--active' : ''}"
    onclick={(e) => {
      e.stopPropagation();
      activeInput = 'start';
      if (!disabled) isOpen = true;
    }}
  />

  <span class="joy-date-range-picker__sep joy-date-range-picker__separator" aria-hidden="true">
    <ArrowRight size={13} />
  </span>

  <input
    type="text"
    readonly
    id={endId}
    placeholder={endPlaceholder}
    value={value.end}
    {disabled}
    tabindex={disabled ? -1 : 0}
    class="joy-date-range-picker__input {activeInput === 'end' && isOpen ? 'joy-date-range-picker__input--active' : ''}"
    onclick={(e) => {
      e.stopPropagation();
      activeInput = 'end';
      if (!disabled) isOpen = true;
    }}
  />

  <div class="joy-date-range-picker__actions">
    {#if allowClear && (!!value.start || !!value.end) && !disabled}
      <button
        type="button"
        class="joy-date-range-picker__clear"
        aria-label="Clear range"
        onclick={handleClear}
      >
        <Close size="14" />
      </button>
    {/if}
    <span class="joy-date-range-picker__icon" aria-hidden="true">
      <Calendar size="16" />
    </span>
  </div>

  {#if isOpen}
    <div
      bind:this={panelEl}
      class="joy-calendar-overlay joy-calendar-overlay--dual"
      role="dialog"
      aria-modal="true"
      aria-label="Choose date range"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="joy-calendar__body">
        <!-- Left Month Pane -->
        <div class="joy-calendar__pane">
          <div class="joy-calendar__header">
            <div style="display: flex; gap: 2px;">
              <button
                type="button"
                class="joy-calendar__nav-btn"
                title="Previous Year"
                aria-label="Previous Year"
                onclick={prevYear}
              >
                <span style="display: inline-flex; letter-spacing: -6px;">
                  <ChevronLeft size={11} />
                  <ChevronLeft size={11} />
                </span>
              </button>
              <button
                type="button"
                class="joy-calendar__nav-btn"
                title="Previous Month"
                aria-label="Previous Month"
                onclick={prevMonth}
              >
                <ChevronLeft size={13} />
              </button>
            </div>
            <div class="joy-calendar__title">
              <span>{MONTH_NAMES[leftMonth]}</span>
              <span>{leftYear}</span>
            </div>
            <div style="width: 24px;"></div>
          </div>

          <div class="joy-calendar__grid" role="grid">
            {#each WEEKDAYS as w (w)}
              <div class="joy-calendar__weekday" role="columnheader">
                {w}
              </div>
            {/each}
            {#each leftDays as day (day.dateString)}
              {@const isStart = isRangeStart(day.date)}
              {@const isEnd = isRangeEnd(day.date)}
              {@const inRange = isDayInRange(day.date)}
              {@const disabledDay = isDateDisabled(day.date)}

              <button
                type="button"
                role="gridcell"
                aria-selected={isStart || isEnd}
                aria-disabled={disabledDay}
                disabled={disabledDay}
                class="joy-calendar__cell {!day.isCurrentMonth ? 'joy-calendar__cell--muted' : ''} {day.isToday ? 'joy-calendar__cell--today' : ''} {isStart ? 'joy-calendar__cell--selected joy-calendar__cell--range-start' : ''} {isEnd ? 'joy-calendar__cell--selected joy-calendar__cell--range-end' : ''} {inRange && !isStart && !isEnd ? 'joy-calendar__cell--in-range' : ''} {disabledDay ? 'joy-calendar__cell--disabled' : ''}"
                onmouseenter={() => {
                  if (value.start && !value.end && !disabledDay) {
                    hoverDate = day.date;
                  }
                }}
                onclick={() => handleSelectDay(day.dateString, day.date)}
              >
                {day.dayNumber}
              </button>
            {/each}
          </div>
        </div>

        <!-- Right Month Pane -->
        <div class="joy-calendar__pane">
          <div class="joy-calendar__header">
            <div style="width: 24px;"></div>
            <div class="joy-calendar__title">
              <span>{MONTH_NAMES[rightMonth]}</span>
              <span>{rightYear}</span>
            </div>
            <div style="display: flex; gap: 2px;">
              <button
                type="button"
                class="joy-calendar__nav-btn"
                title="Next Month"
                aria-label="Next Month"
                onclick={nextMonth}
              >
                <ChevronRight size={13} />
              </button>
              <button
                type="button"
                class="joy-calendar__nav-btn"
                title="Next Year"
                aria-label="Next Year"
                onclick={nextYear}
              >
                <span style="display: inline-flex; letter-spacing: -6px;">
                  <ChevronRight size={11} />
                  <ChevronRight size={11} />
                </span>
              </button>
            </div>
          </div>

          <div class="joy-calendar__grid" role="grid">
            {#each WEEKDAYS as w (w)}
              <div class="joy-calendar__weekday" role="columnheader">
                {w}
              </div>
            {/each}
            {#each rightDays as day (day.dateString)}
              {@const isStart = isRangeStart(day.date)}
              {@const isEnd = isRangeEnd(day.date)}
              {@const inRange = isDayInRange(day.date)}
              {@const disabledDay = isDateDisabled(day.date)}

              <button
                type="button"
                role="gridcell"
                aria-selected={isStart || isEnd}
                aria-disabled={disabledDay}
                disabled={disabledDay}
                class="joy-calendar__cell {!day.isCurrentMonth ? 'joy-calendar__cell--muted' : ''} {day.isToday ? 'joy-calendar__cell--today' : ''} {isStart ? 'joy-calendar__cell--selected joy-calendar__cell--range-start' : ''} {isEnd ? 'joy-calendar__cell--selected joy-calendar__cell--range-end' : ''} {inRange && !isStart && !isEnd ? 'joy-calendar__cell--in-range' : ''} {disabledDay ? 'joy-calendar__cell--disabled' : ''}"
                onmouseenter={() => {
                  if (value.start && !value.end && !disabledDay) {
                    hoverDate = day.date;
                  }
                }}
                onclick={() => handleSelectDay(day.dateString, day.date)}
              >
                {day.dayNumber}
              </button>
            {/each}
          </div>
        </div>
      </div>

      {#if presets && presets.length > 0}
        <div class="joy-calendar__footer">
          <div class="joy-calendar__presets">
            {#each presets as p (p.label)}
              <button
                type="button"
                class="joy-calendar__preset-btn"
                onclick={() => handlePreset(p)}
              >
                {p.label}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
