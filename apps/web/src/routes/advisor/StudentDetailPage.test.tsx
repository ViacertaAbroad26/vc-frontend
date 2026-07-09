import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, waitFor, within } from "@/test/render";

import StudentDetailPage from "./StudentDetailPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId" element={<StudentDetailPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("StudentDetailPage", () => {
  it("shows the student overview with assessment summary", async () => {
    renderAt("/students/student-1");

    expect(await screen.findByRole("heading", { name: "Asha Mehta" })).toBeInTheDocument();
    expect(screen.getByText(/asha@example.com/)).toBeInTheDocument();
    expect(screen.getByText("Target countries: DE, NL")).toBeInTheDocument();
    expect(screen.getByText("Career goal: TECH_SOFTWARE")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("Ready with Plan")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Assessment" })).toBeInTheDocument();
    expect(screen.getByText("Country risk")).toBeInTheDocument();
    expect(screen.getByText("Report builder")).toBeInTheDocument();
  });

  it("shows a stage tracker and lets an advisor advance the student's stage", async () => {
    renderAt("/students/student-1");

    await screen.findByRole("heading", { name: "Asha Mehta" });

    const tracker = screen.getByRole("list", { name: "Student stage progress" });
    expect(within(tracker).getByText("Assessment")).toBeInTheDocument();
    expect(within(tracker).getByText("Country mapping")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Advance stage" }));

    const dialog = screen.getByRole("dialog");
    await userEvent.selectOptions(within(dialog).getByLabelText("New stage"), "STAGE2_COUNTRY_MAPPING");
    await userEvent.type(within(dialog).getByLabelText("Reason"), "Country mapping session completed.");
    await userEvent.click(within(dialog).getByRole("button", { name: "Advance" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
