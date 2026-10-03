import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type CommandIslandPosition = 'bottom-floating' | 'bottom-fixed' | 'top-header';

export interface CommandIslandItem {
  id: string;
  label: string;
  active?: boolean;
  kbd?: string;
}

export interface CommandIslandProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: CommandIslandPosition;
  items: CommandIslandItem[];
  onSelect?: (id: string) => void;
  className?: string;
}

export const CommandIsland = React.forwardRef<HTMLDivElement, CommandIslandProps>(
  (
    {
      position = 'bottom-floating',
      items = [],
      onSelect,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(
          'joy-command-island',
          `joy-command-island--${position}`,
          className
        )}
        {...rest}
      >
        <div className="joy-command-island__inner" role="toolbar" aria-label="Quick actions">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cx(
                'joy-command-island__item',
                item.active && 'joy-command-island__item--active'
              )}
              onClick={() => onSelect?.(item.id)}
            >
              <span>{item.label}</span>
              {item.kbd && <span className="joy-command-island__kbd">{item.kbd}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

CommandIsland.displayName = 'CommandIsland';
