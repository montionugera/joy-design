<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		price: string;
		period?: string;
		features?: string[];
		ctaText?: string;
		featured?: boolean;
		badge?: string;
		onselect?: () => void;
		class?: string;
	}

	let {
		title,
		description,
		price,
		period = '/month',
		features = [],
		ctaText = 'Get Started',
		featured = false,
		badge,
		onselect,
		class: className = ''
	}: Props = $props();
</script>

<div class="joy-pricing-card {featured ? 'joy-pricing-card--featured' : ''} {className}">
	{#if badge}
		<div class="joy-pricing-card__badge">{badge}</div>
	{/if}

	<h3 class="joy-pricing-card__title">{title}</h3>
	{#if description}
		<p class="joy-pricing-card__desc">{description}</p>
	{/if}

	<div class="joy-pricing-card__price">
		<span>{price}</span>
		<span class="joy-pricing-card__period">{period}</span>
	</div>

	{#if features.length > 0}
		<ul class="joy-pricing-card__features">
			{#each features as feature}
				<li class="joy-pricing-card__feature">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;">
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
					<span>{feature}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<button
		type="button"
		class="joy-button {featured ? 'joy-button--solid' : 'joy-button--outline'} joy-button--md"
		style="width: 100%; margin-top: auto;"
		onclick={onselect}
	>
		{ctaText}
	</button>
</div>
