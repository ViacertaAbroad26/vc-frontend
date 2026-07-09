# 07 — Forms & Validation

> **react-hook-form + zod** for every form. No exceptions. No bare `useState` for fields beyond a single value.

## Why this combo

- **react-hook-form** keeps renders surgical — only the field that changed re-renders.
- **zod** is the validation layer, mirroring the backend's Pydantic schemas where it matters.
- **`@hookform/resolvers/zod`** glues them.

## Standard pattern

```tsx
// Generic: every form looks like this.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label, ErrorText } from "@viacerta/ui";

const Schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type Values = z.infer<typeof Schema>;

export function LoginForm({ onSubmit, isSubmitting }: {
  onSubmit: (v: Values) => void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, formState: { errors, isValid } } =
    useForm<Values>({ resolver: zodResolver(Schema), mode: "onBlur" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" error={!!errors.email} {...register("email")} />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" error={!!errors.password} {...register("password")} />
        {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
      </div>
      <Button type="submit" fullWidth loading={isSubmitting} disabled={!isValid}>
        Sign in
      </Button>
    </form>
  );
}
```

## Mirroring backend schemas

Backend Pydantic schemas live in `app/schemas/`. Frontend zod schemas mirror the **request bodies**, plus client-side niceties like trimmed strings and required-when-checked rules.

All of these live under `apps/web/src/features/<feature>/schemas.ts` — one app, one `src/features/` tree (see `docs/01-project-structure.md`).

| Backend (Pydantic) | Frontend (zod) | Lives in |
|---|---|---|
| `RegisterRequest` | `RegisterSchema` | `apps/web/src/features/auth/schemas.ts` |
| `LoginRequest` | `LoginSchema` | same |
| `OverrideRequest` (advisor) | `OverrideSchema` | `apps/web/src/features/assessment/schemas.ts` |
| `GcriOverrideRequest` | `GcriOverrideSchema` | `apps/web/src/features/gcri/schemas.ts` |
| `InsightRequest` | `InsightSchema` | `apps/web/src/features/report-builder/schemas.ts` |
| `DecisionRequest` | `DecisionSchema` | `apps/web/src/features/decision/schemas.ts` |

When backend rules change (e.g., evidence min length goes from 10 to 15), update the zod schema. The server still enforces; the client's job is fast feedback.

## Concrete examples

### Register form

```tsx
// apps/web/src/features/auth/schemas.ts
import { z } from "zod";

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[0-9 ]{7,15}$/, "Enter a valid phone").optional().or(z.literal("")),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string(),
  consentToTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords don't match",
});

export type RegisterValues = z.infer<typeof RegisterSchema>;
```

### Override dialog (advisor)

```tsx
// apps/web/src/features/assessment/schemas.ts
import { z } from "zod";

export const OverrideSchema = z.object({
  dimension: z.string().min(1),
  subComponentKey: z.string().min(1),
  newRaw: z.coerce.number().min(0).max(20),
  evidenceNote: z.string().min(10, "Evidence note must be at least 10 characters").max(500),
});
export type OverrideValues = z.infer<typeof OverrideSchema>;
```

```tsx
// apps/web/src/features/assessment/OverrideDialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogFooter,
         Button, Input, Textarea, Label, ErrorText } from "@viacerta/ui";

import { OverrideSchema, type OverrideValues } from "./schemas";
import { useGcssOverride } from "./useGcssOverride";

type Props = {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  studentId: string;
  dimension: string;
  subComponentKey: string;
  subComponentLabel: string;
  currentRaw: number;
  maxRaw: number;
};

export function OverrideDialog(p: Props) {
  const override = useGcssOverride(p.studentId);

  const { register, handleSubmit, formState: { errors, isValid }, watch } =
    useForm<OverrideValues>({
      resolver: zodResolver(OverrideSchema),
      defaultValues: {
        dimension: p.dimension,
        subComponentKey: p.subComponentKey,
        newRaw: p.currentRaw,
        evidenceNote: "",
      },
      mode: "onBlur",
    });

  const newRaw = watch("newRaw");

  const onSubmit = (v: OverrideValues) => {
    override.mutate(v, { onSuccess: () => p.onOpenChange(false) });
  };

  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <h2 className="text-lg font-semibold">Override score</h2>
          <p className="text-sm text-gray-600">{p.subComponentLabel}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("dimension")} />
          <input type="hidden" {...register("subComponentKey")} />

          <div>
            <Label htmlFor="newRaw">New score (0 – {p.maxRaw})</Label>
            <Input id="newRaw" type="number" min={0} max={p.maxRaw} step={1}
                   error={!!errors.newRaw} {...register("newRaw")} />
            {errors.newRaw && <ErrorText>{errors.newRaw.message}</ErrorText>}
            <p className="text-xs text-gray-500 mt-1">
              Was {p.currentRaw}. {newRaw !== p.currentRaw &&
                <span>Change: <strong>{newRaw - p.currentRaw > 0 ? "+" : ""}{newRaw - p.currentRaw}</strong></span>
              }
            </p>
          </div>

          <div>
            <Label htmlFor="evidenceNote">
              Evidence note <span className="text-red-600">*</span>
            </Label>
            <Textarea id="evidenceNote" rows={4}
                      placeholder="Why this score? Reference specific intake answers or session notes."
                      error={!!errors.evidenceNote}
                      {...register("evidenceNote")} />
            {errors.evidenceNote && <ErrorText>{errors.evidenceNote.message}</ErrorText>}
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters. Visible in the audit log; not shown to the student.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => p.onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={override.isPending} disabled={!isValid}>
              Apply override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Insight editor — sentence count validation

The backend requires advisor insights to be ≤ 3 sentences. Mirror it client-side for instant feedback:

```ts
// apps/web/src/features/report-builder/schemas.ts
import { z } from "zod";

