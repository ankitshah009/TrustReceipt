import { headers } from "next/headers";
import { getClientIp, isIpBlocked } from "./clientIp";
import { getSecurityConfig } from "./config";
import { RateLimitError, ServiceUnavailableError } from "./errors";
import {
  acquireConcurrentSlot,
  checkRateLimit,
  releaseConcurrentSlot,
} from "./rateLimit";

function assertApiKeyConfigured(): void {
  if (!process.env.GROK_API_KEY && !process.env.XAI_API_KEY) {
    throw new ServiceUnavailableError(
      "Live agent execution is not configured on this deployment.",
    );
  }
}

/** Enforce IP blocklist, rate limits, and concurrency before LLM calls. */
export async function beginLlmAction(): Promise<{ ip: string }> {
  assertApiKeyConfigured();

  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  const config = getSecurityConfig();

  if (isIpBlocked(ip, config.blockedIps)) {
    throw new RateLimitError(3600);
  }

  const limit = checkRateLimit(`llm:${ip}`);
  if (!limit.allowed) {
    throw new RateLimitError(limit.retryAfterSec);
  }

  if (!acquireConcurrentSlot(ip)) {
    throw new RateLimitError(30);
  }

  return { ip };
}

export function endLlmAction(ip: string): void {
  releaseConcurrentSlot(ip);
}
