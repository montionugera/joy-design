import * as React from 'react';
import { Play, Pause, Waveform } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SoundTileProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onPlay' | 'onPause' | 'onToggle'> {
  title: string;
  category?: string;
  duration?: string;
  playing?: boolean;
  pinned?: boolean;
  hoverPreview?: boolean;
  peaks?: number[];
  onToggle?: (playing: boolean) => void;
  onPin?: (pinned: boolean) => void;
  className?: string;
}

const DEFAULT_PEAKS = [35, 70, 50, 95, 65, 80, 40, 88, 60, 45, 75, 55];

export const SoundTile = React.forwardRef<HTMLDivElement, SoundTileProps>(
  (
    {
      title,
      category = 'SFX',
      duration = '0:01',
      playing: controlledPlaying,
      pinned: controlledPinned,
      hoverPreview = true,
      peaks = DEFAULT_PEAKS,
      onToggle,
      onPin,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [internalPlaying, setInternalPlaying] = React.useState(controlledPlaying ?? false);
    const [internalPinned, setInternalPinned] = React.useState(controlledPinned ?? false);

    const playing = controlledPlaying !== undefined ? controlledPlaying : internalPlaying;
    const pinned = controlledPinned !== undefined ? controlledPinned : internalPinned;

    const handleToggle = () => {
      const next = !playing;
      setInternalPlaying(next);
      onToggle?.(next);
    };

    const handlePin = () => {
      const next = !pinned;
      setInternalPinned(next);
      setInternalPlaying(next);
      onPin?.(next);
      onToggle?.(next);
    };

    const handleMouseEnter = () => {
      if (hoverPreview && !pinned && !playing) {
        setInternalPlaying(true);
        onToggle?.(true);
      }
    };

    const handleMouseLeave = () => {
      if (hoverPreview && !pinned && playing) {
        setInternalPlaying(false);
        onToggle?.(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-sound-tile',
          playing && 'joy-sound-tile--playing',
          pinned && 'joy-sound-tile--pinned',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <div className="joy-sound-tile__header">
          <span className="joy-sound-tile__category">
            <Waveform size="0.875rem" />
            <span>{category}</span>
          </span>
          <span className="joy-sound-tile__duration">{duration}</span>
        </div>

        <div className="joy-sound-tile__visualizer" aria-hidden="true">
          {peaks.map((peak, idx) => (
            <span
              key={idx}
              className="joy-sound-tile__bar"
              style={{ height: `${Math.max(15, Math.min(100, peak))}%` }}
            />
          ))}
        </div>

        <div className="joy-sound-tile__footer">
          <div className="joy-sound-tile__meta">
            <span className="joy-sound-tile__title">{title}</span>
            {pinned ? <span className="joy-sound-tile__pin-badge">Pinned</span> : null}
          </div>

          <div className="joy-sound-tile__actions">
            <button
              type="button"
              className="joy-sound-tile__play-btn"
              aria-pressed={playing}
              aria-label={playing ? `Pause ${title}` : `Play ${title}`}
              onClick={handleToggle}
            >
              {playing ? <Pause size="1rem" /> : <Play size="1rem" />}
            </button>
            <button
              type="button"
              className={cx('joy-sound-tile__pin-btn', pinned && 'joy-sound-tile__pin-btn--active')}
              aria-pressed={pinned}
              aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}
              onClick={handlePin}
            >
              <span>{pinned ? 'Pinned' : 'Pin'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

SoundTile.displayName = 'SoundTile';
