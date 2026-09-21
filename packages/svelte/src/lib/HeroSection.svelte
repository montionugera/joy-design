<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		badgeText?: string;
		title?: string;
		titleGradient?: string;
		subtitle?: string;
		primaryCtaText?: string;
		secondaryCtaText?: string;
		onprimaryclick?: () => void;
		onsecondaryclick?: () => void;
		previewSlot?: Snippet;
		class?: string;
	}

	let {
		badgeText,
		title,
		titleGradient,
		subtitle,
		primaryCtaText = 'Get Started Free',
		secondaryCtaText = 'Explore Documentation',
		onprimaryclick,
		onsecondaryclick,
		previewSlot,
		class: className = ''
	}: Props = $props();
</script>

<section class="joy-hero {className}">
	{#if badgeText}
		<div class="joy-hero__badge">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
			{badgeText}
		</div>
	{/if}

	{#if title || titleGradient}
		<h1 class="joy-hero__title">
			{#if title}{title}{/if}
			{#if titleGradient}
				{' '}<span class="joy-hero__title-gradient">{titleGradient}</span>
			{/if}
		</h1>
	{/if}

	{#if subtitle}
		<p class="joy-hero__subtitle">{subtitle}</p>
	{/if}

	<div class="joy-hero__ctas">
		{#if primaryCtaText}
			<button
				type="button"
				class="joy-button joy-button--solid joy-button--lg"
				onclick={onprimaryclick}
			>
				{primaryCtaText}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="5" y1="12" x2="19" y2="12"></line>
					<polyline points="12 5 19 12 12 19"></polyline>
				</svg>
			</button>
		{/if}
		{#if secondaryCtaText}
			<button
				type="button"
				class="joy-button joy-button--outline joy-hero__secondary-cta joy-button--lg"
				onclick={onsecondaryclick}
			>
				{secondaryCtaText}
			</button>
		{/if}
	</div>

	{#if previewSlot}
		<div class="joy-hero__preview">
			{@render previewSlot()}
		</div>
	{/if}
</section>
