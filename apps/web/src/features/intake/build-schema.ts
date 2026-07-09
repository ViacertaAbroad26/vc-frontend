import type { IntakeQuestion } from "@viacerta/api-client";
import { z, type ZodTypeAny } from "zod";

export function buildIntakeSchema(questions: IntakeQuestion[]): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {};
  for (const q of questions) {
    let field: ZodTypeAny;
    switch (q.type) {
      case "short_text":
        field = q.required ? z.string().trim().min(1, "Required") : z.string().trim();
        break;
      case "long_text":
        field = q.required
          ? z.string().trim().min(10, "Please provide a more complete answer")
          : z.string().trim();
        break;
      case "single_select":
        field = q.required ? z.string().min(1, "Pick one") : z.string();
        break;
      case "multi_select":
        field = q.required ? z.array(z.string()).min(1, "Pick at least one") : z.array(z.string());
        break;
      case "number":
        field = z.coerce.number();
        break;
      case "date":
        field = z.string();
        break;
      default:
        field = z.unknown();
    }
    shape[q.id] = q.required ? field : field.optional();
  }
  return z.object(shape);
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
