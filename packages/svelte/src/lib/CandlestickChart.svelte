<script lang="ts">
	import { onMount } from 'svelte';
	import { JoyChartCore, type CandlestickDataPoint } from './chart-core.js';

	interface Props {
		data: CandlestickDataPoint[];
		height?: number;
		theme?: 'light' | 'dark';
		class?: string;
	}

	let {
		data = [],
		height = 420,
		theme = 'light',
		class: className = ''
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

		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	$effect(() => {
		if (chartInstance && data) {
			chartInstance.setCandlesticks(data);
		}
	});

	let deltaPercent = $derived(() => {
		if (!hoveredCandle) return 0;
		return ((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100;
	});
</script>

<div class="joy-chart {className}" style="height: {height}px;" role="region" aria-label="Interactive Candlestick Financial Chart">
	{#if hoveredCandle}
		<div class="joy-chart__hud">
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
				<span class="joy-chart__hud-value" style="color: {hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#ef4444'};">
					{hoveredCandle.close.toFixed(2)}
				</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Chg:</span>
				<span class="joy-chart__hud-value" style="color: {deltaPercent() >= 0 ? '#10b981' : '#ef4444'};">
					{deltaPercent() >= 0 ? '+' : ''}{deltaPercent().toFixed(2)}%
				</span>
			</div>
		</div>
	{/if}

	<div class="joy-chart__canvas-container">
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>
</div>
