export class RateLimitError extends Error {
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number) {
    super(
      `Too many workflow requests. Please wait ${retryAfterSec} seconds before trying again.`,
    );
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ServiceUnavailableError extends Error {
  constructor(message = "AI workflow is temporarily unavailable.") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}
