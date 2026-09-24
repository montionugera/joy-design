<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-bento-grid {className}" {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>
