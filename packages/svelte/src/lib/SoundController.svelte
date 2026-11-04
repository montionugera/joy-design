<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Volume2, Volume1, VolumeX, Music, Sliders } from '@montionugera/joy-icons';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'onchange'> {
		muted?: boolean;
		sfxVolume?: number;
		bgmVolume?: number;
		voiceVolume?: number;
		bgmEnabled?: boolean;
		blocked?: boolean;
		ducked?: boolean;
		open?: boolean;
		label?: string;
		unlockLabel?: string;
		onmutechange?: (muted: boolean) => void;
		onsfxvolumechange?: (volume: number) => void;
		onbgmvolumechange?: (volume: number) => void;
		onvoicevolumechange?: (volume: number) => void;
		onbgmtoggle?: (enabled: boolean) => void;
		onunlock?: () => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		muted = $bindable(false),
		sfxVolume = $bindable(80),
		bgmVolume = $bindable(50),
		voiceVolume = $bindable(90),
		bgmEnabled = $bindable(true),
		blocked = false,
		ducked = false,
		open = $bindable(false),
		label = 'Audio mixer',
		unlockLabel = 'Tap to unlock audio',
		onmutechange,
		onsfxvolumechange,
		onbgmvolumechange,
		onvoicevolumechange,
		onbgmtoggle,
		onunlock,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function toggleMute() {
		muted = !muted;
		onmutechange?.(muted);
	}

	function toggleBgm() {
		if (blocked) {
			onunlock?.();
			return;
		}
		bgmEnabled = !bgmEnabled;
		onbgmtoggle?.(bgmEnabled);
	}

	function toggleOpen() {
		open = !open;
	}

	function handleSfxInput(e: Event) {
		const val = Number((e.currentTarget as HTMLInputElement).value);
		sfxVolume = val;
		onsfxvolumechange?.(val);
	}

	function handleBgmInput(e: Event) {
		const val = Number((e.currentTarget as HTMLInputElement).value);
		bgmVolume = val;
		onbgmvolumechange?.(val);
	}

	function handleVoiceInput(e: Event) {
		const val = Number((e.currentTarget as HTMLInputElement).value);
		voiceVolume = val;
		onvoicevolumechange?.(val);
	}
</script>

<div
	bind:this={ref}
	class="joy-sound-controller {muted ? 'joy-sound-controller--muted' : ''} {blocked ? 'joy-sound-controller--blocked' : ''} {ducked ? 'joy-sound-controller--ducked' : ''} {className}"
	role="group"
	aria-label={label}
	{...rest}
>
	<div class="joy-sound-controller__bar">
		<button
			type="button"
			class="joy-sound-controller__btn {muted ? 'joy-sound-controller__btn--muted' : 'joy-sound-controller__btn--active'}"
			aria-pressed={muted}
			aria-label={muted ? 'Unmute audio' : 'Mute audio'}
			onclick={toggleMute}
		>
			{#if muted || sfxVolume === 0}
				<VolumeX size="1.125rem" />
			{:else if sfxVolume < 50}
				<Volume1 size="1.125rem" />
			{:else}
				<Volume2 size="1.125rem" />
			{/if}
			<span class="joy-sound-controller__btn-label">{muted ? 'Muted' : `${sfxVolume}%`}</span>
		</button>

		<button
			type="button"
			class="joy-sound-controller__btn {bgmEnabled && !muted ? 'joy-sound-controller__btn--active' : ''}"
			aria-pressed={bgmEnabled}
			aria-label={blocked ? unlockLabel : bgmEnabled ? 'Disable background music' : 'Enable background music'}
			onclick={toggleBgm}
		>
			<Music size="1.125rem" />
			<span class="joy-sound-controller__btn-label">BGM</span>
			{#if blocked}
				<span class="joy-sound-controller__badge joy-sound-controller__badge--blocked">{unlockLabel}</span>
			{:else if ducked}
				<span class="joy-sound-controller__badge joy-sound-controller__badge--ducked">Ducking</span>
			{/if}
		</button>

		<button
			type="button"
			class="joy-sound-controller__btn joy-sound-controller__mixer-toggle {open ? 'joy-sound-controller__btn--active' : ''}"
			aria-expanded={open}
			aria-label="Toggle audio channel sliders"
			onclick={toggleOpen}
		>
			<Sliders size="1.125rem" />
		</button>
	</div>

	{#if open}
		<div class="joy-sound-controller__popover" role="region" aria-label="Channel volume mixer">
			<div class="joy-sound-controller__channel">
				<div class="joy-sound-controller__channel-header">
					<span class="joy-sound-controller__channel-name">SFX</span>
					<span class="joy-sound-controller__channel-val">{sfxVolume}%</span>
				</div>
				<input
					type="range"
					min="0"
					max="100"
					value={sfxVolume}
					aria-label="SFX volume"
					class="joy-sound-controller__slider"
					oninput={handleSfxInput}
				/>
			</div>

			<div class="joy-sound-controller__channel">
				<div class="joy-sound-controller__channel-header">
					<span class="joy-sound-controller__channel-name">BGM</span>
					<span class="joy-sound-controller__channel-val">{bgmVolume}%</span>
				</div>
				<input
					type="range"
					min="0"
					max="100"
					value={bgmVolume}
					aria-label="BGM volume"
					class="joy-sound-controller__slider"
					oninput={handleBgmInput}
				/>
			</div>

			<div class="joy-sound-controller__channel">
				<div class="joy-sound-controller__channel-header">
					<span class="joy-sound-controller__channel-name">Voice</span>
					<span class="joy-sound-controller__channel-val">{voiceVolume}%</span>
				</div>
				<input
					type="range"
					min="0"
					max="100"
					value={voiceVolume}
					aria-label="Voice volume"
					class="joy-sound-controller__slider"
					oninput={handleVoiceInput}
				/>
			</div>
		</div>
	{/if}
</div>
