<script lang="ts">
	import { ChevronDown, ChevronRight, Close, Check } from '@joymify/icons';
	import { openOverlay } from './overlay-utils.js';

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
		ref?: HTMLDivElement | null;
		onchange?: (value: any, node?: any) => void;
		[key: string]: any;
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
		ref = $bindable(null),
		onchange,
		...rest
	}: Props = $props();

	let open = $state(false);
	let internalValue = $state<string | string[]>(
		defaultValue !== undefined ? defaultValue : multiple ? [] : ''
	);
	let selectedValue = $derived(value !== undefined ? value : internalValue);
	let expandedKeys = $state<Set<string>>(new Set());
	let focusedKey = $state<string | null>(null);

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
		if (treeDefaultExpandAll && treeData.length > 0 && expandedKeys.size === 0) {
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

	$effect(() => {
		if (open) {
			const visible = getVisibleNodes(treeData, expandedKeys);
			if (visible.length > 0 && !focusedKey) {
				focusedKey = visible[0].key;
			}
		}
	});

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

	function findParent(key: string, nodes: TreeNode[], parent: TreeNode | null = null): TreeNode | null {
		for (const n of nodes) {
			if (n.key === key) return parent;
			if (n.children) {
				const res = findParent(key, n.children, n);
				if (res !== null) return res;
			}
		}
		return null;
	}

	function getVisibleNodes(nodes: TreeNode[], expanded: Set<string>): TreeNode[] {
		const list: TreeNode[] = [];
		for (const n of nodes) {
			list.push(n);
			if (n.children && n.children.length > 0 && expanded.has(n.key)) {
				list.push(...getVisibleNodes(n.children, expanded));
			}
		}
		return list;
	}

	function isSelected(val: string) {
		if (multiple && Array.isArray(selectedValue)) {
			return selectedValue.includes(val);
		}
		return selectedValue === val;
	}

	let hasValue = $derived(
		multiple
			? Array.isArray(selectedValue) && selectedValue.length > 0
			: Boolean(selectedValue)
	);

	let selectedArray = $derived<string[]>(
		multiple
			? Array.isArray(selectedValue)
				? selectedValue
				: selectedValue
					? [selectedValue as string]
					: []
			: selectedValue
				? [selectedValue as string]
				: []
	);

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

	function handleRemoveTag(e: MouseEvent, val: string) {
		e.stopPropagation();
		if (disabled) return;
		if (multiple && Array.isArray(selectedValue)) {
			const next = selectedValue.filter((v) => v !== val);
			internalValue = next;
			value = next;
			onchange?.(next, null);
		} else {
			internalValue = '';
			value = '';
			onchange?.('', null);
		}
	}

	function handleClear(e: MouseEvent) {
		e.stopPropagation();
		if (disabled) return;
		const empty = multiple ? [] : '';
		internalValue = empty;
		value = empty;
		onchange?.(empty, null);
	}

	function toggleExpand(e: MouseEvent | KeyboardEvent, key: string) {
		e.stopPropagation();
		const next = new Set(expandedKeys);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expandedKeys = next;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (!open) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				open = true;
				const visible = getVisibleNodes(treeData, expandedKeys);
				if (visible.length > 0 && !focusedKey) {
					focusedKey = visible[0].key;
				}
			}
			return;
		}

		const visible = getVisibleNodes(treeData, expandedKeys);
		if (visible.length === 0) return;

		const currentIdx = visible.findIndex((n) => n.key === focusedKey);

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const nextIdx = currentIdx < visible.length - 1 ? currentIdx + 1 : 0;
			focusedKey = visible[nextIdx].key;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const prevIdx = currentIdx > 0 ? currentIdx - 1 : visible.length - 1;
			focusedKey = visible[prevIdx].key;
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			const currentNode = visible[currentIdx];
			if (currentNode && currentNode.children && currentNode.children.length > 0) {
				if (!expandedKeys.has(currentNode.key)) {
					const next = new Set(expandedKeys);
					next.add(currentNode.key);
					expandedKeys = next;
				} else {
					focusedKey = currentNode.children[0].key;
				}
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			const currentNode = visible[currentIdx];
			if (currentNode && currentNode.children && currentNode.children.length > 0 && expandedKeys.has(currentNode.key)) {
				const next = new Set(expandedKeys);
				next.delete(currentNode.key);
				expandedKeys = next;
			} else if (currentNode) {
				const parent = findParent(currentNode.key, treeData);
				if (parent) {
					focusedKey = parent.key;
				}
			}
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const currentNode = visible[currentIdx];
			if (currentNode) {
				handleSelect(currentNode);
			}
		}
	}
