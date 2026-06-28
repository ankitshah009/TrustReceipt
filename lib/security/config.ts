/** Rate-limit and abuse-prevention settings (override via env). */

function readInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getSecurityConfig() {
  return {
    maxActionsPerWindow: readInt("TRUST_RECEIPT_RATE_LIMIT_ACTIONS", 24),
    windowMs: readInt("TRUST_RECEIPT_RATE_LIMIT_WINDOW_MS", 60 * 60 * 1000),
    maxConcurrentPerIp: readInt("TRUST_RECEIPT_MAX_CONCURRENT", 2),
    briefMaxLength: readInt("TRUST_RECEIPT_BRIEF_MAX_LENGTH", 8000),
    intentMaxLength: readInt("TRUST_RECEIPT_INTENT_MAX_LENGTH", 512),
    disableRateLimit: process.env.TRUST_RECEIPT_DISABLE_RATE_LIMIT === "true",
    blockedIps: (process.env.TRUST_RECEIPT_BLOCKED_IPS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  } as const;
}

/** @deprecated use getSecurityConfig() for runtime env reads */
export const SECURITY_CONFIG = getSecurityConfig();
