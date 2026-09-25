<script lang="ts">
	let { size = '1em', color = 'currentColor', strokeWidth = 1.5 } = $props<{ size?: string; color?: string; strokeWidth?: number | string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true" focusable="false" style="display: inline-block; vertical-align: middle;"
>
	<path
		d="M14 8V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5L9 10H5C3.89543 10 3 10.8954 3 12V18C3 19.1046 3.89543 20 5 20H15L19.2631 11.4737C19.7214 10.5571 19.0558 9.5 18.0315 9.5H14V8Z"
		fill={color}
	/><path d="M9 10V20" stroke="var(--bg-canvas)" stroke-width={strokeWidth} stroke-linejoin="round" />
</svg>
