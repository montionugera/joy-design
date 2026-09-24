<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /**
     * Column count (2, 3 or 4) for layout="uniform". With the default layout="lead" the grid is three columns from
     * 900px and one column below, so this prop has no effect there.
     */
    columns?: 2 | 3 | 4;
    /**
     * 'lead' (default): from 900px the first card spans two of three columns and the last card fills its row, so any
     * number of cards leaves no gap. 'uniform': equal cards in `columns` auto-fit columns (the pre-F-039 grid).
     * The default changed from the old uniform grid, so pass layout="uniform" to keep it.
     */
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
