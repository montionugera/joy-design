<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		SPLIT_STACK_QUERY,
		barOrientation,
		clampSplit,
		effectiveLayout,
		splitFromPointer,
		splitKeyNext,
		type SplitLayout
	} from './splitter-utils.js';

	interface Props {
		layout?: SplitLayout;
		defaultSplit?: number; // 0 to 100 percentage
		min?: number;
		max?: number;
		firstPane?: Snippet;
		secondPane?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		layout = 'horizontal',
		defaultSplit = 50,
		min = 10,
		max = 90,
		firstPane,
		secondPane,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// The panes' share of the container, in percent. Always read through `ratio` so a later min/max change re-clamps it.
	// svelte-ignore state_referenced_locally
	let splitRatio = $state(defaultSplit);
	let ratio = $derived(clampSplit(splitRatio, min, max));
	let isResizing = $state(false);

	// Phones stack the panes whatever `layout` says. The drag axis and arrow keys must flip with it, so this is
	// script state, not just CSS. Desktop-first default keeps SSR output side by side.
	let stacked = $state(false);
	$effect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
		const query = window.matchMedia(SPLIT_STACK_QUERY);
		stacked = query.matches;
		const sync = (e: MediaQueryListEvent) => (stacked = e.matches);
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});
	let arrangement = $derived(effectiveLayout(layout, stacked));

	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		isResizing = true;
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		(e.currentTarget as HTMLElement).focus();
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isResizing || !ref) return;
		const rect = ref.getBoundingClientRect();
		const next =
			arrangement === 'horizontal'
				? splitFromPointer(e.clientX - rect.left, rect.width, min, max)
				: splitFromPointer(e.clientY - rect.top, rect.height, min, max);
		if (next !== null) splitRatio = next;
	}

	function handlePointerEnd(e: PointerEvent) {
		isResizing = false;
		(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
	}

	function handleKeydown(e: KeyboardEvent) {
		const next = splitKeyNext(e.key, ratio, arrangement, min, max, e.shiftKey);
		if (next === null) return;
		e.preventDefault();
		splitRatio = next;
	}
</script>

<div
	bind:this={ref}
	class="joy-splitter joy-splitter--{layout} {className}"
	role="group"
	aria-label="Resizable Splitter Panel"
	{...rest}
>
	<div class="joy-splitter__pane" style="--joy-splitter-size: {ratio};">
		{#if firstPane}
			{@render firstPane()}
		{/if}
	</div>

	<!-- A focusable separator is an interactive widget (ARIA window splitter); Svelte's a11y lint does not know that. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="joy-splitter__bar {isResizing ? 'joy-splitter__bar--active' : ''}"
		role="separator"
		aria-label="Resize panes"
		aria-orientation={barOrientation(arrangement)}
		aria-valuenow={Math.round(ratio)}
		aria-valuemin={min}
		aria-valuemax={max}
		tabindex="0"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerEnd}
		onpointercancel={handlePointerEnd}
		onkeydown={handleKeydown}
	></div>

	<div class="joy-splitter__pane" style="--joy-splitter-size: {100 - ratio};">
		{#if secondPane}
			{@render secondPane()}
		{/if}
	</div>
</div>
