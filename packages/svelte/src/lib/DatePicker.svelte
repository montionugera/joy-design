<script lang="ts">
  import { Calendar, ChevronLeft, ChevronRight, Close } from '@montionugera/joy-icons';
  import { openOverlay } from './overlay-utils.js';
  import {
    MONTH_NAMES,
    WEEKDAYS,
    formatDate,
    getMonthMatrix,
    parseDate,
    isSameDay,
    checkDateDisabled,
    type DisabledDateFn,
    type DateRangeTuple
  } from './calendar-utils.js';

  interface Props {
    value?: string;
    defaultValue?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    size?: 'sm' | 'md' | 'lg';
    id?: string;
    allowClear?: boolean;
    disabledDate?: (current: Date) => boolean;
    blackoutDates?: string[];
    blackoutRanges?: Array<[string, string]>;
    onchange?: (e: any) => void;
    class?: string;
    style?: string;
    ref?: HTMLInputElement | null;
    [key: string]: any;
  }

  let {
    defaultValue = '',
    value = $bindable(defaultValue),
    min,
    max,
    placeholder = 'Select date',
    disabled = false,
    error = false,
    size = 'md',
    id,
    allowClear = true,
    disabledDate,
    blackoutDates,
    blackoutRanges,
    onchange,
    class: className = '',
    style = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let isOpen = $state(false);

  let activeDate = $derived(parseDate(value));
  let viewDate = $state<Date>(new Date());

  $effect(() => {
    if (activeDate) {
      viewDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1);
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
      }
    });
    return () => h.dispose();
  });

  function isDateDisabled(d: Date) {
    return checkDateDisabled(d, {
      min,
      max,
      disabledDate,
      blackoutDates,
      blackoutRanges
    });
  }

  function handleSelect(dateStr: string, d: Date) {
    if (isDateDisabled(d)) return;
    value = dateStr;
    onchange?.(dateStr);
    isOpen = false;
    ref?.focus();
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    value = '';
    onchange?.('');
    ref?.focus();
  }

  function handleToday() {
    const today = new Date();
    if (isDateDisabled(today)) return;
    const todayStr = formatDate(today);
    handleSelect(todayStr, today);
  }

  function prevYear(e: MouseEvent) {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1);
  }

  function nextYear(e: MouseEvent) {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1);
  }

  function prevMonth(e: MouseEvent) {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  }

  function nextMonth(e: MouseEvent) {
    e.stopPropagation();
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  }

  const viewYear = $derived(viewDate.getFullYear());
  const viewMonth = $derived(viewDate.getMonth());
  const days = $derived(getMonthMatrix(viewYear, viewMonth));

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isOpen = !isOpen;
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      isOpen = false;
    }
  }
</script>

<div
  bind:this={wrapperEl}
  class="joy-date-picker joy-date-picker--{size} {isOpen ? 'joy-date-picker--open' : ''} {disabled ? 'joy-date-picker--disabled' : ''} {error ? 'joy-date-picker--error' : ''} {className}"
  {style}
  role="presentation"
  onclick={() => {
    if (!disabled) isOpen = !isOpen;
  }}
  onkeydown={handleKeyDown}
>
  <input
    bind:this={ref}
    type="text"
    readonly
    class="joy-date-picker__input"
    value={value}
    {id}
    {placeholder}
    {disabled}
    tabindex={disabled ? -1 : 0}
    aria-haspopup="dialog"
    aria-expanded={isOpen}
    aria-invalid={error || undefined}
    {...rest}
  />

  <div class="joy-date-picker__actions">
    {#if allowClear && !!value && !disabled}
      <button
        type="button"
        class="joy-date-picker__clear"
        aria-label="Clear date"
        onclick={handleClear}
      >
        <Close size="14" />
      </button>
    {/if}
    <span class="joy-date-picker__icon" aria-hidden="true">
      <Calendar size="16" />
    </span>
  </div>

  {#if isOpen}
    <div
      bind:this={panelEl}
      class="joy-calendar-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Choose date"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
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
                <ChevronLeft size="11" />
                <ChevronLeft size="11" />
              </span>
            </button>
            <button
              type="button"
              class="joy-calendar__nav-btn"
              title="Previous Month"
              aria-label="Previous Month"
              onclick={prevMonth}
            >
              <ChevronLeft size="13" />
            </button>
          </div>

          <div class="joy-calendar__title">
            <span>{MONTH_NAMES[viewMonth]}</span>
            <span>{viewYear}</span>
          </div>

          <div style="display: flex; gap: 2px;">
            <button
              type="button"
              class="joy-calendar__nav-btn"
              title="Next Month"
              aria-label="Next Month"
              onclick={nextMonth}
            >
              <ChevronRight size="13" />
            </button>
            <button
              type="button"
              class="joy-calendar__nav-btn"
              title="Next Year"
              aria-label="Next Year"
              onclick={nextYear}
            >
              <span style="display: inline-flex; letter-spacing: -6px;">
                <ChevronRight size="11" />
                <ChevronRight size="11" />
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

          {#each days as day (day.dateString)}
            {@const isSelected = isSameDay(activeDate, day.date)}
            {@const disabledDay = isDateDisabled(day.date)}
            <button
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-disabled={disabledDay}
              disabled={disabledDay}
              class="joy-calendar__cell {!day.isCurrentMonth ? 'joy-calendar__cell--muted' : ''} {day.isToday ? 'joy-calendar__cell--today' : ''} {isSelected ? 'joy-calendar__cell--selected' : ''} {disabledDay ? 'joy-calendar__cell--disabled' : ''}"
              onclick={() => handleSelect(day.dateString, day.date)}
            >
              {day.dayNumber}
            </button>
          {/each}
        </div>

        <div class="joy-calendar__footer">
          <button
            type="button"
            class="joy-calendar__action-btn"
            onclick={handleToday}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
