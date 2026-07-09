import { http, HttpResponse } from "msw";

import { server } from "@/test/msw-server";
import { render, screen, userEvent } from "@/test/render";

import ReportPage from "./ReportPage";

const API = "http://localhost:8000/api/v1";

describe("ReportPage", () => {
  it("shows a pending message when the advisor hasn't published a report yet", async () => {
    server.use(
      http.get(`${API}/portal/students/me/report`, () =>
        HttpResponse.json(
          {
            type: "https://viacerta.dev/errors/not-found",
            title: "Not Found",
            detail: "No published report available",
            status: 404,
          },
          { status: 404 },
        ),
      ),
    );

    render(<ReportPage />);

    expect(await screen.findByText("Your report is being prepared")).toBeInTheDocument();
    expect(
      screen.getByText("Your advisor is finishing up your assessment report. This page will update automatically once it's ready."),
    ).toBeInTheDocument();
  });

  it("renders the published report sections", async () => {
    render(<ReportPage />);

    expect(await screen.findByText("Ready with Plan")).toBeInTheDocument();
    expect(screen.getByText("Academic readiness")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
    expect(screen.getByText("Visa delay")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" && element.textContent === "Predicted Year-1 employment likelihood: 54-70%",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
    expect(screen.getByText(/This report predicts probability, not certainty/)).toBeInTheDocument();
  });

  it("lets a student open a dispute about their score", async () => {
    render(<ReportPage />);

    expect(await screen.findByText("You haven’t disputed your score.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dispute this score" }));
    await userEvent.type(
      screen.getByLabelText("Reason"),
      "I believe my financial readiness sub-scores were miscounted.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit dispute" }));

    expect(await screen.findByText("I believe my financial readiness sub-scores were miscounted.")).toBeInTheDocument();
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
  });
});
