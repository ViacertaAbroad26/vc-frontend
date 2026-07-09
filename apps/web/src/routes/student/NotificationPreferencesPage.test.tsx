import { render, screen, userEvent, waitFor } from "@/test/render";

import NotificationPreferencesPage from "./NotificationPreferencesPage";

describe("NotificationPreferencesPage", () => {
  it("renders preferences for each notification template", async () => {
    render(<NotificationPreferencesPage />);

    expect(await screen.findByText("Intake reminder")).toBeInTheDocument();
    expect(screen.getByText("Before Session 1")).toBeInTheDocument();
    expect(screen.getByText("Pre-departure")).toBeInTheDocument();
  });

  it("saves updated preferences", async () => {
    render(<NotificationPreferencesPage />);

    await screen.findByText("Intake reminder");
    const [firstCheckbox] = screen.getAllByRole("checkbox");
    await userEvent.click(firstCheckbox!);

    const saveButton = screen.getByRole("button", { name: "Save preferences" });
    await userEvent.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });
});
