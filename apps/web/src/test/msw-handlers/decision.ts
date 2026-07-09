import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const decisionHandlers = [
  http.post(`${API}/portal/students/me/decision`, () =>
    HttpResponse.json({
      decision: "ENROLL",
      currentState: "ENROLLED",
      recordedAt: "2026-06-12T00:00:00Z",
    }),
  ),
];
