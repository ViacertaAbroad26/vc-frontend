import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiError, NetworkError, TimeoutError, isValidationError, normalizeError } from "../src/errors";

describe("normalizeError", () => {
  it("maps a 422 response to ApiError flagged as a validation error", () => {
    const axiosErr = new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 422,
      data: { type: "https://viacerta.dev/errors/validation", title: "Validation failed", detail: "Bad input" },
      statusText: "Unprocessable Entity",
      headers: {},
      config: {} as never,
    });

    const err = normalizeError(axiosErr);
    expect(err).toBeInstanceOf(ApiError);
    expect(isValidationError(err)).toBe(true);
  });

  it("maps a timeout to TimeoutError", () => {
    const axiosErr = new AxiosError("timeout", "ECONNABORTED");
    expect(normalizeError(axiosErr)).toBeInstanceOf(TimeoutError);
  });

  it("maps a missing response to NetworkError", () => {
    const axiosErr = new AxiosError("Network Error");
    expect(normalizeError(axiosErr)).toBeInstanceOf(NetworkError);
  });

  it("passes through plain errors", () => {
    const err = new Error("boom");
    expect(normalizeError(err)).toBe(err);
  });
});
