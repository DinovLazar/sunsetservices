/**
 * Single source of truth for the verifiable Google rating shown in the
 * homepage credentials band.
 *
 * 4.8★ is the real Google Business Profile figure (previously rendered as
 * 4.8 / 37; the count is bumped as reviews land). Keeping it here means the
 * numeric figure and the `aggregateRating` JSON-LD can never drift, and when a
 * live GBP reviews feed lands it overrides these values with no component
 * change — consistent with the "credentials you can verify" framing.
 */
export const BUSINESS_RATING: {value: number; count: number; url: string} = {
  value: 4.8,
  count: 38,
  /**
   * Public Google reviews URL. When set, the homepage rating links here so the
   * figure stays checkable. Leave '' to render as plain (non-link) text.
   */
  url: '',
};
