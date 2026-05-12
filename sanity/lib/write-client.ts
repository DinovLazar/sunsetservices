import {createClient} from 'next-sanity';

/**
 * Server-only Sanity write client (Phase 2.06).
 *
 * Uses SANITY_API_WRITE_TOKEN (created Phase 2.05) and bypasses the CDN so
 * writes hit the live API. NEVER import this from a client component — the
 * token is server-only.
 *
 * Used by:
 *   - src/app/api/quote/route.ts            (full quote submissions)
 *   - src/app/api/quote/partial/route.ts    (Step 1–3 abandoner pushes)
 *
 * Both routes pin `runtime = 'nodejs'` because next-sanity's write client
 * uses Node-only APIs.
 */
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-10-01',
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});
