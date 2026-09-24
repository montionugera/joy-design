import React from 'react';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  /** Shown as the link content; when omitted the visible link text is the name. (The Svelte twin also has a raw-markup `svgHtml`.) */
  icon?: React.ReactNode;
}

// children are omitted: the footer renders its own body, so a caller's children would be silently dropped (Svelte twin omits them too).
export interface SiteFooterProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  brandTitle?: string;
  brandDescription?: string;
  brandLogo?: React.ReactNode;
  columns: FooterColumn[];
  copyright?: string;
  socialLinks?: SocialLink[];
}

export const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(({
  brandTitle = 'Joymify',
  brandDescription = 'A design system for building clear, fast financial apps.',
  brandLogo,
  columns,
  copyright = `© ${new Date().getFullYear()} Joymify Inc. All rights reserved.`,
  socialLinks = [],
  className = '',
  ...props
}, ref) => {
  // A <footer> outside sectioning content is already the page contentinfo landmark: no explicit role.
  return (
    <footer ref={ref} className={`joy-site-footer ${className}`} {...props}>
      <div className="joy-site-footer__inner">
        <div className="joy-site-footer__brand">
          <div className="joy-site-footer__brand-title">
            {brandLogo}
            <span>{brandTitle}</span>
          </div>
          {brandDescription && (
            <p className="joy-site-footer__brand-desc">{brandDescription}</p>
          )}
        </div>

        {columns.map((col, idx) => (
          <div key={`${idx}-${col.title}`} className="joy-site-footer__column">
            <h4 className="joy-site-footer__col-title">{col.title}</h4>
            <ul className="joy-site-footer__links">
              {col.links.map((link, lIdx) => (
                <li key={`${lIdx}-${link.label}`}>
                  <a
                    href={link.href}
                    className="joy-site-footer__link"
                    target={link.external ? '_blank' : undefined}
                    aria-label={link.external ? `${link.label} (opens in a new tab)` : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="joy-site-footer__bottom">
        <div>{copyright}</div>
        {socialLinks.length > 0 && (
          <div className="joy-site-footer__socials">
            {socialLinks.map((social, sIdx) => (
              <a
                key={`${sIdx}-${social.name}`}
                href={social.href}
                className="joy-site-footer__social-link"
                title={social.name}
                aria-label={`${social.name} (opens in a new tab)`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon ?? social.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
});

SiteFooter.displayName = 'SiteFooter';
