#!/usr/bin/env node
/**
 * Walks every service in src/data/services.ts and reports any "related"
 * tile URL that would 404 (or burn a redirect) under the legacy
 * `audience`-based URL formula used by:
 *   - src/components/sections/service/ServiceRelated.tsx (`/${service.audience}/${service.slug}/`)
 *   - src/components/sections/projects/detail/ProjectFacts.tsx (`/${s.audience}/${s.slug}/`)
 *
 * Phase M.01e canonical URL shape is `/${service.division}/${service.slug}/`.
 *
 * Exit code:
 *   0 — every related URL resolves to a canonical division URL.
 *   1 — at least one tile would render a broken link.
 *
 * Usage: node scripts/validate-related-links.mjs
 */

// tsx is a devDependency; use its programmatic `tsImport` to load the .ts seed
// for this one import. tsx 4.x requires this API (the legacy
// `module.register('tsx/esm', ...)` path errors with "tsx must be loaded with
// --import instead of --loader" on Node >= 20.6 / >= 18.19, and the
// `register()` form hits ERR_REQUIRE_CYCLE_MODULE when the caller itself is
// plain .mjs rather than running under tsx).
const {tsImport} = await import('tsx/esm/api');
const servicesModule = await tsImport('../src/data/services.ts', import.meta.url);
// tsx wraps the ESM namespace under `default` when bridging to CJS-compat,
// so fall back to the wrapped shape when the direct named export is absent.
const {SERVICES} = servicesModule.SERVICES ? servicesModule : servicesModule.default;

const canonical = new Set(
  SERVICES.map((s) => `/${s.division}/${s.slug}/`),
);

const broken = [];
for (const svc of SERVICES) {
  for (const relatedSlug of svc.related) {
    const related = SERVICES.find((s) => s.slug === relatedSlug);
    if (!related) {
      broken.push({
        from: `${svc.division}/${svc.slug}`,
        relatedSlug,
        rendered: '(no match in SERVICES)',
        reason: 'related slug not found',
      });
      continue;
    }
    // Mirror the buggy ServiceRelated.tsx formula exactly.
    const rendered = `/${related.audience}/${related.slug}/`;
    if (!canonical.has(rendered)) {
      broken.push({
        from: `${svc.division}/${svc.slug}`,
        relatedSlug,
        rendered,
        reason: related.audience === undefined ? 'related.audience is undefined' : 'audience-rooted URL is not a canonical route',
      });
    }
  }
}

if (broken.length === 0) {
  console.log('OK — every related tile URL is a canonical /<division>/<slug>/ route.');
  process.exit(0);
}

console.error(`FAIL — ${broken.length} related tile(s) would 404 or redirect under the legacy formula:`);
for (const b of broken) {
  console.error(`  ${b.from}  →  ${b.relatedSlug}  rendered as ${b.rendered}  (${b.reason})`);
}
process.exit(1);
