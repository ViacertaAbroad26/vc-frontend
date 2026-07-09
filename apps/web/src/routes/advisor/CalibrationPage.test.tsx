import { Route, Routes } from "react-router-dom";

import { useAuthStore } from "@/stores/auth-store";
import { render, screen, userEvent } from "@/test/render";

import CalibrationPage from "./CalibrationPage";

function renderAt(path: string) {
  return render(
    <Routes>
      <Route path="/calibration" element={<CalibrationPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("CalibrationPage", () => {
  afterEach(() => {
    useAuthStore.setState({ user: null });
  });

  it("lets an advisor score a weekly calibration case", async () => {
    useAuthStore.setState({
      user: { id: "advisor-1", email: "advisor@example.com", fullName: "Advisor One", role: "ADVISOR", studentId: null, orgId: null },
    });

    renderAt("/calibration");

    expect(await screen.findByText("GCSS 72")).toBeInTheDocument();
    expect(screen.getByText("Ready with Plan")).toBeInTheDocument();

    const scoreInput = screen.getByLabelText("Your score");
    await userEvent.clear(scoreInput);
    await userEvent.type(scoreInput, "70");
    await userEvent.click(screen.getByRole("button", { name: "Submit score" }));

    expect(await screen.findByText("Score recorded.")).toBeInTheDocument();
    expect(screen.queryByText("Variance dashboard")).not.toBeInTheDocument();
  });

  it("shows the variance dashboard to senior advisors", async () => {
    useAuthStore.setState({
      user: { id: "senior-1", email: "senior@example.com", fullName: "Senior One", role: "SENIOR_ADVISOR", studentId: null, orgId: null },
    });

    renderAt("/calibration");

    expect(await screen.findByText("Variance dashboard")).toBeInTheDocument();
    expect(await screen.findByText("5")).toBeInTheDocument();
    expect(screen.getByText("Within threshold")).toBeInTheDocument();
  });

  it("lets a senior advisor draft a calibration rubric proposal", async () => {
    useAuthStore.setState({
      user: { id: "senior-1", email: "senior@example.com", fullName: "Senior One", role: "SENIOR_ADVISOR", studentId: null, orgId: null },
    });

    renderAt("/calibration");

    expect(await screen.findByText("Calibration loop")).toBeInTheDocument();
    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.getAllByText("Sufficient").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "Draft new rubric proposal" }));

    expect(await screen.findByText("Drafted v3-calibration-draft (from v3)")).toBeInTheDocument();
  });
});
