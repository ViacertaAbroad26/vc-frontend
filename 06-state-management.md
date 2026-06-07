# 06 — State Management

> **Server state** lives in TanStack Query. **Client/UI state** lives in Zustand or `useState`. Never the two crossed.

## The split

| Kind of state | Where it lives | Examples |
|---|---|---|
| Anything from the API | TanStack Query | assessment, report, journey, case list, intake form definition |
| Auth: current user + tokens | Zustand `auth-store` | `useAuthStore` |
| In-flight intake answers (cached before save) | Zustand `intake-store` | optimistic save buffer |
| Open dialogs, drawers | `useState` in the parent | `<OverrideDialog open={...}>` |
| Filters on a list page (URL params) | URL via `useSearchParams` | `?state=AI_PRESCORED&flag=YELLOW` |
| Form fields | react-hook-form | every form |

## TanStack Query setup

```ts
// apps/portal/src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@viacerta/api-client/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, err) => {
        // Don't retry on 4xx
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
```

Mount in `App.tsx`:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
</QueryClientProvider>
```

## Query key conventions

| Resource | Key |
|---|---|
| Current user | `["auth", "me"]` |
| Student journey | `["journey", studentId]` |
| Student report | `["studentReport", "latest"]` |
| Intake form definition (by persona) | `["intakeForm", persona]` |
| Intake submission | `["intakeSubmission", submissionId]` |
| Documents | `["documents"]` |
| Advisor: case list | `["advisor", "cases", filters]` where `filters = { state, flag }` |
| Advisor: student detail | `["advisor", "student", studentId]` |
| Advisor: assessment | `["advisor", "assessment", studentId]` |
| Advisor: gcri results | `["advisor", "gcri", studentId]` |
| Advisor: report (in progress) | `["advisor", "report", studentId]` |

Rules:

- Keys are **read-shaped**, not endpoint-shaped. "What does the UI render?" → that's the key.
- Filters become part of the key, deep-equality compared by RQ.
- Mutations invalidate only the keys whose data they actually change.

## One file per query

Naming: `use<Subject>` (singular: subject of the query). Each file exports the hook + the type it returns. Co-located with the feature.

```tsx
// apps/portal/src/features/journey/useJourney.ts
import { useQuery } from "@tanstack/react-query";
import { portalClient, type PortalComponents } from "@viacerta/api-client/portal";

export type StudentJourney = PortalComponents["schemas"]["StudentJourneyResponse"];

export function useJourney() {
  return useQuery({
    queryKey: ["journey"],
    queryFn: async (): Promise<StudentJourney> => {
      const { data, error } = await portalClient.GET("/api/v1/portal/students/me/journey");
      if (error) throw error;
      return data!;
    },
    refetchInterval: (q) => {
      // Poll faster while AI pre-score is pending
      const d = q.state.data;
      if (d?.currentState === "INTAKE_COMPLETE" || d?.currentState === "AI_PRESCORED") {
        return 10_000;
      }
      return false;
    },
  });
}
```

## Mutations + invalidation

```tsx
// apps/advisor/src/features/assessment/useConfirmAssessment.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advisorClient } from "@viacerta/api-client/advisor";

export function useConfirmAssessment(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await advisorClient.POST(
        "/api/v1/advisor/students/{student_id}/assessment/confirm",
        { params: { path: { student_id: studentId } } },
      );
      if (error) throw error;
      return data!;
    },
    onSuccess: () => {
      // The state transition affects: assessment + journey + cases queue
      qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
      qc.invalidateQueries({ queryKey: ["advisor", "student", studentId] });
      qc.invalidateQueries({ queryKey: ["advisor", "cases"] });
    },
  });
}
```

## Optimistic updates

Apply selectively — only where the user benefits from immediate feedback and the rollback story is clean. The GCSS override is a good candidate:

```tsx
// apps/advisor/src/features/assessment/useGcssOverride.ts
export function useGcssOverride(studentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: OverrideBody) => { /* ... */ },
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["advisor", "assessment", studentId] });
      const previous = qc.getQueryData<AdvisorAssessment>(["advisor", "assessment", studentId]);
      if (previous) {
        qc.setQueryData(["advisor", "assessment", studentId], applyOverrideLocally(previous, body));
      }
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(["advisor", "assessment", studentId], ctx.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["advisor", "assessment", studentId] });
    },
  });
}
```

Not for confirm, publish, or any state-machine transition — those need server confirmation before reflecting in UI.

## Polling vs websockets

We use **polling** for MVP. Specifically:

| Surface | Cadence |
|---|---|
| `/journey` while in `INTAKE_COMPLETE` or `AI_PRESCORED` | every 10s |
| Advisor case queue | every 30s when tab focused |
| Report status (rendering PDF) | every 5s on the pending page |

Polls stop when the data reaches a terminal state. No websockets, no SSE, no broker plumbing in MVP. Revisit if specific UX needs it.

## Zustand stores

### auth-store

Already shown in `docs/05-auth-and-routing.md`.

### intake-store — save-and-resume buffer

The intake form is long. We auto-save to the server with a debounced PATCH every 5 seconds. But we also keep a local buffer in case the network is flaky — when the user types into a question, we update the buffer synchronously; the debounced effect flushes to the server.

```ts
// apps/portal/src/stores/intake-store.ts
import { create } from "zustand";

