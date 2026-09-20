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
	<circle cx="12" cy="12" r="9" stroke={color} stroke-width="1.5" /><path
		d="M10 14L15 9L14 10L9 15L10 14Z"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
