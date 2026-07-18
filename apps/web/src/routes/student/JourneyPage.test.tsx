import { render, screen } from "@/test/render";

import JourneyPage from "./JourneyPage";

describe("JourneyPage", () => {
  it("renders the next action and timeline from the journey", async () => {
    render(<JourneyPage />);

    expect(await screen.findByText("Finish and submit your intake form.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue intake" })).toBeInTheDocument();
    expect(screen.getByText(/Stage 1 · Global Career Assessment/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue" })).toBeInTheDocument();
  });
});
