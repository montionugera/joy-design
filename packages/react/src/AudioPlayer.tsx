import * as React from 'react';
import { Play, Pause, RefreshCw, Volume2 } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface AudioCueMarker {
  id: string;
  label: string;
  time: number;
}

export interface AudioPlayerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onPlay' | 'onPause' | 'onSeek' | 'onToggle' | 'onRateChange'> {
  title: string;
  subtitle?: string;
  duration?: number;
  currentTime?: number;
  playing?: boolean;
  loop?: boolean;
  playbackRate?: number;
  peaks?: number[];
  cues?: AudioCueMarker[];
  onToggle?: (playing: boolean) => void;
  onSeek?: (time: number) => void;
  onLoopChange?: (loop: boolean) => void;
  onRateChange?: (rate: number) => void;
  className?: string;
}

const DEFAULT_PEAKS = [25, 55, 80, 45, 92, 70, 35, 65, 88, 50, 75, 40, 85, 60, 30, 50];
const RATES = [0.5, 1, 1.5, 2];

function formatTime(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AudioPlayer = React.forwardRef<HTMLDivElement, AudioPlayerProps>(
  (
    {
      title,
      subtitle = '',
      duration = 12,
      currentTime: controlledTime,
      playing: controlledPlaying,
      loop: controlledLoop,
      playbackRate: controlledRate,
      peaks = DEFAULT_PEAKS,
      cues = [],
      onToggle,
      onSeek,
      onLoopChange,
      onRateChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [internalTime, setInternalTime] = React.useState(controlledTime ?? 0);
    const [internalPlaying, setInternalPlaying] = React.useState(controlledPlaying ?? false);
    const [internalLoop, setInternalLoop] = React.useState(controlledLoop ?? false);
    const [internalRate, setInternalRate] = React.useState(controlledRate ?? 1);

    const currentTime = controlledTime !== undefined ? controlledTime : internalTime;
    const playing = controlledPlaying !== undefined ? controlledPlaying : internalPlaying;
    const loop = controlledLoop !== undefined ? controlledLoop : internalLoop;
    const playbackRate = controlledRate !== undefined ? controlledRate : internalRate;

    const safeDuration = duration > 0 ? duration : 1;
    const progressPct = Math.max(0, Math.min(100, (currentTime / safeDuration) * 100));

    const handleToggle = () => {
      const next = !playing;
      setInternalPlaying(next);
      onToggle?.(next);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.currentTarget.value);
      setInternalTime(next);
      onSeek?.(next);
    };

    const handleCueClick = (time: number) => {
      setInternalTime(time);
      onSeek?.(time);
    };

    const toggleLoop = () => {
      const next = !loop;
      setInternalLoop(next);
      onLoopChange?.(next);
    };

    const cycleRate = () => {
      const idx = RATES.indexOf(playbackRate);
      const next = RATES[(idx + 1) % RATES.length];
      setInternalRate(next);
      onRateChange?.(next);
    };

    return (
      <div
        ref={ref}
        className={cx('joy-audio-player', playing && 'joy-audio-player--playing', className)}
        role="region"
        aria-label={title}
        {...rest}
      >
        <div className="joy-audio-player__top">
          <button
            type="button"
            className="joy-audio-player__play-btn"
            aria-pressed={playing}
            aria-label={playing ? `Pause ${title}` : `Play ${title}`}
            onClick={handleToggle}
          >
            {playing ? <Pause size="1.125rem" /> : <Play size="1.125rem" />}
          </button>

          <div className="joy-audio-player__info">
            <div className="joy-audio-player__title-row">
              <span className="joy-audio-player__title">{title}</span>
              {subtitle ? <span className="joy-audio-player__subtitle">{subtitle}</span> : null}
            </div>
            <div className="joy-audio-player__timecode">
              <Volume2 size="0.875rem" />
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="joy-audio-player__controls">
            <button
              type="button"
              className={cx(
                'joy-audio-player__ctrl-btn',
                loop && 'joy-audio-player__ctrl-btn--active'
              )}
              aria-pressed={loop}
              aria-label="Toggle loop playback"
              onClick={toggleLoop}
            >
              <RefreshCw size="0.875rem" />
              <span>Loop</span>
            </button>

            <button
              type="button"
              className="joy-audio-player__ctrl-btn joy-audio-player__rate-btn"
              aria-label="Change playback speed"
              onClick={cycleRate}
            >
              <span>{playbackRate}x</span>
            </button>
          </div>
        </div>

        <div className="joy-audio-player__scrubber">
          <div className="joy-audio-player__waveform" aria-hidden="true">
            {peaks.map((peak, idx) => {
              const barPct = ((idx + 0.5) / peaks.length) * 100;
              return (
                <span
                  key={idx}
                  className={cx(
                    'joy-audio-player__bar',
                    barPct <= progressPct && 'joy-audio-player__bar--played'
                  )}
                  style={{ height: `${Math.max(15, Math.min(100, peak))}%` }}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={safeDuration}
            step={0.1}
            value={currentTime}
            aria-label={`Seek ${title}`}
            className="joy-audio-player__range"
            onChange={handleSeek}
          />
        </div>

        {cues.length > 0 ? (
          <div className="joy-audio-player__cues" role="list" aria-label="Animation SFX cue markers">
            {cues.map((cue) => (
              <button
                key={cue.id}
                type="button"
                className={cx(
                  'joy-audio-player__cue',
                  Math.abs(currentTime - cue.time) < 0.5 && 'joy-audio-player__cue--active'
                )}
                onClick={() => handleCueClick(cue.time)}
              >
                <span className="joy-audio-player__cue-label">{cue.label}</span>
                <span className="joy-audio-player__cue-time">{formatTime(cue.time)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';
