<script lang="ts">
	import CodeBlock from './CodeBlock.svelte';

	export interface PolyglotCodeItem {
		key?: string;
		language: string;
		label?: string;
		code: string;
		filename?: string;
	}

	interface Props {
		items?: PolyglotCodeItem[];
		activeKey?: string;
		defaultActiveKey?: string;
		onchange?: (key: string) => void;
		showLineNumbers?: boolean;
		allowCopy?: boolean;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		items = [],
		activeKey,
		defaultActiveKey,
		onchange,
		showLineNumbers = false,
		allowCopy = true,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const isControlled = $derived(activeKey !== undefined);
	const initialKey = defaultActiveKey || (items.length > 0 ? items[0].key || items[0].language : '');
	let internalActiveKey = $state<string>(initialKey);

	const currentKey = $derived(isControlled ? (activeKey as string) : internalActiveKey);

	const activeItem = $derived(
		items.find((it) => (it.key || it.language) === currentKey) || items[0] || null
	);

	function handleSelect(key: string) {
		if (!isControlled) {
			internalActiveKey = key;
		}
		onchange?.(key);
	}

	function handleKeyDown(e: KeyboardEvent, currentIndex: number) {
		if (items.length <= 1) return;
		let nextIndex = -1;

		if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
			e.preventDefault();
			nextIndex = (currentIndex + 1) % items.length;
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			nextIndex = (currentIndex - 1 + items.length) % items.length;
		} else if (e.key === 'Home') {
			e.preventDefault();
			nextIndex = 0;
		} else if (e.key === 'End') {
			e.preventDefault();
			nextIndex = items.length - 1;
		}

		if (nextIndex >= 0) {
			const nextKey = items[nextIndex].key || items[nextIndex].language;
			handleSelect(nextKey);
		}
	}
</script>

<div
	bind:this={ref}
	class="joy-polyglot-tabs {className}"
	role="region"
	aria-label="Code tabs"
	{...rest}
>
	<div class="joy-polyglot-tabs__bar">
		<div class="joy-polyglot-tabs__list" role="tablist" aria-label="Programming languages">
			{#each items as item, idx}
				{@const itemKey = item.key || item.language}
				{@const isSelected = itemKey === currentKey}
				{@const displayLabel = item.label || item.language.toUpperCase()}

				<button
					type="button"
					role="tab"
					class="joy-polyglot-tabs__tab"
					aria-selected={isSelected}
					tabindex={isSelected ? 0 : -1}
					onclick={() => handleSelect(itemKey)}
					onkeydown={(e) => handleKeyDown(e, idx)}
				>
					{displayLabel}
				</button>
			{/each}
		</div>
	</div>

	<div class="joy-polyglot-tabs__panel" role="tabpanel">
		{#if activeItem}
			<CodeBlock
				code={activeItem.code}
				language={activeItem.language}
				title={activeItem.filename}
				{showLineNumbers}
				{allowCopy}
			/>
		{/if}
	</div>
</div>
