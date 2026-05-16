import {getTranslations} from 'next-intl/server';
import {loadLegalContent, type LegalPolicyType} from '@/lib/legal/load-content';
import LegalTocSidebar from './LegalTocSidebar';
import TermlyPolicyEmbed from './TermlyPolicyEmbed';

type Props = {
  type: LegalPolicyType;
  locale: string;
};

/**
 * Shared body for Privacy + Terms pages — Phase B.03c (static-HTML path).
 *
 * Two-column body on `lg:` and up: prose column on the left, sticky TOC
 * sidebar on the right (per Phase B.02 §2.4 — TOC sits to the right of
 * the prose to keep prose flush-left at the natural reading edge).
 *
 * On free-plan content (Privacy EN only), `loadLegalContent` returns the
 * rendered HTML + extracted h2/h3 headings. On placeholder / unprovisioned
 * routes (Privacy ES, Terms EN, Terms ES — Pro+ paywalled until upgrade),
 * the loader returns null; `TermlyPolicyEmbed` renders the "Legal content
 * is being prepared" fallback and no TOC is shown.
 *
 * Below `lg:` the TOC moves into a closed-by-default `<details>` accordion
 * at the top of the prose column.
 */
export default async function LegalPageBody({type, locale}: Props) {
  const content = await loadLegalContent(type, locale);
  const tToc = await getTranslations({locale, namespace: 'legal.toc'});
  const headerText = tToc('heading');

  const hasToc = content !== null && content.headings.length > 0;

  return (
    <section
      style={{
        background: 'var(--color-bg)',
        paddingTop: 'var(--spacing-10)',
        paddingBottom: 'var(--spacing-20)',
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 lg:[grid-template-columns:1fr_16rem] gap-10"
        style={{maxWidth: 'var(--container-default)'}}
      >
        <article className="prose">
          {hasToc ? (
            <details
              className="lg:hidden"
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                marginBottom: 'var(--spacing-6)',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontSize: 'var(--text-micro)',
                  fontWeight: 600,
                  letterSpacing: 'var(--tracking-eyebrow)',
                  textTransform: 'uppercase',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {headerText}
              </summary>
              <div style={{marginTop: '12px'}}>
                <LegalTocSidebar
                  headings={content.headings}
                  headerText={headerText}
                  variant="mobile"
                />
              </div>
            </details>
          ) : null}
          <TermlyPolicyEmbed type={type} locale={locale} html={content?.html ?? null} />
        </article>
        {hasToc ? (
          <aside
            className="hidden lg:block"
            style={{position: 'sticky', top: 96, alignSelf: 'start'}}
          >
            <LegalTocSidebar
              headings={content.headings}
              headerText={headerText}
              variant="desktop"
            />
          </aside>
        ) : (
          <aside aria-hidden="true" className="hidden lg:block" />
        )}
      </div>
    </section>
  );
}
