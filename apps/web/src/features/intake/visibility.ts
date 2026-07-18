// Keys inside the dict stay snake_case: `visible_if` is a plain passthrough
// dict on the backend (app/data/stage1_intake_content.py), so Pydantic's
// CamelModel alias generator (which only rewrites declared model fields)
// never touches its contents. The generated API type for this field is a
// loose `{[key: string]: unknown}` since the backend intentionally doesn't
// give it a strict schema (see app/schemas/student_portal.py), so this
// accepts that same loose shape rather than fighting the generated types.
type VisibleIfLike = { [key: string]: unknown } | null | undefined;

/** Mirrors the backend's `_condition_met` in intake_service.py — keep in sync. */
export function isVisible(visibleIf: VisibleIfLike, values: Record<string, unknown>): boolean {
  if (!visibleIf) return true;
  const answer = values[visibleIf.question_id as string];
  if ("equals" in visibleIf) return answer === visibleIf.equals;
  if ("in" in visibleIf && Array.isArray(visibleIf.in)) return visibleIf.in.includes(answer);
  return true;
}
