import { http, HttpResponse } from "msw";

const API = "http://localhost:8000/api/v1";

const STATES = [
  { id: "1", type: "STATE", code: "IN-DL", name: "Delhi", parentCode: "IN", sortOrder: 0, isActive: true },
  { id: "2", type: "STATE", code: "IN-MH", name: "Maharashtra", parentCode: "IN", sortOrder: 1, isActive: true },
];

const COUNTRIES = [
  { id: "c1", type: "COUNTRY", code: "IN", name: "India", parentCode: null, sortOrder: 0, isActive: true },
  { id: "c2", type: "COUNTRY", code: "GB", name: "United Kingdom", parentCode: null, sortOrder: 1, isActive: true },
  { id: "c3", type: "COUNTRY", code: "DE", name: "Germany", parentCode: null, sortOrder: 2, isActive: true },
  { id: "c4", type: "COUNTRY", code: "NL", name: "Netherlands", parentCode: null, sortOrder: 3, isActive: true },
];

const BOARDS: Record<string, Array<{ id: string; code: string; name: string }>> = {
  "IN-DL": [
    { id: "10", code: "IN-DL-B00", name: "CBSE" },
    { id: "11", code: "IN-DL-B01", name: "ICSE" },
  ],
  "IN-MH": [
    { id: "20", code: "IN-MH-B00", name: "CBSE" },
    { id: "21", code: "IN-MH-B01", name: "Maharashtra State Board" },
  ],
};

export const configurationHandlers = [
  http.get(`${API}/configurations`, ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const parentCode = url.searchParams.get("parentCode");

    if (type === "STATE") {
      return HttpResponse.json({ data: STATES });
    }

    if (type === "COUNTRY") {
      return HttpResponse.json({ data: COUNTRIES });
    }

    if (type === "EDUCATION_BOARD") {
      const boards = (parentCode && BOARDS[parentCode]) || [];
      return HttpResponse.json({
        data: boards.map((b) => ({
          ...b,
          type: "EDUCATION_BOARD",
          parentCode,
          sortOrder: 0,
          isActive: true,
        })),
      });
    }

    return HttpResponse.json({ data: [] });
  }),
];