type IntakeState = {
  buffer: Record<string, unknown>;       // questionId → answer
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  setAnswer: (id: string, value: unknown) => void;
  markSaved: () => void;
  markSavingStart: () => void;
  reset: () => void;
};

export const useIntakeStore = create<IntakeState>((set) => ({
  buffer: {},
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  setAnswer: (id, value) =>
    set((s) => ({ buffer: { ...s.buffer, [id]: value }, isDirty: true })),
  markSavingStart: () => set({ isSaving: true }),
  markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: Date.now() }),
  reset: () => set({ buffer: {}, isDirty: false, isSaving: false, lastSavedAt: null }),
}));
```

Used by the intake form:

```tsx
// apps/portal/src/features/intake/IntakeForm.tsx (excerpt)
import { useEffect } from "react";
import { useIntakeStore } from "@/stores/intake-store";
import { useIntakeSave } from "./useIntakeSave";

const DEBOUNCE_MS = 1500;

export function IntakeForm({ submissionId }: { submissionId: string }) {
  const { buffer, isDirty, markSavingStart, markSaved } = useIntakeStore();
  const save = useIntakeSave(submissionId);

  useEffect(() => {
    if (!isDirty) return;
    const handle = setTimeout(() => {
      markSavingStart();
      save.mutate({ answers: buffer }, { onSuccess: markSaved });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [buffer, isDirty, save, markSavingStart, markSaved]);

  // ... render form ...
}
```

`<SaveResumeIndicator />` reads from `useIntakeStore` and shows "Saving…" / "Saved 5s ago" in the header.

## URL state for filters

Case queue filters belong in the URL — bookmarks, deep links, refresh-survive.

```tsx
// apps/advisor/src/features/cases/CaseQueue.tsx (excerpt)
import { useSearchParams } from "react-router-dom";

const [params, setParams] = useSearchParams();
const state = params.get("state") ?? undefined;
const flag = params.get("flag") ?? undefined;

const { data } = useCases({ state, flag });
```

`useCases` keys the query off these filter values so changing the URL refetches.

## Local UI state via `useState`

Dialogs and toggles. Simple. No store.

```tsx
function StudentDetail() {
  const [overrideOpen, setOverrideOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOverrideOpen(true)}>Override sub-score</Button>
      <OverrideDialog open={overrideOpen} onOpenChange={setOverrideOpen} />
    </>
  );
}
```

## AsyncBoundary — the shape we render around every async query

```tsx
// packages/ui/src/feedback/AsyncBoundary.tsx
import { type ReactNode } from "react";
import { Spinner } from "./Spinner";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

type Props<T> = {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  isEmpty?: (d: T) => boolean;
  children: (data: T) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (err: unknown) => ReactNode;
  emptyFallback?: ReactNode;
};

export function AsyncBoundary<T>({
  isLoading, error, data, isEmpty, children,
  loadingFallback, errorFallback, emptyFallback,
}: Props<T>) {
  if (isLoading) return <>{loadingFallback ?? <Spinner />}</>;
  if (error)    return <>{errorFallback ? errorFallback(error) : <ErrorState error={error} />}</>;
  if (data === undefined) return <>{loadingFallback ?? <Spinner />}</>;
  if (isEmpty?.(data))    return <>{emptyFallback ?? <EmptyState />}</>;
  return <>{children(data)}</>;
}
```

Used everywhere a query renders. Loading / error / empty become first-class, not afterthoughts.

```tsx
const { data, isLoading, error } = useStudentReport();
return (
  <AsyncBoundary
    isLoading={isLoading}
    error={error}
    data={data}
    errorFallback={(err) => <ReportLoadFailed error={err} />}
  >
    {(report) => <StudentReportView report={report} />}
  </AsyncBoundary>
);
```

## What we explicitly don't use

- **Redux Toolkit** — overkill; TanStack Query + Zustand has 100% of our state needs with 10% of the boilerplate.
- **Recoil / Jotai** — Zustand is plenty for the small amount of cross-component client state we have.
- **Context for global state** — re-render storms; Zustand selectors avoid this.
- **Suspense for data fetching** — works with TanStack Query v5 but introduces error-boundary requirements we don't need yet; revisit Phase 2.
