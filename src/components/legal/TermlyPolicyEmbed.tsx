'use client';

import * as React from 'react';
import Script from 'next/script';
import {useLocale, useTranslations} from 'next-intl';

type Props = {
  type: 'privacy' | 'terms';
};

/**
 * TermlyPolicyEmbed — Phase B.03.
 *
 * Mounts Termly's embed script (`https://app.termly.io/embed-policy.min.js`)
 * once per page via `next/script` `afterInteractive`, then renders the
 * Termly policy iframe via the `name="termly-embed"` div Termly's script
 * targets.
 *
 * Document IDs are looked up by `{type, locale}`. All four IDs ship empty
 * at B.03 — Cowork populates them in Phase B.04 (Termly account setup).
 * When the relevant ID is empty, the component renders a graceful fallback
 * card instead of the broken empty embed.
 *
 * Custom CSS overrides: a `<style>` block scoped to the wrapper applies
 * project typography + spacing to Termly's default rendering. Since the
 * Phase B.02 mockups + selector list aren't available in this worktree,
 * the override block is a first-pass best-effort hitting Termly's known
 * default class names (`termly-document-name`, `.termly-section`, etc).
 * Chat to re-verify selectors against the real embed once a Termly doc
 * is provisioned in B.04.
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
    <div className="termly-embed-wrap" data-termly-type={type}>
      <style
        // First-pass override hitting Termly's known default classes.
        // Chat to verify against real embed once B.04 provisions a doc.
        dangerouslySetInnerHTML={{
          __html: `
            .termly-embed-wrap { font-family: var(--font-body); color: var(--color-text-primary); }
            .termly-embed-wrap h1,
            .termly-embed-wrap h2,
            .termly-embed-wrap h3,
            .termly-embed-wrap h4,
            .termly-embed-wrap h5,
            .termly-embed-wrap h6 {
              font-family: var(--font-heading);
              color: var(--color-text-primary);
              letter-spacing: var(--tracking-snug);
            }
            .termly-embed-wrap h1 { font-size: var(--text-h2); margin-top: var(--spacing-10); margin-bottom: var(--spacing-4); }
            .termly-embed-wrap h2 { font-size: var(--text-h3); margin-top: var(--spacing-8); margin-bottom: var(--spacing-3); }
            .termly-embed-wrap h3 { font-size: var(--text-h4); margin-top: var(--spacing-6); margin-bottom: var(--spacing-2); }
            .termly-embed-wrap p, .termly-embed-wrap li { font-size: var(--text-body); line-height: var(--leading-relaxed); color: var(--color-text-secondary); }
            .termly-embed-wrap a { color: var(--color-sunset-green-700); text-decoration: underline; text-underline-offset: 0.18em; }
            .termly-embed-wrap a:hover { color: var(--color-sunset-green-500); }
            .termly-embed-wrap ul, .termly-embed-wrap ol { padding-left: var(--spacing-6); margin: var(--spacing-3) 0; }
            .termly-embed-wrap li { margin-bottom: var(--spacing-2); }
          `,
        }}
      />
      {/* Termly's embed script (https://app.termly.io/embed-policy.min.js)
          targets divs by `name="termly-embed"`. React passes the `name`
          attribute through to the DOM; React's HTMLAttributes type allows
          it on any HTMLElement. */}
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
