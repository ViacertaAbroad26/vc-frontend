import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

const myDisputes: {
  id: string;
  studentId: string;
  assessmentId: string;
  reason: string;
  status: string;
  openedAt: string;
  resolvedById: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}[] = [];

const session1Answers: { studentAnswers: string[] | null; answeredAt: string | null } = {
  studentAnswers: null,
  answeredAt: null,
};

let session1Booking: { scheduledAt: string; advisorName: string | null; durationMinutes: number } | null = null;

export function resetSession1State() {
  session1Answers.studentAnswers = null;
  session1Answers.answeredAt = null;
  session1Booking = null;
}

export const reportHandlers = [
  http.get(`${API}/portal/students/me/report`, () =>
    HttpResponse.json({
      reportId: "report-1",
      assessmentId: "assessment-1",
      version: 1,
      publishedAt: "2026-06-10T00:00:00Z",
      gcss: {
        total: 78,
        max: 100,
        flag: "YELLOW",
        recommendation: "You're in good shape, with a few gaps to close before applications open.",
        dimensions: [
          { key: "academics", label: "Academic readiness", score: 32, max: 40, subScores: [] },
          { key: "finance", label: "Financial readiness", score: 18, max: 30, subScores: [] },
        ],
      },
      gcri: [
        {
          country: "Germany",
          careerVertical: "Engineering",
          score: 72,
          riskBand: "MODERATE",
          dataSparseFlag: false,
          outcomeProbability: 0.62,
          outcomeProbabilityLow: 0.54,
          outcomeProbabilityHigh: 0.70,
          factors: [{ factor: "Visa approval rate", score: 18, max: 25 }],
        },
      ],
      advisorInsights: [
        { section: "Assessment", text: "Strong academic foundation with room to grow test scores." },
        { section: "Risks", text: "Visa timelines for Germany can run long; apply early." },
      ],
      ninetyDayPlan: [{ week: 1, focus: "Finalise shortlist", actions: ["Research 3 universities", "Book IELTS"] }],
      riskRegister: [{ risk: "Visa delay", severity: "MODERATE", mitigation: "Apply at least 4 months ahead." }],
      parentSummary: {
        cost: "Approx. €15,000/year including living costs.",
        safety: "Low crime rate, well-established student support services.",
        timeline: "Applications open in September, decisions by March.",
        roi: "Strong graduate employment outcomes in engineering.",
      },
      disclaimer: "This report predicts probability, not certainty.",
    }),
  ),

  http.get(`${API}/portal/students/me/report/pdf`, () =>
    HttpResponse.json({ url: "https://files.example.com/report-1.pdf", expiresIn: 900 }),
  ),

  http.get(`${API}/portal/students/me/disputes`, () => HttpResponse.json({ items: myDisputes })),

  http.post(`${API}/portal/students/me/disputes`, async ({ request }) => {
    const body = (await request.json()) as { assessmentId: string; reason: string };
    const dispute = {
      id: `dispute-${myDisputes.length + 1}`,
      studentId: "student-1",
      assessmentId: body.assessmentId,
      reason: body.reason,
      status: "OPEN",
      openedAt: "2026-06-12T00:00:00Z",
      resolvedById: null,
      resolvedAt: null,
      resolutionNotes: null,
    };
    myDisputes.unshift(dispute);
    return HttpResponse.json(dispute, { status: 201 });
  }),

  http.get(`${API}/portal/parent/students/:studentId`, () =>
    HttpResponse.json({
      studentName: "Aditya Basu",
      currentStage: 4,
      gcssFlag: "YELLOW",
      gcssScore: 78,
      parentSummary: {
        cost: "Approx. €15,000/year including living costs.",
        safety: "Low crime rate, well-established student support services.",
        timeline: "Applications open in September, decisions by March.",
        roi: "Strong graduate employment outcomes in engineering.",
      },
      disclaimer: "This report predicts probability, not certainty.",
    }),
  ),

  http.get(`${API}/portal/students/me/session1-questions`, () =>
    HttpResponse.json({
      questions: [
        {
          focusArea: "Financial runway",
          prompt: "Walk me through your current savings and funding plan for the first year abroad.",
        },
        {
          focusArea: "Career clarity",
          prompt: "What roles are you targeting in the first 12 months after graduation?",
        },
      ],
      approvedAt: "2026-06-13T00:00:00Z",
      studentAnswers: session1Answers.studentAnswers,
      answeredAt: session1Answers.answeredAt,
    }),
  ),

  http.post(`${API}/portal/students/me/session1-questions/answers`, async ({ request }) => {
    const body = (await request.json()) as { answers: string[] };
    session1Answers.studentAnswers = body.answers;
    session1Answers.answeredAt = "2026-06-14T00:00:00Z";
    return HttpResponse.json({
      questions: [
        {
          focusArea: "Financial runway",
          prompt: "Walk me through your current savings and funding plan for the first year abroad.",
        },
        {
          focusArea: "Career clarity",
          prompt: "What roles are you targeting in the first 12 months after graduation?",
        },
      ],
      approvedAt: "2026-06-13T00:00:00Z",
      studentAnswers: session1Answers.studentAnswers,
      answeredAt: session1Answers.answeredAt,
    });
  }),

  http.get(`${API}/portal/students/me/session1-booking/availability`, ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get("date") ?? "2026-06-15";
    return HttpResponse.json({
      date,
      slots: [`${date}T10:00:00+00:00`, `${date}T10:45:00+00:00`, `${date}T11:30:00+00:00`],
    });
  }),

  http.get(`${API}/portal/students/me/session1-booking`, () => {
    if (!session1Booking) {
      return HttpResponse.json(
        { type: "https://viacerta.dev/errors/not-found", title: "Not found", detail: "No booking yet" },
        { status: 404 },
      );
    }
    return HttpResponse.json(session1Booking);
  }),

  http.post(`${API}/portal/students/me/session1-booking`, async ({ request }) => {
    const body = (await request.json()) as { scheduledAt: string };
    session1Booking = { scheduledAt: body.scheduledAt, advisorName: "Advisor Name", durationMinutes: 45 };
    return HttpResponse.json(session1Booking);
  }),
];
