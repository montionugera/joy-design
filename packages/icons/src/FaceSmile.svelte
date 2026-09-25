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
	<circle cx="12" cy="12" r="9" stroke={color} stroke-width={strokeWidth} /><path
		d="M8.5 14.5C8.5 14.5 10 16.5 12 16.5C14 16.5 15.5 14.5 15.5 14.5"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/><circle cx="9" cy="10" r="1.2" fill={color} /><circle cx="15" cy="10" r="1.2" fill={color} />
</svg>
