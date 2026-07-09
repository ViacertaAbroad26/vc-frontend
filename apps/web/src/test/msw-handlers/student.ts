import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const studentHandlers = [
  http.get(`${API}/portal/students/me/journey`, () =>
    HttpResponse.json({
      currentState: "INTAKE_SENT",
      currentStage: 1,
      stages: [
        { stage: 1, name: "Assessment", status: "IN_PROGRESS", startedAt: "2026-06-01T00:00:00Z", completedAt: null },
        { stage: 2, name: "Country Mapping", status: "PENDING", startedAt: null, completedAt: null },
        { stage: 3, name: "University & Course Selection", status: "PENDING", startedAt: null, completedAt: null },
        { stage: 4, name: "Document Verification", status: "PENDING", startedAt: null, completedAt: null },
        { stage: 5, name: "Admission + Visa", status: "PENDING", startedAt: null, completedAt: null },
        { stage: 6, name: "Pre-Departure", status: "PENDING", startedAt: null, completedAt: null },
        { stage: 7, name: "Career Support", status: "PENDING", startedAt: null, completedAt: null },
      ],
      nextActions: [{ actorRole: "STUDENT", description: "Finish and submit your intake form.", dueAt: null }],
      advisorName: "Sachin Chauhan",
    }),
  ),
];
