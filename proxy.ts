import { NextResponse, type NextRequest } from "next/server";
import { getClientIp, isIpBlocked } from "@/lib/security/clientIp";
import { getSecurityConfig } from "@/lib/security/config";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function proxy(request: NextRequest) {
  const ip = getClientIp(request.headers);

  if (isIpBlocked(ip, getSecurityConfig().blockedIps)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );
  }

  return applySecurityHeaders(NextResponse.next());
}

// Support both the modern "proxy" convention (to silence deprecation) and the classic
// "middleware" export name so the security layer (IP blocklist + headers) is guaranteed
// to be picked up by Next.js request pipeline.
export { proxy as middleware };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
