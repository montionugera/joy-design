<script lang="ts">
	import type { Snippet } from 'svelte';

	type ColSpan = 4 | 6 | 8 | 12;

	interface Props {
		colSpan?: ColSpan;
		title?: string;
		description?: string;
		badge?: string;
		children?: Snippet;
		class?: string;
	}

	let {
		colSpan = 4,
		title,
		description,
		badge,
		children,
		class: className = ''
	}: Props = $props();
</script>

<div class="joy-bento-card joy-bento-card--col-{colSpan} {className}">
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
