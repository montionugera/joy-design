<script lang="ts">
	import { ChevronRight, ChevronLeft } from '@montionugera/joy-icons';

	export interface TransferItem {
		key: string;
		title: string;
		description?: string;
		disabled?: boolean;
	}

	interface Props {
		dataSource: TransferItem[];
		targetKeys?: string[];
		titles?: [string, string];
		disabled?: boolean;
		class?: string;
		style?: string;
		ref?: HTMLDivElement | null;
		onchange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
		[key: string]: any;
	}

	let {
		dataSource = [],
		targetKeys = $bindable<string[]>([]),
		titles = ['Source', 'Target'],
		disabled = false,
		class: className = '',
		style = '',
		ref = $bindable(null),
		onchange,
		...rest
	}: Props = $props();

	let sourceSelected = $state<string[]>([]);
	let targetSelected = $state<string[]>([]);
	let sourceSearch = $state('');
	let targetSearch = $state('');

	let sourceItems = $derived(
		dataSource
			.filter((item) => !targetKeys.includes(item.key))
			.filter((item) => !sourceSearch || item.title.toLowerCase().includes(sourceSearch.toLowerCase()))
	);

	let targetItems = $derived(
		dataSource
			.filter((item) => targetKeys.includes(item.key))
			.filter((item) => !targetSearch || item.title.toLowerCase().includes(targetSearch.toLowerCase()))
	);

	function toggleSource(key: string) {
		if (disabled) return;
		sourceSelected = sourceSelected.includes(key)
			? sourceSelected.filter((k) => k !== key)
			: [...sourceSelected, key];
	}

	function toggleTarget(key: string) {
		if (disabled) return;
		targetSelected = targetSelected.includes(key)
			? targetSelected.filter((k) => k !== key)
			: [...targetSelected, key];
	}

	function moveToTarget() {
		if (disabled || sourceSelected.length === 0) return;
		const moveKeys = [...sourceSelected];
		const next = [...targetKeys, ...moveKeys];
		targetKeys = next;
		sourceSelected = [];
		onchange?.(next, 'right', moveKeys);
	}

	function moveToSource() {
		if (disabled || targetSelected.length === 0) return;
		const moveKeys = [...targetSelected];
		const next = targetKeys.filter((k) => !moveKeys.includes(k));
		targetKeys = next;
		targetSelected = [];
		onchange?.(next, 'left', moveKeys);
	}
</script>

<div
	bind:this={ref}
	class="joy-transfer {disabled ? 'joy-transfer--disabled' : ''} {className}"
	{style}
	{...rest}
>
	<!-- Left Panel -->
	<div class="joy-transfer__list">
		<div class="joy-transfer__header">
			<span class="joy-transfer__header-title">{titles[0]}</span>
			<span class="joy-transfer__header-count">{sourceSelected.length}/{sourceItems.length} items</span>
		</div>
		<div class="joy-transfer__body">
			{#each sourceItems as item}
				<label class="joy-transfer__item {sourceSelected.includes(item.key) ? 'joy-transfer__item--selected' : ''}">
					<input
						type="checkbox"
						checked={sourceSelected.includes(item.key)}
						disabled={disabled || item.disabled}
						onchange={() => toggleSource(item.key)}
					/>
					<span class="joy-transfer__item-text">{item.title}</span>
				</label>
			{/each}
			{#if sourceItems.length === 0}
				<div class="joy-transfer__empty">No items</div>
			{/if}
		</div>
	</div>

	<!-- Middle Operations -->
	<div class="joy-transfer__operations">
		<button
			type="button"
			class="joy-button joy-button--solid joy-button--sm joy-button--icon-only"
			disabled={disabled || sourceSelected.length === 0}
			onclick={moveToTarget}
			aria-label="Move right"
		>
			<ChevronRight />
		</button>
		<button
			type="button"
			class="joy-button joy-button--solid joy-button--sm joy-button--icon-only"
			disabled={disabled || targetSelected.length === 0}
			onclick={moveToSource}
			aria-label="Move left"
		>
			<ChevronLeft />
		</button>
	</div>

	<!-- Right Panel -->
	<div class="joy-transfer__list">
		<div class="joy-transfer__header">
			<span class="joy-transfer__header-title">{titles[1]}</span>
			<span class="joy-transfer__header-count">{targetSelected.length}/{targetItems.length} items</span>
		</div>
		<div class="joy-transfer__body">
			{#each targetItems as item}
				<label class="joy-transfer__item {targetSelected.includes(item.key) ? 'joy-transfer__item--selected' : ''}">
					<input
						type="checkbox"
						checked={targetSelected.includes(item.key)}
						disabled={disabled || item.disabled}
						onchange={() => toggleTarget(item.key)}
					/>
					<span class="joy-transfer__item-text">{item.title}</span>
				</label>
			{/each}
			{#if targetItems.length === 0}
				<div class="joy-transfer__empty">No items</div>
			{/if}
		</div>
	</div>
</div>

