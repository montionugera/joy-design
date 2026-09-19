<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		icon?: import('svelte').Snippet;
		action?: import('svelte').Snippet;
	}
	let { title, description, icon, action }: Props = $props();
</script>

<div class="joy-empty-state">
	{#if icon}
		<div class="joy-empty-state__icon">
			{@render icon()}
		</div>
	{/if}
	<h3 class="joy-empty-state__title">{title}</h3>
	{#if description}
		<p class="joy-empty-state__desc">{description}</p>
	{/if}
	{#if action}
		<div class="joy-empty-state__action">
			{@render action()}
		</div>
	{/if}
</div>

<style>
	.joy-empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		padding: 48px 24px;
		background: var(--joy-color-surface, #ffffff);
		border: 1px dashed var(--joy-color-border, #cbd5e1);
		border-radius: var(--joy-radius-lg, 12px);
		max-width: 480px;
		margin: 0 auto;
	}

	:global(.dark) .joy-empty-state {
		background: var(--joy-color-surface-dark, #1e293b);
		border-color: var(--joy-color-border-dark, #334155);
	}

	.joy-empty-state__icon {
		display: inline-flex;
		color: var(--joy-color-text-muted, #64748b);
		margin-bottom: 4px;
	}

	.joy-empty-state__title {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.3;
		color: var(--joy-color-text, #0f172a);
		margin: 0;
	}

	:global(.dark) .joy-empty-state__title {
		color: var(--joy-color-text-dark, #f8fafc);
	}

	.joy-empty-state__desc {
		font-size: 14px;
		color: var(--joy-color-text-muted, #64748b);
		line-height: 1.5;
		margin: 0;
		max-width: 40ch;
	}

	.joy-empty-state__action {
		margin-top: 8px;
	}
</style>
