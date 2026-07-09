import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

const disputes: {
  id: string;
  studentId: string;
  studentName: string;
  assessmentId: string;
  reason: string;
  status: string;
  openedAt: string;
  resolvedById: string | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;
}[] = [
  {
    id: "dispute-1",
    studentId: "student-1",
    studentName: "Aditya Basu",
    assessmentId: "assessment-1",
    reason: "I believe my career clarity score was scored too low given my responses.",
    status: "OPEN",
    openedAt: "2026-06-08T00:00:00Z",
    resolvedById: null,
    resolvedAt: null,
    resolutionNotes: null,
  },
];

type Session1Sequence = {
  id: string;
  studentId: string;
  status: "DRAFT" | "APPROVED";
  modelVersion: string;
  questions: { focusArea: string; prompt: string; rationale: string }[];
  generatedAt: string;
  approvedById: string | null;
  approvedAt: string | null;
};

function defaultSession1Sequence(): Session1Sequence {
  return {
    id: "session1-1",
    studentId: "student-1",
    status: "DRAFT",
    modelVersion: "session1-questions-v1",
    questions: [
      {
        focusArea: "Financial runway",
        prompt: "Walk me through your current savings and funding plan for the first year abroad.",
        rationale: "Financial runway was the lowest-scoring GCSS sub-component.",
      },
      {
        focusArea: "Career clarity",
        prompt: "What roles are you targeting in the first 12 months after graduation?",
        rationale: "Career clarity scored below the readiness threshold.",
      },
    ],
    generatedAt: "2026-06-10T00:00:00Z",
    approvedById: null,
    approvedAt: null,
  };
}

let session1Sequence: Session1Sequence | null = defaultSession1Sequence();

