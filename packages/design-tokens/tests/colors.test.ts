import { describe, expect, it } from "vitest";

import { colors, flagColors, riskBandColors } from "../src/colors";

describe("design tokens: colors", () => {
  it("maps every GCSS flag to a flag color", () => {
    expect(flagColors.GREEN).toBe(colors.flag.green);
    expect(flagColors.YELLOW).toBe(colors.flag.yellow);
    expect(flagColors.RED).toBe(colors.flag.red);
    expect(flagColors.DECLINED).toBe(colors.flag.gray);
  });

  it("maps every risk band to a flag color", () => {
    expect(riskBandColors.LOW).toBe(colors.flag.green);
    expect(riskBandColors.MODERATE).toBe(colors.flag.yellow);
    expect(riskBandColors.HIGH).toBe(colors.flag.red);
    expect(riskBandColors.VERY_HIGH).toBe(colors.flag.red);
  });

  it("primary brand navy (Yale Blue) is navy-700", () => {
    expect(colors.navy[700]).toBe("#044e77");
  });

  it("secondary brand mint (Mint Leaf) is mint-400", () => {
    expect(colors.mint[400]).toBe("#68b687");
  });
});
