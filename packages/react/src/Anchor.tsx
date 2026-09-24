import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface AnchorItem {
  key: string;
  href: string;
  title: React.ReactNode;
}

export interface AnchorProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  items: AnchorItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
}

export const Anchor = React.forwardRef<HTMLElement, AnchorProps>(
  ({ items = [], activeKey, onChange, className = '', ...rest }, ref) => {
    // Like the Svelte twin, the clicked link becomes active even when the parent does not control `activeKey`.
    const [internalKey, setInternalKey] = React.useState(activeKey ?? '');
    const current = activeKey !== undefined ? activeKey : internalKey;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: AnchorItem) => {
      e.preventDefault();
      setInternalKey(item.key);
      onChange?.(item.key);
      const targetEl = document.querySelector(item.href);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <nav
        ref={ref}
        className={cx('joy-anchor', className)}
        role="navigation"
        aria-label="Anchor Navigation"
        {...rest}
      >
        <div className="joy-anchor__ink" />
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={cx('joy-anchor__link', current === item.key && 'joy-anchor__link--active')}
            aria-current={current === item.key ? 'location' : undefined}
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
