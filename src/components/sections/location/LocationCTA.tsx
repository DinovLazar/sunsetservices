import CTA from '@/components/sections/CTA';
import type {LocationCity} from '@/data/locations';

type LocationCTAProps = {
  location: LocationCity;
};

/**
 * LocationCTA — Phase 1.14 §4.9.
 *
 * Thin wrapper around the shared `<CTA>` with the city token interpolated
 * into `location.cta.h2` ("Let's design your {city} outdoor space.") via
 * the new `tokens` prop (Phase 1.14 D11).
 *
 * Per location surface alternation (D10), section 9 lands on `--color-bg`,
 * so `surface="bg"` instead of cream.
 */
export default function LocationCTA({location}: LocationCTAProps) {
  return (
    <CTA
      copyNamespace="location.cta"
      destination="/request-quote/"
      tokens={{city: location.name}}
      surface="bg"
      ariaId={`location-${location.slug}`}
    />
  );
}
