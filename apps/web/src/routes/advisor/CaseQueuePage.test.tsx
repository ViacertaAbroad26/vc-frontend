import { render, screen } from "@/test/render";

import CaseQueuePage from "./CaseQueuePage";

describe("CaseQueuePage", () => {
  it("lists cases with stage and flag info", async () => {
    render(<CaseQueuePage />, { initialEntries: ["/cases"] });

    expect(await screen.findByText("Asha Mehta")).toBeInTheDocument();
    expect(screen.getByText("School student")).toBeInTheDocument();
    expect(screen.getAllByText("GCSS confirmed").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Ready with Plan")).toBeInTheDocument();
    expect(screen.getByText("1 missing")).toBeInTheDocument();
  });
});
