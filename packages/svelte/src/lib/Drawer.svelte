<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Close } from '@joymify/icons';
  import { lockBodyScroll, trapFocus } from './overlay-utils.js';

  interface Props {
    open?: boolean;
    title?: string;
    placement?: 'right' | 'left';
    onclose?: () => void;
    children?: Snippet;
    footer?: Snippet;
    class?: string;
    /** The drawer panel (`.joy-drawer`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    open = false,
    title = '',
    placement = 'right',
    onclose,
    children,
    footer,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // Unique per instance, so several drawers/modals never share a label id.
  const uid = $props.id();
  const titleId = `${uid}-title`;

  function handleKeydown(e: KeyboardEvent) {
    // A popover/menu/tooltip inside the drawer claims Escape (preventDefault) to close itself first.
    if (e.key === 'Escape' && open && !e.defaultPrevented) {
      onclose?.();
    }
  }

  $effect(() => {
    if (!open || !ref) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const unlock = lockBodyScroll();
    const cleanupTrap = trapFocus(ref);
    return () => {
      cleanupTrap();
      unlock();
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="joy-drawer-backdrop"
    class:joy-drawer-backdrop--left={placement === 'left'}
    role="presentation"
    onclick={(e) => { if (e.target === e.currentTarget) onclose?.(); }}
  >
    <div
      bind:this={ref}
      class="joy-drawer {className}"
      class:joy-drawer--left={placement === 'left'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Drawer'}
      {...rest}
    >
      <div class="joy-drawer__header">
        {#if title}
          <h3 id={titleId} class="joy-drawer__title">{title}</h3>
        {/if}
        <button
          type="button"
          class="joy-drawer__close"
          onclick={() => onclose?.()}
          aria-label="Close drawer"
        >
          <Close size="1.25rem" />
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
