<script lang="ts">
	import { onMount } from 'svelte';
	import {
		JoyChartCore,
		describeSeriesChart,
		summaryWindow,
		type SeriesConfig,
		type ChartPoint
	} from './chart-core.js';

	interface Props {
		series: SeriesConfig[];
		height?: number;
		smooth?: boolean;
		theme?: 'light' | 'dark';
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		series = [],
		height = 360,
		smooth = true,
		theme,
		class: className = '',
		style = '',
		ref = $bindable(null),
		...rest
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

		const ro = typeof ResizeObserver !== 'undefined'
			? new ResizeObserver(() => chartInstance?.resize())
			: null;

		if (ref && ro) {
			ro.observe(ref);
		}

		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			ro?.disconnect();
			chartInstance?.destroy();
		};
	});

	let chartLabel = $derived(describeSeriesChart('Line', series));

	$effect(() => {
		if (chartInstance && series) {
			chartInstance.setSeries(series);
		}
	});

	// Re-apply the theme override in place on later changes; onMount above
	// only sets it once when the chart instance is created.
	$effect(() => {
		if (chartInstance) {
			chartInstance.setTheme(theme);
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- The chart region is focusable on purpose: keyboard users pan/zoom it (see the aria-label). -->
<div
	bind:this={ref}
	tabindex="0"
	onkeydown={handleKeyDown}
	class="joy-chart {className}"
	style="height: {height}px; {style}"
	role="region"
	aria-label="Interactive Line Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
	{...rest}
>
	<div class="joy-chart__hud" aria-live="polite">
		{#if hoveredPoint}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Index:</span>
				<span class="joy-chart__hud-value">{hoveredPoint.x}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Value:</span>
				<span class="joy-chart__hud-value joy-chart__hud-value--accent">{hoveredPoint.y.toFixed(2)}</span>
			</div>
		{:else}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Interactive</span>
				<span class="joy-chart__hud-value">Pan/Zoom Enabled</span>
			</div>
		{/if}
	</div>

	<div class="joy-chart__canvas-container" role="img" aria-label={chartLabel}>
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>

	<div class="joy-chart__sr">
		{#each series as s (s.id)}
			{#if s.data.length > 0}
				{@const win = summaryWindow(s.data)}
				<table>
					<caption>{s.name || s.id}: {win.note}</caption>
					<thead>
						<tr><th scope="col">Index</th><th scope="col">Value</th></tr>
					</thead>
					<tbody>
						{#each win.rows as pt}
							<tr><th scope="row">{pt.x}</th><td>{pt.y.toFixed(2)}</td></tr>
						{/each}
					</tbody>
				</table>
			{/if}
		{/each}
	</div>
</div>
