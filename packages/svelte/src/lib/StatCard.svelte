<script lang="ts">
	import { TrendingUp, TrendingDown } from '@joymify/icons';
	import { deltaDirection } from './delta-utils.js';

	type Tone = 'positive' | 'critical' | 'info' | 'neutral';

	interface Props {
		label: string;
		value: string;
		delta?: string;
		deltaTone?: Tone;
		/** Arrow direction. Derived from the delta's leading sign when omitted; tone only sets colour. */
		trend?: 'up' | 'down' | 'flat';
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		label,
		value,
		delta,
		deltaTone = 'positive',
		trend,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let direction = $derived(trend ?? deltaDirection(delta));
</script>

<div bind:this={ref} class="joy-stat-card {className}" {...rest}>
	<div class="joy-stat-card__label">{label}</div>
	<div class="joy-stat-card__value">{value}</div>
	{#if delta}
		<div class="joy-stat-card__delta joy-stat-card__delta--{deltaTone}">
			{#if direction === 'up'}
				<TrendingUp size="1em" /><span class="joy-stat-card__sr">Increase: </span>
			{:else if direction === 'down'}
				<TrendingDown size="1em" /><span class="joy-stat-card__sr">Decrease: </span>
			{/if}
			<span>{delta}</span>
		</div>
	{/if}
</div>
