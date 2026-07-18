import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";

import { render, screen, userEvent, waitFor } from "@/test/render";
import { server } from "@/test/msw-server";

import DecisionGatePage from "./DecisionGatePage";
import JourneyPage from "./JourneyPage";

const API = "http://localhost:8000/api/v1";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/decision" element={<DecisionGatePage />} />
      <Route path="/journey" element={<JourneyPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("DecisionGatePage", () => {
  it("submits a decision and redirects to the journey", async () => {
    renderAt("/decision");

    await userEvent.click(await screen.findByRole("radio", { name: /Enrol for full-service support/i }));
    await userEvent.type(
      screen.getByLabelText("Why this choice?"),
      "I want full guidance through the process.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm decision" }));

    await waitFor(() => {
      expect(screen.getByText("My Journey")).toBeInTheDocument();
    });
  });

  it("shows the recorded decision instead of the form once a decision has been made", async () => {
    server.use(
      http.get(`${API}/portal/students/me/journey`, () =>
        HttpResponse.json({
          currentState: "ENROLLED",
          currentStage: 1,
          stages: [],
          nextActions: [],
          advisorName: "Sachin Chauhan",
        }),
      ),
    );

    renderAt("/decision");

    expect(await screen.findByText("Decision recorded")).toBeInTheDocument();
    expect(screen.getByText("Enrol for full-service support")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("still shows the recorded decision after the journey moves past the decision gate", async () => {
    server.use(
      http.get(`${API}/portal/students/me/journey`, () =>
        HttpResponse.json({
          currentState: "STAGE2_COUNTRY_MAPPING",
          currentStage: 2,
          stages: [],
          nextActions: [],
          advisorName: "Sachin Chauhan",
        }),
      ),
    );

    renderAt("/decision");

    expect(await screen.findByText("Decision recorded")).toBeInTheDocument();
    expect(screen.getByText("Enrol for full-service support")).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });
});
