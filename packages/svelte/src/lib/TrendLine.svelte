<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'class' | 'points'> {
		points: number[];
		label?: string;
		height?: number;
		strokeWidth?: number;
		class?: string;
		ref?: SVGSVGElement | null;
	}

	let {
		points = [],
		label = 'Trend line',
		height = 24,
		strokeWidth = 2,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const width = 80;
	const padding = 2;

	let d = $derived.by(() => {
		if (!points || points.length === 0) return '';
		if (points.length === 1) return `M 0 ${height / 2} L ${width} ${height / 2}`;
		const min = Math.min(...points);
		const max = Math.max(...points);
		const range = max === min ? 1 : max - min;
		return points
			.map((p, i) => {
				const x = (i / (points.length - 1)) * width;
				const y = height - padding - ((p - min) / range) * (height - 2 * padding);
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	});
</script>

<svg
	bind:this={ref}
	class="joy-trend-line {className}"
	{width}
	{height}
	viewBox="0 0 {width} {height}"
	role="img"
	aria-label={label}
	{...rest}
>
	<path class="joy-trend-line__path" {d} stroke-width={strokeWidth} />
</svg>
