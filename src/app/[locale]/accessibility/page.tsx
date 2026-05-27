import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {BUSINESS_EMAIL, BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {canonicalUrl, hreflangAlternates, type Locale} from '@/lib/seo/urls';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'accessibility.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/accessibility';
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

/**
 * Accessibility statement page — Phase M.10 Issue 10.
 *
 * Server component with the same hero + section-body chrome shape as the
 * Privacy + Terms routes. Indexable (no noindex) — this is a marketing +
 * compliance asset. Schema: BreadcrumbList only (no Termly embed; the
 * body is real prose, not a third-party iframe).
 */
export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const loc: Locale = locale === 'es' ? 'es' : 'en';

  const tCrumbs = await getTranslations({locale, namespace: 'accessibility.breadcrumb'});
  const tHero = await getTranslations({locale, namespace: 'accessibility.hero'});
  const tBody = await getTranslations({locale, namespace: 'accessibility.body'});

  const breadcrumbs = buildBreadcrumbList([
    {name: tCrumbs('home'), item: loc === 'en' ? '/' : `/${loc}/`},
    {
      name: tCrumbs('accessibility'),
      item: loc === 'en' ? '/accessibility/' : `/${loc}/accessibility/`,
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbs)}}
      />

      {/* Hero — mirrors LegalPageHero shape (cream surface, eyebrow + h1 + lastUpdated). */}
      <section
        aria-labelledby="accessibility-h1"
        style={{
          background: 'var(--color-bg-cream)',
          borderBottom: '1px solid var(--color-border)',
          paddingTop: 'var(--spacing-12)',
          paddingBottom: 'var(--spacing-10)',
        }}
      >
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
          style={{maxWidth: 'var(--container-default)'}}
        >
          <Breadcrumb
            variant="light"
            className="mb-4"
            items={[
              {name: tCrumbs('home'), href: '/'},
              {name: tCrumbs('accessibility')},
            ]}
          />
          <div style={{maxWidth: '64ch'}}>
            <p
              className="font-heading font-semibold uppercase m-0 mb-3"
              style={{
                fontSize: '12px',
                letterSpacing: 'var(--tracking-eyebrow)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {tHero('eyebrow')}
            </p>
            <h1
              id="accessibility-h1"
              className="m-0 font-heading"
              style={{
                fontSize: 'var(--text-h1)',
                fontWeight: 700,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--color-text-primary)',
                textWrap: 'balance',
              }}
            >
              {tHero('h1')}
            </h1>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {tHero('lastUpdated')}
            </p>
          </div>
        </div>
      </section>

      {/* Body — single column on a brand cream surface card to match
          the legal-page visual rhythm. */}
      <section
        style={{
          background: 'var(--color-bg)',
          paddingTop: 'var(--spacing-10)',
          paddingBottom: 'var(--spacing-20)',
        }}
      >
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12"
          style={{maxWidth: 'var(--container-default)'}}
        >
          <article
            className="prose"
            style={{
              background: 'var(--color-bg-cream)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-8) var(--spacing-6)',
              maxWidth: '72ch',
              margin: '0 auto',
            }}
          >
            <Section heading={tBody('commitment.h2')}>
              <p style={paragraphStyle}>{tBody('commitment.p')}</p>
            </Section>

            <Section heading={tBody('doneSoFar.h2')}>
              <p style={paragraphStyle}>{tBody('doneSoFar.intro')}</p>
              <ul style={listStyle}>
                <li style={listItemStyle}>{tBody('doneSoFar.item1')}</li>
                <li style={listItemStyle}>{tBody('doneSoFar.item2')}</li>
                <li style={listItemStyle}>{tBody('doneSoFar.item3')}</li>
                <li style={listItemStyle}>{tBody('doneSoFar.item4')}</li>
                <li style={listItemStyle}>{tBody('doneSoFar.item5')}</li>
                <li style={listItemStyle}>{tBody('doneSoFar.item6')}</li>
              </ul>
            </Section>

            <Section heading={tBody('knownLimitations.h2')}>
              <p style={paragraphStyle}>{tBody('knownLimitations.intro')}</p>
              <ul style={listStyle}>
                <li style={listItemStyle}>{tBody('knownLimitations.item1')}</li>
                <li style={listItemStyle}>{tBody('knownLimitations.item2')}</li>
              </ul>
              <p style={paragraphStyle}>{tBody('knownLimitations.outro')}</p>
            </Section>

            <Section heading={tBody('feedback.h2')}>
              <p style={paragraphStyle}>
                {tBody.rich('feedback.p', {
                  emailLink: (chunks) => (
                    <a href={`mailto:${BUSINESS_EMAIL}`} style={linkStyle}>
                      {chunks}
                    </a>
                  ),
                  phoneLink: (chunks) => (
                    <a href={`tel:${BUSINESS_PHONE_TEL}`} style={linkStyle}>
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </Section>

            <Section heading={tBody('lastReviewed.h2')}>
              <p style={paragraphStyle}>{tBody('lastReviewed.p')}</p>
            </Section>
          </article>
        </div>
      </section>
    </>
  );
}

function Section({heading, children}: {heading: string; children: React.ReactNode}) {
  return (
    <section style={{marginBottom: 'var(--spacing-8)'}}>
      <h2
        className="font-heading"
        style={{
          fontSize: 'var(--text-h3)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: 'var(--tracking-snug)',
          lineHeight: 'var(--leading-snug)',
          margin: '0 0 var(--spacing-3)',
        }}
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 var(--spacing-3)',
  fontSize: 'var(--text-body)',
  lineHeight: 'var(--leading-relaxed)',
  color: 'var(--color-text-primary)',
};

const listStyle: React.CSSProperties = {
  margin: '0 0 var(--spacing-3)',
  paddingInlineStart: 'var(--spacing-6)',
  color: 'var(--color-text-primary)',
};

const listItemStyle: React.CSSProperties = {
  marginBottom: 'var(--spacing-2)',
  fontSize: 'var(--text-body)',
  lineHeight: 'var(--leading-relaxed)',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--color-sunset-green-700)',
  textDecoration: 'underline',
  textDecorationThickness: '1px',
  textUnderlineOffset: '2px',
};

// Suppress the "BUSINESS_PHONE is imported but only used in tel: link" lint
// false positive — the visible phone number is rendered inside the t.rich
// chunks via the phoneLink callback's chunks argument.
void BUSINESS_PHONE;
