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

		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	$effect(() => {
		if (chartInstance && series) {
			chartInstance.setSeries(series);
		}
	});
</script>

<div class="joy-chart {className}" style="height: {height}px;" role="region" aria-label="Interactive Line Chart">
	{#if hoveredPoint}
		<div class="joy-chart__hud">
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Index:</span>
				<span class="joy-chart__hud-value">{hoveredPoint.x}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Value:</span>
				<span class="joy-chart__hud-value" style="color: var(--joy-color-brand-primary, #7c3aed);">{hoveredPoint.y.toFixed(2)}</span>
			</div>
		</div>
	{/if}

	<div class="joy-chart__canvas-container">
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>
</div>
