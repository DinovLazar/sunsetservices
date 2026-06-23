import type {Metadata, Viewport} from 'next';
import {Manrope, Onest} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import MotionRoot from '@/components/global/motion/MotionRoot';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SkipLink from '@/components/layout/SkipLink';
import ChatRoot from '@/components/chat/ChatRoot';
import {Analytics} from '@vercel/analytics/next';
import AnalyticsBridge from '@/components/analytics/AnalyticsBridge';
import ClarityScript from '@/components/analytics/ClarityScript';
import ConsentBanner from '@/components/analytics/ConsentBanner';
import ConsentModeDefault from '@/components/analytics/ConsentModeDefault';
import GTMNoScript from '@/components/analytics/GTMNoScript';
import GTMScript from '@/components/analytics/GTMScript';
import {
  BUSINESS_ADDRESS,
  BUSINESS_AREA_SERVED,
  BUSINESS_EMAIL,
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAME_FULL,
  BUSINESS_PHONE_TEL,
  BUSINESS_URL,
} from '@/lib/constants/business';
import {SITE_URL, hreflangAlternates, isProductionDeploy} from '@/lib/seo/urls';
import '../globals.css';

// Phase M.02 — drop `latin-ext` subset. The site ships EN + ES Spanish only;
// every glyph either alphabet needs (À-ÿ range incl. Ñ ñ á é í ó ú ü ¿ ¡) is
// in the `latin` subset (U+0000-U+00FF). `latin-ext` adds Eastern-European
// glyphs (Polish/Czech/Hungarian/Romanian/Turkish) we never render. Removing
// the subset trims the woff2 payload Next emits in the per-request <link
// rel="preload"> for each weight, cutting font bytes off the LCP path.
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading',
});

const onest = Onest({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

/**
 * Sitewide default metadata.
 *
 * `metadataBase` lets per-page `openGraph` / `twitter` URLs be relative;
 * Next resolves them against this base. Sitewide `alternates.languages`
 * covers the root locale switch (`/` ↔ `/es`) so any page that doesn't
 * override gets at least a sane default — every public page-level
 * `generateMetadata` then overrides `alternates.canonical` +
 * `alternates.languages` with route-specific values via the
 * `canonicalUrl` / `hreflangAlternates` helpers from `@/lib/seo/urls`.
 */
const ROOT_HREFLANG = hreflangAlternates('/');

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Canonical site-name default (per-page descriptive titles override this with
  // the conversational short form). Formal full DBA name per BG-01 §2.1.1.
  title: BUSINESS_NAME_FULL,
  description: 'Landscaping & outdoor living in Aurora, IL.',
  alternates: {
    canonical: ROOT_HREFLANG.en,
    languages: ROOT_HREFLANG,
  },
  // Phase M.14 (Goran QA B-09 §3.12): preview/development deployments emit
  // a sitewide noindex; production has no robots field so pages stay
  // indexable (per-page metadata may still set its own, e.g. /unsubscribe).
  ...(isProductionDeploy() ? {} : {robots: {index: false, follow: false}}),
};

/**
 * `interactiveWidget: 'resizes-content'` — Phase 1.19 §11.3. Lets the chat
 * composer + wizard sticky-Next bar correctly track the on-screen keyboard
 * on mobile. Without it, both surfaces float behind the keyboard on iOS Safari.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Phase M.11c — viewport-fit=cover so `env(safe-area-inset-*)` resolves to the
  // real notch / home-indicator insets on modern phones. globals.css already uses
  // these insets for the consent banner, wizard sticky bar, chat composer + chat
  // bubble; without `cover` they all resolve to 0. (No `user-scalable`/`maximumScale`
  // — pinch-zoom stays enabled for a11y. Desktop is unaffected: insets are 0 there.)
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

// Phase B.04 — Two sitewide entity nodes shipped together in a `@graph`
// container. The `@id`s are stable hash-fragment URIs so per-page builders
// (Place.areaServed, Person.worksFor, ContactPage.mainEntity,
// CreativeWork.creator, Article/BlogPosting.publisher, Service.provider)
// can reference them without restating the NAP block. LocalBusiness covers
// physical-storefront cases; Organization covers publisher/author cases.
// Both reference the same canonical name/url so they stay in lockstep.
const sitewideJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': `${BUSINESS_URL}/#localbusiness`,
      name: BUSINESS_NAME_FULL,
      legalName: BUSINESS_LEGAL_NAME,
      address: {
        '@type': 'PostalAddress',
        ...BUSINESS_ADDRESS,
      },
      telephone: BUSINESS_PHONE_TEL,
      email: BUSINESS_EMAIL,
      url: BUSINESS_URL,
      areaServed: BUSINESS_AREA_SERVED,
    },
    {
      '@type': 'Organization',
      '@id': `${BUSINESS_URL}/#organization`,
      name: BUSINESS_NAME_FULL,
      legalName: BUSINESS_LEGAL_NAME,
      url: BUSINESS_URL,
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${manrope.variable} ${onest.variable}`}>
      <head>
        {/* Google Consent Mode v2 — must run before any tag-management
            script. Sets every signal to 'denied' until pushConsentUpdate()
            flips them after the visitor decides. */}
        <ConsentModeDefault />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(sitewideJsonLd)}}
        />
      </head>
      <body className="antialiased">
        {/* GTM <noscript> fallback for JS-disabled visitors. Per Google's
            install guide, this lives immediately inside <body>. */}
        <GTMNoScript />
        <NextIntlClientProvider locale={locale}>
          <MotionRoot>
            <SkipLink />
            <Navbar />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <div id="toast-root" aria-live="polite" />
            <ChatRoot />
            {/* ConsentBanner uses next-intl translations, so it must mount
                inside NextIntlClientProvider. */}
            <ConsentBanner />
          </MotionRoot>
        </NextIntlClientProvider>
        <Analytics />
        {/* The bridge + script loaders don't need translations and stay
            outside the provider — keeps the listener attach happen as
            early as possible, before any below-the-fold interactions. */}
        <AnalyticsBridge />
        <GTMScript />
        <ClarityScript />
      </body>
    </html>
  );
}
