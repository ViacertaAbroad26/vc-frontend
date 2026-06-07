# 04 — API Client

> One package. Two entry points. Audience separation enforced at the import level.

## How it works

1. **`scripts/generate.ts`** fetches the backend's two OpenAPI specs and produces `generated/portal.d.ts` and `generated/advisor.d.ts` via `openapi-typescript`. These files are committed to the repo (deterministic builds) and regenerated on every backend change.
2. **`portal.ts`** wraps an axios client typed against `generated/portal.d.ts`. It exports `portalClient` (typed `GET/POST/PATCH/DELETE` methods) and re-exports allowed types.
3. **`advisor.ts`** does the same against `generated/advisor.d.ts`.
4. **`axios-instance.ts`** provides the shared base instance with JWT auth, refresh interceptor, error normalization.
5. Apps import only from their audience-appropriate entry: portal app → `@viacerta/api-client/portal`; advisor app → `@viacerta/api-client/advisor`. ESLint blocks the wrong one.

## Codegen

### `packages/api-client/scripts/generate.ts`

```ts
#!/usr/bin/env tsx
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import openapiTS from "openapi-typescript";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

const SPECS = [
  { url: `${BACKEND}/openapi.json`,         out: "src/generated/portal.d.ts" },
  { url: `${BACKEND}/advisor/openapi.json`, out: "src/generated/advisor.d.ts" },
];

const BANNER = `// AUTO-GENERATED — DO NOT EDIT
// Source: ViaCerta backend OpenAPI spec
// Regenerate: pnpm --filter @viacerta/api-client run generate
`;

async function main() {
  for (const { url, out } of SPECS) {
    process.stdout.write(`Fetching ${url}... `);
    const output = await openapiTS(url, {
      exportType: true,
      enum: true,
      formatOptions: { semi: true, singleQuote: false, trailingComma: "all" },
    });
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, BANNER + output, "utf8");
    process.stdout.write("done\n");
  }
  console.log("✓ Generated 2 spec files");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Run via `pnpm --filter @viacerta/api-client run generate` (after backend is up on `localhost:8000`).

## Base axios

### `packages/api-client/src/axios-instance.ts`

```ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { authStorage } from "./auth-storage";
import { attachRefreshInterceptor } from "./refresh-interceptor";
import { normalizeError } from "./errors";

type CreateOpts = {
  baseURL: string;
  audience: "portal" | "advisor";
};

export function createAxios({ baseURL, audience }: CreateOpts): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });

  // Request: attach JWT
  instance.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken(audience);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  // Response: normalize errors to ApiError shape
  instance.interceptors.response.use(
    (resp) => resp,
    (error) => Promise.reject(normalizeError(error)),
  );

  // Refresh interceptor (handles 401 with one retry)
  attachRefreshInterceptor(instance, audience);

  return instance;
}
```

### Auth storage

We use **localStorage** for tokens (not httpOnly cookies) because we need to read the access token to attach the Authorization header. Refresh-token rotation + reuse detection on the backend covers most of the cookie-vs-localStorage debate. **Caveat**: XSS would let an attacker exfiltrate the token; we mitigate via strict CSP + no `dangerouslySetInnerHTML` outside controlled contexts.

```ts
// packages/api-client/src/auth-storage.ts
type Audience = "portal" | "advisor";

const ACCESS_KEY = (a: Audience) => `viacerta:${a}:access`;
const REFRESH_KEY = (a: Audience) => `viacerta:${a}:refresh`;

export const authStorage = {
  getAccessToken(audience: Audience): string | null {
    return localStorage.getItem(ACCESS_KEY(audience));
  },
  getRefreshToken(audience: Audience): string | null {
    return localStorage.getItem(REFRESH_KEY(audience));
  },
  setTokens(audience: Audience, tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem(ACCESS_KEY(audience), tokens.accessToken);
    localStorage.setItem(REFRESH_KEY(audience), tokens.refreshToken);
  },
  clear(audience: Audience) {
    localStorage.removeItem(ACCESS_KEY(audience));
    localStorage.removeItem(REFRESH_KEY(audience));
  },
  clearAll() {
    this.clear("portal");
    this.clear("advisor");
  },
};
```

### Refresh interceptor

```ts
// packages/api-client/src/refresh-interceptor.ts
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { authStorage } from "./auth-storage";

