// PHASE B.09 — two-tier rate limiter with swappable backend.
//
// Backend is selected once at module load via CHAT_RATELIMIT_STORE:
//   'memory' (default) — process-local Maps. Counters reset on Vercel
//                        function cold start and don't share across
//                        concurrent function instances. Preserved
//                        bit-for-bit from Phase 2.09 for local dev.
//   'kv'              — Upstash Redis via Vercel Marketplace integration.
//                        Persists across cold starts; shared across all
//                        function instances. Activate AFTER Cowork
//                        installs the Marketplace integration and the
//                        UPSTASH_REDIS_REST_* (or KV_REST_API_*) env vars
//                        are auto-injected on Production + Preview.
//
// Public surface is async on both branches so callers don't have to know
// which backend is live. See Sunset-Services-Decisions.md entry
// "2026-05-18 — Phase B.09 (Code) — Plan-of-record" for the full D1–D6.

import {Redis} from '@upstash/redis';
import {safeLogMeta} from '@/lib/logging/safeError';

const STORE = process.env.CHAT_RATELIMIT_STORE ?? 'memory';
const DAILY_LIMIT = Number(process.env.CHAT_DAILY_LIMIT_PER_IP ?? 50);
const BURST_INTERVAL_MS = Number(process.env.CHAT_BURST_INTERVAL_MS ?? 2000);
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
const BURST_TTL_S = Math.ceil(BURST_INTERVAL_MS / 1000);
const DAILY_TTL_S = 24 * 60 * 60;

export type RateLimitResult =
  | {allowed: true}
  | {allowed: false; reason: 'burst' | 'daily'; retryAfter: number};

// ---------- Memory backend (Phase 2.09 behavior, preserved bit-for-bit) ----------

type BurstRecord = {lastRequestMs: number};
type DailyRecord = {count: number; resetAt: number};

const burstMap = new Map<string, BurstRecord>();
const dailyMap = new Map<string, DailyRecord>();

function checkRateLimitMemory(ip: string): RateLimitResult {
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

// ---------- KV (Upstash Redis) backend ----------

let kvClient: Redis | null = null;
let unsetFlagWarned = false;

function getKvClient(): Redis {
  if (kvClient) return kvClient;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      '[ratelimit] CHAT_RATELIMIT_STORE=kv but no Upstash credentials in env ' +
        '(set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or the KV_REST_API_* aliases).',
    );
  }
  kvClient = new Redis({url, token});
  return kvClient;
}

async function checkRateLimitKv(ip: string): Promise<RateLimitResult> {
  try {
    const redis = getKvClient();
    const burstKey = `chat:burst:${ip}`;
    const dailyKey = `chat:daily:${ip}`;

    // Burst: SET key 1 NX EX <ttl>. Returns 'OK' on first request in window
    // (allowed) or null when the key already exists (blocked).
    const burstResult = await redis.set(burstKey, 1, {nx: true, ex: BURST_TTL_S});
    if (burstResult === null) {
      return {allowed: false, reason: 'burst', retryAfter: BURST_TTL_S};
    }

    // Daily: INCR + conditional EXPIRE on the first hit only.
    const count = await redis.incr(dailyKey);
    if (count === 1) {
      await redis.expire(dailyKey, DAILY_TTL_S);
    }
    if (count > DAILY_LIMIT) {
      const ttl = await redis.ttl(dailyKey);
      return {
        allowed: false,
        reason: 'daily',
        retryAfter: Math.max(1, Math.min(ttl, DAILY_TTL_S)),
      };
    }

    return {allowed: true};
  } catch (err) {
    // Fail-open: a transient Redis blip must not wedge the chat for every
    // visitor. The error is logged so Vercel function logs can surface it.
    console.error('[ratelimit] kv check failed', safeLogMeta('chat-rate-limit', err));
    return {allowed: true};
  }
}

// ---------- Public surface ----------

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (STORE === 'kv') {
    return checkRateLimitKv(ip);
  }
  if (STORE !== 'memory') {
    if (!unsetFlagWarned) {
      console.warn(
        `[ratelimit] CHAT_RATELIMIT_STORE=${JSON.stringify(STORE)} unrecognized, ` +
          'falling back to memory',
      );
      unsetFlagWarned = true;
    }
  }
  return Promise.resolve(checkRateLimitMemory(ip));
}
