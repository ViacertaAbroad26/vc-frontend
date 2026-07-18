const REGIONAL_INDICATOR_BASE = 0x1f1e6; // 🇦
const ASCII_A = "A".charCodeAt(0);

/** ISO 3166-1 alpha-2 country code -> flag emoji, via the regional-indicator
 * Unicode trick (each letter A-Z maps to U+1F1E6..U+1F1FF). */
export function isoToFlag(iso: string): string {
  const code = iso.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return [...code].map((c) => String.fromCodePoint(REGIONAL_INDICATOR_BASE + (c.charCodeAt(0) - ASCII_A))).join("");
}
