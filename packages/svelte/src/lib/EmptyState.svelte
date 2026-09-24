<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		icon?: import('svelte').Snippet;
		action?: import('svelte').Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}
	let {
		title,
		description,
		icon,
		action,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-empty-state {className}" {...rest}>
	{#if icon}
		<div class="joy-empty-state__icon">
			{@render icon()}
		</div>
	{/if}
	<h3 class="joy-empty-state__title">{title}</h3>
	{#if description}
		<p class="joy-empty-state__desc">{description}</p>
	{/if}
	{#if action}
		<div class="joy-empty-state__action">
			{@render action()}
		</div>
	{/if}
</div>
