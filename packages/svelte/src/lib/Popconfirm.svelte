<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    okText?: string;
    cancelText?: string;
    open?: boolean;
    onconfirm?: () => void;
    oncancel?: () => void;
    children?: Snippet;
  }

  let {
    title = 'Are you sure?',
    okText = 'Confirm',
    cancelText = 'Cancel',
    open = $bindable(false),
    onconfirm,
    oncancel,
    children
  }: Props = $props();

  function handleConfirm() {
    open = false;
    onconfirm?.();
  }

  function handleCancel() {
    open = false;
    oncancel?.();
  }
</script>

<div class="joy-popconfirm">
  <div onclick={() => { open = !open; }}>
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if open}
    <div class="joy-popconfirm__panel" role="dialog" aria-modal="true">
      <div class="joy-popconfirm__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{title}</span>
      </div>
      <div class="joy-popconfirm__buttons">
        <button
          type="button"
          class="joy-button joy-button--ghost joy-button--sm"
          onclick={handleCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          class="joy-button joy-button--primary joy-button--sm"
          onclick={handleConfirm}
        >
          {okText}
        </button>
      </div>
    </div>
  {/if}
</div>
