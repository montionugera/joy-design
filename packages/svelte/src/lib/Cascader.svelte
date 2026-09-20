<script lang="ts">
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
		displayRender?: (labels: string[]) => string;
		onchange?: (value: string[], selectedOptions: CascaderOption[]) => void;
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
		displayRender,
		onchange
	}: Props = $props();

	let open = $state(false);
	let internalValue = $state<string[]>(defaultValue);
	let selectedValue = $derived(value !== undefined ? value : internalValue);
	let activePath = $state<CascaderOption[]>([]);
	let containerEl: HTMLDivElement;

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
		onchange?.([], []);
	}

	function handleOutsideClick(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
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

<svelte:window onmousedown={handleOutsideClick} />

<div
	bind:this={containerEl}
	class="joy-cascader {disabled ? 'joy-cascader--disabled' : ''} {className}"
	style="position: relative; display: inline-block; width: 100%; {style}"
>
	<!-- Selector Input Trigger -->
	<div
		role="combobox"
		aria-expanded={open}
		aria-haspopup="listbox"
		tabindex={disabled ? -1 : 0}
		onclick={() => !disabled && (open = !open)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				open = !open;
			} else if (e.key === 'Escape') {
				open = false;
			}
		}}
		style="display: flex; align-items: center; justify-content: space-between; min-height: 36px; padding: 4px 10px; border: 1px solid var(--joy-border, #23354e); border-radius: 6px; background-color: var(--joy-surface-card, #14253e); color: var(--joy-text-primary, #f8f3e8); cursor: {disabled ? 'not-allowed' : 'pointer'}; box-sizing: border-box;"
	>
		<span style="font-size: 13px; color: {displayLabel ? 'inherit' : '#94a3b8'};">
			{displayLabel || placeholder}
		</span>

		<div style="display: flex; align-items: center; gap: 6px;">
			{#if allowClear && selectedValue.length > 0 && !disabled}
				<button
					type="button"
					onclick={handleClear}
					title="Clear selection"
					aria-label="Clear selection"
					style="border: none; background: transparent; color: #94a3b8; cursor: pointer; padding: 0;"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			{/if}

			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				style="transform: {open ? 'rotate(180deg)' : 'none'}; transition: transform 0.2s ease; color: #94a3b8;"
			>
				<polyline points="6 9 12 15 18 9" />
			</svg>
		</div>
	</div>

	<!-- Multi-column Cascader Panels -->
	{#if open}
		<div
			role="listbox"
			aria-label="Cascader option panels"
			class="joy-cascader-menus"
			style="position: absolute; top: calc(100% + 4px); left: 0; z-index: 1000; display: flex; border-radius: 6px; background-color: var(--joy-surface-card, #14253e); border: 1px solid var(--joy-border, #23354e); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); overflow: hidden;"
		>
			{#each columns as colOptions, colIdx}
				<ul
					role="group"
					style="list-style: none; margin: 0; padding: 4px; min-width: 140px; max-height: 220px; overflow-y: auto; border-right: {colIdx < columns.length - 1 ? '1px solid var(--joy-border, #23354e)' : 'none'};"
				>
					{#each colOptions as option (option.value)}
						{@const isActive = activePath[colIdx]?.value === option.value}
						{@const hasChildren = Boolean(option.children && option.children.length > 0)}

						<li
							role="option"
							aria-selected={isActive}
							onclick={() => handleSelectOption(option, colIdx)}
							style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 4px; font-size: 13px; cursor: {option.disabled ? 'not-allowed' : 'pointer'}; opacity: {option.disabled ? 0.5 : 1}; background-color: {isActive ? 'rgba(196, 154, 58, 0.15)' : 'transparent'}; color: {isActive ? 'var(--gold-400, #c49a3a)' : 'var(--joy-text-primary, #f8f3e8)'}; transition: background-color 0.15s ease;"
						>
							<span>{option.label}</span>
							{#if hasChildren}
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<polyline points="9 18 15 12 9 6" />
								</svg>
							{/if}
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	{/if}
</div>
