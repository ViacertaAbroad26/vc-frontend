import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GcssFlagBadge } from "../src/viacerta/GcssFlagBadge";

describe("GcssFlagBadge", () => {
  it("renders the human label for each flag", () => {
    render(<GcssFlagBadge flag="GREEN" />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("renders the declined label", () => {
    render(<GcssFlagBadge flag="DECLINED" />);
    expect(screen.getByText("Refer to Prep Resources")).toBeInTheDocument();
  });
});
