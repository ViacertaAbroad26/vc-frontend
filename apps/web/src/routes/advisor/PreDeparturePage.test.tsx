import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import PreDeparturePage from "./PreDeparturePage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/pre-departure" element={<PreDeparturePage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("PreDeparturePage", () => {
  it("lets an advisor mark tasks done, save, and confirm readiness", async () => {
    renderAt("/students/student-1/pre-departure");

    expect(await screen.findByText("Flight booked")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Not yet done:", { exact: false })).toBeInTheDocument();

    for (const taskLabel of [
      "Flight booked",
      "Accommodation arranged",
      "Orientation attended",
      "Insurance purchased",
      "Forex arranged",
      "Sim arranged",
    ]) {
      const card = screen.getByText(taskLabel).closest("div.flex-1") as HTMLElement;
      const [, doneCheckbox] = within(card).getAllByRole("checkbox");
      await userEvent.click(doneCheckbox!);
    }

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm readiness" }));

    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
  });
});
