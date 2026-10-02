<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export type Outcome = boolean | 'win' | 'loss' | 'neutral';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		outcomes: Outcome[];
		label?: string;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		outcomes = [],
		label,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function getOutcomeType(item: Outcome): 'win' | 'loss' | 'neutral' {
		if (item === true || item === 'win') return 'win';
		if (item === false || item === 'loss') return 'loss';
		return 'neutral';
	}
</script>

<div bind:this={ref} class="joy-performance-bars {className}" {...rest}>
	{#if label}
		<div class="joy-performance-bars__label">{label}</div>
	{/if}
	<div class="joy-performance-bars__track">
		{#each outcomes as outcome, idx (idx)}
			{@const type = getOutcomeType(outcome)}
			<span class="joy-performance-bars__bar joy-performance-bars__bar--{type}" aria-label={type}></span>
		{/each}
	</div>
</div>
