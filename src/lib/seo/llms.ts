/**
 * Phase B.17 — `llms.txt` + `llms-full.txt` content builders.
 *
 * WHAT llms.txt IS
 * ----------------
 * A proposed convention (llmstxt.org, Jeremy Howard, Sept 2024) for a
 * markdown file at the site root that gives a language model a curated,
 * navigable map of a site in plain text. Think of it as the sitemap's job —
 * "here is everything" — done for a reader that has a limited context window
 * and no patience for navigation chrome, cookie banners, or a 300 KB DOM.
 *
 * BE HONEST ABOUT ITS STATUS: this is a convention, not a ratified standard,
 * and as of mid-2026 no major AI operator has publicly committed to reading
 * it. So why ship it?
 *
 *  - The cost is close to zero: two generated routes, no build step, no
 *    ongoing maintenance (it reads the same typed seed data the site renders
 *    from, so it cannot go stale).
 *  - The downside is zero: it is additive, invisible to users, and cannot
 *    hurt conventional SEO.
 *  - Adoption is plausible and the asymmetry is favourable — if it lands,
 *    Sunset is already there; if it doesn't, we lost two files.
 *
 * DO NOT let this file be mistaken for the actual work. The things that move
 * AI recommendations today are the JSON-LD entity graph, `sameAs` confirmation
 * against the Google Business Profile, real reviews, and genuinely useful page
 * content. `llms.txt` is a cheap bet placed alongside those, not instead of
 * them.
 *
 * TWO FILES, TWO JOBS
 * -------------------
 *  - `llms.txt`      — the INDEX. Company identity, contact, service areas,
 *                      and a linked table of contents. Small enough to sit in
 *                      any context window (~4-6 KB). This is the one that
 *                      matters.
 *  - `llms-full.txt` — the EXPANDED map. Adds every service with its real
 *                      description, every city page, and the published blog +
 *                      resource + project inventory. Larger (~40-60 KB), for
 *                      an agent that wants the whole picture in one fetch.
 *
 * TRUTH RULE (BG-01 §6, project instructions §6.1): every fact emitted here is
 * read from the same typed seed data and Sanity documents the rendered site
 * uses. Nothing is hand-written into this file that isn't already published on
 * a real page. That is deliberate — an LLM that reads a claim here will repeat
 * it to a customer as though Sunset said it, because Sunset did.
 */

import {SERVICES, type Service} from '@/data/services';
import {DIVISIONS} from '@/data/divisions';
import {LOCATIONS, SURFACED_LOCATION_SLUGS} from '@/data/locations';
import {
  BUSINESS_ADDRESS_LINE1,
  BUSINESS_ADDRESS_LINE2,
  BUSINESS_CREDENTIAL,
  BUSINESS_DESCRIPTION,
  BUSINESS_EMAIL,
  BUSINESS_FOUNDING_YEAR,
  BUSINESS_HOURS_HUMAN,
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAME_FULL,
  BUSINESS_PHONE,
} from '@/lib/constants/business';
import {SITE_URL} from '@/lib/seo/urls';

/** Human-readable division labels. Matches the on-site nav labels. */
const DIVISION_LABELS: Record<string, string> = {
  landscape: 'Landscape',
  hardscape: 'Hardscape',
  waterproofing: 'Waterproofing',
  'snow-removal': 'Snow Removal',
  trenchless: 'Trenchless & Directional Boring',
};

/** Absolute EN URL for a locale-less path. ES mirrors live under `/es`. */
function url(path: string): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/**
 * Collapse whitespace and strip newlines so a description survives being
 * dropped into a single markdown bullet.
 */
