<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { ChevronDown } from '@montionugera/joy-icons';

  interface FAQItem {
    question: string;
    answer: string;
    defaultOpen?: boolean;
  }

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title'> {
    title?: string;
    subtitle?: string;
    items: FAQItem[];
    allowMultiple?: boolean;
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    title = 'Frequently asked questions',
    subtitle = 'Everything you need to know about our trading and liquidity services.',
    items,
    allowMultiple = false,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();

  // Until the reader toggles something, the open items are the ones marked defaultOpen; after that their choice wins.
  // The choice is stored by index: if `items` is reordered or inserted into afterwards, the same positions stay open.
  const defaultOpen = $derived(items.flatMap((item, idx) => (item.defaultOpen ? [idx] : [])));
  let chosen = $state<number[] | null>(null);
  const openIndexes = $derived(chosen ?? defaultOpen);

  function toggleIndex(index: number) {
    if (allowMultiple) {
      chosen = openIndexes.includes(index) ? openIndexes.filter((i) => i !== index) : [...openIndexes, index];
    } else {
      chosen = openIndexes.includes(index) ? [] : [index];
    }
  }
</script>

<section bind:this={ref} class="joy-faq-section {className}" {...rest}>
  {#if title || subtitle}
    <div class="joy-faq-section__header">
      {#if title}<h2 class="joy-faq-section__title">{title}</h2>{/if}
      {#if subtitle}<p class="joy-faq-section__subtitle">{subtitle}</p>{/if}
    </div>
  {/if}
  <div class="joy-faq-list">
    {#each items as item, idx}
      {@const isOpen = openIndexes.includes(idx)}
      {@const answerId = `${uid}-answer-${idx}`}
      {@const triggerId = `${uid}-trigger-${idx}`}

      <div class="joy-faq-item" class:joy-faq-item--open={isOpen}>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={answerId}
          class="joy-faq-item__trigger"
          onclick={() => toggleIndex(idx)}
        >
          <span class="joy-faq-item__label">{item.question}</span>
          <span class="joy-faq-item__icon" aria-hidden="true"><ChevronDown size="100%" /></span>
        </button>
        <!-- Always in the DOM so aria-controls resolves and the answer is part of the page; hidden while closed. -->
        <div
          id={answerId}
          role="region"
          aria-labelledby={triggerId}
          class="joy-faq-item__content"
          hidden={!isOpen}
        >
          {item.answer}
        </div>
      </div>
    {/each}
  </div>
</section>
