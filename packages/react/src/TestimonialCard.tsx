import React, { forwardRef } from 'react';

export interface TestimonialCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  quote: string;
  authorName: string;
  authorRole?: string;
  avatarSrc?: string;
  avatarInitials?: string;
  rating?: number;
}

export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  (
    {
      quote,
      authorName,
      authorRole,
      avatarSrc,
      avatarInitials,
      rating = 5,
      className = '',
      ...props
    },
    ref
  ) => {
    // A whole number of stars from 0 to 5: a fraction, a negative or NaN must not reach Array.from.
    const stars = Math.max(0, Math.min(5, Math.round(Number(rating)) || 0));
    return (
      <div ref={ref} className={`joy-testimonial-card ${className}`} {...props}>
        {stars > 0 && (
          <div className="joy-testimonial-card__stars" role="img" aria-label={`Rated ${stars} out of 5`}>
            {Array.from({ length: stars }).map((_, idx) => (
              <svg
                key={idx}
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        )}

        <p className="joy-testimonial-card__quote">"{quote}"</p>

        <div className="joy-testimonial-card__author">
          <div className="joy-avatar joy-avatar--circle joy-avatar--md">
            {avatarSrc ? (
              <img className="joy-avatar__image" src={avatarSrc} alt="" />
            ) : (
              <span className="joy-avatar__fallback" aria-hidden="true">
                {avatarInitials || Array.from(authorName).slice(0, 2).join('').toUpperCase()}
              </span>
            )}
          </div>
          <div className="joy-testimonial-card__author-info">
            <h6>{authorName}</h6>
            {authorRole && <p>{authorRole}</p>}
          </div>
        </div>
      </div>
    );
  }
);

TestimonialCard.displayName = 'TestimonialCard';
