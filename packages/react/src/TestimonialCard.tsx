import React, { forwardRef } from 'react';

export interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
    return (
      <div ref={ref} className={`joy-testimonial-card ${className}`} {...props}>
        <div className="joy-testimonial-card__stars">
          {Array.from({ length: rating }).map((_, idx) => (
            <svg
              key={idx}
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

        <p className="joy-testimonial-card__quote">"{quote}"</p>

        <div className="joy-testimonial-card__author">
          <div
            className="joy-avatar joy-avatar--circle joy-avatar--md"
            style={{ backgroundColor: 'var(--joy-color-brand-primary, #7c3aed)' }}
          >
            {avatarSrc ? (
              <img className="joy-avatar__image" src={avatarSrc} alt={authorName} />
            ) : (
              <span className="joy-avatar__fallback">
                {avatarInitials || authorName.slice(0, 2).toUpperCase()}
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
