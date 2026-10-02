import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type Voice = 'editorial' | 'performance';
export type Ground = 'paper' | 'deep' | 'sunken' | 'flat';

export interface VoiceCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  voice?: Voice;
  ground?: Ground;
  eyebrow?: string;
  caption?: string;
  children?: React.ReactNode;
  className?: string;
}

export const VoiceCard = React.forwardRef<HTMLDivElement, VoiceCardProps>(
  ({ voice = 'editorial', ground = 'paper', eyebrow, caption, children, className = '', ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cx('joy-voice-card', `joy-voice-card--${voice}`, `joy-voice-card--ground-${ground}`, className)}
        {...rest}
      >
        {eyebrow && <div className="joy-voice-card__eyebrow">{eyebrow}</div>}
        {children}
        {caption && <div className="joy-voice-card__caption">{caption}</div>}
      </div>
    );
  }
);

VoiceCard.displayName = 'VoiceCard';
