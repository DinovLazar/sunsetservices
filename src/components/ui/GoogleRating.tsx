import {getTranslations} from 'next-intl/server';
import {Star} from 'lucide-react';
import {BUSINESS_RATING} from '@/lib/constants/reviews';

type GoogleRatingProps = {
  /**
   * Show the Google mark + numeric rating + review count + "Google reviews"
   * label — a real, verifiable claim sourced from `BUSINESS_RATING`. Default
   * (`false`) keeps the decorative 5-star motif only, so every surface that
   * doesn't opt in is unchanged.
   */
  detailed?: boolean;
  /** Surface tone for the `detailed` variant. */
  tone?: 'light' | 'dark';
  className?: string;
};

/** The multi-color Google "G" mark. */
function GoogleG({size = 18}: {size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
      style={{flexShrink: 0, display: 'block'}}
    >
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

/**
 * Five-star Google trust motif. By default it is a decorative `aria-hidden`
 * star row (no rating value, count, or "Google reviews" text — makes no claim
 * to assistive tech). Pass `detailed` to show the verifiable figure
 * (`4.8 ★ · 38 Google reviews`) with the Google mark — used in the homepage
 * credentials band. When `BUSINESS_RATING.url` is set the figure links to the
 * public profile so it stays checkable.
 */
export default async function GoogleRating({detailed = false, tone = 'light', className}: GoogleRatingProps) {
  if (!detailed) {
    return (
      <div
        aria-hidden="true"
        className={['inline-flex items-center gap-0.5', className].filter(Boolean).join(' ')}
        style={{color: 'var(--color-sunset-amber-500)'}}
      >
        {Array.from({length: 5}).map((_, i) => (
          <Star key={i} fill="currentColor" strokeWidth={0} style={{width: 18, height: 18}} />
        ))}
      </div>
    );
  }

  const t = await getTranslations('ratings');
  const value = BUSINESS_RATING.value.toFixed(1);
  const count = BUSINESS_RATING.count;
  const {url} = BUSINESS_RATING;

  const valueColor = tone === 'dark' ? 'var(--color-text-on-dark)' : 'var(--color-text-primary)';
  const labelColor = tone === 'dark' ? 'rgba(250,247,241,0.72)' : 'var(--color-text-secondary)';
  const ariaLabel = t('aria', {value, count});

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="inline-flex items-center gap-0.5"
        style={{color: 'var(--color-sunset-amber-500)'}}
      >
        {Array.from({length: 5}).map((_, i) => (
          <Star key={i} fill="currentColor" strokeWidth={0} style={{width: 16, height: 16}} />
        ))}
      </span>
      <GoogleG size={17} />
      <span
        aria-hidden="true"
        className="font-heading font-semibold"
        style={{fontSize: 'var(--text-body)', color: valueColor}}
      >
        {value}
      </span>
      <span aria-hidden="true" style={{fontSize: 'var(--text-body-sm)', color: labelColor}}>
        ({count}) {t('label')}
      </span>
    </>
  );

  const base = ['inline-flex items-center gap-2 flex-wrap', className].filter(Boolean).join(' ');

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={base}
        style={{textDecoration: 'none'}}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={base} role="img" aria-label={ariaLabel}>
      {inner}
    </div>
  );
}
