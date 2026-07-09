import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import UniversitySelectionPage from "./UniversitySelectionPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/university-selection" element={<UniversitySelectionPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("UniversitySelectionPage", () => {
  it("lets an advisor add a candidate, save, and confirm the shortlist", async () => {
    renderAt("/students/student-1/university-selection");

    expect(await screen.findByText("No candidates yet. Add at least one below.")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Add candidate" }));

    const card = screen.getByLabelText("University").closest("div.space-y-3") as HTMLElement;
    await userEvent.type(within(card).getByLabelText("University"), "TU Munich");
    await userEvent.type(within(card).getByLabelText("Program"), "MSc Computer Science");
    await userEvent.selectOptions(within(card).getByLabelText("Country"), "DE");
    await userEvent.click(within(card).getByRole("checkbox"));

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm shortlist" }));

    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
  });
});
