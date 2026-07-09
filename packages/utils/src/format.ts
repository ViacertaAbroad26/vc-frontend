import { format as formatDateFns, formatDistanceToNow } from "date-fns";

export type CurrencyCode = "INR" | "EUR" | "USD";

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  EUR: "de-DE",
  USD: "en-US",
};

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  opts: { maximumFractionDigits?: number } = {},
): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: opts.maximumFractionDigits ?? 0,
  }).format(amount);
}

export function formatNumber(value: number, opts: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat("en-IN", opts).format(value);
}

export function formatDate(date: Date | string | number, pattern = "d MMM yyyy"): string {
  return formatDateFns(new Date(date), pattern);
}

export function formatDateTime(date: Date | string | number): string {
  return formatDateFns(new Date(date), "d MMM yyyy, HH:mm");
}

export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
