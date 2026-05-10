import {Link} from '@/i18n/navigation';

export default function BlogPostNotFound() {
  return (
    <section className="bg-[var(--color-bg)] py-20 lg:py-24">
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
          <Link href="/blog/" prefetch={false} className="btn btn-primary btn-md">
            See all posts
          </Link>
        </div>
      </div>
    </section>
  );
}
