<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'horizontal' | 'vertical';
		dashed?: boolean;
		orientation?: 'left' | 'center' | 'right';
		children?: Snippet;
		class?: string;
	}

	let {
		type = 'horizontal',
		dashed = false,
		orientation = 'center',
		children,
		class: className = ''
	}: Props = $props();
</script>

{#if type === 'vertical'}
	<div class="joy-divider joy-divider--vertical {dashed ? 'joy-divider--dashed' : ''} {className}" role="separator"></div>
{:else if children}
	<div class="joy-divider joy-divider--with-text joy-divider--{orientation} {dashed ? 'joy-divider--dashed' : ''} {className}" role="separator">
		<span class="joy-divider__text">
			{@render children()}
		</span>
	</div>
{:else}
	<div class="joy-divider {dashed ? 'joy-divider--dashed' : ''} {className}" role="separator"></div>
{/if}
