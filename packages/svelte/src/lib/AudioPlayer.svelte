<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Play, Pause, RefreshCw, Volume2 } from '@montionugera/joy-icons';

	export interface AudioCueMarker {
		id: string;
		label: string;
		time: number;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'onplay' | 'onpause' | 'onseek' | 'ontoggle' | 'onratechange'> {
		title: string;
		subtitle?: string;
		duration?: number;
		currentTime?: number;
		playing?: boolean;
		loop?: boolean;
		playbackRate?: number;
		peaks?: number[];
		cues?: AudioCueMarker[];
		ontoggle?: (playing: boolean) => void;
		onseek?: (time: number) => void;
		onloopchange?: (loop: boolean) => void;
		onratechange?: (rate: number) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	const RATES = [0.5, 1, 1.5, 2];

	let {
		title,
		subtitle = '',
		duration = 12,
		currentTime = $bindable(0),
		playing = $bindable(false),
		loop = $bindable(false),
		playbackRate = $bindable(1),
		peaks = [25, 55, 80, 45, 92, 70, 35, 65, 88, 50, 75, 40, 85, 60, 30, 50],
		cues = [],
		ontoggle,
		onseek,
		onloopchange,
		onratechange,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const safeDuration = $derived(duration > 0 ? duration : 1);
	const progressPct = $derived(Math.max(0, Math.min(100, (currentTime / safeDuration) * 100)));

	function formatTime(sec: number): string {
		const clamped = Math.max(0, Math.floor(sec));
		const mins = Math.floor(clamped / 60);
		const secs = clamped % 60;
		return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
	}

	function handleToggle() {
		playing = !playing;
		ontoggle?.(playing);
	}

	function handleSeek(e: Event) {
		const next = Number((e.currentTarget as HTMLInputElement).value);
		currentTime = next;
		onseek?.(next);
	}

	function handleCueClick(time: number) {
		currentTime = time;
		onseek?.(time);
	}

	function toggleLoop() {
		loop = !loop;
		onloopchange?.(loop);
	}

	function cycleRate() {
		const idx = RATES.indexOf(playbackRate);
		const next = RATES[(idx + 1) % RATES.length];
		playbackRate = next;
		onratechange?.(next);
	}
</script>

<div
	bind:this={ref}
	class="joy-audio-player {playing ? 'joy-audio-player--playing' : ''} {className}"
	role="region"
	aria-label={title}
	{...rest}
>
	<div class="joy-audio-player__top">
		<button
			type="button"
			class="joy-audio-player__play-btn"
			aria-pressed={playing}
			aria-label={playing ? `Pause ${title}` : `Play ${title}`}
			onclick={handleToggle}
		>
			{#if playing}
				<Pause size="1.125rem" />
			{:else}
				<Play size="1.125rem" />
			{/if}
		</button>

		<div class="joy-audio-player__info">
			<div class="joy-audio-player__title-row">
				<span class="joy-audio-player__title">{title}</span>
				{#if subtitle}
					<span class="joy-audio-player__subtitle">{subtitle}</span>
				{/if}
			</div>
			<div class="joy-audio-player__timecode">
				<Volume2 size="0.875rem" />
				<span>{formatTime(currentTime)} / {formatTime(duration)}</span>
			</div>
		</div>

		<div class="joy-audio-player__controls">
			<button
				type="button"
				class="joy-audio-player__ctrl-btn {loop ? 'joy-audio-player__ctrl-btn--active' : ''}"
				aria-pressed={loop}
				aria-label="Toggle loop playback"
				onclick={toggleLoop}
			>
				<RefreshCw size="0.875rem" />
				<span>Loop</span>
			</button>

			<button
				type="button"
				class="joy-audio-player__ctrl-btn joy-audio-player__rate-btn"
				aria-label="Change playback speed"
				onclick={cycleRate}
			>
				<span>{playbackRate}x</span>
			</button>
		</div>
	</div>

	<div class="joy-audio-player__scrubber">
		<div class="joy-audio-player__waveform" aria-hidden="true">
			{#each peaks as peak, idx (idx)}
				{@const barPct = ((idx + 0.5) / peaks.length) * 100}
				<span
					class="joy-audio-player__bar {barPct <= progressPct ? 'joy-audio-player__bar--played' : ''}"
					style="height: {Math.max(15, Math.min(100, peak))}%;"
				></span>
			{/each}
		</div>

		<input
			type="range"
			min="0"
			max={safeDuration}
			step="0.1"
			value={currentTime}
			aria-label={`Seek ${title}`}
			class="joy-audio-player__range"
			oninput={handleSeek}
		/>
	</div>

	{#if cues.length > 0}
		<div class="joy-audio-player__cues" role="list" aria-label="Animation SFX cue markers">
			{#each cues as cue (cue.id)}
				<button
					type="button"
					class="joy-audio-player__cue {Math.abs(currentTime - cue.time) < 0.5 ? 'joy-audio-player__cue--active' : ''}"
					onclick={() => handleCueClick(cue.time)}
				>
					<span class="joy-audio-player__cue-label">{cue.label}</span>
					<span class="joy-audio-player__cue-time">{formatTime(cue.time)}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
