import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {getSubscriberByToken} from '@sanity-lib/queries';
import UnsubscribeActions from './UnsubscribeActions';

/**
 * `/[locale]/unsubscribe/[token]` — Phase B.07.
 *
 * Server-renders one of three initial states based on a Sanity lookup of
 * the URL token:
 *
 *  - `confirm`              — subscriber found, still subscribed.
 *                             Shows the "Confirm unsubscribe" CTA.
 *  - `alreadyUnsubscribed`  — subscriber found, already opted out.
 *                             Shows the resubscribe affordance.
 *  - `invalid`              — no subscriber matches this token. Terminal;
 *                             shows a home link.
 *
 * The client island (`UnsubscribeActions`) owns every transition after
 * mount and POSTs to `/api/newsletter/unsubscribe` for the actual mutation.
 *
 * Page is `noindex,nofollow` (D5) and excluded from the sitemap; `robots.txt`
 * also `Disallow`s `/unsubscribe/` + `/es/unsubscribe/` as belt-and-suspenders.
 *
 * Not gated by `NEWSLETTER_SUBMIT_ENABLED` (D6) — once subscribed, the right
 * to leave can't be flag-gated. The Sanity lookup uses the writeClient (no
 * CDN) so a freshly-issued welcome-email link works inside the 60-second
 * Sanity CDN window.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: 'en' | 'es'}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'unsubscribe.meta'});
  return {
    title: t('title'),
    description: t('description'),
    // D5 — page must never appear in search results; no canonical /
    // hreflang on a token-gated utility surface.
    robots: {index: false, follow: false},
  };
}

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{locale: 'en' | 'es'; token: string}>;
}) {
  const {locale, token} = await params;
  setRequestLocale(locale);
  const t = await getTranslations({locale, namespace: 'unsubscribe'});

  const subscriber = await getSubscriberByToken(token);

  const initialState: 'confirm' | 'alreadyUnsubscribed' | 'invalid' =
    subscriber === null
      ? 'invalid'
      : subscriber.unsubscribed
        ? 'alreadyUnsubscribed'
        : 'confirm';

  return (
    <main className="bg-[var(--color-bg)] py-16 lg:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div
          className="bg-[var(--color-bg-cream)] p-8 sm:p-10 lg:p-12 text-center"
          style={{
            borderRadius: 16,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <UnsubscribeActions
            token={token}
            initialState={initialState}
            locale={locale}
            labels={{
              confirmHeading: t('confirm.heading'),
              confirmBody: t('confirm.body'),
              confirmCta: t('confirm.cta'),
              confirming: t('confirm.confirming'),
              successHeading: t('success.heading'),
              successBody: t('success.body'),
              resubscribeCta: t('success.resubscribeCta'),
              resubscribing: t('success.resubscribing'),
              welcomeBackHeading: t('welcomeBack.heading'),
              welcomeBackBody: t('welcomeBack.body'),
              alreadyUnsubscribedHeading: t('alreadyUnsubscribed.heading'),
              alreadyUnsubscribedBody: t('alreadyUnsubscribed.body'),
              invalidHeading: t('invalid.heading'),
              invalidBody: t('invalid.body'),
              invalidHomeLink: t('invalid.homeLink'),
              errorMessage: t('error.message'),
              errorRetryCta: t('error.retryCta'),
              homeLink: t('homeLink'),
            }}
          />
        </div>
      </div>
    </main>
  );
}
