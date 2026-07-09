import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent } from "@/test/render";

import StudentDocumentsPage from "./StudentDocumentsPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/documents" element={<StudentDocumentsPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("StudentDocumentsPage", () => {
  it("lists the student's documents and lets an advisor verify or reject them", async () => {
    renderAt("/students/student-1/documents");

    expect(await screen.findByText("TRANSCRIPT")).toBeInTheDocument();
    expect(screen.getByText("transcript.pdf")).toBeInTheDocument();
    expect(screen.getByText("PASSPORT")).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: "Verify L4" })[0]!);

    await userEvent.click(screen.getAllByRole("button", { name: "Reject" })[0]!);

    const reasonField = screen.getByRole("textbox");
    await userEvent.type(reasonField, "The uploaded file is unreadable.");
    const rejectButtons = screen.getAllByRole("button", { name: "Reject" });
    await userEvent.click(rejectButtons[rejectButtons.length - 1]!);
  });
});
