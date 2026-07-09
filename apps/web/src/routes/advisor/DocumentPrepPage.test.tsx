import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, within } from "@/test/render";

import DocumentPrepPage from "./DocumentPrepPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/document-prep" element={<DocumentPrepPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("DocumentPrepPage", () => {
  it("lets an advisor waive a document, save, and confirm readiness", async () => {
    renderAt("/students/student-1/document-prep");

    expect(await screen.findByText("Academic transcript")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Not yet verified:", { exact: false })).toBeInTheDocument();

    const scoreReportCard = screen.getByText("Test score report").closest("div.flex-1") as HTMLElement;
    const [, waivedCheckbox] = within(scoreReportCard).getAllByRole("checkbox");
    await userEvent.click(waivedCheckbox!);

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm readiness" }));

    expect(await screen.findByText("Confirmed")).toBeInTheDocument();
  });
});
