<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
  }

  interface FooterColumn {
    title: string;
    links: FooterLink[];
  }

  interface SocialLink {
    name: string;
    href: string;
    icon?: Snippet;
    /** Svelte-only legacy field (React passes an element through `icon`): raw markup, trusted input only. */
    svgHtml?: string;
  }

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> {
    brandTitle?: string;
    brandDescription?: string;
    brandLogo?: Snippet;
    columns: FooterColumn[];
    copyright?: string;
    socialLinks?: SocialLink[];
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    brandTitle = 'Joymify',
    brandDescription = 'A design system for building clear, fast financial apps.',
    brandLogo,
    columns,
    copyright = `© ${new Date().getFullYear()} Joymify Inc. All rights reserved.`,
    socialLinks = [],
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<!-- A <footer> that is not inside sectioning content is already the page's contentinfo landmark: no explicit role. -->
<footer bind:this={ref} class="joy-site-footer {className}" {...rest}>
  <div class="joy-site-footer__inner">
    <div class="joy-site-footer__brand">
      <div class="joy-site-footer__brand-title">
        {#if brandLogo}
          {@render brandLogo()}
        {/if}
        <span>{brandTitle}</span>
      </div>
      {#if brandDescription}
        <p class="joy-site-footer__brand-desc">{brandDescription}</p>
      {/if}
    </div>

    {#each columns as col}
      <div class="joy-site-footer__column">
        <h4 class="joy-site-footer__col-title">{col.title}</h4>
        <ul class="joy-site-footer__links">
          {#each col.links as link}
            <li>
              <a
                href={link.href}
                class="joy-site-footer__link"
                target={link.external ? '_blank' : undefined}
                aria-label={link.external ? `${link.label} (opens in a new tab)` : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>

  <div class="joy-site-footer__bottom">
    <div>{copyright}</div>
    {#if socialLinks.length > 0}
      <div class="joy-site-footer__socials">
        {#each socialLinks as social}
          <a
            href={social.href}
            class="joy-site-footer__social-link"
            title={social.name}
            aria-label="{social.name} (opens in a new tab)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {#if social.icon}
              {@render social.icon()}
            {:else if social.svgHtml}
              {@html social.svgHtml}
            {:else}
              {social.name}
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</footer>
