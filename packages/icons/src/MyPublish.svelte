<script lang="ts">
	let { size = '1em', color = 'currentColor', strokeWidth = 1.5 } = $props<{ size?: string; color?: string; strokeWidth?: number | string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true" focusable="false" style="display: inline-block; vertical-align: middle;"
>
	<path
		d="M10 6H18V18H10"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/><circle cx="6" cy="10" r="2" stroke={color} stroke-width={strokeWidth} /><path
		d="M3 16C3 14.3431 4.34315 13 6 13H8C8.55228 13 9 13.4477 9 14V16"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/>
</svg>
