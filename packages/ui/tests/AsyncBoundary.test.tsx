import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AsyncBoundary } from "../src/feedback/AsyncBoundary";

describe("AsyncBoundary", () => {
  it("shows a spinner while loading", () => {
    render(
      <AsyncBoundary isLoading error={null} data={undefined}>
        {() => <div>content</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows an error state when an error is present", () => {
    render(
      <AsyncBoundary isLoading={false} error={new Error("boom")} data={undefined}>
        {() => <div>content</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("boom");
  });

  it("renders children with data once loaded", () => {
    render(
      <AsyncBoundary isLoading={false} error={null} data={{ name: "Aditya" }}>
        {(data) => <div>{data.name}</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByText("Aditya")).toBeInTheDocument();
  });

  it("shows the empty fallback when isEmpty matches", () => {
    render(
      <AsyncBoundary isLoading={false} error={null} data={[]} isEmpty={(d) => d.length === 0}>
        {() => <div>content</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });
});
