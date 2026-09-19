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
	<circle cx="12" cy="12" r="9" stroke={color} stroke-width="1.5" /><path
		d="M8.5 16.5C8.5 16.5 10 14.5 12 14.5C14 14.5 15.5 16.5 15.5 16.5"
		stroke={color}
		stroke-width="1.5"
		stroke-linecap="round"
	/><circle cx="9" cy="10" r="1.2" fill={color} /><circle cx="15" cy="10" r="1.2" fill={color} />
</svg>
