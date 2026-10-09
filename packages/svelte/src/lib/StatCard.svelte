<script lang="ts">
	import { TrendingUp, TrendingDown } from '@montionugera/joy-icons';
	import { deltaDirection } from './delta-utils.js';

	export type Tone = 'positive' | 'critical' | 'info' | 'neutral';

	interface Props {
		label?: string;
		value?: string;
		delta?: string;
		deltaTone?: Tone;
		/** Arrow direction. Derived from the delta's leading sign when omitted; tone only sets colour. */
		trend?: 'up' | 'down' | 'flat';
		eyebrow?: string;
		figure?: string | number;
		unit?: string;
		qualifier?: string;
		progress?: number;
		note?: string;
		variant?: 'default' | 'editorial';
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		label = '',
		value = '',
		delta,
		deltaTone = 'positive',
		trend,
		eyebrow,
		figure,
		unit,
		qualifier,
		progress,
		note,
		variant = 'default',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let direction = $derived(trend ?? deltaDirection(delta));
</script>

<div
	bind:this={ref}
	class="joy-stat-card {variant === 'editorial' ? 'joy-stat-card--editorial' : ''} {className}"
	{...rest}
>
	{#if variant === 'editorial'}
		{#if eyebrow}
			<div class="joy-stat-card__eyebrow">{eyebrow}</div>
		{/if}
		<div class="joy-stat-card__row">
			<div class="joy-stat-card__figure">{figure ?? value}</div>
			{#if unit}
				<span class="joy-stat-card__unit">{unit}</span>
			{/if}
			{#if qualifier}
				<span class="joy-stat-card__qualifier">{qualifier}</span>
			{/if}
		</div>
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
		{#if progress !== undefined}
			<div class="joy-stat-card__progress-wrap">
				<div class="joy-stat-card__progress-bar" style="width: {Math.min(100, Math.max(0, progress))}%;"></div>
			</div>
		{/if}
		{#if note}
			<div class="joy-stat-card__note">{note}</div>
		{/if}
	{:else}
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
	{/if}
</div>
