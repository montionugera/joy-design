<script lang="ts">
  interface FAQItem {
    question: string;
    answer: string;
    defaultOpen?: boolean;
  }

  interface Props {
    title?: string;
    subtitle?: string;
    items: FAQItem[];
    allowMultiple?: boolean;
    class?: string;
  }

  let {
    title = 'Frequently Asked Questions',
    subtitle = 'Everything you need to know about our institutional trading and liquidity infrastructure.',
    items,
    allowMultiple = false,
    class: className = ''
  }: Props = $props();

  let openIndexes = $state<number[]>(
    items.map((item, idx) => (item.defaultOpen ? idx : -1)).filter((idx) => idx !== -1)
  );

  function toggleIndex(index: number) {
    if (allowMultiple) {
      if (openIndexes.includes(index)) {
        openIndexes = openIndexes.filter((i) => i !== index);
      } else {
        openIndexes = [...openIndexes, index];
      }
    } else {
      openIndexes = openIndexes.includes(index) ? [] : [index];
    }
  }
</script>

<section class="joy-faq-section {className}">
  {#if title || subtitle}
    <div class="joy-faq-section__header">
      {#if title}<h2 class="joy-faq-section__title">{title}</h2>{/if}
      {#if subtitle}<p class="joy-faq-section__subtitle">{subtitle}</p>{/if}
    </div>
  {/if}
  <div class="joy-faq-list">
    {#each items as item, idx}
      {@const isOpen = openIndexes.includes(idx)}
      {@const answerId = `faq-answer-${idx}`}
      {@const triggerId = `faq-trigger-${idx}`}

      <div class="joy-faq-item" class:joy-faq-item--open={isOpen}>
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={answerId}
          class="joy-faq-item__trigger"
          onclick={() => toggleIndex(idx)}
        >
          <span>{item.question}</span>
          <svg
            class="joy-faq-item__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {#if isOpen}
          <div
            id={answerId}
            role="region"
            aria-labelledby={triggerId}
            class="joy-faq-item__content"
          >
            {item.answer}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
