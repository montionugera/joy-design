import * as React from 'react';

export interface AnchorItem {
  key: string;
  href: string;
  title: React.ReactNode;
}

export interface AnchorProps extends React.HTMLAttributes<HTMLElement> {
  items: AnchorItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
}

export const Anchor = React.forwardRef<HTMLElement, AnchorProps>(
  ({ items = [], activeKey, onChange, className = '', ...rest }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
      e.preventDefault();
      onChange?.(item.key);
      const targetEl = document.querySelector(item.href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <nav
        ref={ref}
        className={`joy-anchor ${className}`.trim()}
        role="navigation"
        aria-label="Anchor Navigation"
        {...rest}
      >
        <div className="joy-anchor__ink" />
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`joy-anchor__link ${activeKey === item.key ? 'joy-anchor__link--active' : ''}`}
            onClick={(e) => handleClick(e, item)}
          >
            {item.title}
          </a>
        ))}
      </nav>
    );
  }
);

Anchor.displayName = 'Anchor';
