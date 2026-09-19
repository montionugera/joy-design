<script lang="ts">
	type Tone = 'positive' | 'critical' | 'info' | 'neutral';

	interface Props {
		label: string;
		value: string;
		delta?: string;
		deltaTone?: Tone;
	}

	let { label, value, delta, deltaTone = 'positive' }: Props = $props();
</script>

<div class="joy-stat-card">
	<div class="joy-stat-card__label">{label}</div>
	<div class="joy-stat-card__value">{value}</div>
	{#if delta}
		<div class="joy-stat-card__delta joy-stat-card__delta--{deltaTone}">{delta}</div>
	{/if}
</div>

<style>
	.joy-stat-card {
		background: var(--joy-color-surface, #ffffff);
		border: 1px solid var(--joy-color-border, #cbd5e1);
		border-radius: var(--joy-radius-lg, 12px);
		padding: 20px;
		font-family: inherit;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	:global(.dark) .joy-stat-card {
		background: var(--joy-color-surface-dark, #1e293b);
		border-color: var(--joy-color-border-dark, #334155);
	}

	.joy-stat-card__label {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--joy-color-text-muted, #64748b);
	}

	.joy-stat-card__value {
		font-weight: 600;
		font-size: 32px;
		line-height: 1.1;
		margin-top: 8px;
		font-feature-settings: 'tnum';
		color: var(--joy-color-text, #0f172a);
	}

	:global(.dark) .joy-stat-card__value {
		color: var(--joy-color-text-dark, #f8fafc);
	}

	.joy-stat-card__delta {
		font-size: 13px;
		margin-top: 6px;
		font-weight: 500;
	}

	.joy-stat-card__delta--positive {
		color: var(--joy-color-success, #10b981);
	}

	.joy-stat-card__delta--critical {
		color: var(--joy-color-danger, #ef4444);
	}

	.joy-stat-card__delta--info {
		color: var(--joy-color-info, #3b82f6);
	}

	.joy-stat-card__delta--neutral {
		color: var(--joy-color-text-muted, #64748b);
	}
</style>
