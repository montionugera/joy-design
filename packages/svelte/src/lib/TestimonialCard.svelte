<script lang="ts">
	interface Props {
		quote: string;
		authorName: string;
		authorRole?: string;
		avatarSrc?: string;
		avatarInitials?: string;
		rating?: number;
		class?: string;
	}

	let {
		quote,
		authorName,
		authorRole,
		avatarSrc,
		avatarInitials,
		rating = 5,
		class: className = ''
	}: Props = $props();
</script>

<div class="joy-testimonial-card {className}">
	<div class="joy-testimonial-card__stars">
		{#each Array(rating) as _}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
		{/each}
	</div>

	<p class="joy-testimonial-card__quote">"{quote}"</p>

	<div class="joy-testimonial-card__author">
		<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-color-brand-primary, #7c3aed);">
			{#if avatarSrc}
				<img class="joy-avatar__image" src={avatarSrc} alt={authorName} />
			{:else}
				<span class="joy-avatar__fallback">{avatarInitials || authorName.slice(0, 2).toUpperCase()}</span>
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
