<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Voice = 'editorial' | 'performance';
	export type Ground = 'paper' | 'deep' | 'sunken' | 'flat';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		voice?: Voice;
		ground?: Ground;
		eyebrow?: string;
		caption?: string;
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		voice = 'editorial',
		ground = 'paper',
		eyebrow,
		caption,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class="joy-voice-card joy-voice-card--{voice} joy-voice-card--ground-{ground} {className}"
	{...rest}
>
	{#if eyebrow}
		<div class="joy-voice-card__eyebrow">{eyebrow}</div>
	{/if}
	{#if children}
		{@render children()}
	{/if}
	{#if caption}
		<div class="joy-voice-card__caption">{caption}</div>
	{/if}
</div>
