import { http, HttpResponse } from "msw";

import { render, screen, userEvent, waitFor } from "@/test/render";
import { server } from "@/test/msw-server";

import ProfilePage from "./ProfilePage";

const API = "http://localhost:8000/api/v1";

describe("ProfilePage", () => {
  it("renders all sections with existing values", async () => {
    render(<ProfilePage />);

    expect(await screen.findByDisplayValue("Alex Student")).toBeInTheDocument();
    expect(screen.getByDisplayValue("W6352777")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Mechatronics & Automation Engineer")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /academic qualification/i }));
    expect(await screen.findByDisplayValue("KIIT")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /test scores/i }));
    expect(await screen.findByDisplayValue("320")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /work experience/i }));
    expect(await screen.findByDisplayValue("Foreign Admits")).toBeInTheDocument();
  });

  it("saves edits to the application profile", async () => {
    render(<ProfilePage />);

    const passportInput = await screen.findByDisplayValue("W6352777");
    await userEvent.clear(passportInput);
    await userEvent.type(passportInput, "Z9999999");

    await userEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => expect(screen.getByText("Saved")).toBeInTheDocument());
  });

  it("locks the form once the profile is submitted", async () => {
    render(<ProfilePage />);

    await screen.findByDisplayValue("Alex Student");

    await userEvent.click(screen.getByRole("button", { name: "Submit profile" }));

    await waitFor(() => expect(screen.getByText("Submitted")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Submit profile" })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Alex Student")).toBeDisabled();
  });

  it("lets a student request changes to a locked section", async () => {
    server.use(
      http.get(`${API}/portal/students/me/profile`, () =>
        HttpResponse.json({
          fullName: "Alex Student",
          persona: "FINAL_YEAR_UG",
          profileData: {},
          careerGoal: "",
          targetCountries: [],
          targetIntake: "",
          contactPhone: null,
          address: null,
          applicationProfile: {},
          profileSubmittedAt: "2026-01-01T00:00:00Z",
        }),
      ),
    );

    render(<ProfilePage />);

    await screen.findByDisplayValue("Alex Student");

    const requestToggle = screen.getAllByRole("button", { name: /request changes to this section/i })[0]!;
    await userEvent.click(requestToggle);

    const textarea = await screen.findByPlaceholderText(/describe what you'd like an advisor to update/i);
    await userEvent.type(textarea, "Please correct my date of birth.");

    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    expect(await screen.findByText("Please correct my date of birth.")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
