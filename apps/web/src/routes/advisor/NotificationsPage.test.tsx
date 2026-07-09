import { http, HttpResponse } from "msw";

import { server } from "@/test/msw-server";
import { render, screen } from "@/test/render";

import NotificationsPage from "./NotificationsPage";

const API = "http://localhost:8000/api/v1";

describe("Advisor NotificationsPage", () => {
  it("renders advisor notifications", async () => {
    render(<NotificationsPage />);

    expect(await screen.findByText("A student opened a dispute")).toBeInTheDocument();
    expect(screen.getByText("1 unread")).toBeInTheDocument();
  });

  it("shows an empty state when there are no notifications", async () => {
    server.use(
      http.get(`${API}/advisor/notifications`, () => HttpResponse.json({ items: [], unreadCount: 0 })),
    );

    render(<NotificationsPage />);

    expect(await screen.findByText("No notifications yet")).toBeInTheDocument();
  });
});
