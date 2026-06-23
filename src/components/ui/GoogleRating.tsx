import {Star} from 'lucide-react';

type GoogleRatingProps = {
  className?: string;
};

/**
 * Five-star visual trust motif. Per the operator's request the numeric rating
 * and review count were removed — only the stars remain, as a decorative
 * signal (no rating value, count, or "Google reviews" text). Decorative, so
 * it is `aria-hidden`; it makes no specific rating claim to assistive tech.
 */
export default function GoogleRating({className}: GoogleRatingProps) {
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
