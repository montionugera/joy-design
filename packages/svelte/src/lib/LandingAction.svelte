<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';

  // Internal (not exported from index.ts): the CTA button used by HeroSection and CTASection.
  // Without href it composes Button; with href it renders an anchor. A link ignores :disabled, so
  // a disabled or loading link drops href, is aria-disabled and leaves the tab order.
  interface Props {
    variant?: 'solid' | 'outline';
    href?: string;
    loading?: boolean;
    disabled?: boolean;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    class?: string;
  }

  let {
    variant = 'solid',
    href,
    loading = false,
    disabled = false,
    onclick,
    children,
    class: className = ''
  }: Props = $props();

  const inert = $derived(disabled || loading);
</script>

{#if href}
  <a
    class="joy-button joy-button--{variant} joy-button--lg {loading ? 'joy-button--loading' : ''} {className}"
    href={inert ? undefined : href}
    role={inert ? 'link' : undefined}
    aria-disabled={inert || undefined}
    aria-busy={loading || undefined}
    tabindex={inert ? -1 : undefined}
    onclick={inert ? (e: MouseEvent) => e.preventDefault() : onclick}
  >
    <span class="joy-button__label">{@render children?.()}</span>
    {#if loading}
      <span class="joy-button__spinner" aria-hidden="true">
        <svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </span>
    {/if}
  </a>
{:else}
  <Button {variant} size="lg" {loading} {disabled} {onclick} class={className}>
    {@render children?.()}
  </Button>
{/if}
