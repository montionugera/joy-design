<script lang="ts">
  import { Clock } from '@joymify/icons';
  import { openOverlay } from './overlay-utils.js';

  interface Props {
    value?: string;
    defaultValue?: string;
    format?: string;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    onchange?: (val: string) => void;
    class?: string;
    style?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    defaultValue = '',
    value = $bindable(defaultValue),
    format = 'HH:mm:ss',
    placeholder = 'Select time',
    disabled = false,
    id,
    onchange,
    class: className = '',
    style = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let isOpen = $state(false);
  let activeCol = $state<0 | 1 | 2>(0);

  let anchorEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  let showSeconds = $derived(format.includes('ss'));

  let parts = $derived.by(() => {
    const split = value ? value.split(':') : ['00', '00', '00'];
    return {
      hour: split[0] || '00',
      minute: split[1] || '00',
      second: split[2] || '00'
    };
  });

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  $effect(() => {
    if (!isOpen || !anchorEl || !panelEl) return;
    const h = openOverlay({
      anchor: anchorEl,
      panel: panelEl,
      onClose: () => {
        isOpen = false;
      }
    });
    return () => h.dispose();
  });

  function selectPart(type: 'hour' | 'minute' | 'second', val: string) {
    const next = { ...parts, [type]: val };
    const formatted = showSeconds
      ? `${next.hour}:${next.minute}:${next.second}`
      : `${next.hour}:${next.minute}`;
    value = formatted;
    onchange?.(formatted);
  }

  function focusCurrentCell() {
    if (!panelEl) return;
    const colEls = panelEl.querySelectorAll('.joy-time-picker__column');
    const targetCol = colEls[activeCol];
    if (!targetCol) return;
    const selectedOrFirst = (targetCol.querySelector('.joy-time-picker__cell--selected') ||
      targetCol.querySelector('.joy-time-picker__cell')) as HTMLButtonElement | null;
    selectedOrFirst?.focus();
  }

  function stepActiveCol(delta: number) {
    if (activeCol === 0) {
      const idx = hours.indexOf(parts.hour);
      const nextIdx = (idx === -1 ? 0 : idx + delta + 24) % 24;
      selectPart('hour', hours[nextIdx]);
    } else if (activeCol === 1) {
      const idx = minutes.indexOf(parts.minute);
      const nextIdx = (idx === -1 ? 0 : idx + delta + 60) % 60;
      selectPart('minute', minutes[nextIdx]);
    } else if (activeCol === 2) {
      const idx = seconds.indexOf(parts.second);
      const nextIdx = (idx === -1 ? 0 : idx + delta + 60) % 60;
      selectPart('second', seconds[nextIdx]);
    }
    focusCurrentCell();
  }

  function handlePanelKeyDown(e: KeyboardEvent) {
    const maxCol = showSeconds ? 2 : 1;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (activeCol > 0) {
        activeCol = (activeCol - 1) as 0 | 1 | 2;
        focusCurrentCell();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (activeCol < maxCol) {
        activeCol = (activeCol + 1) as 0 | 1 | 2;
        focusCurrentCell();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepActiveCol(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepActiveCol(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      isOpen = false;
      anchorEl?.focus();
    }
  }
</script>

<div
  bind:this={ref}
  class="joy-time-picker {disabled ? 'joy-time-picker--disabled' : ''} {className}"
  {style}
  {...rest}
>
  <div
    bind:this={anchorEl}
    class="joy-input-wrapper {disabled ? 'joy-input-wrapper--disabled' : ''}"
    tabindex={disabled ? -1 : 0}
    role="combobox"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    onclick={() => {
      if (!disabled) isOpen = !isOpen;
    }}
    onkeydown={(e) => {
      if (!disabled && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
        e.preventDefault();
        isOpen = !isOpen;
      }
    }}
  >
    <input
      type="text"
      class="joy-input"
      readonly
      {disabled}
      {placeholder}
      {id}
      value={value}
      tabindex="-1"
    />
    <span class="joy-input-wrapper__suffix">
      <Clock />
    </span>
  </div>

  {#if isOpen}
    <div
      bind:this={panelEl}
      class="joy-time-picker__panel"
      role="listbox"
      tabindex="-1"
      onkeydown={handlePanelKeyDown}
    >
      <div class="joy-time-picker__column" aria-label="Hours">
        {#each hours as h}
          <button
            type="button"
            role="option"
            aria-selected={parts.hour === h}
            class="joy-time-picker__cell {parts.hour === h ? 'joy-time-picker__cell--selected' : ''}"
            tabindex={parts.hour === h ? 0 : -1}
            onclick={() => {
              activeCol = 0;
              selectPart('hour', h);
            }}
          >
            {h}
          </button>
        {/each}
      </div>
      <div class="joy-time-picker__column" aria-label="Minutes">
        {#each minutes as m}
          <button
            type="button"
            role="option"
            aria-selected={parts.minute === m}
            class="joy-time-picker__cell {parts.minute === m ? 'joy-time-picker__cell--selected' : ''}"
            tabindex={parts.minute === m ? 0 : -1}
            onclick={() => {
              activeCol = 1;
              selectPart('minute', m);
            }}
          >
            {m}
          </button>
        {/each}
      </div>
      {#if showSeconds}
        <div class="joy-time-picker__column" aria-label="Seconds">
          {#each seconds as s}
            <button
              type="button"
              role="option"
              aria-selected={parts.second === s}
              class="joy-time-picker__cell {parts.second === s ? 'joy-time-picker__cell--selected' : ''}"
              tabindex={parts.second === s ? 0 : -1}
              onclick={() => {
                activeCol = 2;
                selectPart('second', s);
              }}
            >
              {s}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
