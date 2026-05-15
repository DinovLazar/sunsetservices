import TermlyPolicyEmbed from './TermlyPolicyEmbed';

/**
 * Shared body for Privacy + Terms pages — Phase B.03.
 *
 * Two-column body: TOC sidebar slot (lg+) + content. The sidebar is
 * empty at B.03 (no Termly content to TOC over yet); B.04 populates it
 * once Termly docs are provisioned. Mobile-side accordion deferred to
 * B.04 for the same reason.
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
        className="mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 lg:[grid-template-columns:16rem_1fr] gap-10"
        style={{maxWidth: 'var(--container-default)'}}
      >
        <aside
          aria-hidden="true"
          className="hidden lg:block"
          style={{position: 'sticky', top: 96, alignSelf: 'start'}}
        />
        <article className="prose">
          <TermlyPolicyEmbed type={type} />
        </article>
      </div>
    </section>
  );
}
