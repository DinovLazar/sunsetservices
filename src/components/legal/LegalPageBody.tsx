import TermlyPolicyEmbed from './TermlyPolicyEmbed';

/**
 * Body wrapper for Privacy + Terms pages.
 *
 * Single column. The TOC sidebar was dropped in Phase B.03d: with the
 * iframe embed (Path B), Termly's headings live cross-origin in
 * `app.termly.io`'s DOM and cannot be enumerated to drive a scroll-spy.
 */
export default function LegalPageBody({type}: {type: 'privacy' | 'terms'}) {
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
        <article className="prose">
          <TermlyPolicyEmbed type={type} />
        </article>
      </div>
    </section>
  );
}
