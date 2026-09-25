<script lang="ts">
	let { size = '1em', color = 'currentColor', strokeWidth = 1.5 } = $props<{ size?: number | string; color?: string; strokeWidth?: number | string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true" focusable="false" style="display: inline-block; vertical-align: middle;"
>
	<circle cx="11" cy="11" r="7" stroke={color} stroke-width={strokeWidth} /><path
		d="M16 16L20 20"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/>
</svg>
