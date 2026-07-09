import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatNumber } from "../src/format";

describe("format", () => {
  it("formats INR currency without decimals by default", () => {
    expect(formatCurrency(125000, "INR")).toBe("₹1,25,000");
  });

  it("formats USD currency", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000");
  });

  it("formats numbers with Indian grouping", () => {
    expect(formatNumber(1234567)).toBe("12,34,567");
  });

  it("formats a date", () => {
    expect(formatDate("2026-01-15T00:00:00.000Z")).toMatch(/15 Jan 2026/);
  });
});
