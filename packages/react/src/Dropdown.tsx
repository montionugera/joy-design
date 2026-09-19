import * as React from 'react';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  onSelect?: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  onSelect,
  children,
  className = ''
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={`joy-dropdown-wrapper ${className}`}>
      <div
        className="joy-dropdown-trigger"
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {children}
      </div>

      {open && (
        <div className="joy-dropdown" role="menu">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={`joy-dropdown__item ${item.danger ? 'joy-dropdown__item--danger' : ''}`}
              onClick={() => {
                if (item.disabled) return;
                setOpen(false);
                onSelect?.(item.key);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';
