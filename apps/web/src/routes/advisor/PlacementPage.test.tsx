import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import PlacementPage from "./PlacementPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/placement" element={<PlacementPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("PlacementPage", () => {
  it("lets an advisor mark tasks done, save, and confirm placement", async () => {
    renderAt("/students/student-1/placement");

    expect(await screen.findByText("Arrival confirmed")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Not yet done:", { exact: false })).toBeInTheDocument();

    for (const taskLabel of ["Arrival confirmed", "Enrollment confirmed", "First checkin completed"]) {
      const card = screen.getByText(taskLabel).closest("div.flex-1") as HTMLElement;
      const [, doneCheckbox] = within(card).getAllByRole("checkbox");
      await userEvent.click(doneCheckbox!);
    }

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm placement" }));

    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
  });
});
