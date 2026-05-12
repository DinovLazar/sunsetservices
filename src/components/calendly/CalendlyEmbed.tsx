'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * CalendlyEmbed — Phase 2.07.
 *
 * Renders the official Calendly inline widget gated by:
 *   1. `NEXT_PUBLIC_CALENDLY_ENABLED === 'true'`
 *   2. Non-empty `NEXT_PUBLIC_CALENDLY_URL`
 *   3. Cookie consent (stub default-true, matching the chat-widget gate
 *      from Phase 1.20 D29; the real banner lands in Phase 2.11).
 *
 * When any gate is closed, a static fallback card renders instead with
 * a tel: button + (when the URL is set) a direct anchor so visitors
 * always have a path through.
 *
 * `widget.js` lazy-loads on viewport entry (`IntersectionObserver`,
 * `rootMargin: '200px 0px'`) so it stays out of the network waterfall
 * for visitors who never scroll to the widget. A `<noscript>` anchor
 * fallback covers visitors with JS disabled.
 *
 * The parent `<section>` owns surface alternation; this component stays
 * neutral. `surface` is informational only — it does not paint inside
 * the widget.
 *
 * `namespace` selects the i18n group ('contact.calendly' on /contact/,
 * 'thanks.calendly' on /thank-you/). Both namespaces ship the same key
 * set: h2, sub, fallbackCta, fallbackLink, iframeLabel.
 */

type CalendlyNamespace = 'contact.calendly' | 'thanks.calendly';

type CalendlyEmbedProps = {
  locale: 'en' | 'es';
  namespace: CalendlyNamespace;
  minHeight?: number;
  surface?: 'bg' | 'cream';
};

const CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';

function readEnv() {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL || '';
  const enabled = process.env.NEXT_PUBLIC_CALENDLY_ENABLED === 'true';
  return {url, enabled};
}

function scriptAlreadyLoaded(): boolean {
  if (typeof document === 'undefined') return false;
  return document.querySelector(
    'script[src*="calendly.com/assets/external/widget.js"]',
  ) !== null;
}

export default function CalendlyEmbed({
  locale: _locale,
  namespace,
  minHeight = 680,
  surface: _surface = 'bg',
}: CalendlyEmbedProps) {
  const t = useTranslations(namespace);
  const {url, enabled} = readEnv();

  // Stub default-true consent — mirrors the chat-widget Phase 1.20 D29 gate.
  // Phase 2.11 will swap this for a live hook that re-renders on grant.
  const [consented] = React.useState<boolean>(true);

  const widgetRef = React.useRef<HTMLDivElement | null>(null);
  const scriptOwnedRef = React.useRef<boolean>(false);

  const shouldRenderWidget = enabled && url !== '' && consented;

  React.useEffect(() => {
    if (!shouldRenderWidget) return;
    if (typeof window === 'undefined') return;

    const target = widgetRef.current;
    if (!target) return;

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    function inject() {
      if (cancelled) return;
      if (scriptAlreadyLoaded()) return;
      const s = document.createElement('script');
      s.src = CALENDLY_SCRIPT_SRC;
      s.async = true;
      s.setAttribute('data-sunset-calendly', 'true');
      document.body.appendChild(s);
      scriptOwnedRef.current = true;
    }

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              inject();
              observer?.disconnect();
              observer = null;
              break;
            }
          }
        },
        {rootMargin: '200px 0px'},
      );
      observer.observe(target);
    } else {
      // Fallback for very old browsers (rare).
      inject();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (scriptOwnedRef.current) {
        const owned = document.querySelector(
          'script[data-sunset-calendly="true"]',
        );
        if (owned && owned.parentNode) {
          owned.parentNode.removeChild(owned);
        }
        scriptOwnedRef.current = false;
      }
    };
  }, [shouldRenderWidget]);

  if (!shouldRenderWidget) {
    return (
      <FallbackCard
        t={t}
        url={url}
        showUrlLink={url !== ''}
      />
    );
  }

  return (
    <div className="w-full">
      <div
        ref={widgetRef}
        role="region"
        className="calendly-inline-widget mx-auto"
        data-url={url}
        style={{minWidth: 320, height: `${minHeight}px`, width: '100%'}}
        aria-label={t('iframeLabel')}
      />
      <noscript>
        <div
          className="mx-auto mt-6 text-center"
          style={{maxWidth: '720px'}}
        >
          <p
            className="m-0"
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-inline"
              style={{
                color: 'var(--color-sunset-green-700)',
                fontWeight: 600,
              }}
            >
              {t('fallbackLink')}
            </a>
          </p>
        </div>
      </noscript>
    </div>
  );
}

type FallbackCardProps = {
  t: ReturnType<typeof useTranslations>;
  url: string;
  showUrlLink: boolean;
};

function FallbackCard({t, url, showUrlLink}: FallbackCardProps) {
  // The parent section owns the h2/sub chrome; this card is just the
  // CTA row so the visitor still has a path to book or call when the
  // widget is gated out.
  return (
    <div
      className="card card-cream mx-auto"
      style={{
        maxWidth: 720,
        textAlign: 'center',
        padding: '24px 32px',
      }}
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`tel:${BUSINESS_PHONE_TEL}`}
          className="btn btn-secondary btn-md"
          style={{minWidth: 240}}
          aria-label={t('fallbackCta', {phone: BUSINESS_PHONE})}
        >
          {t('fallbackCta', {phone: BUSINESS_PHONE})}
        </a>
        {showUrlLink ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-md"
            style={{minWidth: 200}}
          >
            {t('fallbackLink')}
          </a>
        ) : null}
      </div>
    </div>
  );
}
