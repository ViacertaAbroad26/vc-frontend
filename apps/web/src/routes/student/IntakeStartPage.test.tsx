import { loadIntakeCache } from "@/features/intake/intake-cache";
import { render, screen, userEvent, waitFor, within } from "@/test/render";

import IntakeStartPage from "./IntakeStartPage";

describe("IntakeStartPage", () => {
  it("starts an intake submission and caches the returned form", async () => {
    render(<IntakeStartPage />);

    const heading = screen.getByText("School student");
    const card = heading.closest("div")!.parentElement!;
    await userEvent.click(within(card).getByRole("button", { name: "Choose" }));

    await waitFor(() => {
      expect(loadIntakeCache("submission-1")).not.toBeNull();
    });
    expect(loadIntakeCache("submission-1")?.form.sections[0]?.title).toBe("About you");
  });
});
