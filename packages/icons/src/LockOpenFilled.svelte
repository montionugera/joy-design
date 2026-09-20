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
	<rect x="5" y="10" width="14" height="10" rx="2" fill={color} /><path
		d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
	/>
</svg>
