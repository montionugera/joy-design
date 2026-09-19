<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		max?: number;
		children?: Snippet;
	}

	let {
		max,
		children
	}: Props = $props();
</script>

<div class="joy-avatar-group">
	{#if children}
		{@render children()}
	{/if}
</div>
