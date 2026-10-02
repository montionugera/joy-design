<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		figure: string | number;
		unit?: string;
		tally?: string;
		label?: string;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		figure,
		unit,
		tally,
		label,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-performance-figure {className}" {...rest}>
	{#if label}
		<span class="joy-performance-figure__label">{label}</span>
	{/if}
	<div class="joy-performance-figure__val-row">
		<span class="joy-performance-figure__figure">{figure}</span>
		{#if unit}
			<span class="joy-performance-figure__unit">{unit}</span>
		{/if}
		{#if tally}
			<span class="joy-performance-figure__tally">{tally}</span>
		{/if}
	</div>
</div>
