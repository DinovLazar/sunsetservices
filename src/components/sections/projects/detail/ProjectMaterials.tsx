import AnimateIn from '@/components/global/motion/AnimateIn';
import type {Localized} from '@sanity-lib/types';

type Locale = 'en' | 'es';

/**
 * Materials — Phase M.18 (PSS-002 §2, "Materials").
 *
 * The bulleted materials list, with an optional intro note. The same `materials`
 * array the <ProjectFacts> table joins into one line, shown here as the list it
 * actually is ("Walls: Unilock Olde Quarry — tumbled, natural-quarried…").
 */
export default function ProjectMaterials({
  materials,
  note,
  heading,
  locale,
}: {
  materials: Localized[];
  note: Localized;
  heading: string;
  locale: Locale;
}) {
  const items = materials.map((m) => m[locale]).filter(Boolean);
  if (items.length === 0) return null;
  const intro = note[locale]?.trim();

  return (
    <section
      aria-labelledby="project-materials-h2"
      className="bg-[var(--color-bg-cream)] pt-10 pb-4 lg:pt-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <h2
            id="project-materials-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
              textWrap: 'balance',
            }}
          >
            {heading}
          </h2>

          {intro ? (
            <p
              className="mt-5 max-w-[var(--container-prose)]"
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-relaxed)',
                textWrap: 'pretty',
              }}
            >
              {intro}
            </p>
          ) : null}

          <ul className="mt-6 flex max-w-[var(--container-prose)] list-none flex-col gap-3 p-0">
            {items.map((item, i) => (
              <li
                key={i}
                className="relative pl-5"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-relaxed)',
                  textWrap: 'pretty',
                }}
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[0.7em] size-1.5 rounded-full"
                  style={{background: 'var(--color-sunset-green-700)'}}
                />
                {item}
              </li>
            ))}
          </ul>
        </AnimateIn>
      </div>
    </section>
  );
}
