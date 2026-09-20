<script lang="ts">
  interface Props {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled?: boolean;
    placeholder?: string;
    onchange?: (val: number) => void;
  }

  let {
    value = $bindable(0),
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    disabled = false,
    placeholder = '',
    onchange
  }: Props = $props();

  function clamp(val: number): number {
    let res = Math.max(min, Math.min(max, val));
    if (precision !== undefined) {
      res = Number(res.toFixed(precision));
    }
    return res;
  }

  function stepUp() {
    if (disabled) return;
    const next = clamp(value + step);
    value = next;
    onchange?.(next);
  }

  function stepDown() {
    if (disabled) return;
    const next = clamp(value - step);
    value = next;
    onchange?.(next);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const parsed = parseFloat(target.value);
    if (!isNaN(parsed)) {
      const next = clamp(parsed);
      value = next;
      onchange?.(next);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepDown();
    }
  }
</script>

<div
  class="joy-input-number"
  class:joy-input-number--disabled={disabled}
  role="spinbutton"
  aria-valuenow={value}
  aria-valuemin={min !== -Infinity ? min : undefined}
  aria-valuemax={max !== Infinity ? max : undefined}
  tabindex={disabled ? -1 : 0}
  onkeydown={handleKeyDown}
>
  <input
    type="text"
    class="joy-input-number__input"
    {disabled}
    {placeholder}
    value={value}
    oninput={handleInput}
  />
  <div class="joy-input-number__handler-wrap">
    <button
      type="button"
      class="joy-input-number__handler-up"
      tabindex="-1"
      aria-label="Increase value"
      {disabled}
      onclick={stepUp}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
    <button
      type="button"
      class="joy-input-number__handler-down"
      tabindex="-1"
      aria-label="Decrease value"
      {disabled}
      onclick={stepDown}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  </div>
</div>
