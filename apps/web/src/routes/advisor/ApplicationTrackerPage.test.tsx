import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import ApplicationTrackerPage from "./ApplicationTrackerPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/applications" element={<ApplicationTrackerPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("ApplicationTrackerPage", () => {
  it("lets an advisor mark an offer accepted, confirm it, then confirm the visa", async () => {
    renderAt("/students/student-1/applications");

    expect(await screen.findByText("TU Munich")).toBeInTheDocument();
    expect(screen.getByText("Confirm the accepted offer above to start visa tracking.")).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Status"), "ACCEPTED");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await userEvent.selectOptions(screen.getByLabelText("Accepted offer"), "app-1");
    await userEvent.click(screen.getByRole("button", { name: "Confirm accepted offer" }));

    expect(await screen.findAllByText("Confirmed")).not.toHaveLength(0);

    const visaSection = (await screen.findByLabelText("Visa status")).closest("div.grid") as HTMLElement;
    await userEvent.selectOptions(within(visaSection).getByLabelText("Visa status"), "APPROVED");
    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm visa approved" }));

    expect(await screen.findAllByText("Confirmed")).toHaveLength(2);
  });
});
