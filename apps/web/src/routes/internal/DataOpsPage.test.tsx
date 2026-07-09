import { render, screen, userEvent, waitFor } from "@/test/render";

import DataOpsPage from "./DataOpsPage";

describe("DataOpsPage", () => {
  it("shows matrix-cell freshness for the active matrix version", async () => {
    render(<DataOpsPage />, { initialEntries: ["/data-ops"] });

    expect(await screen.findByText(/2026.06.01/)).toBeInTheDocument();
    expect(screen.getByText("TECH_SOFTWARE")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
    expect(screen.getByText("Stale")).toBeInTheDocument();
    expect(screen.getByText("DATA_AND_AI")).toBeInTheDocument();
    expect(screen.getByText("Fresh")).toBeInTheDocument();
  });

  it("lets a data ops admin apply a hard-coded downgrade with evidence", async () => {
    render(<DataOpsPage />, { initialEntries: ["/data-ops"] });

    await userEvent.click(screen.getByRole("button", { name: "Apply hard-coded downgrade" }));

    await userEvent.type(screen.getByLabelText("Country"), "Canada");
    await userEvent.type(screen.getByLabelText("Factor"), "salary_median");
    await userEvent.clear(screen.getByLabelText("New raw value"));
    await userEvent.type(screen.getByLabelText("New raw value"), "52000");
    await userEvent.type(
      screen.getByLabelText("Evidence"),
      "LinkedIn salary insights updated for Canada tech roles.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Apply downgrade" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Apply a hard-coded downgrade" })).not.toBeInTheDocument(),
    );
  });
});
