import type {ReactNode} from 'react';

/**
 * Body wrapper for the Privacy + Terms pages — Phase B.03e.
 *
 * Renders hard-coded legal content (passed as `children` — the document's
 * `Body` JSX from src/content/legal/*) inside the brand `.legal-doc` prose
 * chrome: a single-column cream card mirroring the M.10 accessibility page's
 * typographic treatment. The legal text is English-only, so the document body
 * is wrapped in `lang="en"`; the short localized `englishOnlyNote` sits above
 * it (inheriting the page locale) so a screen reader announces the note in the
 * page language but switches to English for the policy itself.
 *
 * The former Termly iframe embed (Path B) and its "being prepared" fallback
 * branch were both retired in B.03e — no third-party script, no TOC sidebar.
 */
export default function LegalPageBody({
  englishOnlyNote,
  children,
}: {
  englishOnlyNote: string;
  children: ReactNode;
}) {
  return (
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
          className="legal-doc"
          style={{
            background: 'var(--color-bg-cream)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-8) var(--spacing-6)',
            maxWidth: '72ch',
            margin: '0 auto',
          }}
        >
          <p className="legal-doc__note">{englishOnlyNote}</p>
          <div lang="en">{children}</div>
        </article>
      </div>
    </section>
  );
}
