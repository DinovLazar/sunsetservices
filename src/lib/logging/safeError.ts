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
