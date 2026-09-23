<script lang="ts">
	import { ChevronLeft, ChevronRight, Close, Minimize2, RefreshCw, ZoomIn, ZoomOut } from '@joymify/icons';
	import { lockBodyScroll, trapFocus } from './overlay-utils.js';

	export interface ImageItem {
		src: string;
		alt?: string;
	}

	interface Props {
		open: boolean;
		src?: string;
		items?: (string | ImageItem)[];
		current?: number;
		onClose: () => void;
		onChange?: (current: number) => void;
		class?: string;
		/** The mask/dialog element (`.joy-image-preview-mask`). */
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		open = false,
		src,
		items = [],
		current = 0,
		onClose,
		onChange,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let normalizedItems = $derived.by(() => {
		if (items && items.length > 0) {
			return items.map((item) => (typeof item === 'string' ? { src: item } : item));
		}
		if (src) {
			return [{ src }];
		}
		return [];
	});

	let internalCurrent = $state(0);
	let currentIndex = $derived(current !== undefined ? current : internalCurrent);
	let currentItem = $derived(normalizedItems[currentIndex] || normalizedItems[0] || { src: '' });

	let scale = $state(1);
	let rotate = $state(0);
	let posX = $state(0);
	let posY = $state(0);
	let isDragging = $state(false);
	let dragStartX = 0;
	let dragStartY = 0;
	let startPosX = 0;
	let startPosY = 0;

	$effect(() => {
		if (open) {
			scale = 1;
			rotate = 0;
			posX = 0;
			posY = 0;
		}
	});

	$effect(() => {
		if (!open || !ref) return;
		const previouslyFocused = document.activeElement as HTMLElement | null;
		const unlock = lockBodyScroll();
		const cleanupTrap = trapFocus(ref);
		return () => {
			cleanupTrap();
			unlock();
			if (previouslyFocused?.isConnected) previouslyFocused.focus();
		};
	});

	function handlePrev() {
		if (normalizedItems.length <= 1) return;
		const nextIdx = (currentIndex - 1 + normalizedItems.length) % normalizedItems.length;
		internalCurrent = nextIdx;
		onChange?.(nextIdx);
	}

	function handleNext() {
		if (normalizedItems.length <= 1) return;
		const nextIdx = (currentIndex + 1) % normalizedItems.length;
		internalCurrent = nextIdx;
		onChange?.(nextIdx);
	}

	function handleZoomIn() {
		scale = Math.min(5, scale + 0.25);
	}

	function handleZoomOut() {
		scale = Math.max(0.2, scale - 0.25);
	}

	function handleRotateLeft() {
		rotate -= 90;
	}

	function handleRotateRight() {
		rotate += 90;
	}

	function handleReset() {
		scale = 1;
		rotate = 0;
		posX = 0;
		posY = 0;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			handlePrev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			handleNext();
		} else if (e.key === '+' || e.key === '=') {
			e.preventDefault();
			handleZoomIn();
		} else if (e.key === '-' || e.key === '_') {
			e.preventDefault();
			handleZoomOut();
		} else if (e.key === 'r' || e.key === 'R') {
			e.preventDefault();
			handleRotateRight();
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (scale <= 1) return;
		e.preventDefault();
		isDragging = true;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		startPosX = posX;
		startPosY = posY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		posX = startPosX + (e.clientX - dragStartX);
		posY = startPosY + (e.clientY - dragStartY);
	}

	function handleMouseUp() {
		isDragging = false;
	}
</script>

<svelte:window onkeydown={handleKeyDown} onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

{#if open}
	<div
		bind:this={ref}
		role="dialog"
		aria-modal="true"
		aria-label="Image preview"
		class="joy-image-preview-mask {className}"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
		{...rest}
	>
		<!-- Operations Toolbar -->
		<div class="joy-image-preview-toolbar" role="toolbar" aria-label="Preview tools">
			<button type="button" onclick={handleZoomIn} title="Zoom in (+)" aria-label="Zoom in" class="joy-image-preview-btn">
				<ZoomIn size="1.25rem" />
			</button>

			<button type="button" onclick={handleZoomOut} title="Zoom out (-)" aria-label="Zoom out" class="joy-image-preview-btn">
				<ZoomOut size="1.25rem" />
			</button>

			<button type="button" onclick={handleRotateLeft} title="Rotate left" aria-label="Rotate left" class="joy-image-preview-btn">
				<span class="joy-image-preview-btn__icon--flip"><RefreshCw size="1.25rem" /></span>
			</button>

			<button type="button" onclick={handleRotateRight} title="Rotate right (R)" aria-label="Rotate right" class="joy-image-preview-btn">
				<RefreshCw size="1.25rem" />
			</button>

			<button type="button" onclick={handleReset} title="Reset" aria-label="Reset zoom and rotation" class="joy-image-preview-btn">
				<Minimize2 size="1.25rem" />
			</button>

			<button type="button" onclick={onClose} title="Close (Esc)" aria-label="Close preview" class="joy-image-preview-btn joy-image-preview-btn--close">
				<Close size="1.25rem" />
			</button>
		</div>

		<!-- Gallery Indicators & Prev/Next -->
		{#if normalizedItems.length > 1}
			<div class="joy-image-preview-counter">
				{currentIndex + 1} / {normalizedItems.length}
			</div>

			<button type="button" onclick={handlePrev} aria-label="Previous image" class="joy-image-preview-nav joy-image-preview-nav--prev">
				<ChevronLeft size="1.5rem" />
			</button>

			<button type="button" onclick={handleNext} aria-label="Next image" class="joy-image-preview-nav joy-image-preview-nav--next">
				<ChevronRight size="1.5rem" />
			</button>
		{/if}

		<!-- Image Stage -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="joy-image-preview-stage"
			class:joy-image-preview-stage--zoomed={scale > 1}
			class:joy-image-preview-stage--dragging={isDragging}
			onmousedown={handleMouseDown}
		>
			<img
				class="joy-image-preview-img"
				src={currentItem.src}
				alt={currentItem.alt || 'Preview image'}
				draggable="false"
				style="transform: translate({posX}px, {posY}px) scale({scale}) rotate({rotate}deg);"
			/>
		</div>
	</div>
{/if}
