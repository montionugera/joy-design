<script lang="ts">
  export interface MentionOption {
    value: string;
    label?: string;
  }

  interface Props {
    value?: string;
    prefix?: string;
    options?: MentionOption[];
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    onselect?: (option: MentionOption) => void;
  }

  let {
    value = $bindable(''),
    prefix = '@',
    options = [],
    placeholder = '',
    rows = 3,
    disabled = false,
    onselect
  }: Props = $props();

  let isOpen = $state(false);
  let filterText = $state('');
  let textareaEl: HTMLTextAreaElement | null = $state(null);

  let filteredOptions = $derived(
    options.filter(opt =>
      opt.value.toLowerCase().includes(filterText.toLowerCase()) ||
      (opt.label && opt.label.toLowerCase().includes(filterText.toLowerCase()))
    )
  );

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    const cursorPos = target.selectionStart;
    const textBefore = target.value.slice(0, cursorPos);
    const lastPrefixIndex = textBefore.lastIndexOf(prefix);

    if (lastPrefixIndex !== -1 && (lastPrefixIndex === 0 || /\s/.test(textBefore[lastPrefixIndex - 1]))) {
      filterText = textBefore.slice(lastPrefixIndex + prefix.length);
      isOpen = true;
    } else {
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
      onselect?.(option);
      setTimeout(() => {
        if (textareaEl) {
          textareaEl.focus();
          const nextPos = lastPrefixIndex + prefix.length + option.value.length + 1;
          textareaEl.setSelectionRange(nextPos, nextPos);
        }
      }, 0);
    }
  }
</script>

<div class="joy-mentions">
  <textarea
    bind:this={textareaEl}
    class="joy-mentions__textarea"
    {rows}
    {placeholder}
    {disabled}
    {value}
    oninput={handleInput}
    onblur={() => setTimeout(() => { isOpen = false; }, 200)}
  ></textarea>

  {#if isOpen && filteredOptions.length > 0}
    <div class="joy-mentions__dropdown" role="listbox">
      {#each filteredOptions as opt}
        <div
          class="joy-mentions__item"
          role="option"
          aria-selected="false"
          tabindex="-1"
          onmousedown={() => selectOption(opt)}
        >
          <span class="joy-mentions__item-label">{opt.label || opt.value}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
