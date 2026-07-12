export function safeErrorCode(error: unknown): string {
  if (error && typeof error === 'object') {
    const maybeStatusCode = 'statusCode' in error ? error.statusCode : undefined;
    if (typeof maybeStatusCode === 'number') return `http-${maybeStatusCode}`;

    const maybeStatus = 'status' in error ? error.status : undefined;
    if (typeof maybeStatus === 'number') return `http-${maybeStatus}`;

    const maybeCode = 'code' in error ? error.code : undefined;
    if (typeof maybeCode === 'string' && maybeCode.length > 0) return maybeCode;
  }

  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return 'timeout';
  }

  if (error instanceof Error && error.name) {
    return error.name;
  }

  return typeof error;
}

export function safeLogMeta(
  route: string,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {},
) {
  return {
    route,
    errorCode: safeErrorCode(error),
    ...extra,
  };
}

export type SanityErrorDescription = {
  statusCode?: number;
  message?: string;
  detail?: string;
};

/**
 * Pull the human-readable, PII-safe fields out of a Sanity `ClientError`
 * (or any thrown value). Sanity surfaces the API's structured error under a
 * few different shapes depending on the endpoint; we probe them in order and
 * take only the `description` string — never the echoed mutation payload,
 * which can carry the visitor's name/email/phone/address.
 *
 * The `statusCode` alone names the two dominant failure modes: a write with a
 * missing or read-only (Viewer) token returns HTTP 401/403 ("Insufficient
 * permissions; permission 'create' required"). That is what a Preview/
 * Production runtime log needs to say out loud so the write failure can never
 * again be diagnosed by guessing.
 */
export function describeSanityError(error: unknown): SanityErrorDescription {
  if (!error || typeof error !== 'object') {
    return {message: typeof error === 'string' ? error : undefined};
  }
  const e = error as Record<string, unknown>;

  const statusCode =
    typeof e.statusCode === 'number'
      ? e.statusCode
      : typeof e.status === 'number'
        ? e.status
        : undefined;

  const message =
    typeof e.message === 'string' && e.message.length > 0 ? e.message : undefined;

  return {statusCode, message, detail: extractSanityDescription(e)};
}

/**
 * Structured server-log payload for a failed Sanity write. Server-only —
 * this is written to the Vercel runtime log, never returned to the client.
 */
export function sanityErrorDetail(
  route: string,
  error: unknown,
  extra: Record<string, string | number | boolean | null | undefined> = {},
) {
  return {route, ...describeSanityError(error), ...extra};
}

function extractSanityDescription(e: Record<string, unknown>): string | undefined {
  const asRecord = (v: unknown): Record<string, unknown> | undefined =>
    v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
  const asString = (v: unknown): string | undefined =>
    typeof v === 'string' && v.length > 0 ? v : undefined;

  // 1. ClientError.details?.description
  const details = asRecord(e.details);
  const fromDetails = asString(details?.description);
  if (fromDetails) return fromDetails;

  // 2. ClientError.responseBody is a raw JSON string on some code paths.
  if (typeof e.responseBody === 'string') {
    try {
      const parsed = asRecord(JSON.parse(e.responseBody));
      const err = asRecord(parsed?.error);
      const desc = asString(err?.description) ?? asString(parsed?.message);
      if (desc) return desc;
    } catch {
      // Non-JSON body — ignore, fall through to the other probes.
    }
  }

  // 3. ClientError.response?.body?.error?.description
  const body = asRecord(asRecord(e.response)?.body);
  const bodyErr = asRecord(body?.error);
  return asString(bodyErr?.description) ?? asString(body?.message);
}
