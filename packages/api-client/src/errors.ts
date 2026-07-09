import { AxiosError } from "axios";

export class ApiError extends Error {
  readonly status: number;
  readonly type: string; // RFC 7807 'type' URI
  readonly title: string;
  readonly detail: string;
  readonly extras: Record<string, unknown>;

  constructor(opts: {
    status: number;
    type: string;
    title: string;
    detail: string;
    extras?: Record<string, unknown>;
  }) {
    super(opts.detail || opts.title);
    this.status = opts.status;
    this.type = opts.type;
    this.title = opts.title;
    this.detail = opts.detail;
    this.extras = opts.extras ?? {};
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Network error — please check your connection");
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Request timed out");
  }
}

export function normalizeError(err: unknown): Error {
  if (err instanceof AxiosError) {
    if (err.code === "ECONNABORTED") return new TimeoutError();
    if (!err.response) return new NetworkError();
    const body = (err.response.data ?? {}) as Record<string, unknown>;
    return new ApiError({
      status: err.response.status,
      type: typeof body.type === "string" ? body.type : "https://viacerta.dev/errors/unknown",
      title: typeof body.title === "string" ? body.title : "Request failed",
      detail: typeof body.detail === "string" ? body.detail : err.message,
      extras: { ...body },
    });
  }
  return err instanceof Error ? err : new Error(String(err));
}

// Convenience type guards used in UI
export function isGcriGatingError(e: unknown): e is ApiError {
  return e instanceof ApiError && e.type.endsWith("/gcri-gating");
}
export function isEvidenceTooLow(e: unknown): e is ApiError {
  return e instanceof ApiError && e.type.endsWith("/evidence-too-low");
}
export function isValidationError(e: unknown): e is ApiError {
  return e instanceof ApiError && e.status === 422;
}