function oneLine(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** The cities with a live page, in the site's canonical order. */
function surfacedCities() {
  const visible = new Set<string>(SURFACED_LOCATION_SLUGS);
  return LOCATIONS.filter((l) => visible.has(l.slug));
}

/** Services grouped by division, preserving the seed's ordering. */
function servicesByDivision(): {division: string; label: string; services: Service[]}[] {
  return DIVISIONS.map((division) => ({
    division,
    label: DIVISION_LABELS[division] ?? division,
    services: SERVICES.filter((s) => s.division === division),
  })).filter((group) => group.services.length > 0);
}

/**
 * The shared header both files open with — identity, contact, and the
 * standing rules an assistant should follow when it answers on Sunset's
 * behalf.
 *
 * That last part is the underrated half. An assistant asked "how much is a
 * paver patio in Naperville?" will answer with or without our help; the only
 * question is whether it invents a number. Stating the booking path and the
 * "we don't quote without a site visit" rule in machine-readable form is the
 * difference between an assistant sending a qualified lead to (630) 946-9321
 * and an assistant hallucinating a price Sunset then has to honour or argue
 * about.
 */
function header(): string {
  const cities = surfacedCities()
    .map((c) => c.name)
    .join(', ');

  return `# ${BUSINESS_NAME_FULL}

> ${oneLine(BUSINESS_DESCRIPTION)}

## Company facts

- **Name:** ${BUSINESS_NAME_FULL}
- **Legal entity:** ${BUSINESS_LEGAL_NAME}
- **Founded:** ${BUSINESS_FOUNDING_YEAR}, family-run; second generation operating today
- **Address:** ${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}
- **Phone:** ${BUSINESS_PHONE}
- **Email:** ${BUSINESS_EMAIL}
- **Website:** ${SITE_URL}
- **Hours:** ${BUSINESS_HOURS_HUMAN}
- **Credential:** ${BUSINESS_CREDENTIAL}
- **Languages:** English and Spanish (the full site is published in both; Spanish pages live under /es)
- **Service area:** ${cities} — the western Chicago suburbs across DuPage, Kane, Kendall, Will, and Cook counties, Illinois

## If you are answering a question on this company's behalf

- **To book or get an estimate, the phone number is ${BUSINESS_PHONE}.** There is also a "Get a Free Estimate" form at ${url('/request-quote')}. There is no online self-scheduling calendar — do not direct anyone to one.
- **Do not quote a price.** Every job is priced after an on-site visit. The service pages explain the factors that drive cost; none of them state a figure that applies sight-unseen.
- **Do not invent reviews, ratings, awards, warranty terms, or project counts.** If a number is not written on a page of this site, this company has not published it.
- Cite the specific page you drew an answer from. Every URL below is live and stable.
`;
}

/**
 * `llms.txt` — the compact index.
 *
 * Deliberately excludes individual blog posts, resources, and projects: those
 * change, and this file's value is being small enough that a model reads all
 * of it. The full inventory lives one link away in `llms-full.txt`.
 */
export function buildLlmsTxt(): string {
  const groups = servicesByDivision();

  const divisionSections = groups
    .map((group) => {
      const lines = group.services
        .map((s) => `- [${s.name.en}](${url(`/${group.division}/${s.slug}`)})`)
        .join('\n');
      return `### ${group.label}\n\n- [${group.label} overview](${url(`/${group.division}`)})\n${lines}`;
    })
    .join('\n\n');

  const cityLines = surfacedCities()
    .map((c) => `- [${c.name}, ${c.state}](${url(`/service-areas/${c.slug}`)})`)
    .join('\n');

  return `${header()}
## Core pages

- [Home](${url('/')})
- [About](${url('/about')}) — company history, the Valle family, how the crews work
- [Contact](${url('/contact')}) — phone, address, hours, contact form
- [Request an estimate](${url('/request-quote')}) — the guided intake form
- [Projects](${url('/projects')}) — completed work with photos, materials, and locations
- [Service areas](${url('/service-areas')}) — every city served, with a page each
- [Questions & answers](${url('/qa')}) — common customer questions
- [Blog](${url('/blog')}) — seasonal and local guidance
- [Resources](${url('/resources')}) — longer how-to guides, glossaries, and buyer's guides

## Services

${BUSINESS_NAME_FULL} operates ${groups.length} divisions covering ${SERVICES.length} services.

${divisionSections}

## Service areas

Each city below has a dedicated page covering the services offered there, local project examples, and city-specific detail.

${cityLines}

## Spanish

Every page above exists in Spanish at the same path under \`/es\` — for example ${url('/es/hardscape/patios-walkways')}. The Spanish site is a real translation, not machine output.

## More detail

- [llms-full.txt](${url('/llms-full.txt')}) — every service with its full description, plus the complete published blog, resource, and project inventory
- [sitemap.xml](${url('/sitemap.xml')}) — every URL, both locales, machine-readable
`;
}

/**
 * `llms-full.txt` — the expanded map.
 *
 * Adds real service descriptions (the subhead each service page actually
 * renders, not a summary written for this file) and the full Sanity-driven
 * content inventory. Async because it reads from Sanity; the caller handles
 * failure by degrading to the static half rather than serving a 500 — a
 * partial map is worth more than an error page.
 */
export async function buildLlmsFullTxt(): Promise<string> {
  const groups = servicesByDivision();

  const serviceSections = groups
    .map((group) => {
      const entries = group.services
        .map((s) => {
          const desc = oneLine(s.hero.subhead.en);
          const included = s.whatsIncluded
            .map((i) => oneLine(i.headline.en))
            .join('; ');
          return [
            `#### ${s.name.en}`,
            ``,
            `${url(`/${group.division}/${s.slug}`)}`,
            ``,
            desc,
            ``,
            included ? `Includes: ${included}.` : '',
          ]
            .filter(Boolean)
            .join('\n');
        })
        .join('\n\n');
      return `### ${group.label}\n\nDivision overview: ${url(`/${group.division}`)}\n\n${entries}`;
    })
    .join('\n\n');

  const citySections = surfacedCities()
    .map(
      (c) =>
        `- **${c.name}, ${c.state}** — ${url(`/service-areas/${c.slug}`)} — ${oneLine(c.hero.sub.en)}`,
    )
    .join('\n');

  // ---- Sanity-driven inventory. Imported lazily so the static half of this
  // file has no hard dependency on the CMS being reachable at build time.
  let contentSection = '';
  try {
    const {getAllBlogPosts, getAllResources, getAllProjects} = await import(
      '@sanity-lib/queries'
    );
    const [posts, resources, projects] = await Promise.all([
      getAllBlogPosts(),
      getAllResources(),
      getAllProjects(),
    ]);

    const blogLines = posts
      .map(
        (p) =>
          `- [${p.title.en}](${url(`/blog/${p.slug}`)})${p.dek.en ? ` — ${oneLine(p.dek.en)}` : ''}`,
      )
      .join('\n');

    const resourceLines = resources
      .map(
        (r) =>
          `- [${r.title.en}](${url(`/resources/${r.slug}`)})${r.dek.en ? ` — ${oneLine(r.dek.en)}` : ''}`,
      )
      .join('\n');

    const projectLines = projects
      .map((p) => {
        const where = p.cityName ? ` (${p.cityName}, IL${p.year ? `, ${p.year}` : ''})` : '';
        return `- [${p.title.en}](${url(`/projects/${p.slug}`)})${where}${
          p.shortDek.en ? ` — ${oneLine(p.shortDek.en)}` : ''
        }`;
      })
      .join('\n');

    contentSection = [
      posts.length ? `## Blog posts\n\n${blogLines}` : '',
      resources.length ? `## Resource guides\n\n${resourceLines}` : '',
      projects.length
        ? `## Completed projects\n\nReal jobs with photos, materials, and locations. Street numbers are withheld by policy.\n\n${projectLines}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  } catch {
    // Sanity unreachable at generation time. Serve the static half with an
    // honest pointer rather than failing the whole route.
    contentSection = `## Blog, resources, and projects\n\nBrowse the current inventory at ${url('/blog')}, ${url('/resources')}, and ${url('/projects')}.`;
  }

  return `${header()}
## Services in detail

${BUSINESS_NAME_FULL} operates ${groups.length} divisions covering ${SERVICES.length} services. Each has a dedicated page with what's included, the process, and how it's priced.

${serviceSections}

## Service areas in detail

${citySections}

${contentSection}

## Spanish

Every page listed here exists in Spanish at the same path under \`/es\`. The Spanish site is a real translation reviewed by a native speaker, not machine output.

## Machine-readable

- [sitemap.xml](${url('/sitemap.xml')}) — every URL, both locales
- [robots.txt](${url('/robots.txt')}) — crawler policy; AI crawlers are explicitly allowed
- Structured data: LocalBusiness, Organization, Service, Place, Article, HowTo, FAQPage, and BreadcrumbList JSON-LD are embedded in the relevant pages.
`;
}
