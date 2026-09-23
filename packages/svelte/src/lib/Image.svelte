<script lang="ts">
	import ImagePreview from './ImagePreview.svelte';

	interface Props {
		src: string;
		alt?: string;
		preview?: boolean | { src?: string };
		fallback?: string;
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		src,
		alt = '',
		preview = true,
		fallback,
		class: className = '',
		style = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let openPreview = $state(false);
	let currentSrc = $state(src);
	let isHovered = $state(false);

	$effect(() => {
		currentSrc = src;
	});

	function handleError() {
		if (fallback) {
			currentSrc = fallback;
		}
	}

	let previewSrc = $derived(
		typeof preview === 'object' && preview.src ? preview.src : currentSrc
	);
</script>

<div
	bind:this={ref}
	class="joy-image-wrapper {className}"
	class:joy-image-wrapper--previewable={preview}
	{style}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	onclick={() => {
		if (preview) openPreview = true;
	}}
	role={preview ? 'button' : undefined}
	tabindex={preview ? 0 : undefined}
	onkeydown={(e) => {
		if (preview && (e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			openPreview = true;
		}
	}}
>
	<img
		src={currentSrc}
		{alt}
		onerror={handleError}
		class="joy-image__img"
		{...rest}
	/>

	{#if preview && isHovered}
		<div class="joy-image__overlay">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			<span>Preview</span>
		</div>
	{/if}
</div>

{#if preview}
	<ImagePreview
		open={openPreview}
		src={previewSrc}
		onclose={() => (openPreview = false)}
	/>
{/if}
