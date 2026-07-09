import { render, screen, userEvent } from "@/test/render";

import LeadsPage from "./LeadsPage";

describe("LeadsPage", () => {
  it("lists unassigned leads and lets a coordinator assign an advisor", async () => {
    render(<LeadsPage />, { initialEntries: ["/leads"] });

    expect(await screen.findByText("Rohan Gupta")).toBeInTheDocument();
    expect(screen.getByText(/Lead · registered/)).toBeInTheDocument();

    const assignButton = screen.getByRole("button", { name: "Assign" });
    expect(assignButton).toBeDisabled();

    const advisorSelect = await screen.findByRole("combobox", { name: "Assign advisor to Rohan Gupta" });
    await userEvent.selectOptions(advisorSelect, "advisor-1");
    expect(assignButton).toBeEnabled();

    await userEvent.click(assignButton);
  });

  it("shows recorded sessions on the Sessions tab", async () => {
    render(<LeadsPage />, { initialEntries: ["/leads"] });

    await userEvent.click(screen.getByRole("tab", { name: "Sessions" }));

    expect(await screen.findByText("Asha Mehta")).toBeInTheDocument();
    expect(screen.getByText(/Session 1 · advisor Priya Nair/)).toBeInTheDocument();
  });
});
