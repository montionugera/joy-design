<script lang="ts">
  import { openOverlay } from './overlay-utils.js';

  export interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string;
    options?: Option[];
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    name?: string;
    id?: string;
    onchange?: (val: string) => void;
    class?: string;
    ref?: HTMLButtonElement | null;
  }

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    error = false,
    message,
    size = 'md',
    name,
    id,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let open = $state(false);
  let activeIndex = $state(-1);
  let panelEl = $state<HTMLElement | null>(null);

  const generatedId = $props.id();
  const selectedOption = $derived(options.find((o) => o.value === value));
  const selectedLabel = $derived(selectedOption ? selectedOption.label : '');
  const listboxId = $derived(`${id || generatedId}-listbox`);
  const activeDescendantId = $derived(
    open && activeIndex >= 0 && activeIndex < options.length
      ? `${listboxId}-opt-${activeIndex}`
      : undefined
  );

  function getFirstIndex(): number {
    return options.findIndex((o) => !o.disabled);
  }

  function getLastIndex(): number {
    for (let i = options.length - 1; i >= 0; i--) {
      if (!options[i].disabled) return i;
    }
    return -1;
  }

  function getNextIndex(current: number, step: number): number {
    const len = options.length;
    if (len === 0) return -1;
    let next = current + step;
    while (next >= 0 && next < len) {
      if (!options[next].disabled) return next;
      next += step;
    }
    return current;
  }

  function selectOption(opt: Option) {
    if (opt.disabled) return;
    value = opt.value;
    onchange?.(opt.value);
    open = false;
  }

  function toggleOpen() {
    if (disabled) return;
    open = !open;
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      activeIndex = idx >= 0 && !options[idx].disabled ? idx : getFirstIndex();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        open = true;
        const idx = options.findIndex((o) => o.value === value);
        activeIndex = idx >= 0 && !options[idx].disabled ? idx : getFirstIndex();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = getNextIndex(activeIndex, 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = getNextIndex(activeIndex, -1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      activeIndex = getFirstIndex();
    } else if (e.key === 'End') {
      e.preventDefault();
      activeIndex = getLastIndex();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < options.length) {
        selectOption(options[activeIndex]);
      }
    }
  }

  $effect(() => {
    if (!open || !ref || !panelEl) return;
    const handle = openOverlay({
      anchor: ref,
      panel: panelEl,
      onClose: () => {
        open = false;
      }
    });
    return () => handle.dispose();
  });
</script>

<div
  class="joy-select-wrapper joy-select-wrapper--{size} {disabled ? 'joy-select-wrapper--disabled' : ''} {error ? 'joy-select-wrapper--error' : ''} {open ? 'joy-select-wrapper--open' : ''} {className}"
>
  <button
    bind:this={ref}
    type="button"
    role="combobox"
    class="joy-select"
    {id}
    {disabled}
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-controls={listboxId}
    aria-invalid={error || undefined}
    aria-activedescendant={activeDescendantId}
    onclick={toggleOpen}
    onkeydown={handleKeydown}
    {...rest}
  >
    {#if selectedLabel}
      <span class="joy-select__value">{selectedLabel}</span>
    {:else}
      <span class="joy-select__placeholder">{placeholder}</span>
    {/if}
    <span class="joy-select__arrow" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </span>
  </button>
  <input type="hidden" {name} value={value ?? ''} />
  {#if open}
    <ul bind:this={panelEl} id={listboxId} class="joy-select__listbox joy-overlay" role="listbox">
      {#each options as opt, i}
        <li
          id="{listboxId}-opt-{i}"
          role="option"
          class="joy-select__option {i === activeIndex ? 'joy-select__option--active' : ''} {opt.disabled ? 'joy-select__option--disabled' : ''}"
          aria-selected={opt.value === value}
          aria-disabled={opt.disabled || undefined}
          onclick={() => selectOption(opt)}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
  {#if message}
    <p class="joy-select-wrapper__message">{message}</p>
  {/if}
</div>