function countSentences(text: string): number {
  return text.trim().split(/[.!?]+\s+(?=[A-Z])|[.!?]+$/).filter(Boolean).length;
}

export const InsightSchema = z.object({
  section: z.enum([
    "EXECUTIVE_SUMMARY", "GCSS_BREAKDOWN", "GCRI_BREAKDOWN",
    "ROI_ANALYSIS", "RISK_REGISTER", "NINETY_DAY_PLAN",
  ]),
  text: z.string()
    .min(20, "Insight is too short")
    .max(800, "Insight is too long")
    .refine((t) => countSentences(t) <= 3, "Keep it to 3 sentences or fewer"),
});

export type InsightValues = z.infer<typeof InsightSchema>;
```

## The intake form (the big one)

The intake form is variable-shape (the backend ships the form definition per persona). We don't hard-code field names — we render the form by walking the `IntakeForm` shape returned by `/api/v1/portal/students/me/intake/start`.

### Architecture

- `<IntakeForm />` is the top-level. It accepts the form definition and uses `react-hook-form` with **dynamic schema** built from the definition.
- `<IntakeSection />` renders a section (heading + grouped questions).
- `<IntakeQuestion />` switch-renders based on `question.type`.
- A **debounced save effect** writes to the server every 1.5 seconds when fields change.
- A **buffer** in Zustand backs up unsaved answers between visits (in case of network failure or accidental close).

### Building the schema dynamically

```ts
// apps/web/src/features/intake/build-schema.ts
import { z, type ZodTypeAny } from "zod";
import type { IntakeFormQuestion } from "@viacerta/api-client";

export function buildIntakeSchema(questions: IntakeFormQuestion[]): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const q of questions) {
    let field: ZodTypeAny;
    switch (q.type) {
      case "short_text":
        field = z.string().trim();
        if (q.required) field = (field as z.ZodString).min(1, "Required");
        break;
      case "long_text":
        field = z.string().trim();
        if (q.required) field = (field as z.ZodString).min(10, "Please provide a more complete answer");
        break;
      case "single_select":
        field = z.string();
        if (q.required) field = (field as z.ZodString).min(1, "Pick one");
        break;
      case "multi_select":
        field = z.array(z.string());
        if (q.required) field = (field as z.ZodArray<any>).min(1, "Pick at least one");
        break;
      case "number":
        field = z.coerce.number();
        break;
      case "date":
        field = z.string();   // ISO YYYY-MM-DD
        break;
      default:
        field = z.unknown();
    }
    if (!q.required) field = field.optional();
    shape[q.id] = field;
  }
  return z.object(shape);
}
```

### Top-level IntakeForm

```tsx
// apps/web/src/features/intake/IntakeForm.tsx
import { useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IntakeForm as TIntakeForm } from "@viacerta/api-client";

import { Card, CardBody, Button, AsyncBoundary } from "@viacerta/ui";
import { SaveResumeIndicator } from "./SaveResumeIndicator";
import { IntakeSection } from "./IntakeSection";
import { buildIntakeSchema } from "./build-schema";

import { useIntakeStore } from "@/stores/intake-store";
import { useIntakeSave } from "./useIntakeSave";
import { useIntakeSubmit } from "./useIntakeSubmit";

type Props = {
  form: TIntakeForm;
  submissionId: string;
  initialAnswers: Record<string, unknown>;
};

const DEBOUNCE_MS = 1500;

