export const COUNTRY_LABELS: Record<string, string> = {
  US: "United States",
  DE: "Germany",
  NL: "Netherlands",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};

export function countryLabel(code: string): string {
  return COUNTRY_LABELS[code] ?? code;
}
