<script lang="ts">
  import type { Snippet } from 'svelte';
  import { AlertCircle, AlertTriangle, CheckCircle, Close, Info } from '@joymify/icons';

  interface Props {
    title?: string;
    description?: string;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    /** Show a dismiss button. The alert hides itself and then calls `onclose`. */
    closable?: boolean;
    onclose?: () => void;
    children?: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    title,
    description,
    variant = 'info',
    closable = false,
    onclose,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let dismissed = $state(false);

  function dismiss() {
    dismissed = true;
    onclose?.();
  }
</script>

{#if !dismissed}
  <div bind:this={ref} class="joy-alert joy-alert--{variant} {className}" role="alert" {...rest}>
    <span class="joy-alert__icon" aria-hidden="true">
      {#if variant === 'success'}
        <CheckCircle size="1em" />
      {:else if variant === 'warning'}
        <AlertTriangle size="1em" />
      {:else if variant === 'danger'}
        <AlertCircle size="1em" />
      {:else}
        <Info size="1em" />
      {/if}
    </span>
    <div class="joy-alert__body">
      {#if title}
        <div class="joy-alert__title">{title}</div>
      {/if}
      {#if description}
        <div class="joy-alert__desc">{description}</div>
      {/if}
      {#if children}
        {@render children()}
      {/if}
    </div>
    {#if closable}
      <button type="button" class="joy-alert__close" aria-label="Dismiss alert" onclick={dismiss}>
        <Close size="1em" />
      </button>
    {/if}
  </div>
{/if}
