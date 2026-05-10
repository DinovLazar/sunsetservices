/**
 * Slug generator for prose H2/H3 ids — Phase 1.18 §13.4.
 *
 * Strips diacritics, kebab-cases, and dedupes by appending `-2`, `-3`, …
 * in document order via {@link createSlugFactory}. Asserted unique at
 * build (audit assertion #8).
 */

// Combining diacritical marks (U+0300–U+036F). RegExp built from a
// `\u`-escaped string so the source file remains pure ASCII.
const DIACRITICS = new RegExp('[̀-ͯ]', 'g');

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Stateful slug factory: returns a function that yields a unique slug for
 * each input, appending a numeric suffix on collisions in document order.
 */
export function createSlugFactory(): (input: string) => string {
  const seen = new Map<string, number>();
  return (input: string) => {
    const base = slugify(input) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}
