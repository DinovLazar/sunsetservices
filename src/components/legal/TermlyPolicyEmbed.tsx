'use client';

import * as React from 'react';
import Script from 'next/script';
import {useLocale, useTranslations} from 'next-intl';

type Props = {
  type: 'privacy' | 'terms';
};

/**
 * Mounts Termly's embed via the iframe pattern (Path B).
 *
 * Termly's `app.termly.io/embed-policy.min.js` finds divs by
 * `name="termly-embed"` and rewrites them to an iframe pointing at
 * `app.termly.io`. The iframe boundary is why no CSS override block
 * lives here: same-origin CSS cannot reach cross-origin iframe content.
 *
 * Gate: env-var presence. When the per-locale doc ID is empty, render
 * the brand-styled "preparing" fallback card instead of an empty embed.
 */
export default function TermlyPolicyEmbed({type}: Props) {
  const t = useTranslations('legal.embed');
  const locale = useLocale();

  const docId = lookupTermlyId(type, locale);
  const websiteId = process.env.NEXT_PUBLIC_TERMLY_WEBSITE_ID;

  if (!docId) {
    return (
      <div
        className="termly-embed-wrap"
        data-termly-type={type}
        data-state="fallback"
        style={{
          padding: 'var(--spacing-8)',
          background: 'var(--color-bg-cream)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {t('preparingFallback')}
        </p>
      </div>
    );
  }

  return (
    <div
      className="termly-embed-wrap"
      data-termly-type={type}
      data-state="rendered"
    >
      {React.createElement('div', {
        name: 'termly-embed',
        'data-id': docId,
        'data-type': 'iframe',
        'data-website-id': websiteId || undefined,
      })}
      <Script
        id={`termly-embed-${type}`}
        src="https://app.termly.io/embed-policy.min.js"
        strategy="afterInteractive"
      />
    </div>
  );
}

function lookupTermlyId(
  type: 'privacy' | 'terms',
  locale: string,
): string | undefined {
  const isEs = locale === 'es';
  if (type === 'privacy') {
    return isEs
      ? process.env.NEXT_PUBLIC_TERMLY_PRIVACY_ES_ID
      : process.env.NEXT_PUBLIC_TERMLY_PRIVACY_EN_ID;
  }
  return isEs
    ? process.env.NEXT_PUBLIC_TERMLY_TERMS_ES_ID
    : process.env.NEXT_PUBLIC_TERMLY_TERMS_EN_ID;
}
