<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		direction?: 'horizontal' | 'vertical';
		size?: 'small' | 'middle' | 'large' | number;
		align?: 'start' | 'end' | 'center' | 'baseline';
		wrap?: boolean;
		children?: Snippet;
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		direction = 'horizontal',
		size = 'small',
		align,
		wrap = false,
		children,
		class: className = '',
		style: customStyle = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const sizeMap: Record<string, number> = {
		small: 8,
		middle: 16,
		large: 24
	};

	let gapPx = $derived(typeof size === 'number' ? size : sizeMap[size] || 8);
	let computedStyle = $derived(
		`--joy-space-gap: ${gapPx}px; gap: var(--joy-space-gap); ${wrap ? 'flex-wrap: wrap;' : ''} ${align ? `align-items: ${align};` : ''} ${customStyle}`
	);
</script>

<div bind:this={ref} class="joy-space joy-space--{direction} {className}" style={computedStyle} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>
