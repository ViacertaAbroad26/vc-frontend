import { render, screen, userEvent } from "@/test/render";

import UsersPage from "./UsersPage";

describe("UsersPage", () => {
  it("lists users and lets an admin change a role or add a new user", async () => {
    render(<UsersPage />, { initialEntries: ["/users"] });

    expect(await screen.findByText("Priya Nair")).toBeInTheDocument();
    expect(screen.getByText("Amit Shah")).toBeInTheDocument();

    const roleSelect = screen.getByRole("combobox", { name: "Change role for Priya Nair" });
    await userEvent.selectOptions(roleSelect, "ADMIN");

    await userEvent.type(screen.getByLabelText("Full name"), "Nina Verma");
    await userEvent.type(screen.getByLabelText("Email"), "nina@example.com");
    await userEvent.type(screen.getByLabelText("Temporary password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Add user" }));
  });

  it("shows audit log entries on the Audit log tab", async () => {
    render(<UsersPage />, { initialEntries: ["/users"] });

    await userEvent.click(screen.getByRole("tab", { name: "Audit log" }));

    expect(await screen.findAllByText("Document Verified")).not.toHaveLength(0);
    expect(screen.getByText(/DOCUMENT · doc-1/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Show details" }));
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });
});
