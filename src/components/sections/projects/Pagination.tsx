import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {ProjectAudience} from '@/data/projects';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  audience: ProjectAudience | undefined;
};

/**
 * Pagination — Phase 1.15 §3.4 / D16. Numbered pages with prev/next
 * chevrons. Server-rendered `<a>` per page (NOT `<button>` — they
 * navigate). Disabled at boundaries via `aria-disabled` + `tabIndex={-1}`.
 *
 * URL contract:
 *   - `?page=1` is omitted (canonical is `/projects/` or
 *     `/projects/?audience=…`).
 *   - Combines with audience filter.
 *
 * Renders nothing when `totalPages <= 1`.
 */
export default async function Pagination({
  currentPage,
  totalPages,
  audience,
}: PaginationProps) {
  const t = await getTranslations('projects.pagination');

  if (totalPages <= 1) return null;

  function pageHref(n: number): string {
    const params = new URLSearchParams();
    if (audience) params.set('audience', audience);
    if (n > 1) params.set('page', String(n));
    const qs = params.toString();
    return qs ? `/projects/?${qs}` : '/projects/';
  }

  const pages = Array.from({length: totalPages}, (_, i) => i + 1);
  const prevPage = currentPage > 1 ? currentPage - 1 : 1;
  const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
  const atFirst = currentPage <= 1;
  const atLast = currentPage >= totalPages;

  // Shared visual style for buttons.
  const baseStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'var(--font-heading)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: 'var(--motion-fast)',
    transitionTimingFunction: 'var(--easing-standard)',
    textDecoration: 'none',
  };

  return (
    <nav
      aria-label="Projects pagination"
      className="bg-[var(--color-bg)] pb-14 lg:pb-20"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <ul className="m-0 p-0 list-none flex justify-center items-center gap-2">
          <li>
            {atFirst ? (
              <span
                aria-disabled="true"
                aria-label={t('prev')}
                style={{
                  ...baseStyle,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  opacity: 0.6,
                  pointerEvents: 'none',
                  cursor: 'default',
                }}
              >
                ←
              </span>
            ) : (
              <Link
                href={pageHref(prevPage)}
                aria-label={t('prev')}
                style={{
                  ...baseStyle,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  background: 'transparent',
                }}
              >
                ←
              </Link>
            )}
          </li>
          {pages.map((n) => {
            const isCurrent = n === currentPage;
            return (
              <li key={n}>
                {isCurrent ? (
                  <span
                    aria-current="page"
                    aria-label={t('pageLabel', {n})}
                    style={{
                      ...baseStyle,
                      background: 'var(--color-sunset-green-700)',
                      color: 'var(--color-text-on-dark)',
                      border: '1px solid transparent',
                    }}
                  >
                    {n}
                  </span>
                ) : (
                  <Link
                    href={pageHref(n)}
                    aria-label={t('pageLabel', {n})}
                    style={{
                      ...baseStyle,
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      background: 'transparent',
                    }}
                  >
                    {n}
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            {atLast ? (
              <span
                aria-disabled="true"
                aria-label={t('next')}
                style={{
                  ...baseStyle,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  opacity: 0.6,
                  pointerEvents: 'none',
                  cursor: 'default',
                }}
              >
                →
              </span>
            ) : (
              <Link
                href={pageHref(nextPage)}
                aria-label={t('next')}
                style={{
                  ...baseStyle,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  background: 'transparent',
                }}
              >
                →
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
