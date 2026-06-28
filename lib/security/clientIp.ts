type HeaderLike = {
  get(name: string): string | null;
};

/** Best-effort client IP for Vercel / reverse proxies. */
export function getClientIp(headers: HeaderLike): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const vercelIp = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelIp) return vercelIp.split(",")[0]?.trim() ?? vercelIp;

  return "unknown";
}

export function isIpBlocked(ip: string, blockedList: readonly string[]): boolean {
  if (ip === "unknown") return false;
  return blockedList.includes(ip);
}
