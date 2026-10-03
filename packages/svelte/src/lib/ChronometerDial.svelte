<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export interface LapRecord {
		lap: number;
		split: string;
		overall: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		time?: string;
		progress?: number;
		running?: boolean;
		label?: string;
		laps?: LapRecord[];
		startText?: string;
		stopText?: string;
		resetText?: string;
		lapText?: string;
		ontoggle?: () => void;
		onlap?: () => void;
		onreset?: () => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		time = '00:00.00',
		progress = 0,
		running = false,
		label = 'SPLIT LAP',
		laps = [],
		startText = 'Start',
		stopText = 'Stop',
		resetText = 'Reset',
		lapText = 'Lap',
		ontoggle,
		onlap,
		onreset,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const radius = 96;
	const circumference = 2 * Math.PI * radius; // ~603.185
	const strokeDashoffset = $derived(
		circumference * (1 - Math.max(0, Math.min(100, progress)) / 100)
	);
</script>

<div bind:this={ref} class="joy-chronometer-dial {className}" {...rest}>
	<div class="joy-chronometer-dial__dial-wrap">
		<svg class="joy-chronometer-dial__svg" viewBox="0 0 220 220" role="img" aria-label="Stopwatch dial">
			<!-- Background Track -->
			<circle
				class="joy-chronometer-dial__track"
				cx="110"
				cy="110"
				r={radius}
			/>
			<!-- Progress Ring -->
			<circle
				class="joy-chronometer-dial__progress"
				cx="110"
				cy="110"
				r={radius}
				stroke-dasharray={circumference}
				stroke-dashoffset={strokeDashoffset}
			/>
		</svg>

		<div class="joy-chronometer-dial__center">
			<span class="joy-chronometer-dial__time">{time}</span>
			<span class="joy-chronometer-dial__label">{label}</span>
		</div>
	</div>

	<div class="joy-chronometer-dial__controls">
		{#if running}
			<button
				type="button"
				class="joy-chronometer-dial__btn joy-chronometer-dial__btn--secondary"
				onclick={onlap}
			>
				{lapText}
			</button>
			<button
				type="button"
				class="joy-chronometer-dial__btn joy-chronometer-dial__btn--primary"
				onclick={ontoggle}
			>
				{stopText}
			</button>
		{:else}
			<button
				type="button"
				class="joy-chronometer-dial__btn joy-chronometer-dial__btn--secondary"
				onclick={onreset}
			>
				{resetText}
			</button>
			<button
				type="button"
				class="joy-chronometer-dial__btn joy-chronometer-dial__btn--primary"
				onclick={ontoggle}
			>
				{startText}
			</button>
		{/if}
	</div>

	{#if laps.length > 0}
		<div class="joy-chronometer-dial__laps">
			{#each laps as lapItem (lapItem.lap)}
				<div class="joy-chronometer-dial__lap-item">
					<span>Lap {lapItem.lap}</span>
					<span>+{lapItem.split}</span>
					<span>{lapItem.overall}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
