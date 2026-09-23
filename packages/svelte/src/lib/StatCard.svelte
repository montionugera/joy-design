<script lang="ts">
	import { TrendingUp, TrendingDown } from '@joymify/icons';

	type Tone = 'positive' | 'critical' | 'info' | 'neutral';

	interface Props {
		label: string;
		value: string;
		delta?: string;
		deltaTone?: Tone;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		label,
		value,
		delta,
		deltaTone = 'positive',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-stat-card {className}" {...rest}>
	<div class="joy-stat-card__label">{label}</div>
	<div class="joy-stat-card__value">{value}</div>
	{#if delta}
		<div class="joy-stat-card__delta joy-stat-card__delta--{deltaTone}">
			{#if deltaTone === 'positive'}
				<TrendingUp size="1em" /><span class="joy-stat-card__sr">Increase: </span>
			{:else if deltaTone === 'critical'}
				<TrendingDown size="1em" /><span class="joy-stat-card__sr">Decrease: </span>
			{/if}
			<span>{delta}</span>
		</div>
	{/if}
</div>

<style>
	.joy-stat-card {
		background: var(--joy-surface-card);
		border: 1px solid var(--joy-border-default);
		border-radius: var(--joy-radius-card);
		padding: var(--joy-space-5);
		font-family: inherit;
		box-shadow: var(--joy-elevation-1);
	}

	.joy-stat-card__label {
		font-size: var(--joy-font-size-sm);
		font-weight: 600;
		color: var(--joy-text-muted);
	}

	.joy-stat-card__value {
		font-weight: 600;
		font-size: 2rem;
		line-height: 1.1;
		margin-top: var(--joy-space-2);
		font-feature-settings: 'tnum';
		color: var(--joy-text-primary);
	}

	.joy-stat-card__delta {
		display: inline-flex;
		align-items: center;
		gap: var(--joy-space-1);
		font-size: 0.8125rem;
		margin-top: 6px;
		font-weight: 500;
	}

	.joy-stat-card__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.joy-stat-card__delta--positive {
		color: var(--joy-status-success-fg);
	}

	.joy-stat-card__delta--critical {
		color: var(--joy-status-danger-fg);
	}

	.joy-stat-card__delta--info {
		color: var(--joy-accent-text);
	}

	.joy-stat-card__delta--neutral {
		color: var(--joy-text-muted);
	}
</style>
