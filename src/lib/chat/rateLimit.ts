// PHASE 2.09 — in-memory rate limiter. Counters reset on Vercel function cold start.
// MUST BE REPLACED before Phase 3.13 DNS cutover. See Sunset-Services-Decisions.md
// entry "2026-05-12 — Phase 2.09 rate-limiter chosen + carryover".

type BurstRecord = {lastRequestMs: number};
type DailyRecord = {count: number; resetAt: number};

const burstMap = new Map<string, BurstRecord>();
const dailyMap = new Map<string, DailyRecord>();

const BURST_INTERVAL_MS = Number(process.env.CHAT_BURST_INTERVAL_MS ?? 2000);
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT_PER_IP ?? 50);
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult =
  | {allowed: true}
  | {allowed: false; reason: 'burst' | 'daily'; retryAfter: number};

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  const burst = burstMap.get(ip);
  if (burst && now - burst.lastRequestMs < BURST_INTERVAL_MS) {
    return {
      allowed: false,
      reason: 'burst',
      retryAfter: Math.ceil((BURST_INTERVAL_MS - (now - burst.lastRequestMs)) / 1000),
    };
  }

  let daily = dailyMap.get(ip);
  if (!daily || now >= daily.resetAt) {
    daily = {count: 0, resetAt: now + DAILY_WINDOW_MS};
    dailyMap.set(ip, daily);
  }
  if (daily.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: 'daily',
      retryAfter: Math.ceil((daily.resetAt - now) / 1000),
    };
  }

  burstMap.set(ip, {lastRequestMs: now});
  daily.count += 1;

  return {allowed: true};
}
