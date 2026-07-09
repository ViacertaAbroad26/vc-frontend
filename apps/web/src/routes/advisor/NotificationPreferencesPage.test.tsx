import { render, screen } from "@/test/render";

import NotificationPreferencesPage from "./NotificationPreferencesPage";

describe("Advisor NotificationPreferencesPage", () => {
  it("renders preferences for each advisor notification template", async () => {
    render(<NotificationPreferencesPage />);

    expect(await screen.findByText("Dispute opened")).toBeInTheDocument();
    expect(screen.getByText("Session 1 questions drafted")).toBeInTheDocument();
  });
});
