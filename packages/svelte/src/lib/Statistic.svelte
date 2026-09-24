<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		value: number | string;
		precision?: number;
		prefix?: Snippet;
		suffix?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		title,
		value,
		precision,
		prefix,
		suffix,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let formattedValue = $derived(
		typeof value === 'number' && precision !== undefined ? value.toFixed(precision) : String(value)
	);
</script>

<div bind:this={ref} class="joy-statistic {className}" {...rest}>
	{#if title}
		<div class="joy-statistic__title">{title}</div>
	{/if}
	<div class="joy-statistic__content">
		{#if prefix}
			<span class="joy-statistic__prefix">
				{@render prefix()}
			</span>
		{/if}
		<span class="joy-statistic__value">{formattedValue}</span>
		{#if suffix}
			<span class="joy-statistic__suffix">
				{@render suffix()}
			</span>
		{/if}
	</div>
</div>
