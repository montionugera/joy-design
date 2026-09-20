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

	let container: HTMLDivElement;
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
		if (chartInstance && data) {
			chartInstance.setCandlesticks(data);
		}
	});

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

<div
	bind:this={container}
	tabindex="0"
	onkeydown={handleKeyDown}
	class="joy-chart {className}"
	style="height: {height}px;"
	role="region"
	aria-label="Interactive Candlestick Financial Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset."
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
					class="joy-chart__hud-value"
					style="color: {hoveredCandle.close >= hoveredCandle.open ? 'var(--joy-color-success, #10b981)' : 'var(--joy-color-error, #f43f5e)'};"
				>
					{hoveredCandle.close.toFixed(2)}
				</span>
			</div>
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Chg:</span>
				<span
					class="joy-chart__hud-value"
					style="color: {deltaPercent >= 0 ? 'var(--joy-color-success, #10b981)' : 'var(--joy-color-error, #f43f5e)'};"
				>
					{deltaPercent >= 0 ? '+' : ''}{deltaPercent.toFixed(2)}%
				</span>
			</div>
		{:else}
			<div class="joy-chart__hud-item">
				<span class="joy-chart__hud-label">Interactive</span>
				<span class="joy-chart__hud-value" style="color: var(--navy-500, #14253e);">Candlestick Feed</span>
			</div>
		{/if}
	</div>

	<div class="joy-chart__canvas-container">
		<canvas bind:this={baseCanvas} class="joy-chart__canvas-base"></canvas>
		<canvas bind:this={overlayCanvas} class="joy-chart__canvas-overlay"></canvas>
	</div>
</div>
