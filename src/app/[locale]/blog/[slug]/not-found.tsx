import {Link} from '@/i18n/navigation';

export default function BlogPostNotFound() {
  return (
    /* a11y remediation (SC 3.1.2 Language of Parts): every string below is
        hardcoded English, but this component also renders for /es/... — the
        segment sits under [locale]/layout.tsx, which emits <html lang="es">.
        A Spanish screen-reader voice was reading the whole page as Spanish.
        lang="en" marks the part honestly without inventing untranslated copy;
        it mirrors the existing pattern in src/components/legal/LegalPageBody.tsx.
        Proper localization (a notFoundBlog / notFoundResource namespace at
        EN/ES leaf-key parity) is the real fix and is logged for the owner. */
    <section lang="en" className="bg-[var(--color-bg)] py-20 lg:py-24">
      <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <p
          className="font-heading font-semibold uppercase m-0 mb-3"
          style={{
            fontSize: '13px',
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          404
        </p>
        <h1
          className="m-0 font-heading font-bold"
          style={{
            fontSize: 'var(--text-h1)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-snug)',
          }}
        >
          We couldn&rsquo;t find that post.
        </h1>
        <p
          className="m-0 mt-4 mx-auto"
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            maxWidth: '50ch',
          }}
        >
          The post may have moved. Browse the latest writing from the field.
        </p>
        <div className="mt-8">
          <Link href="/blog" prefetch={false} className="btn btn-primary btn-md">
            See all posts
          </Link>
        </div>
      </div>
    </section>
  );
}
