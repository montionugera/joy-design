import React from 'react';

export interface LogoItem {
  name: string;
  logo: React.ReactNode;
  href?: string;
}

export interface LogoCloudProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  logos: LogoItem[];
}

export const LogoCloud = React.forwardRef<HTMLDivElement, LogoCloudProps>(({
  title,
  logos,
  className = '',
  ...props
}, ref) => {
  return (
    <section ref={ref} className={`joy-logo-cloud ${className}`} {...props}>
      {title && <p className="joy-logo-cloud__title">{title}</p>}
      <div className="joy-logo-cloud__logos">
        {logos.map((item, idx) => {
          if (item.href) {
            return (
              <a
                key={item.name || idx}
                href={item.href}
                className="joy-logo-cloud__item"
                title={item.name}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.logo}
              </a>
            );
          }
          return (
            <div key={item.name || idx} className="joy-logo-cloud__item" title={item.name}>
              {item.logo}
            </div>
          );
        })}
      </div>
    </section>
  );
});

LogoCloud.displayName = 'LogoCloud';
