/**
 * Phase 2.05 — image resolver for Sanity-driven project pages.
 *
 * Sanity wins when an asset is present; otherwise falls back to the
 * Phase 1.16 `imageMap.ts` placeholders. Phase 2.04 (Cowork photo curation)
 * populates the Sanity side; until then every project resolves through
 * the fallback path and the page UX is unchanged from Phase 1.16.
 *
 * Return shape is intentionally `StaticImageData`-compatible so existing
 * consumers (`ProjectCard`, `ProjectHero`, `ProjectGallery`, etc.) keep
 * working without changes. The Sanity branch synthesizes a StaticImageData
 * with a transformed URL string + explicit width/height + a tiny LQIP
 * blur placeholder when the asset metadata carries one.
 */
import type {StaticImageData} from 'next/image';
import {urlFor} from '@sanity-lib/image';
import type {ProjectDetail, SanityImageAsset} from '@sanity-lib/types';
import {
  PROJECT_LEAD,
  PROJECT_GALLERY,
  PROJECT_BEFORE_AFTER,
} from '@/data/imageMap';

export type ImageKind = 'lead' | 'gallery' | 'before' | 'after';

type ResolveInput = {
  slug: string;
  sanityAsset?: SanityImageAsset;
  /** Required width/height when sourcing from Sanity (the StaticImageData target). */
  targetWidth?: number;
  targetHeight?: number;
};

function fromSanity({
  sanityAsset,
  targetWidth,
  targetHeight,
}: ResolveInput): StaticImageData | null {
  if (!sanityAsset) return null;
  const w = targetWidth ?? 1200;
  const h = targetHeight ?? 900;
  const url = urlFor(sanityAsset).width(w).height(h).fit('crop').auto('format').url();
  return {
    src: url,
    width: w,
    height: h,
    blurDataURL: undefined,
    blurWidth: 0,
    blurHeight: 0,
  } as StaticImageData;
}

/**
 * Resolve a project image for a specific kind. Returns the Sanity-served
 * `StaticImageData` if an asset is present, else falls back to the
 * Phase 1.16 placeholder map. Returns `null` only when no fallback exists
 * (rare — only if a slug is missing from `imageMap.ts` entirely).
 */
export function resolveProjectImage(
  slug: string,
  kind: ImageKind,
  options: {
    sanityAsset?: SanityImageAsset;
    index?: number;
    targetWidth?: number;
    targetHeight?: number;
  } = {},
): StaticImageData | null {
  const sanityOut = fromSanity({
    slug,
    sanityAsset: options.sanityAsset,
    targetWidth: options.targetWidth,
    targetHeight: options.targetHeight,
  });
  if (sanityOut) return sanityOut;
  switch (kind) {
    case 'lead':
      return PROJECT_LEAD[slug] ?? null;
    case 'gallery': {
      const i = options.index ?? 0;
      const arr = PROJECT_GALLERY[slug];
      if (!arr) return null;
      return arr[i] ?? arr[0] ?? null;
    }
    case 'before':
      return PROJECT_BEFORE_AFTER[slug]?.before ?? null;
    case 'after':
      return PROJECT_BEFORE_AFTER[slug]?.after ?? null;
    default:
      return null;
  }
}

/**
 * Convenience: resolve every gallery image for a Sanity-fetched project,
 * honoring the same fallback rule per-index. Caller picks the locale at
 * render time via `alt[locale]`.
 */
export function resolveProjectGallery(
  slug: string,
  galleryEntries: ProjectDetail['gallery'],
): {photo: StaticImageData; alt: ProjectDetail['gallery'][number]['alt']}[] {
  const fallbackArr = PROJECT_GALLERY[slug] ?? [];
  // Phase 2.05: gallery is always empty on Sanity side. Use fallback length.
  const count = galleryEntries.length > 0 ? galleryEntries.length : fallbackArr.length;
  const out: {photo: StaticImageData; alt: ProjectDetail['gallery'][number]['alt']}[] = [];
  for (let i = 0; i < count; i++) {
    const entry = galleryEntries[i];
    const sanityPhoto = fromSanity({
      slug,
      sanityAsset: entry?.image,
    });
    const photo = sanityPhoto ?? fallbackArr[i] ?? fallbackArr[0];
    if (!photo) continue;
    out.push({photo, alt: entry?.alt ?? {en: '', es: ''}});
  }
  return out;
}
