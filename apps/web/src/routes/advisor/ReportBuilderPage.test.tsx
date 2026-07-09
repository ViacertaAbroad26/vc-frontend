import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent } from "@/test/render";

import ReportBuilderPage from "./ReportBuilderPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/report" element={<ReportBuilderPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("ReportBuilderPage", () => {
  it("lets an advisor save insights and disables publish until all sections are complete", async () => {
    renderAt("/students/student-1/report");

    expect(await screen.findByText("Executive summary")).toBeInTheDocument();
    expect(screen.getByText("90-day plan")).toBeInTheDocument();

    const publishButton = screen.getByRole("button", { name: "Publish report" });
    expect(publishButton).toBeDisabled();

    const textareas = screen.getAllByRole("textbox");
    await userEvent.type(textareas[0]!, "The student is well prepared for Germany.");

    const saveButtons = screen.getAllByRole("button", { name: "Save" });
    await userEvent.click(saveButtons[0]!);

    expect(await screen.findByRole("button", { name: "Build report" })).toBeInTheDocument();
  });
});
