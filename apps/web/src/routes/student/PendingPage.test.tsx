import { render, screen } from "@/test/render";

import PendingPage from "./PendingPage";

describe("PendingPage", () => {
  it("shows a status message derived from the journey state", async () => {
    render(<PendingPage />);

    expect(await screen.findByText("We're processing your assessment")).toBeInTheDocument();
    expect(screen.getByText(/We'll email you when there's an update/)).toBeInTheDocument();
  });
});
