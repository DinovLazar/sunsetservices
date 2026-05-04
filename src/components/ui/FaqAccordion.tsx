'use client';

import * as React from 'react';
import {ChevronDown} from 'lucide-react';

export type FaqAccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqAccordionItem[];
};

/**
 * Multi-open FAQ accordion. Renders native <details>/<summary> per item
 * so every answer is in the SSR HTML (FAQPage schema validity, Phase 1.08
 * §3.7). The component is a client island only to provide a smooth height
 * transition + a custom chevron rotation; if JS is disabled, the native
 * <details> still works (graceful fallback).
 *
 * Reduced-motion: height transition removed; chevron rotation kept (it's
 * a simple transform that reads the same as the open/closed state).
 *
 * Per Phase 1.08 §10 (Lighthouse implications) and §8 (motion choreography):
 * **the accordion items themselves are NOT wrapped in <AnimateIn>**.
 * That's the primary lever for closing the homepage's mobile P=86 gap on
 * these new templates — a separate `<AnimateIn>` per item would push
 * client-island count past budget.
 */
export default function FaqAccordion({items}: FaqAccordionProps) {
  return (
    <div className="border-t border-[var(--color-border)]">
      {items.map((it) => (
        <FaqRow key={it.id} item={it} />
      ))}
    </div>
  );
}

function FaqRow({item}: {item: FaqAccordionItem}) {
  const [open, setOpen] = React.useState(false);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group border-b border-[var(--color-border)]"
    >
      <summary
        className="flex items-start justify-between gap-6 cursor-pointer list-none py-5 lg:py-6"
        style={{outline: 'none'}}
      >
        <h3
          className="m-0 font-heading font-semibold"
          style={{
            fontSize: 'var(--text-h4)',
            lineHeight: 'var(--leading-snug)',
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-snug)',
          }}
        >
          {item.question}
        </h3>
        <ChevronDown
          aria-hidden="true"
          className="shrink-0 transition-transform duration-[var(--motion-base)] ease-[var(--easing-standard)] group-open:rotate-180"
          style={{
            width: 22,
            height: 22,
            color: 'var(--color-sunset-green-700)',
            marginTop: 4,
          }}
          strokeWidth={1.75}
        />
      </summary>
      <div
        className="pb-6 lg:pb-8 pr-12"
        style={{
          fontSize: 'var(--text-body)',
          lineHeight: 'var(--leading-relaxed)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {item.answer}
      </div>
    </details>
  );
}
