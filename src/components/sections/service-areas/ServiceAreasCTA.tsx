import CTA from '@/components/sections/CTA';

/**
 * ServiceAreasCTA — Phase 1.14 §3.5.
 *
 * Thin wrapper around the shared `<CTA>` (Phase 1.14, no tokens needed).
 * The page's only amber button (D11). Surface: `--color-bg-cream`.
 */
export default function ServiceAreasCTA() {
  return (
    <CTA
      copyNamespace="serviceAreas.cta"
      destination="/request-quote/"
      surface="cream"
      ariaId="service-areas"
    />
  );
}
