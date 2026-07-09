import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const internalHandlers = [
  http.get(`${API}/internal/outcomes/coverage`, () =>
    HttpResponse.json({
      cohorts: [
        {
          cohort: "September 2026",
          studentCount: 2,
          confirmedCount: 2,
          year1CapturedCount: 1,
          year1CoveragePct: 0.5,
          year3CapturedCount: 1,
          year3CoveragePct: 0.5,
        },
        {
          cohort: "Unspecified",
          studentCount: 1,
          confirmedCount: 1,
          year1CapturedCount: 0,
          year1CoveragePct: 0,
          year3CapturedCount: 0,
          year3CoveragePct: 0,
        },
      ],
      totalConfirmed: 3,
      totalYear1Captured: 1,
      totalYear1CoveragePct: 0.33,
    }),
  ),

  http.get(`${API}/internal/leads`, () =>
    HttpResponse.json({
      data: [
        {
          studentId: "student-2",
          fullName: "Rohan Gupta",
          currentState: "LEAD",
          advisorId: null,
          coordinatorId: null,
          createdAt: "2026-06-09T00:00:00Z",
        },
      ],
      nextCursor: null,
    }),
  ),

  http.post(`${API}/internal/students/:studentId/assign-advisor`, () =>
    HttpResponse.json({ message: "advisor assigned" }),
  ),

  http.get(`${API}/internal/users/advisors`, () =>
    HttpResponse.json({
      data: [{ id: "advisor-1", email: "priya@example.com", fullName: "Priya Nair", role: "ADVISOR", isActive: true }],
      nextCursor: null,
    }),
  ),

  http.get(`${API}/internal/documents`, () =>
    HttpResponse.json({
      data: [
        {
          documentId: "doc-1",
          studentId: "student-1",
          studentName: "Asha Mehta",
          type: "BANK_STATEMENT",
          status: "UPLOADED",
          evidenceLevel: "L3",
          fileName: "bank-statement.pdf",
          uploadedAt: "2026-06-10T00:00:00Z",
        },
      ],
      nextCursor: null,
    }),
  ),

  http.post(`${API}/internal/documents/:documentId/verify`, () =>
    HttpResponse.json({ documentId: "doc-1", status: "VERIFIED", evidenceLevel: "L4" }),
  ),

  http.post(`${API}/internal/documents/:documentId/reject`, () =>
    HttpResponse.json({ documentId: "doc-1", status: "REJECTED", evidenceLevel: "L3" }),
  ),

  http.get(`${API}/internal/users`, () =>
    HttpResponse.json({
      data: [
        { id: "user-1", email: "priya@example.com", fullName: "Priya Nair", role: "ADVISOR", isActive: true },
        { id: "user-2", email: "amit@example.com", fullName: "Amit Shah", role: "COORDINATOR", isActive: true },
      ],
      nextCursor: null,
    }),
  ),

  http.post(`${API}/internal/users`, () =>
    HttpResponse.json(
      { id: "user-3", email: "new@example.com", fullName: "New User", role: "ADVISOR", isActive: true },
      { status: 201 },
    ),
  ),

  http.patch(`${API}/internal/users/:userId/role`, () =>
    HttpResponse.json({ id: "user-1", email: "priya@example.com", fullName: "Priya Nair", role: "ADMIN", isActive: true }),
  ),

  http.get(`${API}/internal/organizations`, () =>
    HttpResponse.json({
      data: [
        { id: "org-1", name: "Bengaluru HQ", code: "BLR-HQ", city: "Bengaluru", isActive: true },
        { id: "org-2", name: "Delhi Branch", code: "DEL-01", city: "Delhi", isActive: true },
      ],
    }),
  ),

  http.post(`${API}/internal/organizations`, async ({ request }) => {
    const body = (await request.json()) as { name: string; code: string; city?: string | null };
    return HttpResponse.json(
      { id: "org-3", name: body.name, code: body.code, city: body.city ?? null, isActive: true },
      { status: 201 },
    );
  }),

  http.get(`${API}/internal/sessions`, () =>
    HttpResponse.json({
      data: [
        {
          id: "session-1",
          studentId: "student-1",
          studentName: "Asha Mehta",
          advisorId: "advisor-1",
          advisorName: "Priya Nair",
          type: "SESSION_1",
          scheduledAt: "2026-06-10T10:00:00Z",
          startedAt: "2026-06-10T10:02:00Z",
          endedAt: "2026-06-10T10:40:00Z",
          notes: "Covered intake summary and target countries.",
          parentJoined: false,
        },
      ],
      nextCursor: null,
    }),
  ),

  http.post(`${API}/internal/outcomes`, async ({ request }) => {
    const body = (await request.json()) as { studentId: string };
    return HttpResponse.json(
      { id: "outcome-1", studentId: body.studentId, capturedAt: "2026-06-13T00:00:00Z" },
      { status: 201 },
    );
  }),

  http.post(`${API}/internal/outcomes/year3`, async ({ request }) => {
    const body = (await request.json()) as { studentId: string };
    return HttpResponse.json(
      { id: "outcome-2", studentId: body.studentId, capturedAt: "2026-06-13T00:00:00Z" },
      { status: 201 },
    );
  }),

  http.get(`${API}/internal/data-ops/freshness`, () =>
    HttpResponse.json({
      matrixVersion: "2026.06.01",
      maxStalenessDays: 30,
      cells: [
        {
          vertical: "TECH_SOFTWARE",
          country: "Canada",
          lastRefreshAt: "2026-05-01T00:00:00Z",
          ageDays: 43,
          stale: true,
          dataPoints: 120,
        },
        {
          vertical: "DATA_AND_AI",
          country: "Germany",
          lastRefreshAt: "2026-06-05T00:00:00Z",
          ageDays: 8,
          stale: false,
          dataPoints: 95,
        },
      ],
    }),
  ),

  http.post(`${API}/internal/data-ops/hardcoded-downgrade`, () =>
    HttpResponse.json({
      id: "matrix-2",
      version: "2026.06.01.delta.01",
      isActive: true,
      publishedAt: "2026-06-13T00:00:00Z",
    }),
  ),

  http.get(`${API}/internal/audit-logs`, () =>
    HttpResponse.json({
      data: [
        {
          id: "audit-1",
          actorId: "user-1",
          action: "DOCUMENT_VERIFIED",
          entityType: "DOCUMENT",
          entityId: "doc-1",
          before: { status: "UPLOADED" },
          after: { status: "VERIFIED", evidenceLevel: "L4" },
          evidence: "Verified against original passport scan.",
          createdAt: "2026-06-10T12:00:00Z",
        },
      ],
      nextCursor: null,
    }),
  ),
];
