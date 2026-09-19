<script lang="ts">
  interface Props {
    variant?: 'text' | 'rect' | 'circle';
    width?: string;
    height?: string;
    lines?: number;
  }

  let {
    variant = 'text',
    width,
    height,
    lines = 1
  }: Props = $props();
</script>

{#if variant === 'text' && lines > 1}
  {#each Array.from({ length: lines }, (_, i) => i) as idx}
    <div
      class="joy-skeleton joy-skeleton--text"
      style={width && idx === lines - 1 ? `width: 70%` : (width ? `width: ${width}` : '')}
      role="progressbar"
      aria-busy="true"
    ></div>
  {/each}
{:else}
  <div
    class="joy-skeleton joy-skeleton--{variant}"
    style="{width ? `width: ${width};` : ''} {height ? `height: ${height};` : ''}"
    role="progressbar"
    aria-busy="true"
  ></div>
{/if}
