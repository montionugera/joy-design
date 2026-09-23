<script lang="ts">
	import { ChevronDown, ChevronRight, Close } from '@joymify/icons';
	import { openOverlay } from './overlay-utils.js';

	export interface CascaderOption {
		value: string;
		label: string;
		disabled?: boolean;
		children?: CascaderOption[];
		isLeaf?: boolean;
	}

	interface Props {
		options: CascaderOption[];
		value?: string[];
		defaultValue?: string[];
		placeholder?: string;
		allowClear?: boolean;
		disabled?: boolean;
		changeOnSelect?: boolean;
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		displayRender?: (labels: string[]) => string;
		onchange?: (value: string[], selectedOptions: CascaderOption[]) => void;
		[key: string]: any;
	}

	let {
		options = [],
		value = $bindable(),
		defaultValue = [],
		placeholder = 'Please select...',
		allowClear = true,
		disabled = false,
		changeOnSelect = false,
		class: className = '',
		style = '',
		ref = $bindable(null),
		displayRender,
		onchange,
		...rest
	}: Props = $props();

	let open = $state(false);
	let internalValue = $state<string[]>(defaultValue);
	let selectedValue = $derived(value !== undefined ? value : internalValue);
	let activePath = $state<CascaderOption[]>([]);
	let focusedCol = $state(0);
	let focusedVal = $state<string | null>(null);

	let controlEl = $state<HTMLDivElement | null>(null);
	let panelEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!open || !controlEl || !panelEl) return;
		const handle = openOverlay({
			anchor: controlEl,
			panel: panelEl,
			onClose: () => {
				open = false;
			}
		});
		return () => handle.dispose();
	});

	$effect(() => {
		if (open) {
			const path: CascaderOption[] = [];
			let currentOptions = options;
			for (const val of selectedValue) {
				const match = currentOptions.find((opt) => opt.value === val);
				if (match) {
					path.push(match);
					currentOptions = match.children || [];
				} else {
					break;
				}
			}
			activePath = path;
			focusedCol = path.length > 0 ? Math.min(path.length - 1, columns.length - 1) : 0;
			focusedVal = path.length > 0 ? path[focusedCol]?.value ?? null : (options[0]?.value ?? null);
		}
	});

	let columns = $derived.by(() => {
		const cols: CascaderOption[][] = [options];
		for (const selected of activePath) {
			if (selected.children && selected.children.length > 0) {
				cols.push(selected.children);
			}
		}
		return cols;
	});

	function handleSelectOption(option: CascaderOption, colIndex: number) {
		if (option.disabled || disabled) return;

		const nextPath = [...activePath.slice(0, colIndex), option];
		activePath = nextPath;
		focusedCol = colIndex;
		focusedVal = option.value;

		const hasChildren = Boolean(option.children && option.children.length > 0);
		if (!hasChildren || changeOnSelect) {
			const nextVal = nextPath.map((o) => o.value);
			internalValue = nextVal;
			value = nextVal;
			onchange?.(nextVal, nextPath);
			if (!hasChildren) {
				open = false;
			}
		}
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		internalValue = [];
		value = [];
		activePath = [];
		focusedVal = null;
		onchange?.([], []);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (!open) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				open = true;
			}
			return;
		}

		const currentColOptions = columns[focusedCol] || [];
		const currentIdx = currentColOptions.findIndex((opt) => opt.value === focusedVal);

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const nextIdx = currentIdx < currentColOptions.length - 1 ? currentIdx + 1 : 0;
			const nextOpt = currentColOptions[nextIdx];
			if (nextOpt) {
				focusedVal = nextOpt.value;
				if (changeOnSelect) {
					handleSelectOption(nextOpt, focusedCol);
				}
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const prevIdx = currentIdx > 0 ? currentIdx - 1 : currentColOptions.length - 1;
			const prevOpt = currentColOptions[prevIdx];
			if (prevOpt) {
				focusedVal = prevOpt.value;
				if (changeOnSelect) {
					handleSelectOption(prevOpt, focusedCol);
				}
			}
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			const currentOpt = currentColOptions[currentIdx];
			if (currentOpt && currentOpt.children && currentOpt.children.length > 0) {
				if (activePath[focusedCol]?.value !== currentOpt.value) {
					handleSelectOption(currentOpt, focusedCol);
				}
				if (columns.length > focusedCol + 1) {
					focusedCol = focusedCol + 1;
					const nextColOptions = columns[focusedCol] || [];
					focusedVal = nextColOptions[0]?.value ?? null;
				}
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			if (focusedCol > 0) {
				focusedCol = focusedCol - 1;
				focusedVal = activePath[focusedCol]?.value ?? (columns[focusedCol]?.[0]?.value ?? null);
			}
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const currentOpt = currentColOptions[currentIdx];
			if (currentOpt) {
				handleSelectOption(currentOpt, focusedCol);
			}
		}
	}

	let displayLabel = $derived.by(() => {
		if (selectedValue.length === 0) return '';
		const labels: string[] = [];
		let currentOptions = options;
		for (const val of selectedValue) {
			const match = currentOptions.find((opt) => opt.value === val);
			if (match) {
				labels.push(match.label);
				currentOptions = match.children || [];
			} else {
				labels.push(val);
			}
		}
		return displayRender ? displayRender(labels) : labels.join(' / ');
	});
</script>

<div
	bind:this={ref}
	class="joy-cascader {disabled ? 'joy-cascader--disabled' : ''} {open ? 'joy-cascader--open' : ''} {className}"
	{style}
	{...rest}
>
	<!-- Selector Input Trigger -->
	<div
		bind:this={controlEl}
		role="combobox"
		aria-expanded={open}
		aria-haspopup="listbox"
		tabindex={disabled ? -1 : 0}
		class="joy-cascader__control"
		onclick={() => !disabled && (open = !open)}
		onkeydown={handleKeyDown}
	>
		{#if displayLabel}
			<span class="joy-cascader__value">{displayLabel}</span>
		{:else}
			<span class="joy-cascader__placeholder">{placeholder}</span>
		{/if}

		{#if allowClear && selectedValue.length > 0 && !disabled}
			<button
				type="button"
				class="joy-cascader__clear"
				aria-label="Clear selection"
				onclick={handleClear}
			>
				<Close />
			</button>
		{/if}

		<span class="joy-cascader__arrow">
			<ChevronDown />
		</span>
	</div>

	<!-- Multi-column Cascader Panels -->
	{#if open}
		<div
			bind:this={panelEl}
			role="listbox"
			aria-label="Cascader options"
			class="joy-cascader__panel joy-overlay"
			tabindex="-1"
			onkeydown={handleKeyDown}
		>
			<div class="joy-cascader__columns">
				{#each columns as colOptions, colIdx}
					<ul role="menu" class="joy-cascader__column">
						{#each colOptions as option (option.value)}
							{@const isActive = activePath[colIdx]?.value === option.value}
							{@const isFocused = focusedCol === colIdx && focusedVal === option.value}
							{@const hasChildren = Boolean(option.children && option.children.length > 0)}

							<li
								role="menuitem"
								tabindex={isFocused || isActive ? 0 : -1}
								aria-expanded={hasChildren ? isActive : undefined}
								aria-disabled={option.disabled ? true : undefined}
								class="joy-cascader__item {isActive || isFocused ? 'joy-cascader__item--active' : ''}"
								onclick={() => handleSelectOption(option, colIdx)}
							>
								<span>{option.label}</span>
								{#if hasChildren}
									<span class="joy-cascader__item-arrow">
										<ChevronRight />
									</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/each}
			</div>
		</div>
	{/if}
</div>

