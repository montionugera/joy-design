<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		layout?: 'horizontal' | 'vertical';
		defaultSplit?: number; // 0 to 100 percentage
		min?: number;
		max?: number;
		firstPane?: Snippet;
		secondPane?: Snippet;
		class?: string;
	}

	let {
		layout = 'horizontal',
		defaultSplit = 50,
		min = 10,
		max = 90,
		firstPane,
		secondPane,
		class: className = ''
	}: Props = $props();

	let splitRatio = $state(defaultSplit);
	let isResizing = $state(false);
	let containerRef: HTMLDivElement;

	function handleMouseDown(e: MouseEvent) {
		isResizing = true;
		e.preventDefault();

		const onMouseMove = (moveEvent: MouseEvent) => {
			if (!isResizing || !containerRef) return;
			const rect = containerRef.getBoundingClientRect();
			let newRatio: number;

			if (layout === 'horizontal') {
				const offset = moveEvent.clientX - rect.left;
				newRatio = (offset / rect.width) * 100;
			} else {
				const offset = moveEvent.clientY - rect.top;
				newRatio = (offset / rect.height) * 100;
			}

			splitRatio = Math.max(min, Math.min(max, newRatio));
		};

		const onMouseUp = () => {
			isResizing = false;
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}
</script>

<div
	bind:this={containerRef}
	class="joy-splitter joy-splitter--{layout} {className}"
	role="group"
	aria-label="Resizable Splitter Panel"
>
	<div
		class="joy-splitter__pane"
		style={layout === 'horizontal' ? `width: ${splitRatio}%;` : `height: ${splitRatio}%;`}
	>
		{#if firstPane}
			{@render firstPane()}
		{/if}
	</div>

	<div
		class="joy-splitter__bar {isResizing ? 'joy-splitter__bar--active' : ''}"
		role="separator"
		tabindex="0"
		onmousedown={handleMouseDown}
		aria-valuenow={Math.round(splitRatio)}
		aria-valuemin={min}
		aria-valuemax={max}
	></div>

	<div
		class="joy-splitter__pane"
		style={layout === 'horizontal' ? `width: ${100 - splitRatio}%;` : `height: ${100 - splitRatio}%;`}
	>
		{#if secondPane}
			{@render secondPane()}
		{/if}
	</div>
</div>
