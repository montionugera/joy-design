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
	<circle cx="12" cy="12" r="9" stroke={color} stroke-width={strokeWidth} /><path
		d="M8 14H16C16 16.5 14 18 12 18C10 18 8 16.5 8 14Z"
		fill={color}
	/><path d="M9 10C9 9 10 9 10 10" stroke={color} stroke-width={strokeWidth} stroke-linecap="round" /><path
		d="M14 10C14 9 15 9 15 10"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/>
</svg>
