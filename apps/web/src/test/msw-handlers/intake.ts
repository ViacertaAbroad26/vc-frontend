import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const SAMPLE_FORM = {
  id: "form-1",
  version: 1,
  persona: "SCHOOL_STUDENT" as const,
  sections: [
    {
      id: "section-1",
      title: "About you",
      questions: [
        {
          id: "full_name",
          type: "short_text",
          prompt: "What's your full name?",
          required: true,
        },
        {
          id: "goal",
          type: "single_select",
          prompt: "What's your primary goal?",
          required: true,
          options: [
            { value: "undergrad", label: "Undergraduate study abroad" },
            { value: "masters", label: "Masters abroad" },
          ],
        },
      ],
    },
  ],
};

export const intakeHandlers = [
  http.post(`${API}/portal/students/me/intake/start`, () =>
    HttpResponse.json({ submissionId: "submission-1", form: SAMPLE_FORM }),
  ),
  http.patch(`${API}/portal/students/me/intake/:submissionId`, () =>
    HttpResponse.json({ submissionId: "submission-1", isComplete: false, savedAt: "2026-06-01T00:00:00Z" }),
  ),
  http.post(`${API}/portal/students/me/intake/:submissionId/submit`, () =>
    HttpResponse.json({ submissionId: "submission-1", isComplete: true, queuedJobs: [], jobIds: [] }),
  ),
];
