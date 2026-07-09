import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, waitFor } from "@/test/render";

import AssessmentPage from "./AssessmentPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/assessment" element={<AssessmentPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("AssessmentPage", () => {
  it("shows dimension breakdown and lets an advisor override and confirm", async () => {
    renderAt("/students/student-1/assessment");

    expect(await screen.findByText("Academic & Cognitive Readiness")).toBeInTheDocument();
    expect(screen.getByText("GPA")).toBeInTheDocument();
    expect(screen.getByText("L5 · Fully verified")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Confirm assessment" });
    expect(confirmButton).toBeEnabled();

    await userEvent.click(screen.getByRole("button", { name: "Override" }));
    expect(screen.getByText("Override score")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/New score/));
    await userEvent.type(screen.getByLabelText(/New score/), "16");
    await userEvent.type(
      screen.getByLabelText("Evidence note"),
      "Updated after reviewing transcript and certificates",
    );
    await userEvent.click(screen.getByRole("button", { name: "Save override" }));

    await waitFor(() => {
      expect(screen.queryByText("Override score")).not.toBeInTheDocument();
    });

    await userEvent.click(confirmButton);
  });
});
