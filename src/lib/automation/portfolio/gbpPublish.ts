/**
 * Google Business Profile write-leg stubs (Phase 2.17 → Phase 2.17a).
 *
 * TODO Phase 2.17a — implement after Phase 2.14 ships the GBP write client.
 *
 * Phase 2.14 is gated on (a) Google's approval of the GBP API access
 * application (filed 2026-05-12, 2–6 week review window) and (b) Goran
 * providing `GBP_OAUTH_CLIENT_SECRET` + `GBP_OAUTH_REFRESH_TOKEN` (the
 * latter requires a 5-min screenshare while logged into the GBP-owner
 * account — mini-phase 2.14a).
 *
 * Until Phase 2.17a lands, both stubs gate on
 * `GBP_PORTFOLIO_PUBLISH_ENABLED='true'` (default false) AND the presence
 * of the GBP env vars. With either condition unmet, they return
 * `{skipped:true, reason:'gbp-deferred'}` so the rest of the publish flow
 * (Sanity project creation + Telegram confirmation) runs unaffected.
 *
 * Call sites in `publish.ts` stay unchanged when 2.17a swaps the stub
 * bodies for real implementations — only the function bodies below change.
 */

export type GbpUploadResult =
  | {skipped: true; reason: 'gbp-deferred' | 'flag-off' | 'missing-creds'}
  | {ok: true; mediaIds: string[]}
  | {ok: false; error: string};

export type GbpPostResult =
  | {skipped: true; reason: 'gbp-deferred' | 'flag-off' | 'missing-creds'}
  | {ok: true; postId: string}
  | {ok: false; error: string};

function gbpEnabled(): boolean {
  return process.env.GBP_PORTFOLIO_PUBLISH_ENABLED === 'true';
}

function gbpCredsPresent(): boolean {
  return (
    Boolean(process.env.GBP_OAUTH_CLIENT_ID) &&
    Boolean(process.env.GBP_OAUTH_CLIENT_SECRET) &&
    Boolean(process.env.GBP_OAUTH_REFRESH_TOKEN)
  );
}

export async function uploadPhotosToGbp(args: {
  assetUrls: string[];
  caption: string;
}): Promise<GbpUploadResult> {
  // TODO Phase 2.17a — upload args.assetUrls to GBP via the real client.
  if (!gbpEnabled()) {
    return {skipped: true, reason: 'gbp-deferred'};
  }
  if (!gbpCredsPresent()) {
    return {skipped: true, reason: 'missing-creds'};
  }
  // Real implementation lands in Phase 2.17a. Returning the deferred-reason
  // sentinel keeps the call site stable until then. caption + assetUrls are
  // intentionally unused right now.
  void args;
  return {skipped: true, reason: 'gbp-deferred'};
}

export async function createGoogleBusinessPost(args: {
  title: string;
  body: string;
  primaryPhotoAssetUrl: string;
  ctaUrl: string;
}): Promise<GbpPostResult> {
  // TODO Phase 2.17a — POST to mybusinessbusinessinformation/v1/.../localPosts.
  if (!gbpEnabled()) {
    return {skipped: true, reason: 'gbp-deferred'};
  }
  if (!gbpCredsPresent()) {
    return {skipped: true, reason: 'missing-creds'};
  }
  // Real implementation lands in Phase 2.17a.
  void args;
  return {skipped: true, reason: 'gbp-deferred'};
}

/**
 * Convert a GBP write result to a short string for the
 * portfolioDraftPending.gbpUploadResult audit field.
 */
export function summarizeGbpResult(result: GbpUploadResult | GbpPostResult): string {
  if ('skipped' in result && result.skipped) return `skipped:${result.reason}`;
  if ('ok' in result && result.ok) return 'ok';
  if ('error' in result) return `error:${result.error}`;
  return 'unknown';
}
