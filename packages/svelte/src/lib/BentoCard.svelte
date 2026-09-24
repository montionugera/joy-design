<script lang="ts">
	import type { Snippet } from 'svelte';

	type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

	interface Props {
		colSpan?: ColSpan;
		title?: string;
		description?: string;
		badge?: string;
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		colSpan = 4,
		title,
		description,
		badge,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Only 1..12 have a rule; anything else falls back to 4 instead of emitting a NaN modifier.
	const span = $derived(Number.isInteger(colSpan) && colSpan >= 1 && colSpan <= 12 ? colSpan : 4);
</script>

<div bind:this={ref} class="joy-bento-card joy-bento-card--col-{span} {className}" {...rest}>
	<div>
		{#if badge}
			<div class="joy-bento-card__badge">{badge}</div>
		{/if}
		{#if title}
			<h4 class="joy-bento-card__title">{title}</h4>
		{/if}
		{#if description}
			<p class="joy-bento-card__desc">{description}</p>
		{/if}
	</div>
	{#if children}
		<div class="joy-bento-card__content">
			{@render children()}
		</div>
	{/if}
</div>
