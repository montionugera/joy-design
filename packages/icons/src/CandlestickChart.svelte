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
	style="display: inline-block; vertical-align: middle;"
>
	<path d="M9 5v4"></path><rect width="4" height="6" x="7" y="9" rx="1"></rect><path d="M9 15v4"></path><path d="M17 3v2"></path><rect width="4" height="8" x="15" y="5" rx="1"></rect><path d="M17 13v8"></path>
</svg>
