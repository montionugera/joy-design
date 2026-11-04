<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Search, Close } from '@montionugera/joy-icons';

	export interface CommandPaletteItem {
		id: string;
		label: string;
		group?: string;
		shortcut?: string;
		description?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'onselect'> {
		open?: boolean;
		items: CommandPaletteItem[];
		query?: string;
		placeholder?: string;
		emptyText?: string;
		onselect?: (item: CommandPaletteItem) => void;
		onclose?: () => void;
		onquerychange?: (query: string) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		open = false,
		items = [],
		query = $bindable(''),
		placeholder = 'Type a command or search assets...',
		emptyText = 'No matching commands found.',
		onselect,
		onclose,
		onquerychange,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let activeIndex = $state(0);

	const filteredItems = $derived(
		query.trim() === ''
			? items
			: items.filter((item) => {
					const q = query.toLowerCase();
					return (
						item.label.toLowerCase().includes(q) ||
						(item.group && item.group.toLowerCase().includes(q)) ||
						(item.description && item.description.toLowerCase().includes(q))
					);
				})
	);

	function handleQueryInput(e: Event) {
		query = (e.currentTarget as HTMLInputElement).value;
		activeIndex = 0;
		onquerychange?.(query);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			onclose?.();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (filteredItems.length > 0) {
				activeIndex = (activeIndex + 1) % filteredItems.length;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (filteredItems.length > 0) {
				activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
			}
		} else if (e.key === 'Enter' && filteredItems[activeIndex]) {
			e.preventDefault();
			onselect?.(filteredItems[activeIndex]);
			onclose?.();
		}
	}
</script>

{#if open}
	<div
		class="joy-command-palette-backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose?.();
		}}
	>
		<div
			bind:this={ref}
			class="joy-command-palette {className}"
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			onkeydown={handleKeyDown}
			{...rest}
		>
			<div class="joy-command-palette__search">
				<span class="joy-command-palette__search-icon" aria-hidden="true">
					<Search size="1.125rem" />
				</span>
				<input
					type="text"
					class="joy-command-palette__input"
					value={query}
					{placeholder}
					aria-label={placeholder}
					oninput={handleQueryInput}
				/>
				<button
					type="button"
					class="joy-command-palette__close"
					aria-label="Close command palette"
					onclick={() => onclose?.()}
				>
					<Close size="1rem" />
				</button>
			</div>

			<div class="joy-command-palette__list" role="listbox" aria-label="Commands">
				{#if filteredItems.length === 0}
					<div class="joy-command-palette__empty">{emptyText}</div>
				{:else}
					{#each filteredItems as item, idx (item.id)}
						<button
							type="button"
							role="option"
							aria-selected={idx === activeIndex}
							class="joy-command-palette__item {idx === activeIndex ? 'joy-command-palette__item--active' : ''}"
							onmouseenter={() => (activeIndex = idx)}
							onclick={() => {
								onselect?.(item);
								onclose?.();
							}}
						>
							<div class="joy-command-palette__item-main">
								{#if item.group}
									<span class="joy-command-palette__group">{item.group}</span>
								{/if}
								<span class="joy-command-palette__label">{item.label}</span>
								{#if item.description}
									<span class="joy-command-palette__desc">{item.description}</span>
								{/if}
							</div>
							{#if item.shortcut}
								<kbd class="joy-command-palette__kbd">{item.shortcut}</kbd>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
