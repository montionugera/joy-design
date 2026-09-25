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
		d="M12 5C7 5 3 12 3 12C3 12 7 19 12 19C17 19 21 12 21 12C21 12 17 5 12 5Z"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/><circle cx="12" cy="12" r="3" stroke={color} stroke-width={strokeWidth} />
</svg>
