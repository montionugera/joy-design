import * as React from 'react';
import { Volume2, Volume1, VolumeX, Music, Sliders } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface SoundControllerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  muted?: boolean;
  sfxVolume?: number;
  bgmVolume?: number;
  voiceVolume?: number;
  bgmEnabled?: boolean;
  blocked?: boolean;
  ducked?: boolean;
  open?: boolean;
  label?: string;
  unlockLabel?: string;
  onMuteChange?: (muted: boolean) => void;
  onSfxVolumeChange?: (volume: number) => void;
  onBgmVolumeChange?: (volume: number) => void;
  onVoiceVolumeChange?: (volume: number) => void;
  onBgmToggle?: (enabled: boolean) => void;
  onUnlock?: () => void;
  className?: string;
}

export const SoundController = React.forwardRef<HTMLDivElement, SoundControllerProps>(
  (
    {
      muted: controlledMuted,
      sfxVolume: controlledSfx = 80,
      bgmVolume: controlledBgm = 50,
      voiceVolume: controlledVoice = 90,
      bgmEnabled: controlledBgmEnabled = true,
      blocked = false,
      ducked = false,
      open: controlledOpen,
      label = 'Audio mixer',
      unlockLabel = 'Tap to unlock audio',
      onMuteChange,
      onSfxVolumeChange,
      onBgmVolumeChange,
      onVoiceVolumeChange,
      onBgmToggle,
      onUnlock,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [internalMuted, setInternalMuted] = React.useState(controlledMuted ?? false);
    const [internalSfx, setInternalSfx] = React.useState(controlledSfx);
    const [internalBgm, setInternalBgm] = React.useState(controlledBgm);
    const [internalVoice, setInternalVoice] = React.useState(controlledVoice);
    const [internalBgmEnabled, setInternalBgmEnabled] = React.useState(controlledBgmEnabled);
    const [internalOpen, setInternalOpen] = React.useState(controlledOpen ?? false);

    const muted = controlledMuted !== undefined ? controlledMuted : internalMuted;
    const sfxVolume = controlledSfx !== undefined ? controlledSfx : internalSfx;
    const bgmVolume = controlledBgm !== undefined ? controlledBgm : internalBgm;
    const voiceVolume = controlledVoice !== undefined ? controlledVoice : internalVoice;
    const bgmEnabled = controlledBgmEnabled !== undefined ? controlledBgmEnabled : internalBgmEnabled;
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const toggleMute = () => {
      const next = !muted;
      setInternalMuted(next);
      onMuteChange?.(next);
    };

    const toggleBgm = () => {
      if (blocked) {
        onUnlock?.();
        return;
      }
      const next = !bgmEnabled;
      setInternalBgmEnabled(next);
      onBgmToggle?.(next);
    };

    const toggleOpen = () => {
      setInternalOpen(!open);
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-sound-controller',
          muted && 'joy-sound-controller--muted',
          blocked && 'joy-sound-controller--blocked',
          ducked && 'joy-sound-controller--ducked',
          className
        )}
        role="group"
        aria-label={label}
        {...rest}
      >
        <div className="joy-sound-controller__bar">
          <button
            type="button"
            className={cx(
              'joy-sound-controller__btn',
              muted ? 'joy-sound-controller__btn--muted' : 'joy-sound-controller__btn--active'
            )}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            onClick={toggleMute}
          >
            {muted || sfxVolume === 0 ? (
              <VolumeX size="1.125rem" />
            ) : sfxVolume < 50 ? (
              <Volume1 size="1.125rem" />
            ) : (
              <Volume2 size="1.125rem" />
            )}
            <span className="joy-sound-controller__btn-label">{muted ? 'Muted' : `${sfxVolume}%`}</span>
          </button>

          <button
            type="button"
            className={cx(
              'joy-sound-controller__btn',
              bgmEnabled && !muted && 'joy-sound-controller__btn--active'
            )}
            aria-pressed={bgmEnabled}
            aria-label={
              blocked
                ? unlockLabel
                : bgmEnabled
                  ? 'Disable background music'
                  : 'Enable background music'
            }
            onClick={toggleBgm}
          >
            <Music size="1.125rem" />
            <span className="joy-sound-controller__btn-label">BGM</span>
            {blocked ? (
              <span className="joy-sound-controller__badge joy-sound-controller__badge--blocked">
                {unlockLabel}
              </span>
            ) : ducked ? (
              <span className="joy-sound-controller__badge joy-sound-controller__badge--ducked">
                Ducking
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className={cx(
              'joy-sound-controller__btn',
              'joy-sound-controller__mixer-toggle',
              open && 'joy-sound-controller__btn--active'
            )}
            aria-expanded={open}
            aria-label="Toggle audio channel sliders"
            onClick={toggleOpen}
          >
            <Sliders size="1.125rem" />
          </button>
        </div>

        {open ? (
          <div className="joy-sound-controller__popover" role="region" aria-label="Channel volume mixer">
            <div className="joy-sound-controller__channel">
              <div className="joy-sound-controller__channel-header">
                <span className="joy-sound-controller__channel-name">SFX</span>
                <span className="joy-sound-controller__channel-val">{sfxVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={sfxVolume}
                aria-label="SFX volume"
                className="joy-sound-controller__slider"
                onChange={(e) => {
                  const val = Number(e.currentTarget.value);
                  setInternalSfx(val);
                  onSfxVolumeChange?.(val);
                }}
              />
            </div>

            <div className="joy-sound-controller__channel">
              <div className="joy-sound-controller__channel-header">
                <span className="joy-sound-controller__channel-name">BGM</span>
                <span className="joy-sound-controller__channel-val">{bgmVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={bgmVolume}
                aria-label="BGM volume"
                className="joy-sound-controller__slider"
                onChange={(e) => {
                  const val = Number(e.currentTarget.value);
                  setInternalBgm(val);
                  onBgmVolumeChange?.(val);
                }}
              />
            </div>

            <div className="joy-sound-controller__channel">
              <div className="joy-sound-controller__channel-header">
                <span className="joy-sound-controller__channel-name">Voice</span>
                <span className="joy-sound-controller__channel-val">{voiceVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={voiceVolume}
                aria-label="Voice volume"
                className="joy-sound-controller__slider"
                onChange={(e) => {
                  const val = Number(e.currentTarget.value);
                  setInternalVoice(val);
                  onVoiceVolumeChange?.(val);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
);

SoundController.displayName = 'SoundController';
