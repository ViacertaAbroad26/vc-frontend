import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GcriHeatmap } from "../src/viacerta/GcriHeatmap";

describe("GcriHeatmap", () => {
  it("renders a cell per country with its score and label", () => {
    render(
      <GcriHeatmap
        items={[
          { country: "US", finalScore: 82, riskBand: "LOW" },
          { country: "DE", finalScore: 55, riskBand: "MODERATE" },
          { country: "IN", finalScore: 30, riskBand: "HIGH" },
        ]}
        labels={{ US: "United States" }}
      />,
    );

    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("DE")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("IN")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<GcriHeatmap items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
