<script lang="ts">
	let { size = '1em', color = 'currentColor' } = $props<{ size?: string; color?: string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	style="display: inline-block; vertical-align: middle;"
>
	<circle cx="12" cy="8" r="4" stroke={color} stroke-width="1.5" /><path
		d="M4 20C4 17.7909 7.58172 16 12 16C16.4183 16 20 17.7909 20 20"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
	/>
</svg>
