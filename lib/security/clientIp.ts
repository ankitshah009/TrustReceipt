type HeaderLike = {
  get(name: string): string | null;
};

/** Best-effort client IP for Vercel / reverse proxies.
 * Prioritize platform-specific headers to avoid spoofing via X-Forwarded-For.
 */
export function getClientIp(headers: HeaderLike): string {
  // Prefer Vercel platform header first (harder to spoof from client)
  const vercelIp = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelIp) {
    return vercelIp.split(",")[0]?.trim() ?? vercelIp;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  // Fall back to X-Forwarded-For (common in proxies); take first hop
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}

export function isIpBlocked(ip: string, blockedList: readonly string[]): boolean {
  if (ip === "unknown") return false;
  return blockedList.includes(ip);
}
