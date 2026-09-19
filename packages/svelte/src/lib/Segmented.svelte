<script lang="ts">
	export interface SegmentedOption {
		label: string;
		value: string | number;
		disabled?: boolean;
	}

	interface Props {
		options: (string | number | SegmentedOption)[];
		value?: string | number;
		onchange?: (value: string | number) => void;
		class?: string;
	}

	let {
		options = [],
		value = $bindable(),
		onchange,
		class: className = ''
	}: Props = $props();

	let normalizedOptions = $derived(
		options.map((opt) =>
			typeof opt === 'object' && opt !== null
				? opt
				: { label: String(opt), value: opt, disabled: false }
		)
	);

	function handleSelect(val: string | number) {
		value = val;
		onchange?.(val);
	}
</script>

<div class="joy-segmented {className}" role="radiogroup">
	{#each normalizedOptions as opt}
		<button
			type="button"
			class="joy-segmented__item {value === opt.value ? 'joy-segmented__item--active' : ''}"
			role="radio"
			aria-checked={value === opt.value}
			disabled={opt.disabled}
			onclick={() => handleSelect(opt.value)}
		>
			{opt.label}
		</button>
	{/each}
</div>
