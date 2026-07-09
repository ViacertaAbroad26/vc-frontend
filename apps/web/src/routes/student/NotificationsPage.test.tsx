import { http, HttpResponse } from "msw";

import { server } from "@/test/msw-server";
import { render, screen, waitFor } from "@/test/render";

import NotificationsPage from "./NotificationsPage";

const API = "http://localhost:8000/api/v1";

describe("NotificationsPage", () => {
  it("renders the student's notifications with an unread badge", async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText("Your Session 1 prep is ready")).toBeInTheDocument();
    expect(screen.getByText("Finish your intake form")).toBeInTheDocument();
    expect(screen.getByText("1 unread")).toBeInTheDocument();
  });

  it("marks all notifications as read", async () => {
    render(<NotificationsPage />);

    const button = await screen.findByRole("button", { name: "Mark all as read" });
    button.click();

    await waitFor(() => expect(screen.getByText("All caught up")).toBeInTheDocument());
  });

  it("shows an empty state when there are no notifications", async () => {
    server.use(
      http.get(`${API}/portal/students/me/notifications`, () =>
        HttpResponse.json({ items: [], unreadCount: 0 }),
      ),
    );

    render(<NotificationsPage />);

    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });
});
