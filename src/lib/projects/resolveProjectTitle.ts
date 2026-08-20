/**
 * a11y remediation (WCAG 2.2 AA) — resolve a project's display **title** for
 * the locale being rendered, never returning an empty string.
 *
 * Why this exists. Every callsite previously read `project.title[locale]`
 * directly. For Sanity-adapted portfolio entries whose Spanish title has not
 * been authored yet, that expression evaluates to `''`, and the surrounding
 * element renders empty. The observable result on 2026-08-20 was six of the
 * ten `/es/projects/*` detail pages shipping a COMPLETELY EMPTY `<h1>`, plus
 * six empty card `<h3>`s on `/es/projects`, plus an empty `name` in the
 * Project JSON-LD and in the OG image. An empty `<h1>` is a WCAG failure
 * (SC 1.3.1 Info and Relationships, SC 2.4.6 Headings and Labels): a screen
 * reader announces a heading level with no text, and heading-navigation —
 * the primary way screen-reader users skim a page — lands on nothing.
 *
 * Resolution order:
 *   1. `title[locale]` — the authored title for this locale.
 *   2. `title.en` — English fallback. Deliberate: showing the English title
 *      on a Spanish page is a visible, honest degradation that keeps the
 *      document structurally sound, whereas an empty heading is silent and
 *      unrecoverable for AT users. The project's fabrication-free copy rule
 *      forbids inventing a Spanish title here, so falling back is the only
 *      correct automatic behaviour.
 *   3. `''` — only if BOTH locales are empty, which no current project hits.
 *
 * This is a resilience floor, NOT a substitute for the missing translations.
 * The six affected projects are listed in `docs/accessibility-report.md`
 * under "Needs owner decision" and still need real Spanish titles authored
 * in Sanity.
 *
 * Pure function. No side effects.
 */

type Locale = 'en' | 'es';

type LocalizedTitle = {en: string; es: string};

export function resolveProjectTitle(
  project: {title: LocalizedTitle},
  locale: Locale,
): string {
  const localized = project.title?.[locale]?.trim();
  if (localized) return localized;
  return project.title?.en?.trim() ?? '';
}
