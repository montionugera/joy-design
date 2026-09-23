<script lang="ts">
	import { onMount } from 'svelte';
	import {
		JoyChartCore,
		describeCandlestickChart,
		formatCandleTime,
		summaryWindow,
		type CandlestickDataPoint
	} from './chart-core.js';

	interface Props {
		data: CandlestickDataPoint[];
		height?: number;
		theme?: 'light' | 'dark';
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		data = [],
		height = 420,
		theme = 'light',
		class: className = '',
		style = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let baseCanvas: HTMLCanvasElement;
	let overlayCanvas: HTMLCanvasElement;
	let chartInstance: JoyChartCore | null = null;
	let hoveredCandle = $state<CandlestickDataPoint | null>(null);

	onMount(() => {
		chartInstance = new JoyChartCore(baseCanvas, overlayCanvas, {
			theme,
			onHoverPoint: (p) => {
				hoveredCandle = p as CandlestickDataPoint | null;
			}
		});
		chartInstance.setCandlesticks(data);

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

	$effect(() => {
		if (chartInstance && data) {
			chartInstance.setCandlesticks(data);
		}
	});

	let chartLabel = $derived(describeCandlestickChart(data));
	let summary = $derived(summaryWindow(data, 'candle'));
	let hasVolume = $derived(data.some((d) => d.volume != null));

	let deltaPercent = $derived(
		hoveredCandle && hoveredCandle.open !== 0
			? ((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100
			: 0
	);

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
	aria-label="Interactive Candlestick Financial Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
	{...rest}
>
	<div class="joy-chart__hud" aria-live="polite">
		{#if hoveredCandle}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">O:</span>
				<span class="joy-chart__hud-value">{hoveredCandle.open.toFixed(2)}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">H:</span>
				<span class="joy-chart__hud-value">{hoveredCandle.high.toFixed(2)}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">L:</span>
				<span class="joy-chart__hud-value">{hoveredCandle.low.toFixed(2)}</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">C:</span>
				<span
					class="joy-chart__hud-value {hoveredCandle.close >= hoveredCandle.open ? 'joy-chart__hud-value--bull' : 'joy-chart__hud-value--bear'}"
				>
					{hoveredCandle.close.toFixed(2)}
				</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Chg:</span>
				<span
					class="joy-chart__hud-value {deltaPercent >= 0 ? 'joy-chart__hud-value--bull' : 'joy-chart__hud-value--bear'}"
				>
					{deltaPercent >= 0 ? '+' : ''}{deltaPercent.toFixed(2)}%
				</span>
			</div>
		{:else}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Interactive</span>
				<span class="joy-chart__hud-value">Candlestick Feed</span>
			</div>
		{/if}
	</div>

	<div class="joy-chart__canvas-container" role="img" aria-label={chartLabel}>
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>

	<div class="joy-chart__sr">
		<table>
			<caption>Candlestick data: {summary.note}</caption>
			<thead>
				<tr>
					<th scope="col">Time</th>
					<th scope="col">Open</th>
					<th scope="col">High</th>
					<th scope="col">Low</th>
					<th scope="col">Close</th>
					{#if hasVolume}<th scope="col">Volume</th>{/if}
				</tr>
			</thead>
			<tbody>
				{#each summary.rows as c}
					<tr>
						<th scope="row">{formatCandleTime(c.time)}</th>
						<td>{c.open.toFixed(2)}</td>
						<td>{c.high.toFixed(2)}</td>
						<td>{c.low.toFixed(2)}</td>
						<td>{c.close.toFixed(2)}</td>
						{#if hasVolume}<td>{c.volume ?? ''}</td>{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
