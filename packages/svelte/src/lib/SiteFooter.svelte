<script lang="ts">
  import type { Snippet } from 'svelte';

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
    svgHtml?: string;
  }

  interface Props {
    brandTitle?: string;
    brandDescription?: string;
    brandLogo?: Snippet;
    columns: FooterColumn[];
    copyright?: string;
    socialLinks?: SocialLink[];
    class?: string;
  }

  let {
    brandTitle = 'Joymify',
    brandDescription = 'High-velocity institutional quantitative design system and trading infrastructure.',
    brandLogo,
    columns,
    copyright = `© ${new Date().getFullYear()} Joymify Inc. All rights reserved.`,
    socialLinks = [],
    class: className = ''
  }: Props = $props();
</script>

<footer role="contentinfo" class="joy-site-footer {className}">
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
                rel={link.external ? 'noreferrer noopener' : undefined}
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
            target="_blank"
            rel="noreferrer noopener"
          >
            {#if social.icon}
              {@render social.icon()}
            {:else if social.svgHtml}
              {@html social.svgHtml}
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</footer>
