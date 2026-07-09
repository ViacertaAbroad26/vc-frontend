import type { IntakeForm, Persona } from "@viacerta/api-client";

/**
 * The backend has no GET endpoint to re-fetch an in-progress submission, so the
 * form definition (and last-saved answers) returned by `/intake/start` are cached
 * here to support resuming `/intake/:submissionId` after a reload.
 */
type CachedSubmission = {
  persona: Persona;
  form: IntakeForm;
  answers: Record<string, unknown>;
};

const keyFor = (submissionId: string) => `viacerta:intake:${submissionId}`;

export function saveIntakeCache(submissionId: string, data: CachedSubmission) {
  window.localStorage.setItem(keyFor(submissionId), JSON.stringify(data));
}

export function loadIntakeCache(submissionId: string): CachedSubmission | null {
  const raw = window.localStorage.getItem(keyFor(submissionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedSubmission;
  } catch {
    return null;
  }
}

export function updateIntakeCacheAnswers(submissionId: string, answers: Record<string, unknown>) {
  const existing = loadIntakeCache(submissionId);
  if (!existing) return;
  saveIntakeCache(submissionId, { ...existing, answers: { ...existing.answers, ...answers } });
}

export function clearIntakeCache(submissionId: string) {
  window.localStorage.removeItem(keyFor(submissionId));
}
