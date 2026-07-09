# 04 — API Client

> One package. One entry point. Generated from both backend OpenAPI specs, merged.

## How it works

1. **`scripts/generate.ts`** fetches the backend's two OpenAPI specs (`/openapi.json` for student/parent endpoints and `/advisor/openapi.json` for advisor/internal endpoints), merges their `paths` and `components.schemas` objects into one spec object, and runs `openapi-typescript` once on the merged spec to produce `generated/api.d.ts`. This file is committed to the repo (deterministic builds) and regenerated on every backend change.
2. **`src/index.ts`** wraps an axios client typed against the merged `generated/api.d.ts`. It exports `apiClient` (typed `GET/POST/PATCH/DELETE` methods via `openapi-fetch`), `apiAxios` (raw axios for the rare case we need it, e.g. multipart uploads), `authStorage`, and re-exports the generated types.
3. **`axios-instance.ts`** provides the shared base instance with JWT auth, refresh interceptor, error normalization.
4. `apps/web` imports everything — `apiClient`, `apiAxios`, `authStorage`, and all generated types — from `@viacerta/api-client`. There is no `/portal` or `/advisor` subpath; `package.json` `exports` are just `"."` and `"./errors"`. Audience separation is enforced by `<RoleGate>` on routes, not by import-level type isolation — see CLAUDE.md's "Pattern 6" and [ADR-007](./ADR-007-single-app-merge.md).

## Codegen

### `packages/api-client/scripts/generate.ts`

```ts
#!/usr/bin/env tsx
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import openapiTS from "openapi-typescript";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

const SPECS = [
  `${BACKEND}/openapi.json`,
  `${BACKEND}/advisor/openapi.json`,
];

const OUT = "src/generated/api.d.ts";

const BANNER = `// AUTO-GENERATED — DO NOT EDIT
// Source: ViaCerta backend OpenAPI specs (/openapi.json + /advisor/openapi.json), merged
// Regenerate: pnpm --filter @viacerta/api-client run generate
`;

async function fetchSpec(url: string): Promise<Record<string, any>> {
  process.stdout.write(`Fetching ${url}... `);
  const resp = await fetch(url);
  const spec = await resp.json();
  process.stdout.write("done\n");
  return spec;
}

function mergeSpecs(specs: Record<string, any>[]): Record<string, any> {
  const [base, ...rest] = specs;
  const merged = structuredClone(base);

  for (const spec of rest) {
    merged.paths = { ...merged.paths, ...spec.paths };
    merged.components = {
      ...merged.components,
      schemas: {
        ...merged.components?.schemas,
        ...spec.components?.schemas,
      },
    };
  }

  return merged;
}

async function main() {
  const specs = await Promise.all(SPECS.map(fetchSpec));
  const merged = mergeSpecs(specs);

  const output = await openapiTS(merged, {
    exportType: true,
    enum: true,
    formatOptions: { semi: true, singleQuote: false, trailingComma: "all" },
  });

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, BANNER + output, "utf8");
  console.log(`✓ Generated ${OUT} from ${SPECS.length} merged specs`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Run via `pnpm --filter @viacerta/api-client run generate` (after backend is up on `localhost:8000`).

**Known sharp edge** (flagged as a follow-up in [ADR-007](./ADR-007-single-app-merge.md)): if both specs define a schema with the same name but different shapes, the spread-merge of `components.schemas` silently lets the later spec's version win. Not yet hit in practice — if it occurs, fix by namespacing the colliding schema names in `mergeSpecs` rather than reverting to two generated files.

## Base axios

### `packages/api-client/src/axios-instance.ts`

```ts
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { authStorage } from "./auth-storage";
import { attachRefreshInterceptor } from "./refresh-interceptor";
import { normalizeError } from "./errors";

type CreateOpts = {
  baseURL: string;
};

