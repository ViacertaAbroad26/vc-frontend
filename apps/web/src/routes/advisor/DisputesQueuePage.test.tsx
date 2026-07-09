import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import DisputesQueuePage from "./DisputesQueuePage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/disputes" element={<DisputesQueuePage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("DisputesQueuePage", () => {
  it("lets an advisor resolve an open dispute", async () => {
    renderAt("/disputes");

    expect(await screen.findByText("Aditya Basu")).toBeInTheDocument();
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Resolve" }));

    const dialog = screen.getByRole("dialog");
    await userEvent.selectOptions(within(dialog).getByLabelText("Resolution"), "REASSESS");
    await userEvent.type(
      within(dialog).getByLabelText("Resolution notes"),
      "Reviewed the audit trail and the score needs to be reassessed.",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Resolve" }));

    expect(await screen.findAllByText("Resolved · reassess")).toHaveLength(2);
  });
});
