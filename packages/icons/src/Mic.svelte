<script lang="ts">
	let { size = '1em', color = 'currentColor', strokeWidth = 1.5 } = $props<{ size?: number | string; color?: string; strokeWidth?: number | string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true" focusable="false" style="display: inline-block; vertical-align: middle;"
>
	<rect x="9" y="3" width="6" height="10" rx="3" stroke={color} stroke-width={strokeWidth} /><path
		d="M5 11V13C5 16.866 8.13401 20 12 20C15.866 20 19 16.866 19 13V11M12 20V23"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linecap="round"
	/>
</svg>
