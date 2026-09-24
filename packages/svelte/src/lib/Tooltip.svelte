<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children?: Snippet;
    class?: string;
    /** The root element (`.joy-tooltip-wrapper`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let { title, children, class: className = '', ref = $bindable(null), ...rest }: Props = $props();

  const uid = $props.id();
  const tooltipId = `${uid}-tip`;

  // Three independent reasons to be visible. Mouse hover and keyboard focus behave as before; a tap on a
  // touch/pen device has no hover, so it pins the tooltip until the next tap on the trigger, an outside
  // tap, or Escape.
  let hovered = $state(false);
  let focused = $state(false);
  let pinned = $state(false);
  let lastPointerType = 'mouse';

  let visible = $derived(hovered || focused || pinned);

  function dismiss() {
    hovered = false;
    focused = false;
    pinned = false;
  }

  function handleClick() {
    if (lastPointerType === 'mouse') return;
    if (pinned) dismiss();
    else pinned = true;
  }

  $effect(() => {
    if (!visible || !ref) return;
    const wrapper = ref;
    const trigger = wrapper.firstElementChild ?? wrapper;
    const tokens = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!tokens.includes(tooltipId)) trigger.setAttribute('aria-describedby', [...tokens, tooltipId].join(' '));

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Claim the key so a dialog around the trigger stays open: Escape dismisses the tooltip first.
      e.preventDefault();
      dismiss();
    };
    const onPointerdown = (e: PointerEvent) => {
      if (!wrapper.contains(e.target as Node)) dismiss();
    };
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('pointerdown', onPointerdown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('pointerdown', onPointerdown);
      const remaining = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((t) => t && t !== tooltipId);
      if (remaining.length) trigger.setAttribute('aria-describedby', remaining.join(' '));
      else trigger.removeAttribute('aria-describedby');
    };
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
  bind:this={ref}
  class="joy-tooltip-wrapper {className}"
  onpointerenter={(e) => { lastPointerType = e.pointerType; if (e.pointerType !== 'touch') hovered = true; }}
  onpointerleave={(e) => { if (e.pointerType !== 'touch') hovered = false; }}
  onpointerdown={(e) => (lastPointerType = e.pointerType)}
  onfocusin={() => (focused = true)}
  onfocusout={() => (focused = false)}
  onclick={handleClick}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}

  {#if visible}
    <div id={tooltipId} class="joy-tooltip" role="tooltip">
      {title}
    </div>
  {/if}
</div>
