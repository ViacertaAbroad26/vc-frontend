import { render, screen, userEvent } from "@/test/render";

import OrganizationsPage from "./OrganizationsPage";

describe("OrganizationsPage", () => {
  it("lists branches and lets a super admin add a new one", async () => {
    render(<OrganizationsPage />, { initialEntries: ["/organizations"] });

    expect(await screen.findByText("Bengaluru HQ")).toBeInTheDocument();
    expect(screen.getByText("Delhi Branch")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Name"), "Pune Branch");
    await userEvent.type(screen.getByLabelText("Code"), "PUN-01");
    await userEvent.click(screen.getByRole("button", { name: "Add branch" }));
  });
});
