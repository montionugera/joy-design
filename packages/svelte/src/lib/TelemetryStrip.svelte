<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TelemetryMetric {
		label: string;
		value: string | number;
		unit?: string;
		zone?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		metrics: TelemetryMetric[];
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		metrics = [],
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-telemetry-strip {className}" {...rest}>
	{#each metrics as item, idx (item.label + idx)}
		<div class="joy-telemetry-strip__item">
			<span class="joy-telemetry-strip__label">{item.label}</span>
			<span class="joy-telemetry-strip__metric">
				{item.value}{item.unit ? ` ${item.unit}` : ''}
			</span>
			{#if item.zone}
				<span class="joy-telemetry-strip__zone">{item.zone}</span>
			{/if}
		</div>
	{/each}
</div>