type Audience = "portal" | "advisor";

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(baseURL: string, audience: Audience): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = authStorage.getRefreshToken(audience);
    if (!refresh) return null;
    try {
      const resp = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        { refreshToken: refresh },
        { timeout: 10_000 },
      );
      const tokens = resp.data.tokens;
      authStorage.setTokens(audience, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return tokens.accessToken;
    } catch {
      authStorage.clear(audience);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function attachRefreshInterceptor(instance: AxiosInstance, audience: Audience) {
  instance.interceptors.response.use(
    (resp) => resp,
    async (error) => {
      const original = error.config as InternalAxiosRequestConfig & { __retry?: boolean };
      const status = error?.response?.status;

      if (status !== 401 || original.__retry) {
        return Promise.reject(error);
      }
      // Don't try to refresh the refresh call itself
      if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }
      original.__retry = true;

      const newToken = await refreshTokens(instance.defaults.baseURL!, audience);
      if (!newToken) {
        // surface a clear "session expired" error; app routes back to /login
        window.dispatchEvent(new CustomEvent("viacerta:session-expired", { detail: { audience } }));
        return Promise.reject(error);
      }
      original.headers.set("Authorization", `Bearer ${newToken}`);
      return instance(original);
    },
  );
}
```

### Error normalization

```ts
// packages/api-client/src/errors.ts
import { AxiosError } from "axios";

export class ApiError extends Error {
  readonly status: number;
  readonly type: string;       // RFC 7807 'type' URI
  readonly title: string;
  readonly detail: string;
  readonly extras: Record<string, unknown>;
  constructor(opts: { status: number; type: string; title: string; detail: string; extras?: Record<string, unknown> }) {
    super(opts.detail || opts.title);
    this.status = opts.status;
    this.type = opts.type;
    this.title = opts.title;
    this.detail = opts.detail;
    this.extras = opts.extras ?? {};
  }
}

export class NetworkError extends Error {
  constructor() { super("Network error — please check your connection"); }
}

export class TimeoutError extends Error {
  constructor() { super("Request timed out"); }
}

