<script lang="ts">
  interface Props {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    onchange?: (checked: boolean) => void;
  }

  let { checked = $bindable(false), disabled = false, label, onchange }: Props = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  {disabled}
  class="joy-switch"
  class:joy-switch--checked={checked}
  onclick={toggle}
>
  <span class="joy-switch__thumb"></span>
  {#if label}
    <span class="joy-switch__label">{label}</span>
  {/if}
</button>

<style>
  .joy-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--joy-spacing-2, 8px);
    background: #cbd5e1;
    border: none;
    border-radius: 9999px;
    width: 44px;
    height: 24px;
    padding: 2px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    position: relative;
  }
  .joy-switch--checked {
    background-color: var(--joy-color-brand-primary, #7c3aed);
  }
  .joy-switch__thumb {
    display: block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }
  .joy-switch--checked .joy-switch__thumb {
    transform: translateX(20px);
  }
  .joy-switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
