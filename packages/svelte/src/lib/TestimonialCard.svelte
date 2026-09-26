<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
		quote: string;
		authorName: string;
		authorRole?: string;
		avatarSrc?: string;
		avatarInitials?: string;
		rating?: number;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		quote,
		authorName,
		authorRole,
		avatarSrc,
		avatarInitials,
		rating = 5,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// A whole number of stars from 0 to 5: a fraction, a negative or NaN must not reach Array().
	const stars = $derived(Math.max(0, Math.min(5, Math.round(Number(rating)) || 0)));
</script>

<div bind:this={ref} class="joy-testimonial-card {className}" {...rest}>
	{#if stars > 0}
		<div class="joy-testimonial-card__stars" role="img" aria-label="Rated {stars} out of 5">
			{#each Array(stars) as _}
				<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
					<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
				</svg>
			{/each}
		</div>
	{/if}

	<p class="joy-testimonial-card__quote">"{quote}"</p>

	<div class="joy-testimonial-card__author">
		<div class="joy-avatar joy-avatar--circle joy-avatar--md">
			{#if avatarSrc}
				<img class="joy-avatar__image" src={avatarSrc} alt="" />
			{:else}
				<span class="joy-avatar__fallback" aria-hidden="true">{avatarInitials || Array.from(authorName).slice(0, 2).join('').toUpperCase()}</span>
			{/if}
		</div>
		<div class="joy-testimonial-card__author-info">
			<h6>{authorName}</h6>
			{#if authorRole}
				<p>{authorRole}</p>
			{/if}
		</div>
	</div>
</div>
