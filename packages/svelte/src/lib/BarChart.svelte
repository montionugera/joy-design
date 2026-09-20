<script lang="ts">
	import { onMount } from 'svelte';
	import { JoyChartCore, type SeriesConfig, type ChartPoint } from './chart-core.js';

	interface Props {
		series: SeriesConfig[];
		height?: number;
		theme?: 'light' | 'dark';
		class?: string;
	}

	let {
		series = [],
		height = 360,
		theme = 'light',
		class: className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let baseCanvas: HTMLCanvasElement;
	let overlayCanvas: HTMLCanvasElement;
	let chartInstance: JoyChartCore | null = null;
	let hoveredPoint = $state<ChartPoint | null>(null);

	let barSeries = $derived(
		series.map((s) => ({
			...s,
			type: 'bar' as const,
			color: s.color || 'var(--gold-400, #c49a3a)'
		}))
	);

	onMount(() => {
		chartInstance = new JoyChartCore(baseCanvas, overlayCanvas, {
			theme,
			smooth: false,
			onHoverPoint: (p) => {
				hoveredPoint = p as ChartPoint | null;
			}
		});
		chartInstance.setSeries(barSeries);

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
		if (chartInstance && barSeries) {
			chartInstance.setSeries(barSeries);
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
	aria-label="Interactive Bar Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
>
	<div class="joy-chart__hud" aria-live="polite">
		{#if hoveredPoint}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Category:</span>
				<span class="joy-chart__hud-value">{hoveredPoint.x}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Value:</span>
				<span class="joy-chart__hud-value" style="color: var(--gold-400, #c49a3a);">{hoveredPoint.y.toFixed(2)}</span>
			</div>
		{:else}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Interactive</span>
				<span class="joy-chart__hud-value" style="color: var(--navy-500, #14253e);">Bar Series</span>
			</div>
		{/if}
	</div>

	<div class="joy-chart__canvas-container">
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>
</div>
