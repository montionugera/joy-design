<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    placement?: 'right' | 'left';
    onclose?: () => void;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    open = false,
    title = '',
    placement = 'right',
    onclose,
    children,
    footer
  }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="joy-drawer-backdrop"
    role="presentation"
    style="justify-content: {placement === 'left' ? 'flex-start' : 'flex-end'};"
    onclick={(e) => { if (e.target === e.currentTarget) onclose?.(); }}
  >
    <div
      class="joy-drawer"
      class:joy-drawer--left={placement === 'left'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div class="joy-drawer__header">
        <h3 id="drawer-title" class="joy-drawer__title">{title}</h3>
        <button
          type="button"
          class="joy-drawer__close"
          onclick={() => onclose?.()}
          aria-label="Close drawer"
        >
          &times;
        </button>
      </div>

      <div class="joy-drawer__body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="joy-drawer__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