export function normalizeError(err: unknown): Error {
  if (err instanceof AxiosError) {
    if (err.code === "ECONNABORTED") return new TimeoutError();
    if (!err.response) return new NetworkError();
    const body = err.response.data ?? {};
    return new ApiError({
      status: err.response.status,
      type: body.type ?? "https://viacerta.dev/errors/unknown",
      title: body.title ?? "Request failed",
      detail: body.detail ?? err.message,
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
```

## Audience-specific entries

### `packages/api-client/src/portal.ts`

```ts
import createClient from "openapi-fetch";
import type { paths as PortalPaths } from "./generated/portal";
import { createAxios } from "./axios-instance";

// We expose two layers:
//   1. portalAxios — raw axios for the rare case we need it (multipart uploads)
//   2. portalClient — openapi-fetch typed client
// Most code uses portalClient. Forms with files use portalAxios.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const portalAxios = createAxios({ baseURL: BASE_URL, audience: "portal" });

export const portalClient = createClient<PortalPaths>({
  baseUrl: BASE_URL,
  fetch: async (input, init) => {
    // route fetch through axios to reuse interceptors
    const url = typeof input === "string" ? input : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const resp = await portalAxios.request({
      url, method,
      data: init?.body,
      headers: Object.fromEntries(new Headers(init?.headers ?? {}).entries()),
    });
    return new Response(JSON.stringify(resp.data), {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  },
});

// Re-export the subset of types portal screens need
export type { components as PortalComponents } from "./generated/portal";

// Convenience exports of common shapes
export type StudentReport = PortalComponents["schemas"]["StudentReportResponse"];
export type StudentJourney = PortalComponents["schemas"]["StudentJourneyResponse"];
export type IntakeForm = PortalComponents["schemas"]["IntakeStartResponse"];
export type AuthEnvelope = PortalComponents["schemas"]["AuthEnvelope"];
// ... etc — keep this list trimmed to what's actually used
```

### `packages/api-client/src/advisor.ts`

```ts
import createClient from "openapi-fetch";
import type { paths as AdvisorPaths } from "./generated/advisor";
import { createAxios } from "./axios-instance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/advisor";

export const advisorAxios = createAxios({ baseURL: BASE_URL, audience: "advisor" });

export const advisorClient = createClient<AdvisorPaths>({
  baseUrl: BASE_URL,
  fetch: async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const resp = await advisorAxios.request({
      url, method, data: init?.body,
      headers: Object.fromEntries(new Headers(init?.headers ?? {}).entries()),
    });
    return new Response(JSON.stringify(resp.data), {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  },
});

export type { components as AdvisorComponents } from "./generated/advisor";

export type AdvisorAssessment = AdvisorComponents["schemas"]["AdvisorAssessmentResponse"];
export type CaseListResponse = AdvisorComponents["schemas"]["CaseListResponse"];
export type GcriResults = AdvisorComponents["schemas"]["GcriResultsResponse"];
export type AdvisorReport = AdvisorComponents["schemas"]["AdvisorReportResponse"];
```

## Usage in components

### Query

```tsx
// apps/portal/src/features/report/useStudentReport.ts
import { useQuery } from "@tanstack/react-query";
import { portalClient, type StudentReport } from "@viacerta/api-client/portal";

export function useStudentReport() {
  return useQuery({
    queryKey: ["studentReport", "latest"],
    queryFn: async (): Promise<StudentReport> => {
      const { data, error } = await portalClient.GET("/api/v1/portal/students/me/report");
      if (error) throw error;
      return data!;
    },
    staleTime: 60_000,
  });
}
```

### Mutation

```tsx
// apps/advisor/src/features/assessment/useGcssOverride.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advisorClient, type AdvisorComponents } from "@viacerta/api-client/advisor";

type OverrideBody = AdvisorComponents["schemas"]["OverrideRequest"];

export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: OverrideBody) => {
      const { data, error } = await advisorClient.POST(
        "/api/v1/advisor/students/{student_id}/assessment/override",
        { params: { path: { student_id: studentId } }, body },
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
      qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
```

### Multipart upload (raw axios)

```tsx
// apps/portal/src/features/documents/useDocumentUpload.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { portalAxios } from "@viacerta/api-client/portal";

export function useDocumentUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      const { data } = await portalAxios.post("/api/v1/portal/students/me/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}
```

### Error handling in UI

```tsx
import { isGcriGatingError, isValidationError } from "@viacerta/api-client/errors";

const trigger = useTriggerGcri(studentId);

const onClick = () => {
  trigger.mutate(body, {
    onError: (err) => {
      if (isGcriGatingError(err)) {
        toast.error(`Cannot run GCRI yet: ${err.detail}`);
      } else if (isValidationError(err)) {
        toast.error("Please check the form for errors");
      } else {
        toast.error("Something went wrong; please try again");
      }
    },
  });
};
```

## Codegen workflow

1. Backend dev makes an endpoint change → updates the OpenAPI spec automatically.
2. Frontend dev runs `pnpm generate-api`.
3. Git diff shows what changed in `generated/*.d.ts`.
4. If types changed in a breaking way, TypeScript compile fails — fix the call sites.
5. Commit both the generated files and the call-site fixes together.

This makes the contract between backend and frontend **enforceable via the type system**.

## What we don't do

- **No tRPC** — backend is Python; tRPC is JS-only.
- **No GraphQL codegen** — REST + OpenAPI is what backend serves.
- **No SWR** — TanStack Query covers the same ground with more features.
- **No fetch-only** — axios's interceptors are non-trivial to replicate; openapi-fetch sits on top of our axios for typing.
