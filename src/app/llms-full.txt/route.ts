import {buildLlmsFullTxt} from '@/lib/seo/llms';

/**
 * Phase B.17 — `GET /llms-full.txt`.
 *
 * The expanded companion to `/llms.txt`: every service with its real
 * description, every city, and the full published blog / resource / project
 * inventory pulled from Sanity.
 *
 * Not `force-static`, unlike `llms.txt`: this one reads Sanity, so it follows
 * the same 30-minute ISR window the rest of the Sanity-driven surface uses.
 * A newly published post appears here on the same schedule it appears on
 * `/blog` — the two cannot visibly diverge, which is the point.
 *
 * `buildLlmsFullTxt()` swallows a Sanity failure internally and degrades to
 * the static half rather than throwing. A partial map served with a 200 is
 * more useful to a crawler than a 500, and a crawler that gets a 500 may back
 * off from the path for a long time.
 */
export const revalidate = 1800;

export async function GET(): Promise<Response> {
  const body = await buildLlmsFullTxt();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    },
  });
}
