<script lang="ts">
  interface Props {
    value?: string;
    format?: string;
    placeholder?: string;
    disabled?: boolean;
    onchange?: (val: string) => void;
  }

  let {
    value = $bindable(''),
    format = 'HH:mm:ss',
    placeholder = 'Select time',
    disabled = false,
    onchange
  }: Props = $props();

  let isOpen = $state(false);

  let showSeconds = $derived(format.includes('ss'));

  let parts = $derived(() => {
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

  function selectPart(type: 'hour' | 'minute' | 'second', val: string) {
    const current = parts();
    const next = { ...current, [type]: val };
    const formatted = showSeconds
      ? `${next.hour}:${next.minute}:${next.second}`
      : `${next.hour}:${next.minute}`;
    value = formatted;
    onchange?.(formatted);
  }
</script>

<div class="joy-time-picker">
  <div
    class="joy-input-wrapper"
    class:joy-input-wrapper--disabled={disabled}
    onclick={() => { if (!disabled) isOpen = !isOpen; }}
  >
    <input
      type="text"
      class="joy-input"
      readonly
      {disabled}
      {placeholder}
      value={value}
    />
    <span class="joy-time-picker__icon" style="padding-right: 10px; display: flex; align-items: center; color: var(--joy-color-text-muted, #64748b);">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </span>
  </div>

  {#if isOpen}
    <div class="joy-time-picker__panel" role="dialog">
      <div class="joy-time-picker__column" aria-label="Hours">
        {#each hours as h}
          <div
            class="joy-time-picker__cell"
            class:joy-time-picker__cell--selected={parts().hour === h}
            onclick={() => selectPart('hour', h)}
          >
            {h}
          </div>
        {/each}
      </div>
      <div class="joy-time-picker__column" aria-label="Minutes">
        {#each minutes as m}
          <div
            class="joy-time-picker__cell"
            class:joy-time-picker__cell--selected={parts().minute === m}
            onclick={() => selectPart('minute', m)}
          >
            {m}
          </div>
        {/each}
      </div>
      {#if showSeconds}
        <div class="joy-time-picker__column" aria-label="Seconds">
          {#each seconds as s}
            <div
              class="joy-time-picker__cell"
              class:joy-time-picker__cell--selected={parts().second === s}
              onclick={() => selectPart('second', s)}
            >
              {s}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
