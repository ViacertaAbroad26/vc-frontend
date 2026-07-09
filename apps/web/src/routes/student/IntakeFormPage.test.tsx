import { Route, Routes } from "react-router-dom";

import { saveIntakeCache } from "@/features/intake/intake-cache";
import { SAMPLE_FORM } from "@/test/msw-handlers/intake";
import { render, screen } from "@/test/render";

import IntakeFormPage from "./IntakeFormPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/intake/:submissionId" element={<IntakeFormPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("IntakeFormPage", () => {
  it("renders the cached intake form for a known submission", () => {
    saveIntakeCache("submission-1", { persona: "SCHOOL_STUDENT", form: SAMPLE_FORM, answers: {} });

    renderAt("/intake/submission-1");

    expect(screen.getByText("About you")).toBeInTheDocument();
    expect(screen.getByText("What's your full name?")).toBeInTheDocument();
  });

  it("shows an empty state when there's no cached submission", () => {
    renderAt("/intake/unknown-submission");

    expect(screen.getByText("We couldn't find this intake form")).toBeInTheDocument();
  });
});
