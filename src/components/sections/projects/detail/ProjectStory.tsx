import Image from 'next/image';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {urlFor} from '@sanity-lib/image';
import type {Localized, ProjectPhoto} from '@sanity-lib/types';

type Locale = 'en' | 'es';

export type StorySection = {
  /** Stable id for the section heading (used by aria-labelledby). */
  id: string;
  /** The writer's own heading, when they set one. */
  heading: Localized;
  /** The default heading when they didn't (localized, from the message catalog). */
  fallbackHeading: string;
  /** The section copy. Blank paragraphs split on empty lines. */
  body: Localized;
  /** The photos that belong to THIS section (before shots, evening shots, …). */
  photos: ProjectPhoto[];
};

/** A section is rendered only if it has copy or photos — never an empty heading. */
export function hasContent(section: StorySection, locale: Locale): boolean {
  return Boolean(section.body[locale]?.trim()) || section.photos.length > 0;
}

/**
 * The project story — Phase M.18 (PSS-002 §2, "The Project Feature Page").
 *
 * The heart of the change: a project is no longer one <ProjectNarrative> blob
 * followed by a bag of photos. It is a run of named sections — the site & the
 * goal, our approach, the work, the standout feature, the result, the long-term
 * value — and each section carries ITS OWN photos, so the "before" shots sit with
 * the paragraph about the site and the evening shots sit with the paragraph about
 * the lighting. That placement is the whole point of the standard.
 *
 * Every section is optional. A project with none of them renders nothing here and
 * the route falls back to the legacy narrative, so nothing already published moves.
 */
export default function ProjectStory({
  sections,
  locale,
}: {
  sections: StorySection[];
  locale: Locale;
}) {
  const visible = sections.filter((s) => hasContent(s, locale));
  if (visible.length === 0) return null;

  return (
    <div className="bg-[var(--color-bg-cream)]">
      {visible.map((section, index) => (
        <Section
          key={section.id}
          section={section}
          locale={locale}
          first={index === 0}
        />
      ))}
    </div>
  );
}

function Section({
  section,
  locale,
  first,
}: {
  section: StorySection;
  locale: Locale;
  first: boolean;
}) {
  const heading = section.heading[locale]?.trim() || section.fallbackHeading;
  const paragraphs = (section.body[locale] ?? '')
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
  const headingId = `project-${section.id}-h2`;

  return (
    <section
      aria-labelledby={headingId}
      className={`${first ? 'pt-14 lg:pt-20' : 'pt-10 lg:pt-14'} pb-4 [content-visibility:auto] [contain-intrinsic-size:auto_600px]`}
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id={headingId}
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
              maxWidth: '24ch',
            }}
          >
            {heading}
          </h2>

          {paragraphs.length > 0 ? (
            <div className="mt-6 max-w-[var(--container-prose)]">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className="m-0 mt-5 first:mt-0"
                  style={{
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)',
                    lineHeight: 'var(--leading-relaxed)',
                    textWrap: 'pretty',
                  }}
                >
                  {para}
                </p>
              ))}
            </div>
          ) : null}

          {section.photos.length > 0 ? (
            <SectionPhotos photos={section.photos} locale={locale} />
          ) : null}
        </AnimateIn>
      </div>
    </section>
  );
}

/**
 * The photos belonging to one section. One photo runs wide; two or more sit in a
 * responsive grid. Alt text is required in Sanity and written by the portal, so
 * it is always real — never a filename.
 */
function SectionPhotos({
  photos,
  locale,
}: {
  photos: ProjectPhoto[];
  locale: Locale;
}) {
  // Resolve each photo to a CDN url up front, dropping any whose asset is missing
  // (a half-filled row in Sanity must never render as a broken picture).
  const usable = photos
    .map((photo) => {
      const image = photo.image;
      if (!image?.asset?._ref) return null;
      try {
        return {
          src: urlFor(image).width(1600).fit('max').auto('format').url(),
          alt: photo.alt[locale] ?? '',
        };
      } catch {
        return null;
      }
    })
    .filter((p): p is {src: string; alt: string} => p !== null);

  if (usable.length === 0) return null;
  const single = usable.length === 1;

  return (
    <ul
      className={`mt-8 grid list-none gap-4 p-0 ${
        single ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
      }`}
    >
      {usable.map((photo, i) => {
        return (
          <li key={i} className="m-0">
            <div
              className={`relative w-full overflow-hidden rounded-[var(--radius-card,12px)] border border-[var(--color-border)] bg-[var(--color-bg-cream)] ${
                single ? 'aspect-[16/9]' : 'aspect-[4/3]'
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes={single ? '(max-width: 1024px) 100vw, 1100px' : '(max-width: 640px) 100vw, 50vw'}
                className="object-cover"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
