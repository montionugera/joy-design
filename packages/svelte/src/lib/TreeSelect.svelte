<script lang="ts">
	export interface TreeNode {
		key: string;
		title: string;
		value: string;
		disabled?: boolean;
		children?: TreeNode[];
	}

	interface Props {
		treeData: TreeNode[];
		value?: string | string[];
		defaultValue?: string | string[];
		multiple?: boolean;
		placeholder?: string;
		allowClear?: boolean;
		disabled?: boolean;
		treeDefaultExpandAll?: boolean;
		class?: string;
		style?: string;
		onchange?: (value: any, node?: any) => void;
	}

	let {
		treeData = [],
		value = $bindable(),
		defaultValue,
		multiple = false,
		placeholder = 'Select option...',
		allowClear = true,
		disabled = false,
		treeDefaultExpandAll = true,
		class: className = '',
		style = '',
		onchange
	}: Props = $props();

	let open = $state(false);
	let internalValue = $state<string | string[]>(
		defaultValue !== undefined ? defaultValue : multiple ? [] : ''
	);
	let expandedKeys = $state<Set<string>>(new Set());

	$effect(() => {
		if (treeDefaultExpandAll && treeData.length > 0) {
			const all = new Set<string>();
			const collect = (nodes: TreeNode[]) => {
				for (const n of nodes) {
					if (n.children && n.children.length > 0) {
						all.add(n.key);
						collect(n.children);
					}
				}
			};
			collect(treeData);
			expandedKeys = all;
		}
	});

	let selectedValue = $derived(value !== undefined ? value : internalValue);
	let containerEl: HTMLDivElement;

	function findTitle(val: string, nodes: TreeNode[]): string | null {
		for (const n of nodes) {
			if (n.value === val) return n.title;
			if (n.children) {
				const res = findTitle(val, n.children);
				if (res) return res;
			}
		}
		return null;
	}

	function toggleExpand(e: MouseEvent, key: string) {
		e.stopPropagation();
		const next = new Set(expandedKeys);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expandedKeys = next;
	}

	function handleSelect(node: TreeNode) {
		if (node.disabled || disabled) return;
		if (multiple) {
			const arr = Array.isArray(selectedValue) ? [...selectedValue] : [];
			const idx = arr.indexOf(node.value);
			let next: string[];
			if (idx >= 0) {
				next = arr.filter((v) => v !== node.value);
			} else {
				next = [...arr, node.value];
			}
			internalValue = next;
			value = next;
			onchange?.(next, node);
		} else {
			internalValue = node.value;
			value = node.value;
			onchange?.(node.value, node);
			open = false;
		}
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		const empty = multiple ? [] : '';
		internalValue = empty;
		value = empty;
		onchange?.(empty, null);
	}

	function isSelected(val: string) {
		if (multiple && Array.isArray(selectedValue)) {
			return selectedValue.includes(val);
		}
		return selectedValue === val;
	}

	function handleOutsideClick(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
		}
	}

	let hasValue = $derived(
		multiple
			? Array.isArray(selectedValue) && selectedValue.length > 0
			: Boolean(selectedValue)
	);
</script>

<svelte:window onmousedown={handleOutsideClick} />

<div
	bind:this={containerEl}
	class="joy-treeselect {disabled ? 'joy-treeselect--disabled' : ''} {className}"
	style="position: relative; display: inline-block; width: 100%; {style}"
>
	<!-- Trigger Input -->
	<div
		role="combobox"
		aria-expanded={open}
		aria-haspopup="tree"
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
		<div style="display: flex; flex-wrap: wrap; gap: 4px; flex: 1; overflow: hidden;">
			{#if multiple && Array.isArray(selectedValue) && selectedValue.length > 0}
				{#each selectedValue as val}
					<span
						style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; font-size: 12px; background-color: rgba(196, 154, 58, 0.2); color: var(--gold-400, #c49a3a);"
					>
						{findTitle(val, treeData) || val}
					</span>
				{/each}
			{:else if !multiple && selectedValue}
				<span style="font-size: 13px;">
					{findTitle(selectedValue as string, treeData) || selectedValue}
				</span>
			{:else}
				<span style="font-size: 13px; color: #94a3b8;">{placeholder}</span>
			{/if}
		</div>

		<div style="display: flex; align-items: center; gap: 6px;">
			{#if allowClear && hasValue && !disabled}
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

	<!-- Dropdown Panel -->
	{#if open}
		<div
			role="tree"
			aria-label="Tree selector options"
			style="position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 1000; max-height: 280px; overflow-y: auto; padding: 8px; border-radius: 6px; background-color: var(--joy-surface-card, #14253e); border: 1px solid var(--joy-border, #23354e); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);"
		>
			{#snippet renderNodes(nodes: TreeNode[], level: number)}
				<ul role="group" style="list-style: none; margin: 0; padding-left: {level > 0 ? 18 : 0}px;">
					{#each nodes as node (node.key)}
						{@const hasChildren = Boolean(node.children && node.children.length > 0)}
						{@const isExp = expandedKeys.has(node.key)}
						{@const sel = isSelected(node.value)}

						<li role="treeitem" aria-selected={sel} aria-expanded={hasChildren ? isExp : undefined}>
							<div
								class="joy-treeselect__node {sel ? 'joy-treeselect__node--selected' : ''}"
								onclick={() => handleSelect(node)}
								style="display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 4px; cursor: {node.disabled ? 'not-allowed' : 'pointer'}; opacity: {node.disabled ? 0.5 : 1}; background-color: {sel ? 'rgba(196, 154, 58, 0.15)' : 'transparent'}; color: {sel ? 'var(--gold-400, #c49a3a)' : 'var(--joy-text-primary, #f8f3e8)'}; transition: background-color 0.15s ease;"
							>
								{#if hasChildren}
									<button
										type="button"
										onclick={(e) => toggleExpand(e, node.key)}
										aria-label={isExp ? 'Collapse node' : 'Expand node'}
										style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: none; background: transparent; color: inherit; cursor: pointer; transform: {isExp ? 'rotate(90deg)' : 'none'}; transition: transform 0.15s ease;"
									>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
											<polyline points="9 18 15 12 9 6" />
										</svg>
									</button>
								{:else}
									<span style="width: 18px;"></span>
								{/if}

								{#if multiple}
									<span
										style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border: 1px solid var(--joy-border, #23354e); border-radius: 3px; background-color: {sel ? 'var(--gold-400, #c49a3a)' : 'transparent'}; color: #14253e;"
									>
										{#if sel}
											<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
												<polyline points="20 6 9 17 4 12" />
											</svg>
										{/if}
									</span>
								{/if}

								<span style="font-size: 13px; flex: 1;">{node.title}</span>
							</div>

							{#if hasChildren && isExp}
								{@render renderNodes(node.children!, level + 1)}
							{/if}
						</li>
					{/each}
				</ul>
			{/snippet}

			{#if treeData.length > 0}
				{@render renderNodes(treeData, 0)}
			{:else}
				<div style="padding: 12px; text-align: center; color: #94a3b8; font-size: 13px;">
					No options available
				</div>
			{/if}
		</div>
	{/if}
</div>
