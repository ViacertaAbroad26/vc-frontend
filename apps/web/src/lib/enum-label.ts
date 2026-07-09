/** Converts a SCREAMING_SNAKE_CASE enum value into a readable label, e.g. "UNDER_REVIEW" -> "Under review". */
export function enumLabel(value: string): string {
  const words = value.toLowerCase().split("_");
  return words.map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(" ");
}
