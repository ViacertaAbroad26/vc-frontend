import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

type NotificationItem = {
  id: string;
  template: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

type PreferenceItem = { template: string; channels: string[] };

const myNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    template: "session1-questions-approved",
    title: "Your Session 1 prep is ready",
    body: "Your advisor has approved questions to help you prepare for Session 1.",
    createdAt: "2026-06-12T09:00:00Z",
    readAt: null,
  },
  {
    id: "notif-2",
    template: "intake-reminder",
    title: "Finish your intake form",
    body: "You're almost done — complete your intake form to keep things moving.",
    createdAt: "2026-06-10T09:00:00Z",
    readAt: "2026-06-10T10:00:00Z",
  },
];

const myPreferences: PreferenceItem[] = [
  { template: "intake-reminder", channels: ["EMAIL", "WHATSAPP"] },
  { template: "pre-session1", channels: ["EMAIL", "WHATSAPP"] },
  { template: "gap-loop-checkin", channels: ["EMAIL"] },
  { template: "session2-followup", channels: ["EMAIL", "WHATSAPP"] },
  { template: "application-deadline", channels: ["EMAIL", "WHATSAPP"] },
  { template: "pre-departure", channels: ["EMAIL", "WHATSAPP"] },
];

const advisorNotifications: NotificationItem[] = [
  {
    id: "notif-advisor-1",
    template: "dispute-opened",
    title: "A student opened a dispute",
    body: "A student has disputed their assessment result. Review it in the disputes queue.",
    createdAt: "2026-06-12T09:00:00Z",
    readAt: null,
  },
];

const advisorPreferences: PreferenceItem[] = [
  { template: "dispute-opened", channels: ["EMAIL"] },
  { template: "session1-questions-drafted", channels: ["EMAIL"] },
];

function unreadCount(items: NotificationItem[]) {
  return items.filter((n) => n.readAt === null).length;
}

function markRead(items: NotificationItem[], id: string) {
  const item = items.find((n) => n.id === id);
  if (item) item.readAt = new Date().toISOString();
  return item;
}

function markAllRead(items: NotificationItem[]) {
  const count = unreadCount(items);
  items.forEach((n) => {
    if (n.readAt === null) n.readAt = new Date().toISOString();
  });
  return count;
}

export const notificationHandlers = [
  http.get(`${API}/portal/students/me/notifications`, () =>
    HttpResponse.json({ items: myNotifications, unreadCount: unreadCount(myNotifications) }),
  ),
  http.post(`${API}/portal/students/me/notifications/mark-all-read`, () =>
    HttpResponse.json({ markedCount: markAllRead(myNotifications) }),
  ),
  http.patch(`${API}/portal/students/me/notifications/:notificationId/read`, ({ params }) => {
    const item = markRead(myNotifications, params.notificationId as string);
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json(
          { type: "https://viacerta.dev/errors/not-found", title: "Not found" },
          { status: 404 },
        );
  }),
  http.get(`${API}/portal/students/me/notification-preferences`, () =>
    HttpResponse.json({ preferences: myPreferences }),
  ),
  http.patch(`${API}/portal/students/me/notification-preferences`, async ({ request }) => {
    const body = (await request.json()) as { preferences: PreferenceItem[] };
    myPreferences.splice(0, myPreferences.length, ...body.preferences);
    return HttpResponse.json({ preferences: myPreferences });
  }),

  http.get(`${API}/advisor/notifications`, () =>
    HttpResponse.json({ items: advisorNotifications, unreadCount: unreadCount(advisorNotifications) }),
  ),
  http.post(`${API}/advisor/notifications/mark-all-read`, () =>
    HttpResponse.json({ markedCount: markAllRead(advisorNotifications) }),
  ),
  http.patch(`${API}/advisor/notifications/:notificationId/read`, ({ params }) => {
    const item = markRead(advisorNotifications, params.notificationId as string);
    return item
      ? HttpResponse.json(item)
      : HttpResponse.json(
          { type: "https://viacerta.dev/errors/not-found", title: "Not found" },
          { status: 404 },
        );
  }),
  http.get(`${API}/advisor/notification-preferences`, () =>
    HttpResponse.json({ preferences: advisorPreferences }),
  ),
  http.patch(`${API}/advisor/notification-preferences`, async ({ request }) => {
    const body = (await request.json()) as { preferences: PreferenceItem[] };
    advisorPreferences.splice(0, advisorPreferences.length, ...body.preferences);
    return HttpResponse.json({ preferences: advisorPreferences });
  }),
];
