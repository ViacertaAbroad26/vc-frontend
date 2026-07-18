import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const platformFeatureHandlers = [
  http.get(`${API}/portal/students/me/achievements`, () =>
    HttpResponse.json({
      achievements: [
        { stage: 0, label: "Discovery", earned: true, earnedAt: "2026-06-01T00:00:00Z" },
        { stage: 1, label: "Global Career Assessment", earned: false, earnedAt: null },
        { stage: 2, label: "Career Strategy", earned: false, earnedAt: null },
        { stage: 3, label: "University Strategy", earned: false, earnedAt: null },
        { stage: 4, label: "Application Execution", earned: false, earnedAt: null },
        { stage: 5, label: "Visa & Financial Planning", earned: false, earnedAt: null },
        { stage: 6, label: "Pre-Departure", earned: false, earnedAt: null },
        { stage: 7, label: "Global Career Success", earned: false, earnedAt: null },
      ],
      level: 1,
      levelLabel: "Level 1 of 8",
    }),
  ),

  http.get(`${API}/portal/students/me/messages`, () =>
    HttpResponse.json({ advisorId: "advisor-1", messages: [], unreadCount: 0 }),
  ),
  http.post(`${API}/portal/students/me/messages`, () =>
    HttpResponse.json({ advisorId: "advisor-1", messages: [], unreadCount: 0 }),
  ),
  http.post(`${API}/portal/students/me/messages/read`, () =>
    HttpResponse.json({ advisorId: "advisor-1", messages: [], unreadCount: 0 }),
  ),

  http.get(`${API}/portal/students/me/assistant`, () => HttpResponse.json({ turns: [] })),
  http.post(`${API}/portal/students/me/assistant/messages`, () => HttpResponse.json({ turns: [] })),

  http.get(`${API}/portal/students/me/analytics`, () =>
    HttpResponse.json({
      snapshots: [],
      current_dimensions: [],
      currentDimensions: [],
    }),
  ),
];
