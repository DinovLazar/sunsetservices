import {LOCATIONS, type LocationCitySlug} from '@/data/locations';

/**
 * ServiceM8 webhook payload → job metadata extractor (Phase 2.17).
 *
 * The Phase 2.13 ingest route stores the original webhook body as a JSON
 * string under `servicem8Event.payload` and treats `payload.data` as
 * `z.record(z.unknown())` — Sanity carries the raw bytes without forcing a
 * schema migration. This helper projects the fields Phase 2.17 needs from
 * that opaque blob, with defensive fallbacks for every key.
 *
 * Field lookup orders (documented in Sunset-Services-Decisions.md
 * 2026-05-15 entry "Phase 2.17 plan-of-record"):
 *   - jobUuid:    payload.data.uuid → job_uuid → id
 *   - description: payload.data.job_description → description
 *   - address:    payload.data.job_address → address
 *   - attachments: payload.data.attachments[] filtered to {url: string}
 *
 * The inferred-* fields are HINTS the LLM consumes alongside the description.
 * The model may override them based on the full context; that's expected.
 *
 * NEVER throws. Every field can be `null` (or `[]` for attachments). At
 * flag-on time, re-confirm the assumed shape against Erick's real
 * ServiceM8 webhook output — if a field lives elsewhere, add a lookup
 * branch here.
 */

export type Audience = 'residential' | 'commercial' | 'hardscape';

export type JobMetadata = {
  jobUuid: string | null;
  description: string | null;
  address: string | null;
  /** Empty array when the payload has no attachments or none with a URL. */
  attachmentUrls: string[];
  inferredLocationSlug: LocationCitySlug | null;
  inferredAudience: Audience | null;
  inferredServiceSlug: string | null;
};

const COMMERCIAL_KEYWORDS = [
  'hoa',
  'property manager',
  'office',
  'commercial',
  'business',
  'retail',
  'condo',
  'townhome association',
];

const HARDSCAPE_KEYWORDS = [
  'patio',
  'retaining wall',
  'fire pit',
  'pergola',
  'paver',
  'unilock',
  'driveway',
  'outdoor kitchen',
];

const RESIDENTIAL_KEYWORDS = [
  'lawn',
  'tree',
  'sprinkler',
  'mulch',
  'snow removal',
];

// Real service slugs from src/data/services.ts. First keyword match wins.
// Order is intentional — more specific terms before generic ones.
const SERVICE_SLUG_RULES: Array<{slug: string; keywords: string[]}> = [
  {slug: 'outdoor-kitchens', keywords: ['outdoor kitchen', 'bbq island']},
  {slug: 'fire-pits-features', keywords: ['fire pit', 'water feature', 'fountain']},
  {slug: 'pergolas-pavilions', keywords: ['pergola', 'pavilion', 'gazebo']},
  {slug: 'retaining-walls', keywords: ['retaining wall']},
  {slug: 'driveways', keywords: ['driveway']},
  {slug: 'patios-walkways', keywords: ['patio', 'walkway', 'paver', 'unilock', 'flagstone']},
  {slug: 'sprinkler-systems', keywords: ['sprinkler', 'irrigation']},
  {slug: 'tree-services', keywords: ['tree removal', 'tree trim', 'stump']},
  {slug: 'snow-removal', keywords: ['snow removal', 'snow plow', 'salting']},
  {slug: 'seasonal-cleanup', keywords: ['leaf removal', 'fall cleanup', 'spring cleanup', 'seasonal cleanup']},
  {slug: 'turf-management', keywords: ['turf management', 'fertilization', 'weed control', 'aeration']},
  {slug: 'landscape-design', keywords: ['landscape design', 'landscape plan', 'planting design']},
  {slug: 'landscape-maintenance', keywords: ['landscape maintenance', 'grounds maintenance', 'mowing']},
  {slug: 'property-enhancement', keywords: ['property enhancement']},
  {slug: 'lawn-care', keywords: ['lawn care', 'lawn', 'turf']},
];

function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function pickRecordField(rec: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const candidate = asStringOrNull(rec[key]);
    if (candidate) return candidate;
  }
  return null;
}

function inferLocationSlug(address: string | null): LocationCitySlug | null {
  if (!address) return null;
  const haystack = address.toLowerCase();
  for (const loc of LOCATIONS) {
    if (haystack.includes(loc.name.toLowerCase())) return loc.slug;
  }
  return null;
}

function containsAny(haystack: string, needles: string[]): boolean {
  for (const n of needles) {
    if (haystack.includes(n)) return true;
  }
  return false;
}

function inferAudience(description: string | null): Audience | null {
  if (!description) return null;
  const haystack = description.toLowerCase();
  if (containsAny(haystack, COMMERCIAL_KEYWORDS)) return 'commercial';
  if (containsAny(haystack, HARDSCAPE_KEYWORDS)) return 'hardscape';
  if (containsAny(haystack, RESIDENTIAL_KEYWORDS)) return 'residential';
  return null;
}

function inferServiceSlug(description: string | null): string | null {
  if (!description) return null;
  const haystack = description.toLowerCase();
  for (const rule of SERVICE_SLUG_RULES) {
    if (containsAny(haystack, rule.keywords)) return rule.slug;
  }
  return null;
}

function extractAttachmentUrls(data: Record<string, unknown>): string[] {
  const raw = data.attachments;
  if (!Array.isArray(raw)) return [];
  const urls: string[] = [];
  for (const entry of raw) {
    if (entry && typeof entry === 'object') {
      const url = asStringOrNull((entry as Record<string, unknown>).url);
      if (url) urls.push(url);
    }
  }
  return urls;
}

export function extractJobMetadata(eventPayload: unknown): JobMetadata {
  const empty: JobMetadata = {
    jobUuid: null,
    description: null,
    address: null,
    attachmentUrls: [],
    inferredLocationSlug: null,
    inferredAudience: null,
    inferredServiceSlug: null,
  };

  if (!eventPayload || typeof eventPayload !== 'object') return empty;
  const root = eventPayload as Record<string, unknown>;

  const dataField = root.data;
  if (!dataField || typeof dataField !== 'object' || Array.isArray(dataField)) {
    return empty;
  }
  const data = dataField as Record<string, unknown>;

  const jobUuid = pickRecordField(data, ['uuid', 'job_uuid', 'id']);
  const description = pickRecordField(data, ['job_description', 'description']);
  const address = pickRecordField(data, ['job_address', 'address']);
  const attachmentUrls = extractAttachmentUrls(data);

  return {
    jobUuid,
    description,
    address,
    attachmentUrls,
    inferredLocationSlug: inferLocationSlug(address),
    inferredAudience: inferAudience(description),
    inferredServiceSlug: inferServiceSlug(description),
  };
}
