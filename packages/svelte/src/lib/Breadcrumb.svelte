<script lang="ts">
	interface Crumb {
		label: string;
		href?: string;
	}

	interface Props {
		items: Crumb[];
		separator?: string;
		class?: string;
		ref?: HTMLElement | null;
		[key: string]: any;
	}

	let { items, separator = '/', class: className = '', ref = $bindable(null), ...rest }: Props = $props();
</script>

<nav bind:this={ref} class="joy-breadcrumb {className}" aria-label="Breadcrumb" {...rest}>
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
