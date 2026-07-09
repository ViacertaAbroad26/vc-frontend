import axios, { type AxiosInstance } from "axios";

import { authStorage } from "./auth-storage";
import { devOverrideStorage } from "./dev-override";
import { normalizeError } from "./errors";
import { attachRefreshInterceptor } from "./refresh-interceptor";

type CreateOpts = {
  baseURL: string;
};

export function createAxios({ baseURL }: CreateOpts): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });

  // Request: attach JWT, or fall back to a local-dev identity override
  instance.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
      return config;
    }

    // Dev-only: lets a developer preview the app as any role/branch without
    // a seeded login. Backend ignores these unless AUTH_OPTIONAL=true and no
    // Authorization header is present (see app/deps.py) — never affects prod.
    if (import.meta.env.DEV) {
      const override = devOverrideStorage.get();
      if (override?.role) config.headers.set("X-Dev-Role", override.role);
      if (override?.userId) config.headers.set("X-Dev-User", override.userId);
      if (override?.studentId) config.headers.set("X-Dev-Student", override.studentId);
      if (override?.orgId) config.headers.set("X-Dev-Org", override.orgId);
    }

    return config;
  });

  // Refresh interceptor (handles 401 with one retry). Must run before the
  // normalize-errors interceptor below, since axios response interceptors
  // run in registration order on rejection too — if normalizeError ran
  // first, it would strip `error.config`/`error.response` and the refresh
  // interceptor would never see a retryable 401.
  attachRefreshInterceptor(instance);

  // Response: normalize errors to ApiError shape
  instance.interceptors.response.use(
    (resp) => resp,
    (error) => Promise.reject(normalizeError(error)),
  );

  return instance;
}
