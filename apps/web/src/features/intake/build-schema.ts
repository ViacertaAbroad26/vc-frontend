import type { IntakeQuestion } from "@viacerta/api-client";
import { z, type ZodTypeAny } from "zod";

import { isVisible } from "./visibility";

/** True if a non-empty answer was given, per question type. */
function hasAnswer(q: IntakeQuestion, value: unknown): boolean {
  if (q.type === "multi_select") return Array.isArray(value) && value.length > 0;
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

export function buildIntakeSchema(questions: IntakeQuestion[]): ZodTypeAny {
  const shape: Record<string, ZodTypeAny> = {};
  for (const q of questions) {
    let field: ZodTypeAny;
    switch (q.type) {
      case "short_text":
      case "long_text":
        field = z.string().trim();
        break;
      case "single_select":
        field = z.string();
        break;
      case "multi_select":
        field = z.array(z.string());
        break;
      case "number":
        field = z.coerce.number().optional();
        break;
      case "date":
        field = z.string();
        break;
      default:
        field = z.unknown();
    }
    shape[q.id] = field.optional();
  }

  // Required-ness is conditional on visibility (a required question hidden
  // by a visible_if the student never triggered must not block submit) —
  // evaluated here against the full answer set, mirroring the backend's
  // equivalent check in intake_service.py::submit_final.
  return z.object(shape).superRefine((data, ctx) => {
    for (const q of questions) {
      if (!q.required || !isVisible(q.visibleIf, data)) continue;
      if (!hasAnswer(q, data[q.id])) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [q.id], message: "Required" });
      }
    }
  });
}

export function defaultAnswers(questions: IntakeQuestion[]): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const q of questions) {
    switch (q.type) {
      case "multi_select":
        defaults[q.id] = [];
        break;
      case "number":
        defaults[q.id] = undefined;
        break;
      default:
        defaults[q.id] = "";
    }
  }
  return defaults;
}
