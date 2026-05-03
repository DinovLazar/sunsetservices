'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';

/**
 * Part 1 newsletter placeholder. `e.preventDefault()` and inline note —
 * no POST anywhere (D1.05-J). Wired up in Part 2.08 (Resend).
 */
export default function FooterNewsletter() {
  const t = useTranslations('chrome.footer.newsletter');
  const [submitted, setSubmitted] = React.useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col gap-3 min-w-[220px]">
      <h2 className="font-heading font-semibold text-[12px] tracking-[0.08em] uppercase text-[var(--color-text-on-dark)] m-0">
        {t('heading')}
      </h2>
      <p className="text-[14px] text-[var(--color-text-on-dark)] m-0 leading-relaxed">
        {t('helper')}
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-1">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          {t('fieldLabel')}
        </label>
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          required
          placeholder={t('placeholder')}
          className="h-11 px-3 rounded text-[14px] text-[var(--color-text-on-dark)] placeholder:text-[var(--color-sunset-green-200)] bg-[rgba(250,247,241,0.08)] border border-[rgba(250,247,241,0.32)] focus:border-[var(--color-sunset-green-300)] focus:border-2 focus:outline-none"
        />
        <button type="submit" className="btn btn-primary btn-md self-start">
          {t('submit')}
        </button>
      </form>
      {submitted && (
        <p
          role="status"
          className="text-[14px] text-[var(--color-sunset-green-300)] mt-1 m-0"
        >
          {t('placeholderNote')}
        </p>
      )}
    </div>
  );
}
