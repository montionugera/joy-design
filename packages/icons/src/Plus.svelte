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
		d="M12 6V18M6 12H18"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/><circle cx="12" cy="12" r="9" stroke={color} stroke-width={strokeWidth} />
</svg>
