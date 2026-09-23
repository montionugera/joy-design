<script lang="ts">
  interface Props {
    variant?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
    lines?: number;
    class?: string;
    style?: string;
    /** Bound to the single root element (the element itself, or the lines wrapper when `lines > 1`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    variant = 'text',
    width,
    height,
    lines = 1,
    class: className = '',
    style: consumerStyle = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formatDim = (d?: string | number) => (typeof d === 'number' ? `${d}px` : d);
  const decl = (prop: string, v?: string) => (v ? `${prop}: ${v};` : '');
</script>

{#if variant === 'text' && lines > 1}
  <div
    bind:this={ref}
    class={className}
    style={consumerStyle}
    role="progressbar"
    aria-busy="true"
    {...rest}
  >
    {#each Array.from({ length: lines }, (_, i) => i) as idx}
      <div
        class="joy-skeleton joy-skeleton--text"
        style="{decl('width', width && idx === lines - 1 ? '70%' : formatDim(width))} {decl('height', formatDim(height))}"
      ></div>
    {/each}
  </div>
{:else}
  <div
    bind:this={ref}
    class="joy-skeleton joy-skeleton--{variant} {className}"
    style="{decl('width', formatDim(width))} {decl('height', formatDim(height))} {consumerStyle}"
    role="progressbar"
    aria-busy="true"
    {...rest}
  ></div>
{/if}
