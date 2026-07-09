/**
 * Field/key names that must never appear in the portal app's bundle or API
 * responses. The portal's generated types shouldn't include these at all —
 * this list backs a dev-mode runtime guard and the bundle leak check
 * (`scripts/check-portal-bundle.sh`) as a second line of defense.
 */
export const FORBIDDEN_PORTAL_KEYS = [
  "weight",
  "weights",
  "overrideDelta",
  "overrideReason",
  "evidenceNote",
  "versionId",
  "rubricVersion",
  "matrixVersion",
  "confidenceMultiplier",
  "rawScore",
  "advisorNotes",
] as const;

export type ForbiddenPortalKey = (typeof FORBIDDEN_PORTAL_KEYS)[number];

/**
 * Recursively scans an object for forbidden keys. Intended for dev-mode
 * assertions on API responses rendered in the portal app — never run in
 * production.
 */
export function findForbiddenKeys(value: unknown, path = "$"): string[] {
  if (value === null || typeof value !== "object") return [];

  const hits: string[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const childPath = `${path}.${key}`;
    if ((FORBIDDEN_PORTAL_KEYS as readonly string[]).includes(key)) {
      hits.push(childPath);
    }
    hits.push(...findForbiddenKeys(child, childPath));
  }
  return hits;
}
