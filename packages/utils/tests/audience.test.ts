import { describe, expect, it } from "vitest";

import { findForbiddenKeys } from "../src/audience";

describe("audience", () => {
  it("finds no forbidden keys in a clean portal payload", () => {
    const payload = { gcssFinal: 72, flag: "GREEN", insights: [{ title: "x" }] };
    expect(findForbiddenKeys(payload)).toEqual([]);
  });

  it("flags advisor-only keys anywhere in the tree", () => {
    const payload = {
      gcssFinal: 72,
      dimensions: [{ name: "Academic", weight: 0.4, overrideReason: "manual bump" }],
    };
    const hits = findForbiddenKeys(payload);
    expect(hits).toContain("$.dimensions.0.weight");
    expect(hits).toContain("$.dimensions.0.overrideReason");
  });
});
