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
  icon: React.ReactNode;
}

export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  brandTitle?: string;
  brandDescription?: string;
  brandLogo?: React.ReactNode;
  columns: FooterColumn[];
  copyright?: string;
  socialLinks?: SocialLink[];
}

export const SiteFooter = React.forwardRef<HTMLElement, SiteFooterProps>(({
  brandTitle = 'Joymify',
  brandDescription = 'High-velocity institutional quantitative design system and trading infrastructure.',
  brandLogo,
  columns,
  copyright = `© ${new Date().getFullYear()} Joymify Inc. All rights reserved.`,
  socialLinks = [],
  className = '',
  ...props
}, ref) => {
  return (
    <footer ref={ref} role="contentinfo" className={`joy-site-footer ${className}`} {...props}>
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
          <div key={col.title || idx} className="joy-site-footer__column">
            <h4 className="joy-site-footer__col-title">{col.title}</h4>
            <ul className="joy-site-footer__links">
              {col.links.map((link, lIdx) => (
                <li key={link.label || lIdx}>
                  <a
                    href={link.href}
                    className="joy-site-footer__link"
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noreferrer noopener' : undefined}
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
                key={social.name || sIdx}
                href={social.href}
                className="joy-site-footer__social-link"
                title={social.name}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
});

SiteFooter.displayName = 'SiteFooter';
