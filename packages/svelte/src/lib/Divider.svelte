<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'horizontal' | 'vertical';
		dashed?: boolean;
		orientation?: 'left' | 'center' | 'right';
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		type = 'horizontal',
		dashed = false,
		orientation = 'center',
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const hasText = $derived(type !== 'vertical' && !!children);
	const modifier = $derived(
		type === 'vertical' ? 'joy-divider--vertical' : hasText ? `joy-divider--with-text joy-divider--${orientation}` : ''
	);
</script>

<div
	class="joy-divider {modifier} {dashed ? 'joy-divider--dashed' : ''} {className}"
	role="separator"
	bind:this={ref}
	{...rest}
>
	{#if hasText}
		<span class="joy-divider__text">
			{@render children?.()}
		</span>
	{/if}
</div>
