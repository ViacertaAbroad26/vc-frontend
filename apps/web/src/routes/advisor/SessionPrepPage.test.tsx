import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent } from "@/test/render";

import SessionPrepPage from "./SessionPrepPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/session1-questions" element={<SessionPrepPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("SessionPrepPage", () => {
  it("lets an advisor edit and approve the AI-drafted Session 1 questions", async () => {
    renderAt("/students/student-1/session1-questions");

    expect(await screen.findByDisplayValue("Financial runway")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Model: session1-questions-v1")).toBeInTheDocument();

    const [promptField] = screen.getAllByLabelText("Question");
    await userEvent.clear(promptField!);
    await userEvent.type(promptField!, "Tell me about your savings plan for year one.");

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(await screen.findByText("Approved")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });
});
