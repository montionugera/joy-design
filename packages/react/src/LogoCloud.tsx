import React, { useId } from 'react';

export interface LogoItem {
  name: string;
  logo?: React.ReactNode;
  href?: string;
}

export interface LogoCloudProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  title?: string;
  logos: LogoItem[];
}

export const LogoCloud = React.forwardRef<HTMLElement, LogoCloudProps>(({
  title,
  logos,
  className = '',
  ...props
}, ref) => {
  const titleId = `joy-logo-cloud-title-${useId()}`;
  return (
    <section ref={ref} className={`joy-logo-cloud ${className}`} aria-labelledby={title && !props['aria-label'] ? titleId : undefined} {...props}>
      {title && <p className="joy-logo-cloud__title" id={titleId}>{title}</p>}
      <div className="joy-logo-cloud__logos">
        {logos.map((item, idx) => {
          if (item.href) {
            // The logo is a graphic, so the link's name comes from aria-label, and the new-tab behaviour is disclosed.
            return (
              <a
                key={`${idx}-${item.name}`}
                href={item.href}
                className="joy-logo-cloud__item"
                title={item.name}
                aria-label={`${item.name} (opens in a new tab)`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.logo}
              </a>
            );
          }
          return (
            <div key={`${idx}-${item.name}`} className="joy-logo-cloud__item" title={item.name} role="img" aria-label={item.name}>
              {item.logo}
            </div>
          );
        })}
      </div>
    </section>
  );
});

LogoCloud.displayName = 'LogoCloud';
