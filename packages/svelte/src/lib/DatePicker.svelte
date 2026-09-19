<script lang="ts">
	interface Props {
		value?: string;
		min?: string;
		max?: string;
		placeholder?: string;
		disabled?: boolean;
		error?: boolean;
		id?: string;
		onchange?: (e: Event) => void;
	}

	let {
		value = $bindable(''),
		min,
		max,
		placeholder,
		disabled = false,
		error = false,
		id,
		onchange
	}: Props = $props();
</script>

<div class="joy-date-picker" class:joy-date-picker--disabled={disabled} class:joy-date-picker--error={error}>
	<input
		type="date"
		class="joy-date-picker__input"
		bind:value
		{id}
		{min}
		{max}
		{disabled}
		{placeholder}
		{onchange}
	/>
	<span class="joy-date-picker__icon" aria-hidden="true">
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
			<line x1="16" y1="2" x2="16" y2="6"></line>
			<line x1="8" y1="2" x2="8" y2="6"></line>
			<line x1="3" y1="10" x2="21" y2="10"></line>
		</svg>
	</span>
</div>

<style>
	.joy-date-picker {
		display: inline-flex;
		align-items: center;
		position: relative;
		gap: 8px;
		padding: 8px 12px;
		background: var(--joy-color-surface, #ffffff);
		border: 1px solid var(--joy-color-border, #cbd5e1);
		border-radius: var(--joy-radius-md, 8px);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	:global(.dark) .joy-date-picker {
		background: var(--joy-color-surface-dark, #1e293b);
		border-color: var(--joy-color-border-dark, #334155);
	}

	.joy-date-picker:focus-within {
		border-color: var(--joy-color-primary, #14253e);
		box-shadow: 0 0 0 2px var(--joy-color-primary-soft, rgba(20, 37, 62, 0.15));
	}

	.joy-date-picker--error {
		border-color: var(--joy-color-danger, #ef4444) !important;
	}

	.joy-date-picker--error:focus-within {
		box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
	}

	.joy-date-picker--disabled {
		background: var(--joy-color-bg-muted, #f1f5f9);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.joy-date-picker__input {
		appearance: none;
		flex: 1 1 auto;
		min-width: 0;
		font-family: inherit;
		font-size: 14px;
		color: var(--joy-color-text, #0f172a);
		background: transparent;
		border: 0;
		padding: 0;
		outline: none;
		cursor: inherit;
	}

	:global(.dark) .joy-date-picker__input {
		color: var(--joy-color-text-dark, #f8fafc);
	}

	.joy-date-picker__icon {
		flex: 0 0 auto;
		color: var(--joy-color-text-muted, #64748b);
		pointer-events: none;
		display: inline-flex;
		align-items: center;
	}

	.joy-date-picker__input::-webkit-calendar-picker-indicator {
		opacity: 0;
		cursor: pointer;
		position: absolute;
		right: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}
</style>
