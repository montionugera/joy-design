import React, { useId, useState } from 'react';
import { ChevronDown } from '@joymify/icons/react';

export interface FAQItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export interface FAQSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  allowMultiple?: boolean;
}

export const FAQSection = React.forwardRef<HTMLElement, FAQSectionProps>(({
  title = 'Frequently asked questions',
  subtitle = 'Everything you need to know about our trading and liquidity services.',
  items,
  allowMultiple = false,
  className = '',
  ...props
}, ref) => {
  const uid = useId();

  // Until the reader toggles something, the open items are the ones marked defaultOpen; after that their choice wins.
  // The choice is stored by index: if `items` is reordered or inserted into afterwards, the same positions stay open.
  const defaultOpen = items.flatMap((item, idx) => (item.defaultOpen ? [idx] : []));
  const [chosen, setChosen] = useState<number[] | null>(null);
  const openIndexes = chosen ?? defaultOpen;

  const toggleIndex = (index: number) => {
    if (allowMultiple) {
      setChosen(openIndexes.includes(index) ? openIndexes.filter((i) => i !== index) : [...openIndexes, index]);
    } else {
      setChosen(openIndexes.includes(index) ? [] : [index]);
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
          const answerId = `${uid}-answer-${idx}`;
          const triggerId = `${uid}-trigger-${idx}`;

          return (
            <div
              key={`${idx}-${item.question}`}
              className={isOpen ? 'joy-faq-item joy-faq-item--open' : 'joy-faq-item'}
            >
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                className="joy-faq-item__trigger"
                onClick={() => toggleIndex(idx)}
              >
                <span className="joy-faq-item__label">{item.question}</span>
                <span className="joy-faq-item__icon" aria-hidden="true"><ChevronDown size="100%" /></span>
              </button>
              {/* Always in the DOM so aria-controls resolves and the answer is part of the page; hidden while closed. */}
              <div
                id={answerId}
                role="region"
                aria-labelledby={triggerId}
                className="joy-faq-item__content"
                hidden={!isOpen}
              >
                {item.answer}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

FAQSection.displayName = 'FAQSection';
