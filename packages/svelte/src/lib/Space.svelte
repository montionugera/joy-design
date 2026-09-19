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
	}

	let {
		direction = 'horizontal',
		size = 'small',
		align,
		wrap = false,
		children,
		class: className = '',
		style: customStyle = ''
	}: Props = $props();

	const sizeMap: Record<string, number> = {
		small: 8,
		middle: 16,
		large: 24
	};

	let gapPx = $derived(typeof size === 'number' ? size : sizeMap[size] || 8);
	let computedStyle = $derived(
		`gap: ${gapPx}px; ${wrap ? 'flex-wrap: wrap;' : ''} ${align ? `align-items: ${align};` : ''} ${customStyle}`
	);
</script>

<div class="joy-space joy-space--{direction} {className}" style={computedStyle}>
	{#if children}
		{@render children()}
	{/if}
</div>