export const advisorHandlers = [
  http.get(`${API}/advisor/cases`, () =>
    HttpResponse.json({
      data: [
        {
          studentId: "student-1",
          fullName: "Asha Mehta",
          persona: "School student",
          currentState: "GCSS_CONFIRMED",
          aiPreScore: { gcssFinal: 72, flag: "YELLOW", confidence: 0.8 },
          missingDocuments: ["BANK_STATEMENT"],
          lastUpdatedAt: "2026-06-10T00:00:00Z",
          createdAt: "2026-06-09T00:00:00Z",
        },
      ],
      nextCursor: null,
    }),
  ),

  http.get(`${API}/advisor/students/:studentId`, () =>
    HttpResponse.json({
      studentId: "student-1",
      fullName: "Asha Mehta",
      email: "asha@example.com",
      persona: "School student",
      profileData: {},
      careerGoal: "TECH_SOFTWARE",
      targetCountries: ["DE", "NL"],
      currentState: "GCSS_CONFIRMED",
      intakeAnswers: {},
      documents: [{ type: "TRANSCRIPT", status: "VERIFIED" }],
      assessment: { gcssFinal: 72, gcssFlag: "YELLOW", status: "DRAFT" },
      auditSummary: [{ action: "ASSESSMENT_AI_SCORED" }],
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/assessment`, () =>
    HttpResponse.json({
      id: "assessment-1",
      studentId: "student-1",
      rubricVersionId: "v1",
      rubricVersion: "1.0.0",
      status: "DRAFT",
      gcssRaw: 70,
      confidenceMultiplier: 1,
      gcssFinal: 72,
      flag: "YELLOW",
      aiContributionPct: 80,
      humanContributionPct: 20,
      dimensions: [
        {
          dimension: "ACADEMIC_AND_COGNITIVE_READINESS",
          raw: 14,
          max: 20,
          weighted: 14,
          overrideDelta: 0,
          overrideEvidence: null,
          overriddenById: null,
          subScores: [
            {
              subComponentKey: "GPA",
              raw: 14,
              max: 20,
              weight: 1,
              evidenceLevel: "L5",
              anchorMatched: "A2",
              rationale: "Transcript shows 3.6 GPA",
            },
          ],
        },
      ],
    }),
  ),

  http.post(`${API}/advisor/students/:studentId/assessment/override`, () =>
    HttpResponse.json({
      id: "assessment-1",
      studentId: "student-1",
      rubricVersionId: "v1",
      rubricVersion: "1.0.0",
      status: "DRAFT",
      gcssRaw: 70,
      confidenceMultiplier: 1,
      gcssFinal: 74,
      flag: "YELLOW",
      aiContributionPct: 80,
      humanContributionPct: 20,
      dimensions: [
        {
          dimension: "ACADEMIC_AND_COGNITIVE_READINESS",
          raw: 16,
          max: 20,
          weighted: 16,
          overrideDelta: 2,
          overrideEvidence: "Updated after reviewing transcript",
          overriddenById: "advisor-1",
          subScores: [
            {
              subComponentKey: "GPA",
              raw: 16,
              max: 20,
              weight: 1,
              evidenceLevel: "L5",
              anchorMatched: "A1",
              rationale: "Transcript shows 3.6 GPA",
            },
          ],
        },
      ],
    }),
  ),

  http.post(`${API}/advisor/students/:studentId/assessment/confirm`, () =>
    HttpResponse.json({
      id: "assessment-1",
      studentId: "student-1",
      rubricVersionId: "v1",
      rubricVersion: "1.0.0",
      status: "CONFIRMED",
      gcssRaw: 70,
      confidenceMultiplier: 1,
      gcssFinal: 72,
      flag: "YELLOW",
      aiContributionPct: 80,
      humanContributionPct: 20,
      dimensions: [
        {
          dimension: "ACADEMIC_AND_COGNITIVE_READINESS",
          raw: 14,
          max: 20,
          weighted: 14,
          overrideDelta: 0,
          overrideEvidence: null,
          overriddenById: null,
          subScores: [
            {
              subComponentKey: "GPA",
              raw: 14,
              max: 20,
              weight: 1,
              evidenceLevel: "L5",
              anchorMatched: "A2",
              rationale: "Transcript shows 3.6 GPA",
            },
          ],
        },
      ],
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/gcri`, () => HttpResponse.json({ results: [] })),

  http.post(`${API}/advisor/students/:studentId/gcri/run`, () =>
    HttpResponse.json({ jobId: "job-1", status: "QUEUED" }, { status: 202 }),
  ),

  http.post(`${API}/advisor/students/:studentId/gcri/:country/override`, ({ params }) =>
    HttpResponse.json({
      id: "gcri-1",
      studentId: "student-1",
      matrixVersionId: "v1",
      matrixVersion: "2026.Q2",
      careerVertical: "TECH_SOFTWARE",
      country: params.country,
      baseScore: 60,
      overlayDelta: 2,
      advisorOverrideDelta: 3,
      advisorOverrideEvidence: "Adjusted for visa policy change",
      finalScore: 65,
      riskBand: "MODERATE",
      dataSparseFlag: false,
      factorScores: [],
    }),
  ),

  http.post(`${API}/advisor/students/:studentId/report/build`, () =>
    HttpResponse.json({ jobId: "job-2", status: "QUEUED" }, { status: 202 }),
  ),

  http.post(`${API}/advisor/students/:studentId/report/insight`, async ({ request }) => {
    const body = (await request.json()) as { section: string; text: string };
    return HttpResponse.json({
      id: "report-1",
      studentId: "student-1",
      assessmentId: "assessment-1",
      version: 1,
      rubricVersionId: "v1",
      matrixVersionId: "v1",
      content: {},
      parentSummary: {},
      advisorInsights: [{ section: body.section, text: body.text }],
      pdfS3Key: null,
      publishedAt: null,
      disclaimer: "This report is advisory only.",
    });
  }),

  http.post(`${API}/advisor/students/:studentId/report/publish`, () =>
    HttpResponse.json({
      id: "report-1",
      studentId: "student-1",
      assessmentId: "assessment-1",
      version: 1,
      rubricVersionId: "v1",
      matrixVersionId: "v1",
      content: {},
      parentSummary: {},
      advisorInsights: [],
      pdfS3Key: null,
      publishedAt: "2026-06-12T00:00:00Z",
      disclaimer: "This report is advisory only.",
    }),
  ),

  http.post(`${API}/internal/workflow/students/:studentId/advance`, async ({ params, request }) => {
    const body = (await request.json()) as { targetState: string };
    return HttpResponse.json({ studentId: params.studentId, currentState: body.targetState });
  }),

  http.get(`${API}/advisor/students/:studentId/country-mapping`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      candidates: [
        { country: "DE", gcriResultId: "gcri-1", finalScore: 70, riskBand: "MODERATE", rank: 1, selected: false, notes: null },
        { country: "NL", gcriResultId: "gcri-2", finalScore: 65, riskBand: "LOW", rank: 2, selected: false, notes: null },
      ],
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/country-mapping`, async ({ params, request }) => {
    const body = (await request.json()) as {
      candidates: { country: string; rank?: number; selected?: boolean; notes?: string }[];
    };
    const byCountry = new Map(body.candidates.map((c) => [c.country, c]));
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      candidates: [
        { country: "DE", gcriResultId: "gcri-1", finalScore: 70, riskBand: "MODERATE", rank: byCountry.get("DE")?.rank ?? 1, selected: byCountry.get("DE")?.selected ?? false, notes: byCountry.get("DE")?.notes ?? null },
        { country: "NL", gcriResultId: "gcri-2", finalScore: 65, riskBand: "LOW", rank: byCountry.get("NL")?.rank ?? 2, selected: byCountry.get("NL")?.selected ?? false, notes: byCountry.get("NL")?.notes ?? null },
      ],
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/country-mapping/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      candidates: [
        { country: "DE", gcriResultId: "gcri-1", finalScore: 70, riskBand: "MODERATE", rank: 1, selected: true, notes: null },
        { country: "NL", gcriResultId: "gcri-2", finalScore: 65, riskBand: "LOW", rank: 2, selected: false, notes: null },
      ],
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/university-selection`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      candidates: [],
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/university-selection`, async ({ params, request }) => {
    const body = (await request.json()) as {
      candidates: { id?: string | null; university: string; country: string; program: string; selected?: boolean }[];
    };
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      candidates: body.candidates.map((c, i) => ({
        id: c.id ?? `uni-${i + 1}`,
        university: c.university,
        country: c.country,
        program: c.program,
        degreeLevel: null,
        tuitionFee: null,
        applicationDeadline: null,
        rank: null,
        selected: c.selected ?? false,
        notes: null,
      })),
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/university-selection/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      candidates: [
        {
          id: "uni-1",
          university: "TU Munich",
          country: "DE",
          program: "MSc Computer Science",
          degreeLevel: "Masters",
          tuitionFee: null,
          applicationDeadline: null,
          rank: 1,
          selected: true,
          notes: null,
        },
      ],
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/documents`, () =>
    HttpResponse.json({
      documents: [
        {
          documentId: "doc-1",
          type: "TRANSCRIPT",
          status: "UPLOADED",
          evidenceLevel: "L1",
          fileName: "transcript.pdf",
          uploadedAt: "2026-06-10T00:00:00Z",
        },
        {
          documentId: "doc-2",
          type: "PASSPORT",
          status: "VERIFIED",
          evidenceLevel: "L5",
          fileName: "passport.pdf",
          uploadedAt: "2026-06-09T00:00:00Z",
        },
      ],
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/documents/:documentId/download`, () =>
    HttpResponse.json({ url: "/files/documents/student-1/doc-1_transcript.pdf", expiresIn: 900 }),
  ),

  http.post(`${API}/advisor/students/:studentId/documents/:documentId/verify`, async ({ params, request }) => {
    const body = (await request.json()) as { evidenceLevel: string };
    return HttpResponse.json({ documentId: params.documentId, status: "VERIFIED", evidenceLevel: body.evidenceLevel });
  }),

  http.post(`${API}/advisor/students/:studentId/documents/:documentId/reject`, ({ params }) =>
    HttpResponse.json({ documentId: params.documentId, status: "REJECTED", evidenceLevel: "L1" }),
  ),

  http.get(`${API}/advisor/students/:studentId/document-prep`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: [
        { documentType: "TRANSCRIPT", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "SCORE_REPORT", required: true, waived: false, notes: null, documentStatus: "NOT_SUBMITTED" },
        { documentType: "SOP", required: true, waived: false, notes: null, documentStatus: "NOT_SUBMITTED" },
        { documentType: "LOR", required: true, waived: false, notes: null, documentStatus: "NOT_SUBMITTED" },
        { documentType: "CV", required: true, waived: false, notes: null, documentStatus: "NOT_SUBMITTED" },
        { documentType: "PASSPORT", required: true, waived: false, notes: null, documentStatus: "NOT_SUBMITTED" },
        { documentType: "BANK_STATEMENT", required: true, waived: false, notes: null, documentStatus: "UNDER_REVIEW" },
      ],
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/document-prep`, async ({ params, request }) => {
    const body = (await request.json()) as {
      items: { documentType: string; required?: boolean | null; waived?: boolean | null; notes?: string | null }[];
    };
    const byType = new Map(body.items.map((i) => [i.documentType, i]));
    const statuses: Record<string, string> = {
      TRANSCRIPT: "VERIFIED",
      SCORE_REPORT: "NOT_SUBMITTED",
      SOP: "NOT_SUBMITTED",
      LOR: "NOT_SUBMITTED",
      CV: "NOT_SUBMITTED",
      PASSPORT: "NOT_SUBMITTED",
      BANK_STATEMENT: "UNDER_REVIEW",
    };
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: Object.keys(statuses).map((documentType) => {
        const upd = byType.get(documentType);
        return {
          documentType,
          required: upd?.required ?? true,
          waived: upd?.waived ?? false,
          notes: upd?.notes ?? null,
          documentStatus: statuses[documentType],
        };
      }),
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/document-prep/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      items: [
        { documentType: "TRANSCRIPT", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "SCORE_REPORT", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "SOP", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "LOR", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "CV", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "PASSPORT", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
        { documentType: "BANK_STATEMENT", required: true, waived: false, notes: null, documentStatus: "VERIFIED" },
      ],
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/applications`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      applications: [
        {
          id: "app-1",
          universityCandidateId: "uni-1",
          university: "TU Munich",
          country: "DE",
          program: "MSc Computer Science",
          status: "NOT_STARTED",
          submittedAt: null,
          decisionAt: null,
          notes: null,
        },
      ],
      acceptedApplicationId: null,
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/applications`, async ({ params, request }) => {
    const body = (await request.json()) as {
      applications: { id: string; status?: string | null; submittedAt?: string | null; decisionAt?: string | null; notes?: string | null }[];
    };
    const byId = new Map(body.applications.map((a) => [a.id, a]));
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      applications: [
        {
          id: "app-1",
          universityCandidateId: "uni-1",
          university: "TU Munich",
          country: "DE",
          program: "MSc Computer Science",
          status: byId.get("app-1")?.status ?? "NOT_STARTED",
          submittedAt: byId.get("app-1")?.submittedAt ?? null,
          decisionAt: byId.get("app-1")?.decisionAt ?? null,
          notes: byId.get("app-1")?.notes ?? null,
        },
      ],
      acceptedApplicationId: null,
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/applications/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      applications: [
        {
          id: "app-1",
          universityCandidateId: "uni-1",
          university: "TU Munich",
          country: "DE",
          program: "MSc Computer Science",
          status: "ACCEPTED",
          submittedAt: "2026-01-10T00:00:00Z",
          decisionAt: "2026-03-01T00:00:00Z",
          notes: null,
        },
      ],
      acceptedApplicationId: "app-1",
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/visa`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      country: "DE",
      visaStatus: "NOT_STARTED",
      applicationSubmittedAt: null,
      interviewAt: null,
      decisionAt: null,
      notes: null,
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/visa`, async ({ params, request }) => {
    const body = (await request.json()) as {
      visaStatus?: string | null;
      applicationSubmittedAt?: string | null;
      interviewAt?: string | null;
      decisionAt?: string | null;
      notes?: string | null;
    };
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      country: "DE",
      visaStatus: body.visaStatus ?? "NOT_STARTED",
      applicationSubmittedAt: body.applicationSubmittedAt ?? null,
      interviewAt: body.interviewAt ?? null,
      decisionAt: body.decisionAt ?? null,
      notes: body.notes ?? null,
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/visa/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      country: "DE",
      visaStatus: "APPROVED",
      applicationSubmittedAt: "2026-01-10T00:00:00Z",
      interviewAt: "2026-02-01T00:00:00Z",
      decisionAt: "2026-02-15T00:00:00Z",
      notes: null,
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/pre-departure`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: [
        { task: "FLIGHT_BOOKED", required: true, done: false, notes: null },
        { task: "ACCOMMODATION_ARRANGED", required: true, done: false, notes: null },
        { task: "ORIENTATION_ATTENDED", required: true, done: false, notes: null },
        { task: "INSURANCE_PURCHASED", required: true, done: false, notes: null },
        { task: "FOREX_ARRANGED", required: true, done: false, notes: null },
        { task: "SIM_ARRANGED", required: true, done: false, notes: null },
      ],
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/pre-departure`, async ({ params, request }) => {
    const body = (await request.json()) as {
      items: { task: string; required?: boolean | null; done?: boolean | null; notes?: string | null }[];
    };
    const byTask = new Map(body.items.map((i) => [i.task, i]));
    const tasks = [
      "FLIGHT_BOOKED",
      "ACCOMMODATION_ARRANGED",
      "ORIENTATION_ATTENDED",
      "INSURANCE_PURCHASED",
      "FOREX_ARRANGED",
      "SIM_ARRANGED",
    ];
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: tasks.map((task) => {
        const upd = byTask.get(task);
        return {
          task,
          required: upd?.required ?? true,
          done: upd?.done ?? false,
          notes: upd?.notes ?? null,
        };
      }),
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/pre-departure/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      items: [
        { task: "FLIGHT_BOOKED", required: true, done: true, notes: null },
        { task: "ACCOMMODATION_ARRANGED", required: true, done: true, notes: null },
        { task: "ORIENTATION_ATTENDED", required: true, done: true, notes: null },
        { task: "INSURANCE_PURCHASED", required: true, done: true, notes: null },
        { task: "FOREX_ARRANGED", required: true, done: true, notes: null },
        { task: "SIM_ARRANGED", required: true, done: true, notes: null },
      ],
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/students/:studentId/placement`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: [
        { task: "ARRIVAL_CONFIRMED", required: true, done: false, notes: null },
        { task: "ENROLLMENT_CONFIRMED", required: true, done: false, notes: null },
        { task: "FIRST_CHECKIN_COMPLETED", required: true, done: false, notes: null },
      ],
      confirmedById: null,
      confirmedAt: null,
    }),
  ),

  http.patch(`${API}/advisor/students/:studentId/placement`, async ({ params, request }) => {
    const body = (await request.json()) as {
      items: { task: string; required?: boolean | null; done?: boolean | null; notes?: string | null }[];
    };
    const byTask = new Map(body.items.map((i) => [i.task, i]));
    const tasks = ["ARRIVAL_CONFIRMED", "ENROLLMENT_CONFIRMED", "FIRST_CHECKIN_COMPLETED"];
    return HttpResponse.json({
      studentId: params.studentId,
      status: "DRAFT",
      items: tasks.map((task) => {
        const upd = byTask.get(task);
        return {
          task,
          required: upd?.required ?? true,
          done: upd?.done ?? false,
          notes: upd?.notes ?? null,
        };
      }),
      confirmedById: null,
      confirmedAt: null,
    });
  }),

  http.post(`${API}/advisor/students/:studentId/placement/confirm`, ({ params }) =>
    HttpResponse.json({
      studentId: params.studentId,
      status: "CONFIRMED",
      items: [
        { task: "ARRIVAL_CONFIRMED", required: true, done: true, notes: null },
        { task: "ENROLLMENT_CONFIRMED", required: true, done: true, notes: null },
        { task: "FIRST_CHECKIN_COMPLETED", required: true, done: true, notes: null },
      ],
      confirmedById: "advisor-1",
      confirmedAt: "2026-06-12T00:00:00Z",
    }),
  ),

  http.get(`${API}/advisor/disputes`, ({ request }) => {
    const status = new URL(request.url).searchParams.get("status");
    const items = status ? disputes.filter((d) => d.status === status) : disputes;
    return HttpResponse.json({ items });
  }),

  http.post(`${API}/advisor/disputes/:disputeId/resolve`, async ({ params, request }) => {
    const body = (await request.json()) as { resolution: "KEEP" | "REASSESS"; notes: string };
    const dispute = disputes.find((d) => d.id === params.disputeId);
    if (!dispute) return HttpResponse.json({ detail: "Dispute not found" }, { status: 404 });

    dispute.status = body.resolution === "KEEP" ? "RESOLVED_KEPT" : "RESOLVED_REASSESS";
    dispute.resolvedById = "advisor-1";
    dispute.resolvedAt = "2026-06-12T00:00:00Z";
    dispute.resolutionNotes = body.notes;
    return HttpResponse.json(dispute);
  }),

  http.get(`${API}/advisor/calibration/cases`, () =>
    HttpResponse.json({
      data: [
        {
          id: "calibration-case-1",
          weekStarting: "2026-06-08T00:00:00Z",
          intakeSnippet: {
            gcss_final: 72,
            flag: "YELLOW",
            dimensions: [
              { dimension: "ACADEMIC_AND_COGNITIVE_READINESS", raw: 14 },
              { dimension: "SKILL_BASELINE", raw: 12 },
              { dimension: "FINANCIAL_STABILITY", raw: 16 },
            ],
          },
        },
      ],
    }),
  ),

  http.post(`${API}/advisor/calibration/cases/:caseId/score`, () =>
    HttpResponse.json({ message: "score recorded" }, { status: 201 }),
  ),

  http.get(`${API}/advisor/calibration/variance`, () =>
    HttpResponse.json({
      casesTotal: 5,
      casesWithMultipleScorers: 2,
      thresholdPoints: 8,
      averageRange: 5.5,
      withinThreshold: true,
      perCase: [
        { caseId: "calibration-case-1", weekStarting: "2026-06-08T00:00:00Z", n: 2, mean: 71, range: 4 },
        { caseId: "calibration-case-2", weekStarting: "2026-06-08T00:00:00Z", n: 3, mean: 65, range: 7 },
      ],
    }),
  ),

  http.get(`${API}/advisor/calibration/correlations`, () =>
    HttpResponse.json({
      sampleSize: 42,
      calibrationMinSample: 30,
      predictiveModelThreshold: 1200,
      dataSufficientForCalibration: true,
      dataSufficientForPredictiveModel: false,
      gcssSubcomponentCorrelations: [{ subComponentKey: "FINANCIAL_RUNWAY", n: 42, correlation: 0.35 }],
      gcriFactorCorrelations: [{ factor: "VISA_APPROVAL_RATE", n: 42, correlation: 0.51 }],
    }),
  ),

  http.post(`${API}/advisor/calibration/rubric-draft`, () =>
    HttpResponse.json(
      {
        id: "rubric-draft-1",
        version: "v3-calibration-draft",
        draftedFromVersion: "v3",
        sampleSize: 42,
        notes: "Bi-annual calibration draft from v3, based on 42 outcome-linked assessments.",
        dimensions: [],
      },
      { status: 201 },
    ),
  ),

  http.get(`${API}/advisor/students/:studentId/session1-questions`, () => {
    if (!session1Sequence) {
      return HttpResponse.json(
        { type: "https://viacerta.dev/errors/not-found", title: "Not found", detail: "No session prep generated yet." },
        { status: 404 },
      );
    }
    return HttpResponse.json(session1Sequence);
  }),

  http.put(`${API}/advisor/students/:studentId/session1-questions`, async ({ request }) => {
    const body = (await request.json()) as { questions: { focusArea: string; prompt: string; rationale: string }[] };
    session1Sequence = {
      ...(session1Sequence ?? defaultSession1Sequence()),
      questions: body.questions,
    };
    return HttpResponse.json(session1Sequence);
  }),

  http.post(`${API}/advisor/students/:studentId/session1-questions/approve`, () => {
    session1Sequence = {
      ...(session1Sequence ?? defaultSession1Sequence()),
      status: "APPROVED",
      approvedById: "senior-1",
      approvedAt: "2026-06-13T00:00:00Z",
    };
    return HttpResponse.json(session1Sequence);
  }),

  http.get(`${API}/universities`, ({ request }) => {
    const search = new URL(request.url).searchParams.get("search")?.toLowerCase() ?? "";
    const all = [
      { id: "univ-1", name: "Technical University of Munich", worldRank: 28, countryCode: null },
      { id: "univ-2", name: "University of Toronto", worldRank: 18, countryCode: null },
      { id: "univ-3", name: "University of Melbourne", worldRank: 33, countryCode: null },
    ];
    const data = all.filter((u) => u.name.toLowerCase().includes(search));
    return HttpResponse.json({ data, total: data.length });
  }),
];
