<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    onprimaryclick?: () => void;
    onsecondaryclick?: () => void;
    class?: string;
  }

  let {
    title,
    description,
    primaryCtaText = 'Get Started Today',
    secondaryCtaText = 'Contact Sales',
    onprimaryclick,
    onsecondaryclick,
    class: className = ''
  }: Props = $props();
</script>

<section class="joy-cta-section {className}">
  <div class="joy-cta-section__container">
    <h2 class="joy-cta-section__title">{title}</h2>
    {#if description}
      <p class="joy-cta-section__desc">{description}</p>
    {/if}
    <div class="joy-cta-section__actions">
      {#if primaryCtaText}
        <button
          type="button"
          class="joy-button joy-button--solid joy-button--lg"
          onclick={onprimaryclick}
        >
          {primaryCtaText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      {/if}
      {#if secondaryCtaText}
        <button
          type="button"
          class="joy-button joy-button--glass joy-button--lg"
          onclick={onsecondaryclick}
        >
          {secondaryCtaText}
        </button>
      {/if}
    </div>
  </div>
</section>
