/**
 * Blog featured-image resolver.
 *
 * Sanity wins when an asset is present; otherwise falls back to the
 * Phase 1.18-seeded static placeholder at `/images/blog/<slug>.jpg`.
 *
 * Mirrors `resolveProjectImage.ts` / the `assetUrl()` helper in
 * `sanity-adapters.ts`: resolve the Sanity asset through `urlFor()` when a
 * `_ref` is present, wrap the transform in a try/catch so a malformed asset
 * can never crash the page, and fall back to the static path otherwise.
 *
 * Return shape matches the former local `fallbackImage()` / `fallbackBlogImage()`
 * helpers (`{src, width, height}`) so the blog call sites change minimally.
 */
import {urlFor} from '@sanity-lib/image';
import type {SanityImageAsset} from '@sanity-lib/types';

/** Default served dimensions — same 16:9 the seeded placeholders used. */
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

export function resolveBlogImage(
  featuredImage: SanityImageAsset | null | undefined,
  slug: string,
  targetWidth: number = DEFAULT_WIDTH,
  targetHeight: number = DEFAULT_HEIGHT,
): {src: string; width: number; height: number} {
  if (featuredImage?.asset?._ref) {
    try {
      const src = urlFor(featuredImage)
        .width(targetWidth)
        .height(targetHeight)
        .fit('crop')
        .auto('format')
        .url();
      return {src, width: targetWidth, height: targetHeight};
    } catch {
      // Malformed asset — fall through to the static placeholder.
    }
  }
  return {
    src: `/images/blog/${slug}.jpg`,
    width: targetWidth,
    height: targetHeight,
  };
}
