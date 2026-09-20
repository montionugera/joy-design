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
	<circle cx="12" cy="12" r="10" fill={color} /><path
		d="M8.5 14.5C8.5 14.5 10 16.5 12 16.5C14 16.5 15.5 14.5 15.5 14.5"
		stroke="var(--bg-canvas)"
		stroke-width="1.5"
		stroke-linecap="round"
	/><circle cx="9" cy="10" r="1.2" fill="var(--bg-canvas)" /><circle
		cx="15"
		cy="10"
		r="1.2"
		fill="var(--bg-canvas)"
	/>
</svg>
