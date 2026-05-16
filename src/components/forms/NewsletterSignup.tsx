'use client';

import * as React from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {usePathname} from 'next/navigation';

/**
 * Newsletter signup — footer surface (Phase 2.08).
 *
 * Replaces the Phase 1.05-J Part-1 placeholder. POSTs to /api/newsletter
 * which writes to Sanity (`newsletterSubscriber`) and sends the branded
 * welcome email through `sendBrandedEmail()` (sandbox-routed at Phase 2.08).
 *
 * Hidden on `/request-quote/` so the signup never competes visually with
 * the wizard flow (the conversion surface). Same pattern as the chat
 * bubble (D17, Phase 1.20). All other routes show the form.
 *
 * Honeypot field name on the form is `website` (same as wizard + contact
 * for bot-pattern consistency); mapped to the wire key `honeypot`.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'already' | 'invalid' | 'error';

function fireNewsletterEvent(name: string, detail: Record<string, unknown> = {}): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('sunset:newsletter-event', {detail: {name, ...detail}}));
}

export default function NewsletterSignup() {
  const t = useTranslations('chrome.footer.newsletter');
  const locale = useLocale() as 'en' | 'es';
  const pathname = usePathname();
  const [status, setStatus] = React.useState<Status>('idle');
  const [email, setEmail] = React.useState('');
  const [honeypot, setHoneypot] = React.useState('');

  // Hide on /request-quote/ (any locale prefix).
  const onWizardRoute = /\/request-quote(\/|$)/.test(pathname ?? '');
  if (onWizardRoute) return null;

  const flagEnabled =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED !== 'false';
  if (!flagEnabled) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    const cleaned = email.trim();
    if (!cleaned || !EMAIL_RE.test(cleaned)) {
      setStatus('invalid');
      fireNewsletterEvent('newsletter_submit_invalid', {locale});
      return;
    }

    setStatus('submitting');
    fireNewsletterEvent('newsletter_submit_attempted', {locale});
    const sourcePage = typeof window !== 'undefined' ? window.location.pathname : undefined;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          email: cleaned,
          locale,
          sourcePage,
          honeypot,
        }),
        keepalive: true,
      });
      if (!res.ok) {
        setStatus('error');
        fireNewsletterEvent('newsletter_submit_failed', {locale, status: res.status});
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {status?: string};
      if (body.status === 'already_subscribed') {
        setStatus('already');
        // Phase 2.10: renamed from `newsletter_submit_already_subscribed`
        // to match the analytics spec at `src/lib/analytics/events.ts`.
        fireNewsletterEvent('newsletter_already_subscribed', {locale});
      } else {
        setStatus('success');
        setEmail('');
        // Phase 2.10: renamed from `newsletter_submit_succeeded` to the
        // conversion-tagged `newsletter_subscribed` (GTM Key Event tag).
        fireNewsletterEvent('newsletter_subscribed', {locale});
      }
    } catch (err) {
      console.error('[newsletter] submit network error', err);
      setStatus('error');
      fireNewsletterEvent('newsletter_submit_failed', {locale, reason: 'network'});
    }
  }

  const submitting = status === 'submitting';

  return (
    <section
      aria-labelledby="footer-newsletter-heading"
      className="bg-[var(--color-bg-charcoal)] border-b border-[rgba(250,247,241,0.16)]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 py-10 lg:py-12">
        <div className="grid gap-6 lg:gap-12 grid-cols-1 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <h2
              id="footer-newsletter-heading"
              className="m-0 font-heading"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-text-on-dark)',
                lineHeight: 1.3,
              }}
            >
              {t('heading')}
            </h2>
            <p
              className="m-0 mt-2"
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: 'rgba(250,247,241,0.8)',
              }}
            >
              {t('helper')}
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            aria-busy={submitting}
            lang={locale}
            className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-[520px] lg:ml-auto"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              {t('fieldLabel')}
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder={t('placeholder')}
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'invalid' || status === 'error') setStatus('idle');
              }}
              aria-invalid={status === 'invalid' ? 'true' : undefined}
              aria-describedby={status !== 'idle' && status !== 'submitting' ? 'newsletter-status' : undefined}
              className="flex-1 px-4"
              style={{
                height: 48,
                background: '#FFFFFF',
                color: 'var(--color-text-primary)',
                border: '1px solid rgba(250,247,241,0.32)',
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: 15,
                fontFamily: 'inherit',
              }}
            />
            {/* Honeypot — same name (`website`) as wizard + contact for consistency. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              <label htmlFor="newsletter-website">Website</label>
              <input
                id="newsletter-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              data-loading={submitting ? 'true' : undefined}
              data-analytics-event="newsletter_submit_clicked"
              className="btn btn-primary"
              style={{
                height: 48,
                minWidth: 120,
                borderRadius: 'var(--radius-md, 8px)',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <span className="btn__label">{t('submit')}</span>
            </button>
          </form>
        </div>

        {status !== 'idle' && status !== 'submitting' ? (
          <p
            id="newsletter-status"
            role={status === 'error' || status === 'invalid' ? 'alert' : 'status'}
            aria-live="polite"
            className="m-0 mt-4"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color:
                status === 'success' || status === 'already'
                  ? 'var(--color-sunset-green-300, #B7D3A6)'
                  : 'var(--color-feedback-error-on-dark, #FFB4A8)',
            }}
          >
            {status === 'success'
              ? t('successMessage')
              : status === 'already'
                ? t('alreadySubscribed')
                : status === 'invalid'
                  ? t('invalidEmail')
                  : t('errorMessage')}
          </p>
        ) : null}
      </div>
    </section>
  );
}

