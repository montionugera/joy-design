<script lang="ts">
	import { onMount } from 'svelte';
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
	}

	let {
		open = false,
		src,
		items = [],
		current = 0,
		onClose,
		onChange,
		class: className = ''
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

	let dialogEl: HTMLDivElement;

	$effect(() => {
		if (open) {
			scale = 1;
			rotate = 0;
			posX = 0;
			posY = 0;
		}
	});

	$effect(() => {
		if (!open) return;
		const unlock = lockBodyScroll();
		let cleanupTrap = () => {};
		if (dialogEl) {
			cleanupTrap = trapFocus(dialogEl);
		}
		return () => {
			unlock();
			cleanupTrap();
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
		bind:this={dialogEl}
		role="dialog"
		aria-modal="true"
		aria-label="Image Preview"
		class="joy-image-preview-mask {className}"
		style="position: fixed; inset: 0; z-index: 1050; background-color: rgba(13, 24, 41, 0.88); backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; user-select: none;"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<!-- Operations Toolbar -->
		<div
			class="joy-image-preview-toolbar"
			role="toolbar"
			aria-label="Preview tools"
			style="position: absolute; bottom: 24px; z-index: 1060; display: flex; align-items: center; gap: 12px; padding: 8px 16px; border-radius: 24px; background-color: rgba(20, 37, 62, 0.9); border: 1px solid rgba(248, 243, 232, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);"
		>
			<button type="button" onclick={handleZoomIn} title="Zoom In (+)" aria-label="Zoom In" class="joy-preview-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
					<line x1="11" y1="8" x2="11" y2="14" />
					<line x1="8" y1="11" x2="14" y2="11" />
				</svg>
			</button>

			<button type="button" onclick={handleZoomOut} title="Zoom Out (-)" aria-label="Zoom Out" class="joy-preview-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
					<line x1="8" y1="11" x2="14" y2="11" />
				</svg>
			</button>

			<button type="button" onclick={handleRotateLeft} title="Rotate Counterclockwise" aria-label="Rotate Counterclockwise" class="joy-preview-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
				</svg>
			</button>

			<button type="button" onclick={handleRotateRight} title="Rotate Clockwise (R)" aria-label="Rotate Clockwise" class="joy-preview-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
					<path d="M21 3v5h-5" />
				</svg>
			</button>

			<button type="button" onclick={handleReset} title="Reset" aria-label="Reset Zoom and Rotation" class="joy-preview-btn">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
					<path d="M21 3v5h-5" />
					<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
					<path d="M8 16H3v5" />
				</svg>
			</button>

			<button type="button" onclick={onClose} title="Close (Esc)" aria-label="Close Preview" class="joy-preview-btn" style="color: #f8f3e8; background-color: rgba(196, 154, 58, 0.2);">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</button>
		</div>

		<!-- Gallery Indicators & Prev/Next -->
		{#if normalizedItems.length > 1}
			<div style="position: absolute; top: 24px; color: var(--cream-100, #f8f3e8); font-family: monospace; font-size: 14px; background-color: rgba(20, 37, 62, 0.8); padding: 4px 12px; border-radius: 12px;">
				{currentIndex + 1} / {normalizedItems.length}
			</div>

			<button type="button" onclick={handlePrev} aria-label="Previous image" class="joy-nav-btn" style="left: 24px;">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="15 18 9 12 15 6" />
				</svg>
			</button>

			<button type="button" onclick={handleNext} aria-label="Next image" class="joy-nav-btn" style="right: 24px;">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
		{/if}

		<!-- Image Stage -->
		<div
			style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; cursor: {scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'};"
			onmousedown={handleMouseDown}
		>
			<img
				src={currentItem.src}
				alt={currentItem.alt || 'Preview image'}
				draggable="false"
				style="max-width: 90vw; max-height: 85vh; object-fit: contain; transform: translate({posX}px, {posY}px) scale({scale}) rotate({rotate}deg); transition: {isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'}; box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5); border-radius: 4px;"
			/>
		</div>
	</div>
{/if}

<style>
	.joy-preview-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: none;
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--cream-100, #f8f3e8);
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.1s ease;
	}
	.joy-preview-btn:hover {
		background-color: rgba(255, 255, 255, 0.18);
	}
	.joy-nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 1060;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid rgba(248, 243, 232, 0.2);
		background-color: rgba(20, 37, 62, 0.85);
		color: var(--cream-100, #f8f3e8);
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
	}
</style>
