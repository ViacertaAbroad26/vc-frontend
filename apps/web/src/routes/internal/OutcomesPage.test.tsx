import { render, screen, userEvent, waitFor } from "@/test/render";

import OutcomesPage from "./OutcomesPage";

describe("OutcomesPage", () => {
  it("shows outcome data coverage per cohort", async () => {
    render(<OutcomesPage />, { initialEntries: ["/outcomes"] });

    expect(await screen.findByText("September 2026")).toBeInTheDocument();
    expect(screen.getByText("Unspecified")).toBeInTheDocument();
    expect(screen.getByText(/3 confirmed assessments/)).toBeInTheDocument();
    expect(screen.getByText(/1 Year-1 outcomes captured/)).toBeInTheDocument();
  });

  it("lets Career Services capture a Year-1 outcome for a student", async () => {
    render(<OutcomesPage />, { initialEntries: ["/outcomes"] });

    await userEvent.click(screen.getByRole("tab", { name: "Capture outcome" }));
    await userEvent.type(screen.getByLabelText("Student ID"), "stu_123");
    await userEvent.click(screen.getByRole("button", { name: "Capture Year-1 outcome" }));

    expect(await screen.findByText("Year-1 outcome captured.")).toBeInTheDocument();
  });

  it("lets Career Services capture a Year-3 outcome for a student", async () => {
    render(<OutcomesPage />, { initialEntries: ["/outcomes"] });

    await userEvent.click(screen.getByRole("tab", { name: "Capture outcome" }));
    await userEvent.click(screen.getByRole("tab", { name: "Year 3" }));
    await userEvent.type(screen.getByLabelText("Student ID"), "stu_123");
    await userEvent.click(screen.getByRole("button", { name: "Capture Year-3 outcome" }));

    expect(await screen.findByText("Year-3 outcome captured.")).toBeInTheDocument();
  });

  it("imports outcomes in bulk from pasted CSV data", async () => {
    render(<OutcomesPage />, { initialEntries: ["/outcomes"] });

    await userEvent.click(screen.getByRole("tab", { name: "Bulk import" }));
    await userEvent.type(
      screen.getByLabelText("CSV data"),
      "stu_123,true,55000,USD,Canada,Software Engineer,\nstu_456,false,,,,,",
    );
    await userEvent.click(screen.getByRole("button", { name: "Import outcomes" }));

    await waitFor(() => expect(screen.getByText("2 of 2 rows imported")).toBeInTheDocument());
    expect(screen.getByText("stu_123: imported")).toBeInTheDocument();
    expect(screen.getByText("stu_456: imported")).toBeInTheDocument();
  });
});
