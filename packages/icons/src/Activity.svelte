<script lang="ts">
	let { size = "1em", color = "currentColor" } = $props<{ size?: string; color?: string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true" focusable="false" style="display: inline-block; vertical-align: middle;"
>
	<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
</svg>
