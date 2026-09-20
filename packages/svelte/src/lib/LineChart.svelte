<script lang="ts">
	import { onMount } from 'svelte';
	import { JoyChartCore, type SeriesConfig, type ChartPoint } from './chart-core.js';

	interface Props {
		series: SeriesConfig[];
		height?: number;
		smooth?: boolean;
		theme?: 'light' | 'dark';
		class?: string;
	}

	let {
		series = [],
		height = 360,
		smooth = true,
		theme = 'light',
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let baseCanvas: HTMLCanvasElement;
	let overlayCanvas: HTMLCanvasElement;
	let chartInstance: JoyChartCore | null = null;
	let hoveredPoint = $state<ChartPoint | null>(null);

	onMount(() => {
		chartInstance = new JoyChartCore(baseCanvas, overlayCanvas, {
			theme,
			smooth,
			onHoverPoint: (p) => {
				hoveredPoint = p as ChartPoint | null;
			}
		});
		chartInstance.setSeries(series);

		const ro = typeof ResizeObserver !== 'undefined'
			? new ResizeObserver(() => chartInstance?.resize())
			: null;

		if (container && ro) {
			ro.observe(container);
		}

		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			ro?.disconnect();
			chartInstance?.destroy();
		};
	});

	$effect(() => {
		if (chartInstance && series) {
			chartInstance.setSeries(series);
		}
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (!chartInstance) return;
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			chartInstance.pan(0.05);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			chartInstance.pan(-0.05);
		} else if (e.key === '+' || e.key === '=') {
			e.preventDefault();
			chartInstance.zoom(0.85);
		} else if (e.key === '-' || e.key === '_') {
			e.preventDefault();
			chartInstance.zoom(1.15);
		} else if (e.key === '0') {
			e.preventDefault();
			chartInstance.autoFit();
			chartInstance.render();
		}
	}
</script>

<div
	bind:this={container}
	tabindex="0"
	onkeydown={handleKeyDown}
	class="joy-chart {className}"
	style="height: {height}px;"
	role="region"
	aria-label="Interactive Line Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
>
	<div class="joy-chart__hud" aria-live="polite">
		{#if hoveredPoint}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Index:</span>
				<span class="joy-chart__hud-value">{hoveredPoint.x}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Value:</span>
				<span class="joy-chart__hud-value" style="color: var(--gold-400, #c49a3a);">{hoveredPoint.y.toFixed(2)}</span>
			</div>
		{:else}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Interactive</span>
				<span class="joy-chart__hud-value" style="color: var(--navy-500, #14253e);">Pan/Zoom Enabled</span>
			</div>
		{/if}
	</div>

	<div class="joy-chart__canvas-container">
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>
</div>
