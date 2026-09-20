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
	<path d="m21 2-2 2m-1.5 1.5L14 9l-4-4-7 7a5.66 5.66 0 0 0 8 8l7-7 3.5-3.5"></path><circle cx="7.5" cy="16.5" r="1.5"></circle>
</svg>
