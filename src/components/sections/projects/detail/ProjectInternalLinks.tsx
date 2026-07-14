import AnimateIn from '@/components/global/motion/AnimateIn';
import {Link} from '@/i18n/navigation';
import type {ProjectLink} from '@sanity-lib/types';

type Locale = 'en' | 'es';

/** A path on this site — never an off-site URL (the schema enforces the same rule). */
const SITE_PATH = /^\/[A-Za-z0-9/_-]*$/;

/**
 * Internal links from a project page — Phase M.18 (PSS-002 §2, "Internal links").
 *
 * The services, the division, and the city page this job belongs to. These exist
 * for the reader first and the crawler second: a project page that links nowhere
 * is a dead end in the site's internal link graph.
 *
 * Hrefs are locale-less and rendered through the next-intl <Link>, which prepends
 * the locale — the same rule the breadcrumb follows (Phase M.11b: passing
 * `/${loc}/…` here double-prefixes and 404s). Anything that isn't a site path is
 * dropped rather than rendered as a link to nowhere.
 */
export default function ProjectInternalLinks({
  links,
  heading,
  locale,
}: {
  links: ProjectLink[];
  heading: string;
  locale: Locale;
}) {
  const usable = links.filter(
    (l) => l.label[locale]?.trim() && l.href && SITE_PATH.test(l.href),
  );
  if (usable.length === 0) return null;

  return (
    <section
      aria-labelledby="project-links-h2"
      className="bg-[var(--color-bg-cream)] pb-12 lg:pb-16"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-links-h2"
            className="m-0 mb-4 font-heading font-semibold uppercase"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {heading}
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
            {usable.map((link, i) => (
              <li key={i} className="m-0">
                <Link
                  href={link.href}
                  className="link link-inline"
                  style={{color: 'var(--color-sunset-green-700)', fontWeight: 500}}
                >
                  {link.label[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
