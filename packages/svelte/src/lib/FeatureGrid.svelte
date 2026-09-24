<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    columns?: 2 | 3 | 4;
    /** 'lead' (default): the first card spans two of three columns from 900px up. 'uniform': equal cards. */
    layout?: 'lead' | 'uniform';
    children: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let {
    columns = 3,
    layout = 'lead',
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // Never emit an empty or unknown modifier (a "cols-undefined" class has no rule).
  const cols = $derived(columns === 2 || columns === 4 ? columns : 3);
</script>

<div
  bind:this={ref}
  class="joy-feature-grid joy-feature-grid--cols-{cols} {layout === 'uniform' ? '' : 'joy-feature-grid--lead'} {className}"
  {...rest}
>
  {@render children()}
</div>