export function IntakeForm({ form, submissionId, initialAnswers }: Props) {
  const allQuestions = useMemo(() => form.sections.flatMap((s) => s.questions), [form]);
  const schema = useMemo(() => buildIntakeSchema(allQuestions), [allQuestions]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialAnswers,
    mode: "onBlur",
  });

  const watched = methods.watch();
  const save = useIntakeSave(submissionId);
  const submit = useIntakeSubmit(submissionId);
  const { setAnswer, markSavingStart, markSaved, buffer } = useIntakeStore();

  // Mirror form state to the store; debounce-save to server
  useEffect(() => {
    Object.entries(watched).forEach(([k, v]) => setAnswer(k, v));
  }, [watched, setAnswer]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (Object.keys(buffer).length === 0) return;
      markSavingStart();
      save.mutate({ answers: buffer }, {
        onSuccess: markSaved,
        onError: () => { /* keep buffer; show indicator */ },
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [buffer, save, markSavingStart, markSaved]);

  const onSubmit = methods.handleSubmit((values) => {
    save.mutate({ answers: values }, {
      onSuccess: () => submit.mutate(undefined),
    });
  });

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{form.persona} intake</h1>
          <SaveResumeIndicator />
        </header>

        <form onSubmit={onSubmit} className="space-y-8">
          {form.sections.map((section) => (
            <IntakeSection key={section.id} section={section} />
          ))}
          <div className="flex justify-end">
            <Button type="submit" loading={submit.isPending}>
              Submit and pre-score
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
```

### IntakeQuestion — type-dispatched

```tsx
// apps/web/src/features/intake/IntakeQuestion.tsx
import { useFormContext } from "react-hook-form";
import type { IntakeFormQuestion } from "@viacerta/api-client";

import { Input, Textarea, Label, ErrorText, RadioGroup, Checkbox } from "@viacerta/ui";

export function IntakeQuestion({ question }: { question: IntakeFormQuestion }) {
  const { register, formState: { errors }, watch, setValue } = useFormContext();
  const error = errors[question.id]?.message as string | undefined;

  const FieldLabel = (
    <Label htmlFor={question.id}>
      {question.prompt}
      {question.required && <span className="ml-1 text-red-600">*</span>}
    </Label>
  );

  switch (question.type) {
    case "short_text":
      return (
        <div>
          {FieldLabel}
          <Input id={question.id} error={!!error} {...register(question.id)} />
          {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "long_text":
      return (
        <div>
          {FieldLabel}
          <Textarea id={question.id} rows={4} error={!!error} {...register(question.id)} />
          {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "single_select": {
      const value = watch(question.id);
      return (
        <div>
          {FieldLabel}
          <RadioGroup
            value={value as string}
            onValueChange={(v) => setValue(question.id, v, { shouldValidate: true, shouldDirty: true })}
          >
            {question.options?.map((opt: any) => (
              <RadioGroup.Item key={opt.value} value={opt.value} label={opt.label} />
            ))}
          </RadioGroup>
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );
    }

    case "multi_select": {
      const value = (watch(question.id) as string[]) ?? [];
      return (
        <div>
          {FieldLabel}
          {question.options?.map((opt: any) => (
            <Checkbox
              key={opt.value}
              checked={value.includes(opt.value)}
              onCheckedChange={(checked) => {
                const next = checked
                  ? [...value, opt.value]
                  : value.filter((v) => v !== opt.value);
                setValue(question.id, next, { shouldValidate: true, shouldDirty: true });
              }}
              label={opt.label}
            />
          ))}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );
    }

    case "number":
      return (
        <div>
          {FieldLabel}
          <Input id={question.id} type="number" error={!!error} {...register(question.id, { valueAsNumber: true })} />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "date":
      return (
        <div>
          {FieldLabel}
          <Input id={question.id} type="date" error={!!error} {...register(question.id)} />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    default:
      return <p className="text-sm text-red-600">Unsupported question type: {question.type}</p>;
  }
}
```

### Save-and-resume indicator

```tsx
// apps/web/src/features/intake/SaveResumeIndicator.tsx
import { useIntakeStore } from "@/stores/intake-store";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Check, AlertCircle } from "lucide-react";

export function SaveResumeIndicator() {
  const { isSaving, isDirty, lastSavedAt } = useIntakeStore();

  if (isSaving) {
    return (
      <span className="inline-flex items-center text-xs text-gray-600">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (!isDirty && lastSavedAt) {
    return (
      <span className="inline-flex items-center text-xs text-green-700">
        <Check className="mr-1 h-3 w-3" />
        Saved {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="inline-flex items-center text-xs text-amber-700">
        <AlertCircle className="mr-1 h-3 w-3" /> Unsaved changes
      </span>
    );
  }
  return null;
}
```

## Server validation surfacing

When the backend returns 422 with field-specific errors, surface them on the right fields:

```ts
// Mutation onError handler
import { isValidationError } from "@viacerta/api-client/errors";
import type { FieldValues, UseFormSetError } from "react-hook-form";

function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
) {
  if (!isValidationError(err)) return;
  const fields = (err.extras as any)?.fields as Record<string, string> | undefined;
  if (!fields) return;
  for (const [name, message] of Object.entries(fields)) {
    setError(name as any, { type: "server", message });
  }
}
```

Backend RFC 7807 includes a `fields` extension when validation fails per field. The client doesn't have to guess.

## What we don't do

- **No uncontrolled inputs** in any production form. They're fine for prototypes; `register` from react-hook-form makes "controlled with refs" the default and that's strictly better.
- **No raw FormData parsing**. We use react-hook-form values and convert to FormData only at the upload boundary.
- **No alert/confirm dialogs**. Use Radix `<AlertDialog>` from `@viacerta/ui`.
