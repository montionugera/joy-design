<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export type DenseRowTone = 'positive' | 'critical' | 'info' | 'neutral';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		label: string;
		figure: string | number;
		delta?: string;
		tone?: DenseRowTone;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		label,
		figure,
		delta,
		tone = 'neutral',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-dense-row {className}" {...rest}>
	<span class="joy-dense-row__label">{label}</span>
	<div class="joy-dense-row__right">
		<span class="joy-dense-row__figure">{figure}</span>
		{#if delta}
			<span class="joy-dense-row__delta joy-dense-row__delta--{tone}">{delta}</span>
		{/if}
	</div>
</div>
