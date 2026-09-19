<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    type?: string;
    oninput?: (e: Event) => void;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    error = false,
    type = 'text',
    oninput
  }: Props = $props();
</script>

<div class="joy-input-wrapper" class:joy-input-wrapper--error={error}>
  <input
    {type}
    {disabled}
    {placeholder}
    bind:value
    {oninput}
    class="joy-input"
  />
</div>

<style>
  .joy-input-wrapper {
    display: inline-flex;
    width: 100%;
    border: 1px solid var(--joy-color-surface-muted, #cbd5e1);
    border-radius: var(--joy-radius-md, 8px);
    background: var(--joy-color-surface-base, #ffffff);
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .joy-input-wrapper:focus-within {
    border-color: var(--joy-color-brand-primary, #7c3aed);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
  }
  .joy-input-wrapper--error {
    border-color: var(--joy-color-status-danger, #ef4444);
  }
  .joy-input-wrapper--error:focus-within {
    border-color: var(--joy-color-status-danger, #ef4444);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
  }
  .joy-input {
    width: 100%;
    padding: var(--joy-spacing-2, 8px) var(--joy-spacing-3, 12px);
    font-family: var(--joy-font-family-sans, sans-serif);
    font-size: 0.875rem;
    color: var(--joy-color-text-primary, #0f172a);
    border: none;
    background: transparent;
    outline: none;
  }
  .joy-input:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
