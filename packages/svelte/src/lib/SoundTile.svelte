<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Play, Pause, Waveform } from '@montionugera/joy-icons';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'onplay' | 'onpause' | 'ontoggle'> {
		title: string;
		category?: string;
		duration?: string;
		playing?: boolean;
		pinned?: boolean;
		hoverPreview?: boolean;
		peaks?: number[];
		ontoggle?: (playing: boolean) => void;
		onpin?: (pinned: boolean) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		title,
		category = 'SFX',
		duration = '0:01',
		playing = $bindable(false),
		pinned = $bindable(false),
		hoverPreview = true,
		peaks = [35, 70, 50, 95, 65, 80, 40, 88, 60, 45, 75, 55],
		ontoggle,
		onpin,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function handleToggle() {
		playing = !playing;
		ontoggle?.(playing);
	}

	function handlePin() {
		pinned = !pinned;
		playing = pinned;
		onpin?.(pinned);
		ontoggle?.(playing);
	}

	function handleMouseEnter() {
		if (hoverPreview && !pinned && !playing) {
			playing = true;
			ontoggle?.(true);
		}
	}

	function handleMouseLeave() {
		if (hoverPreview && !pinned && playing) {
			playing = false;
			ontoggle?.(false);
		}
	}
</script>

<div
	bind:this={ref}
	class="joy-sound-tile {playing ? 'joy-sound-tile--playing' : ''} {pinned ? 'joy-sound-tile--pinned' : ''} {className}"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	{...rest}
>
	<div class="joy-sound-tile__header">
		<span class="joy-sound-tile__category">
			<Waveform size="0.875rem" />
			<span>{category}</span>
		</span>
		<span class="joy-sound-tile__duration">{duration}</span>
	</div>

	<div class="joy-sound-tile__visualizer" aria-hidden="true">
		{#each peaks as peak, idx (idx)}
			<span
				class="joy-sound-tile__bar"
				style="height: {Math.max(15, Math.min(100, peak))}%;"
			></span>
		{/each}
	</div>

	<div class="joy-sound-tile__footer">
		<div class="joy-sound-tile__meta">
			<span class="joy-sound-tile__title">{title}</span>
			{#if pinned}
				<span class="joy-sound-tile__pin-badge">Pinned</span>
			{/if}
		</div>

		<div class="joy-sound-tile__actions">
			<button
				type="button"
				class="joy-sound-tile__play-btn"
				aria-pressed={playing}
				aria-label={playing ? `Pause ${title}` : `Play ${title}`}
				onclick={handleToggle}
			>
				{#if playing}
					<Pause size="1rem" />
				{:else}
					<Play size="1rem" />
				{/if}
			</button>
			<button
				type="button"
				class="joy-sound-tile__pin-btn {pinned ? 'joy-sound-tile__pin-btn--active' : ''}"
				aria-pressed={pinned}
				aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}
				onclick={handlePin}
			>
				<span>{pinned ? 'Pinned' : 'Pin'}</span>
			</button>
		</div>
	</div>
</div>
