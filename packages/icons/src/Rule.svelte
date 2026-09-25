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
	<path
		d="M12 3L4 6V11C4 16.5 12 21 12 21C12 21 20 16.5 20 11V6L12 3Z"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/><path d="M8 12H16" stroke={color} stroke-width={strokeWidth} stroke-linecap="round" />
</svg>
