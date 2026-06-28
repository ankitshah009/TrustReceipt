import { z } from "zod";
import { getSecurityConfig } from "./config";
import { ValidationError } from "./errors";

const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

function sanitizeText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ValidationError(`${field} is required.`);
  }
  if (controlChars.test(trimmed)) {
    throw new ValidationError(`${field} contains invalid characters.`);
  }
  return trimmed;
}

export function validateBrief(brief: string): string {
  const { briefMaxLength } = getSecurityConfig();
  const clean = sanitizeText(brief, "Product brief");
  if (clean.length > briefMaxLength) {
    throw new ValidationError(
      `Product brief must be at most ${briefMaxLength} characters.`,
    );
  }
  return clean;
}

export function validateIntent(intent: string): string {
  const { intentMaxLength } = getSecurityConfig();
  const clean = sanitizeText(intent, "Intent");
  if (clean.length > intentMaxLength) {
    throw new ValidationError(
      `Intent must be at most ${intentMaxLength} characters.`,
    );
  }
  return clean;
}

export function validateDraft(draft: string): string {
  const { briefMaxLength } = getSecurityConfig();
  const clean = sanitizeText(draft, "Draft");
  if (clean.length > briefMaxLength) {
    throw new ValidationError("Draft exceeds maximum allowed length.");
  }
  return clean;
}

export const plannerOutputSchema = z.object({
  keyFacts: z.array(z.string().max(2000)).max(50),
  plan: z.array(z.string().max(2000)).max(50),
  estimatedClaims: z.array(z.string().max(500)).max(100),
  sources: z.array(z.string().max(500)).max(50),
});
