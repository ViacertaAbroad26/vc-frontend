const KEY = "viacerta:dev-override";

/**
 * Local-dev-only identity override, sent as `X-Dev-*` headers when no JWT is
 * present. The backend only honors these when `AUTH_OPTIONAL=true` (never in
 * prod) and no `Authorization` header is sent — see `app/deps.py`. Lets a
 * developer preview the app as any role/branch (incl. SUPER_ADMIN) without a
 * seeded login.
 */
export type DevOverride = {
  role?: string;
  userId?: string;
  studentId?: string;
  orgId?: string;
};

export const devOverrideStorage = {
  get(): DevOverride | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DevOverride;
    } catch {
      return null;
    }
  },
  set(override: DevOverride) {
    localStorage.setItem(KEY, JSON.stringify(override));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
