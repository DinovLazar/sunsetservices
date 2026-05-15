/**
 * Google Search Console fetcher — Phase 2.16 plumbing, Phase 3.15 activation.
 *
 * Returns a typed weekly summary (top queries, top pages, totals) for the
 * configured GSC_SITE_URL. The body is a TODO until Phase 3.15: when
 * GSC_ENABLED flips to 'true' AND domain verification on sunsetservices.us
 * is complete AND the service-account JSON is provisioned, the
 * implementation drops in here without changing the type signature.
 *
 * Defense-in-depth: the cron route gates the call on GSC_ENABLED already.
 * The internal flag check below is a second guard — if a future caller
 * forgets to gate, this function throws rather than silently returning
 * empty data.
 */

export interface WeeklySeoQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface WeeklySeoPageRow {
  page: string;
  clicks: number;
  impressions: number;
}

export interface WeeklySeoSummary {
  topQueries: WeeklySeoQueryRow[];
  topPages: WeeklySeoPageRow[];
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  rangeStart: string; // ISO date (YYYY-MM-DD)
  rangeEnd: string; // ISO date (YYYY-MM-DD)
}

export async function fetchWeeklySeoSummary(): Promise<WeeklySeoSummary> {
  // Defense-in-depth flag check. The cron route already gates on this; the
  // internal guard ensures a future caller can't accidentally drive the
  // function before Phase 3.15 lights up GSC.
  if (process.env.GSC_ENABLED !== 'true') {
    throw new Error('GSC_ENABLED is false — GSC fetcher is not callable yet (Phase 3.15)');
  }

  // ─────────────────── TODO(Phase 3.15) ───────────────────
  // Implementation lands here when Google Search Console ownership
  // verification on sunsetservices.us is complete and the service-account
  // JSON is provisioned. Steps:
  //
  //   1. Read GOOGLE_SERVICE_ACCOUNT_JSON env var (provisioned in Phase 2.10
  //      block of .env.local.example — references existing variable).
  //   2. Instantiate Google Auth client via google-auth-library:
  //
  //        const auth = new JWT({
  //          email: creds.client_email,
  //          key: creds.private_key,
  //          scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  //        });
  //
  //   3. POST to https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/searchAnalytics/query
  //      twice — once with dimensions=['query'] (rowLimit 10, sortBy clicks
  //      desc), once with dimensions=['page'] (rowLimit 10).
  //   4. Aggregate totals.
  //   5. Return the typed shape.
  //
  // Until Phase 3.15:
  //   - npm install google-auth-library (NOT currently a dependency —
  //     verify with `npm list google-auth-library` first; the Phase 2.10
  //     analytics chain may have already added it transitively).
  //   - Set GSC_ENABLED=true on Vercel Production after domain
  //     verification.
  //   - Set GSC_SITE_URL=sc-domain:sunsetservices.us on Vercel.
  //
  // The throw below is unreachable under normal config (the cron route
  // short-circuits on GSC_ENABLED!=='true' before reaching here, and the
  // flag-check above catches any other accidental call), but the explicit
  // pending-implementation message helps debugging if a future operator
  // forgets to wire one of the env-var pieces.
  throw new Error('GSC fetcher implementation pending — Phase 3.15');
}
