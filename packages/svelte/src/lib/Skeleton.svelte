<script lang="ts">
  interface Props {
    variant?: 'text' | 'rect' | 'circle';
    width?: string;
    height?: string;
    lines?: number;
    class?: string;
    /** Bound to the element in the single-skeleton case; not set when `lines > 1`. */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    variant = 'text',
    width,
    height,
    lines = 1,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

{#if variant === 'text' && lines > 1}
  {#each Array.from({ length: lines }, (_, i) => i) as idx}
    <div
      class="joy-skeleton joy-skeleton--text {className}"
      style={width && idx === lines - 1 ? `width: 70%` : (width ? `width: ${width}` : '')}
      role="progressbar"
      aria-busy="true"
      {...rest}
    ></div>
  {/each}
{:else}
  <div
    bind:this={ref}
    class="joy-skeleton joy-skeleton--{variant} {className}"
    style="{width ? `width: ${width};` : ''} {height ? `height: ${height};` : ''}"
    role="progressbar"
    aria-busy="true"
    {...rest}
  ></div>
{/if}
