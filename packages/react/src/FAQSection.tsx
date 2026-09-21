import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export interface FAQSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  allowMultiple?: boolean;
}

export const FAQSection = React.forwardRef<HTMLElement, FAQSectionProps>(({
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about our institutional trading and liquidity infrastructure.',
  items,
  allowMultiple = false,
  className = '',
  ...props
}, ref) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>(() => {
    return items
      .map((item, idx) => (item.defaultOpen ? idx : -1))
      .filter((idx) => idx !== -1);
  });

  const toggleIndex = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <section ref={ref} className={`joy-faq-section ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="joy-faq-section__header">
          {title && <h2 className="joy-faq-section__title">{title}</h2>}
          {subtitle && <p className="joy-faq-section__subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="joy-faq-list">
        {items.map((item, idx) => {
          const isOpen = openIndexes.includes(idx);
          const answerId = `faq-answer-${idx}`;
          const triggerId = `faq-trigger-${idx}`;

          return (
            <div
              key={item.question || idx}
              className={`joy-faq-item ${isOpen ? 'joy-faq-item--open' : ''}`}
            >
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="joy-faq-item__trigger"
                onClick={() => toggleIndex(idx)}
              >
                <span>{item.question}</span>
                <svg
                  className="joy-faq-item__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={triggerId}
                  className="joy-faq-item__content"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';
