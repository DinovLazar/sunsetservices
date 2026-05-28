/**
 * Phase M.01d — display-layer helper that strips a leading street number
 * from a project's address-bearing string. Sanity / `src/data/projects.ts`
 * keeps the full street address ("1227 Colchester Lane, Aurora"); the
 * rendered output reads "Colchester Lane, Aurora".
 *
 * The regex `^\d+(?:\/\d+)?\s+/` handles both single (`1227 Foo`) and
 * slash-separated leading numbers (`807/811 Edgewater`) — both occur in
 * the real M.01c photo corpus. No-op for any string that doesn't start
 * with digits.
 *
 * Phase M.10c (2026-05-27) extracted this from
 * `src/app/[locale]/projects/[slug]/page.tsx` into its own util so the
 * `/projects` index tile titles (addendum step A-extra) can reuse the
 * same render-time strip without importing across page boundaries.
 */
export function stripStreetNumber(address: string): string {
  return address.replace(/^\d+(?:\/\d+)?\s+/, '');
}
