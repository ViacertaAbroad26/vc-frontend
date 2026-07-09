import { format } from "date-fns";
import { http, HttpResponse } from "msw";

import { resetSession1State } from "@/test/msw-handlers/report";
import { server } from "@/test/msw-server";
import { render, screen, userEvent, waitFor } from "@/test/render";

import MySessionPrepPage from "./MySessionPrepPage";

const API = "http://localhost:8000/api/v1";

describe("MySessionPrepPage", () => {
  afterEach(() => {
    resetSession1State();
  });

  it("renders the advisor-approved Session 1 questions", async () => {
    render(<MySessionPrepPage />);

    expect(await screen.findByText("Financial runway")).toBeInTheDocument();
    expect(
      screen.getByText("Walk me through your current savings and funding plan for the first year abroad."),
    ).toBeInTheDocument();
    expect(screen.getByText("Career clarity")).toBeInTheDocument();
  });

  it("shows an empty state when no sequence has been approved yet", async () => {
    server.use(
      http.get(`${API}/portal/students/me/session1-questions`, () =>
        HttpResponse.json(
          { type: "https://viacerta.dev/errors/not-found", title: "Not found", detail: "Not ready" },
          { status: 404 },
        ),
      ),
    );

    render(<MySessionPrepPage />);

    expect(await screen.findByText("Session 1 prep isn't ready yet")).toBeInTheDocument();
  });

  it("submits answers and locks them as read-only", async () => {
    const user = userEvent.setup();
    render(<MySessionPrepPage />);

    expect(await screen.findByText("Financial runway")).toBeInTheDocument();

    const textareas = screen.getAllByRole("textbox");
    await user.type(textareas[0]!, "My savings cover the first semester.");
    await user.type(textareas[1]!, "I'm targeting software engineering roles.");

    await user.click(screen.getByRole("button", { name: "Submit answers" }));

    expect(await screen.findByText("My savings cover the first semester.")).toBeInTheDocument();
    expect(screen.getByText("I'm targeting software engineering roles.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit answers" })).not.toBeInTheDocument();
  });

  it("books a Session 1 slot after answers are submitted", async () => {
    const user = userEvent.setup();
    render(<MySessionPrepPage />);

    expect(await screen.findByText("Schedule your Session 1 meeting")).toBeInTheDocument();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedSlotLabel = format(new Date(`${format(tomorrow, "yyyy-MM-dd")}T10:00:00+00:00`), "p");

    const slotButton = await screen.findByRole("button", { name: expectedSlotLabel });
    await user.click(slotButton);
    await user.click(screen.getByRole("button", { name: "Confirm Session 1 time" }));

    await waitFor(() => expect(screen.getByText("Session 1 is booked")).toBeInTheDocument());
  });
});
