import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";

import { server } from "@/test/msw-server";
import { render, screen, userEvent } from "@/test/render";

import GcriPage from "./GcriPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/students/:studentId/gcri" element={<GcriPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("GcriPage", () => {
  it("offers to trigger a GCRI run when none exists yet", async () => {
    renderAt("/students/student-1/gcri");

    expect(await screen.findByText("No GCRI run yet")).toBeInTheDocument();

    const trigger = await screen.findByRole("button", { name: "Run GCRI for DE, NL" });
    expect(trigger).toBeEnabled();

    await userEvent.click(trigger);
  });

  it("shows the predicted employment likelihood when GCRI includes a prediction", async () => {
    server.use(
      http.get("http://localhost:8000/api/v1/advisor/students/:studentId/gcri", () =>
        HttpResponse.json({
          results: [
            {
              id: "gcri-1",
              studentId: "student-1",
              matrixVersionId: "v1",
              careerVertical: "TECH_SOFTWARE",
              country: "DE",
              baseScore: 60,
              overlayDelta: 2,
              advisorOverrideDelta: 0,
              finalScore: 62,
              riskBand: "MODERATE",
              dataSparseFlag: false,
              outcomeProbability: 0.62,
              outcomeProbabilityLow: 0.54,
              outcomeProbabilityHigh: 0.70,
              outcomeConfidenceLevel: 5,
              outcomeProbabilityModelVersion: "heuristic-v1",
              outcomeProbabilityRationale: "Base rate for MODERATE risk band (62%) +0% for GCSS 62 vs. gating floor 60",
              factorScores: [],
            },
          ],
        }),
      ),
    );

    renderAt("/students/student-1/gcri");

    expect(
      await screen.findByText(
        (_, element) =>
          element?.tagName === "P" && element.textContent === "Predicted Year-1 employment likelihood: 54-70%",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Advisor confidence: 5/10")).toBeInTheDocument();
    expect(screen.getByText("Model: heuristic-v1")).toBeInTheDocument();
  });
});
