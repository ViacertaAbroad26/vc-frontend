import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

export const documentHandlers = [
  http.get(`${API}/portal/students/me/documents`, () =>
    HttpResponse.json({
      documents: [
        {
          documentId: "doc-1",
          type: "TRANSCRIPT",
          status: "VERIFIED",
          evidenceLevel: "L5",
          fileName: "transcript.pdf",
          uploadedAt: "2026-06-01T00:00:00Z",
        },
      ],
    }),
  ),

  http.post(`${API}/portal/students/me/documents`, () =>
    HttpResponse.json({
      documentId: "doc-2",
      type: "CV",
      status: "UPLOADED",
      evidenceLevel: "L2",
      fileName: "cv.pdf",
      uploadedAt: "2026-06-12T00:00:00Z",
    }),
  ),
];
