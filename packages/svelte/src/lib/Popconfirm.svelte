<script lang="ts">
  import type { Snippet } from 'svelte';
  import { AlertCircle } from '@joymify/icons';
  import { openOverlay } from './overlay-utils.js';

  interface Props {
    title?: string;
    okText?: string;
    cancelText?: string;
    open?: boolean;
    onconfirm?: () => void;
    oncancel?: () => void;
    children?: Snippet;
    class?: string;
    /** The root element (`.joy-popconfirm`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    title = 'Are you sure?',
    okText = 'Confirm',
    cancelText = 'Cancel',
    open = $bindable(false),
    onconfirm,
    oncancel,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const titleId = `${uid}-title`;

  let triggerEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  // The trigger wrapper is not focusable itself; focus goes back to the control inside it.
  function focusTrigger() {
    triggerEl?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  }

  // openOverlay gives Escape + outside-click dismissal and fixed positioning (above the trigger's
  // overflow:hidden ancestors, in the popover layer). It does not focus anything, so focus the first
  // button on open and hand focus back to the trigger on every way out.
  $effect(() => {
    if (!open || !triggerEl || !panelEl) return;
    const handle = openOverlay({
      anchor: triggerEl,
      panel: panelEl,
      onClose: () => {
        open = false;
        focusTrigger();
      }
    });
    panelEl.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    return () => handle.dispose();
  });

  function handleConfirm() {
    open = false;
    focusTrigger();
    onconfirm?.();
  }

  function handleCancel() {
    open = false;
    focusTrigger();
    oncancel?.();
  }
</script>

<div bind:this={ref} class="joy-popconfirm {className}" {...rest}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div bind:this={triggerEl} class="joy-popconfirm__trigger" onclick={() => { open = !open; }}>
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if open}
    <div bind:this={panelEl} class="joy-popconfirm__panel" role="alertdialog" aria-labelledby={titleId}>
      <div class="joy-popconfirm__title">
        <span class="joy-popconfirm__icon"><AlertCircle size="1rem" /></span>
        <span id={titleId}>{title}</span>
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
