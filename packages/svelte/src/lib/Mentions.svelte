<script lang="ts">
  import { openOverlay } from './overlay-utils.js';

  export interface MentionOption {
    value: string;
    label?: string;
  }

  interface Props {
    value?: string;
    defaultValue?: string;
    prefix?: string;
    options?: MentionOption[];
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    id?: string;
    onchange?: (val: string) => void;
    onselect?: (option: MentionOption) => void;
    class?: string;
    style?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    defaultValue = '',
    value = $bindable(defaultValue),
    prefix = '@',
    options = [],
    placeholder = '',
    rows = 3,
    disabled = false,
    id,
    onchange,
    onselect,
    class: className = '',
    style = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const generatedId = $props.id();
  const dropdownId = $derived(`${id || generatedId}-listbox`);

  let isOpen = $state(false);
  let filterText = $state('');
  let activeIndex = $state(0);

  let textareaEl = $state<HTMLTextAreaElement | null>(null);
  let panelEl = $state<HTMLUListElement | null>(null);

  let filteredOptions = $derived(
    options.filter(
      (opt) =>
        opt.value.toLowerCase().includes(filterText.toLowerCase()) ||
        (opt.label && opt.label.toLowerCase().includes(filterText.toLowerCase()))
    )
  );

  $effect(() => {
    if (!isOpen || !textareaEl || !panelEl) return;
    const h = openOverlay({
      anchor: textareaEl,
      panel: panelEl,
      onClose: () => {
        isOpen = false;
      }
    });
    return () => h.dispose();
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);

    const cursorPos = target.selectionStart;
    const textBefore = target.value.slice(0, cursorPos);
    const lastPrefixIndex = textBefore.lastIndexOf(prefix);

    if (
      lastPrefixIndex !== -1 &&
      (lastPrefixIndex === 0 || /\s/.test(textBefore[lastPrefixIndex - 1]))
    ) {
      filterText = textBefore.slice(lastPrefixIndex + prefix.length);
      activeIndex = 0;
      isOpen = true;
    } else {
      isOpen = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen || filteredOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filteredOptions.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filteredOptions.length) % filteredOptions.length;
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        e.preventDefault();
        selectOption(filteredOptions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isOpen = false;
    }
  }

  function selectOption(option: MentionOption) {
    if (!textareaEl) return;
    const cursorPos = textareaEl.selectionStart;
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const lastPrefixIndex = textBefore.lastIndexOf(prefix);

    if (lastPrefixIndex !== -1) {
      const newText = textBefore.slice(0, lastPrefixIndex) + prefix + option.value + ' ' + textAfter;
      value = newText;
      isOpen = false;
      onchange?.(newText);
      onselect?.(option);

      textareaEl.focus();
      const nextPos = lastPrefixIndex + prefix.length + option.value.length + 1;
      textareaEl.setSelectionRange(nextPos, nextPos);
    }
  }
</script>

<div
  bind:this={ref}
  {id}
  class="joy-mentions {disabled ? 'joy-mentions--disabled' : ''} {className}"
  {style}
  {...rest}
>
  <textarea
    bind:this={textareaEl}
    class="joy-textarea joy-mentions__textarea"
    role="combobox"
    {rows}
    {placeholder}
    {disabled}
    {value}
    oninput={handleInput}
    onkeydown={handleKeyDown}
    aria-autocomplete="list"
    aria-expanded={isOpen}
    aria-controls={isOpen && filteredOptions.length > 0 ? dropdownId : undefined}
  ></textarea>

  {#if isOpen && filteredOptions.length > 0}
    <ul
      bind:this={panelEl}
      id={dropdownId}
      class="joy-mentions__dropdown"
      role="listbox"
    >
      {#each filteredOptions as opt, i}
        <!-- False positive: options are not focusable; the keyboard is handled by the textarea (handleKeyDown: Arrow/Enter/Tab). -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          class="joy-mentions__item {i === activeIndex ? 'joy-mentions__item--active' : ''}"
          role="option"
          aria-selected={i === activeIndex}
          tabindex="-1"
          onclick={() => selectOption(opt)}
        >
          <span class="joy-mentions__item-label">{opt.label || opt.value}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>
