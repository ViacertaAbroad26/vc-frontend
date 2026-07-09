import { describe, expect, it } from "vitest";

import { gcssFlagToLabel, recommendationFor } from "../src/flags";

describe("flags", () => {
  it("labels every GCSS flag", () => {
    expect(gcssFlagToLabel("GREEN")).toBe("Ready");
    expect(gcssFlagToLabel("YELLOW")).toBe("Ready with Plan");
    expect(gcssFlagToLabel("RED")).toBe("Not Yet Ready");
    expect(gcssFlagToLabel("DECLINED")).toBe("Refer to Prep Resources");
  });

  it("returns a recommendation for every flag", () => {
    for (const flag of ["GREEN", "YELLOW", "RED", "DECLINED"] as const) {
      expect(recommendationFor(flag)).toBeTruthy();
    }
  });
});