</script>

<div
	bind:this={ref}
	class="joy-treeselect {disabled ? 'joy-treeselect--disabled' : ''} {open ? 'joy-treeselect--open' : ''} {className}"
	{style}
	{...rest}
>
	<!-- Trigger Input -->
	<div
		bind:this={controlEl}
		role="combobox"
		aria-expanded={open}
		aria-haspopup="tree"
		tabindex={disabled ? -1 : 0}
		class="joy-treeselect__control"
		onclick={() => !disabled && (open = !open)}
		onkeydown={handleKeyDown}
	>
		{#if multiple && selectedArray.length > 0}
			<span class="joy-treeselect__tags">
				{#each selectedArray as val}
					<span class="joy-treeselect__tag">
						<span>{findTitle(val, treeData) || val}</span>
						{#if !disabled}
							<button
								type="button"
								class="joy-treeselect__tag-remove"
								aria-label="Remove {findTitle(val, treeData) || val}"
								onclick={(e) => handleRemoveTag(e, val)}
							>
								<Close />
							</button>
						{/if}
					</span>
				{/each}
			</span>
		{:else if !multiple && selectedValue}
			<span class="joy-treeselect__tags">
				<span class="joy-treeselect__tag">
					<span>{findTitle(selectedValue as string, treeData) || selectedValue}</span>
				</span>
			</span>
		{:else}
			<span class="joy-treeselect__placeholder">{placeholder}</span>
		{/if}

		{#if allowClear && hasValue && !disabled}
			<button
				type="button"
				class="joy-treeselect__clear"
				aria-label="Clear selection"
				onclick={handleClear}
			>
				<Close />
			</button>
		{/if}

		<span class="joy-treeselect__arrow">
			<ChevronDown />
		</span>
	</div>

	<!-- Dropdown Panel -->
	{#if open}
		<div
			bind:this={panelEl}
			role="tree"
			aria-label="Tree selector options"
			class="joy-treeselect__panel joy-overlay"
			tabindex="-1"
			onkeydown={handleKeyDown}
		>
			{#snippet renderNodes(nodes: TreeNode[], level: number)}
				{#each nodes as node (node.key)}
					{@const hasChildren = Boolean(node.children && node.children.length > 0)}
					{@const isExp = expandedKeys.has(node.key)}
					{@const sel = isSelected(node.value)}
					{@const isFocused = focusedKey === node.key}

					<div
						role="treeitem"
						tabindex={isFocused ? 0 : -1}
						aria-selected={sel}
						aria-expanded={hasChildren ? isExp : undefined}
						aria-disabled={node.disabled ? true : undefined}
						class="joy-treeselect__node {sel ? 'joy-treeselect__node--selected' : ''} {node.disabled ? 'joy-treeselect__node--disabled' : ''}"
						onclick={() => handleSelect(node)}
					>
						{#if hasChildren}
							<button
								type="button"
								class="joy-treeselect__node-toggle"
								aria-label={isExp ? 'Collapse node' : 'Expand node'}
								tabindex="-1"
								onclick={(e) => toggleExpand(e, node.key)}
							>
								{#if isExp}
									<ChevronDown />
								{:else}
									<ChevronRight />
								{/if}
							</button>
						{:else}
							<span class="joy-treeselect__node-toggle" aria-hidden="true"></span>
						{/if}

						{#if multiple}
							<span class="joy-treeselect__node-checkbox" aria-hidden="true">
								{#if sel}
									<Check />
								{/if}
							</span>
						{/if}

						<span>{node.title}</span>
					</div>

					{#if hasChildren && isExp}
						{@render renderNodes(node.children!, level + 1)}
					{/if}
				{/each}
			{/snippet}

			{#if treeData.length > 0}
				{@render renderNodes(treeData, 0)}
			{/if}
		</div>
	{/if}
</div>

