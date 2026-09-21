<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    columns?: 2 | 3 | 4;
    children: Snippet;
    class?: string;
  }

  let {
    columns = 3,
    children,
    class: className = ''
  }: Props = $props();
</script>

<div class="joy-feature-grid joy-feature-grid--cols-{columns} {className}">
  {@render children()}
</div>
