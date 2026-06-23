import {getTranslations} from 'next-intl/server';
import {Star} from 'lucide-react';
import {BUSINESS_RATING} from '@/lib/constants/reviews';

type GoogleRatingProps = {
  /** `light` for cream/white surfaces, `dark` for the charcoal trust band. */
  tone?: 'light' | 'dark';
  className?: string;
};

/**
 * The confirmed Google rating (4.8 ★ · 37 reviews), rendered identically on
 * every surface that carries it (homepage trust band, About credentials,
 * division social proof, location trust band). Step 2 / Hand-off B.
 *
 * The single source is `BUSINESS_RATING`; when the live GBP reviews feed lands
 * it overrides that constant and this component follows with no change. A
 * verifiable real figure — consistent with the M.14 "credentials you can
 * verify" framing (it is no longer an invented rating).
 */
export default async function GoogleRating({tone = 'light', className}: GoogleRatingProps) {
  const t = await getTranslations('ratings');
  const value = BUSINESS_RATING.value.toFixed(1);
  const count = BUSINESS_RATING.count;

  const valueColor = tone === 'dark' ? 'var(--color-text-on-dark)' : 'var(--color-text-primary)';
  const labelColor = tone === 'dark' ? 'rgba(250,247,241,0.72)' : 'var(--color-text-secondary)';

  return (
    <div
      className={['inline-flex items-center gap-2', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={t('aria', {value, count})}
    >
      <span aria-hidden="true" className="inline-flex items-center gap-0.5" style={{color: 'var(--color-sunset-amber-500)'}}>
        {Array.from({length: 5}).map((_, i) => (
          <Star key={i} fill="currentColor" strokeWidth={0} style={{width: 16, height: 16}} />
        ))}
      </span>
      <span
        aria-hidden="true"
        className="font-heading font-semibold"
        style={{fontSize: 'var(--text-body)', color: valueColor}}
      >
        {value}
      </span>
      <span aria-hidden="true" style={{fontSize: 'var(--text-body-sm)', color: labelColor}}>
        · {t('summary', {count})}
      </span>
    </div>
  );
}