export function createAxios({ baseURL }: CreateOpts): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
  });

  // Request: attach JWT
  instance.interceptors.request.use((config) => {
    const token = authStorage.getAccessToken();
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
  attachRefreshInterceptor(instance);

  return instance;
}
```

### Auth storage

We use **localStorage** for tokens (not httpOnly cookies) because we need to read the access token to attach the Authorization header. Refresh-token rotation + reuse detection on the backend covers most of the cookie-vs-localStorage debate. **Caveat**: XSS would let an attacker exfiltrate the token; we mitigate via strict CSP + no `dangerouslySetInnerHTML` outside controlled contexts.

```ts
// packages/api-client/src/auth-storage.ts
const ACCESS_KEY = "viacerta:access";
const REFRESH_KEY = "viacerta:refresh";

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
```

There is a single `authStorage` namespace (`viacerta:access` / `viacerta:refresh`) for the whole app — no per-audience prefix.

### Refresh interceptor

```ts
// packages/api-client/src/refresh-interceptor.ts
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { authStorage } from "./auth-storage";

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(baseURL: string): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = authStorage.getRefreshToken();
    if (!refresh) return null;
    try {
      const resp = await axios.post(
        `${baseURL}/api/v1/auth/refresh`,
        { refreshToken: refresh },
        { timeout: 10_000 },
      );
      const tokens = resp.data.tokens;
      authStorage.setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      return tokens.accessToken;
    } catch {
      authStorage.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function attachRefreshInterceptor(instance: AxiosInstance) {
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

      const newToken = await refreshTokens(instance.defaults.baseURL!);
      if (!newToken) {
        // surface a clear "session expired" error; app routes back to /login
        window.dispatchEvent(new CustomEvent("viacerta:session-expired"));
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

## Single entry point

### `packages/api-client/src/index.ts`

```ts
import createClient from "openapi-fetch";
import type { paths, components } from "./generated/api";
import { createAxios } from "./axios-instance";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

// We expose two layers:
//   1. apiAxios — raw axios for the rare case we need it (multipart uploads)
//   2. apiClient — openapi-fetch typed client
// Most code uses apiClient. Forms with files use apiAxios.

export const apiAxios = createAxios({ baseURL: BASE_URL });

export const apiClient = createClient<paths>({
  baseUrl: BASE_URL,
  fetch: async (input, init) => {
    // route fetch through axios to reuse interceptors
    const url = typeof input === "string" ? input : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    const resp = await apiAxios.request({
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

export { authStorage } from "./auth-storage";

// Re-export the generated types
export type { paths, components } from "./generated/api";

// Convenience exports of common shapes — keep this list trimmed to what's actually used
export type StudentReport = components["schemas"]["StudentReportResponse"];
export type StudentJourney = components["schemas"]["StudentJourneyResponse"];
export type IntakeForm = components["schemas"]["IntakeStartResponse"];
export type AuthEnvelope = components["schemas"]["AuthEnvelope"];
export type AdvisorAssessment = components["schemas"]["AdvisorAssessmentResponse"];
export type CaseListResponse = components["schemas"]["CaseListResponse"];
export type GcriResults = components["schemas"]["GcriResultsResponse"];
export type AdvisorReport = components["schemas"]["AdvisorReportResponse"];
export type OutcomeCoverageResponse = components["schemas"]["OutcomeCoverageResponse"];
export type CohortOutcomeCoverage = components["schemas"]["CohortOutcomeCoverage"];
```

Both student/parent and advisor/internal types come from the same `paths`/`components` objects — there's no separate `PortalComponents`/`AdvisorComponents` split anymore. Any feature can import any type from `@viacerta/api-client`; the boundary that matters is which routes a role can reach (`<RoleGate>`), not which types a file can import.

## Usage in components

### Query

```tsx
// apps/web/src/features/report/useStudentReport.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient, type StudentReport } from "@viacerta/api-client";

export function useStudentReport() {
  return useQuery({
    queryKey: ["studentReport", "latest"],
    queryFn: async (): Promise<StudentReport> => {
      const { data, error } = await apiClient.GET("/api/v1/portal/students/me/report");
      if (error) throw error;
      return data!;
    },
    staleTime: 60_000,
  });
}
```

### Mutation

```tsx
// apps/web/src/features/assessment/useGcssOverride.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type components } from "@viacerta/api-client";

type OverrideBody = components["schemas"]["OverrideRequest"];

export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: OverrideBody) => {
      const { data, error } = await apiClient.POST(
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
// apps/web/src/features/documents/useDocumentUpload.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@viacerta/api-client";

export function useDocumentUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const form = new FormData();
      form.append("type", type);
      form.append("file", file);
      const { data } = await apiAxios.post("/api/v1/portal/students/me/documents", form, {
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

1. Backend dev makes an endpoint change → updates the relevant OpenAPI spec automatically.
2. Frontend dev runs `pnpm generate-api`.
3. Git diff shows what changed in `generated/api.d.ts`.
4. If types changed in a breaking way, TypeScript compile fails — fix the call sites.
5. Commit both the generated file and the call-site fixes together.

This makes the contract between backend and frontend **enforceable via the type system**.

## What we don't do

- **No tRPC** — backend is Python; tRPC is JS-only.
- **No GraphQL codegen** — REST + OpenAPI is what backend serves.
- **No SWR** — TanStack Query covers the same ground with more features.
- **No fetch-only** — axios's interceptors are non-trivial to replicate; openapi-fetch sits on top of our axios for typing.
