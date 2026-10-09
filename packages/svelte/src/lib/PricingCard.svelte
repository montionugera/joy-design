<script lang="ts">
	import { Check } from '@montionugera/joy-icons';
	import Button from './Button.svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'title' | 'onselect'> {
		title: string;
		description?: string;
		price: string;
		period?: string;
		features?: string[];
		ctaText?: string;
		featured?: boolean;
		badge?: string;
		loading?: boolean;
		disabled?: boolean;
		onselect?: () => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		title,
		description,
		price,
		period = '/month',
		features = [],
		ctaText = 'Get started',
		featured = false,
		badge,
		loading = false,
		disabled = false,
		onselect,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-pricing-card {featured ? 'joy-pricing-card--featured' : ''} {className}" {...rest}>
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
					<span class="joy-pricing-card__check"><Check size="18" /></span>
					<span>{feature}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<Button
		variant={featured ? 'solid' : 'outline'}
		block
		{loading}
		{disabled}
		onclick={onselect}
		class="joy-pricing-card__cta"
	>
		{ctaText}
	</Button>
</div>
