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
	<rect x="4" y="7" width="16" height="12" rx="2" fill={color} /><path
		d="M9 7V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V7"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
	/><circle cx="12" cy="13" r="3" fill="var(--bg-canvas)" />
</svg>
