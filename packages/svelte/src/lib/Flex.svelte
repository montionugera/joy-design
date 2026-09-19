<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		vertical?: boolean;
		wrap?: boolean;
		justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
		align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
		gap?: number | string;
		children?: Snippet;
		class?: string;
		style?: string;
	}

	let {
		vertical = false,
		wrap = false,
		justify = 'start',
		align = 'stretch',
		gap = 8,
		children,
		class: className = '',
		style: customStyle = ''
	}: Props = $props();

	const justifyMap: Record<string, string> = {
		start: 'flex-start',
		end: 'flex-end',
		center: 'center',
		between: 'space-between',
		around: 'space-around',
		evenly: 'space-evenly'
	};

	const alignMap: Record<string, string> = {
		start: 'flex-start',
		end: 'flex-end',
		center: 'center',
		baseline: 'baseline',
		stretch: 'stretch'
	};

	let computedStyle = $derived(
		`display: flex; flex-direction: ${vertical ? 'column' : 'row'}; flex-wrap: ${wrap ? 'wrap' : 'nowrap'}; justify-content: ${justifyMap[justify] || justify}; align-items: ${alignMap[align] || align}; gap: ${typeof gap === 'number' ? `${gap}px` : gap}; ${customStyle}`
	);
</script>

<div class="joy-flex {className}" style={computedStyle}>
	{#if children}
		{@render children()}
	{/if}
</div>
