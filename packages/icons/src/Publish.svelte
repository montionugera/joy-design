<script lang="ts">
	let { size = '1em', color = 'currentColor' } = $props<{ size?: string; color?: string }>();
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
		d="M13 14H6V4H14V7"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/><path
		d="M10 9H19M19 9L16 6M19 9L16 12"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
