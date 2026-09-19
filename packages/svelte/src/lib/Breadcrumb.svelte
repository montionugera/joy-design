<script lang="ts">
	interface Crumb {
		label: string;
		href?: string;
	}

	interface Props {
		items: Crumb[];
		separator?: string;
	}

	let { items, separator = '/' }: Props = $props();
</script>

<nav class="joy-breadcrumb" aria-label="Breadcrumb">
	<ol>
		{#each items as item, i (item.label + i)}
			{@const isLast = i === items.length - 1}
			<li>
				{#if isLast || !item.href}
					<span class="joy-breadcrumb__current" aria-current={isLast ? 'page' : undefined}>{item.label}</span>
				{:else}
					<a class="joy-breadcrumb__link" href={item.href}>{item.label}</a>
				{/if}
				{#if !isLast}
					<span class="joy-breadcrumb__sep" aria-hidden="true">{separator}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.joy-breadcrumb {
		font-family: inherit;
		font-size: 14px;
		color: var(--joy-color-text-muted, #64748b);
	}

	.joy-breadcrumb ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.joy-breadcrumb li {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.joy-breadcrumb__link {
		color: var(--joy-color-text-muted, #64748b);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.joy-breadcrumb__link:hover {
		color: var(--joy-color-primary, #14253e);
		text-decoration: underline;
	}

	:global(.dark) .joy-breadcrumb__link:hover {
		color: var(--joy-color-primary-light, #93c5fd);
	}

	.joy-breadcrumb__current {
		color: var(--joy-color-text, #0f172a);
		font-weight: 500;
	}

	:global(.dark) .joy-breadcrumb__current {
		color: var(--joy-color-text-dark, #f8fafc);
	}

	.joy-breadcrumb__sep {
		color: var(--joy-color-border, #cbd5e1);
	}
</style>
