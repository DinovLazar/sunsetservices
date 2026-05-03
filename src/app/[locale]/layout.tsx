import type {Metadata} from 'next';
import {Manrope, Onest} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import MotionRoot from '@/components/global/motion/MotionRoot';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SkipLink from '@/components/layout/SkipLink';
import {
  BUSINESS_ADDRESS,
  BUSINESS_AREA_SERVED,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE_TEL,
  BUSINESS_URL,
} from '@/lib/constants/business';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-heading',
});

const onest = Onest({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Sunset Services',
  description: 'Landscaping & outdoor living in Aurora, IL.',
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: BUSINESS_NAME,
  address: {
    '@type': 'PostalAddress',
    ...BUSINESS_ADDRESS,
  },
  telephone: BUSINESS_PHONE_TEL,
  email: BUSINESS_EMAIL,
  url: BUSINESS_URL,
  areaServed: BUSINESS_AREA_SERVED,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(localBusinessJsonLd)}}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale}>
          <MotionRoot>
            <SkipLink />
            <Navbar />
            <main id="main" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <div id="toast-root" aria-live="polite" />
            <div id="chat-root" />
          </MotionRoot>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
