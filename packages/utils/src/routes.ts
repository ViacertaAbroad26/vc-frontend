/** Named routes for the merged ViaCerta app (student/parent + advisor/internal). */
export const routes = {
  login: "/login",
  register: "/register",

  // Student / parent
  dashboard: "/",
  profile: "/profile",
  journey: "/journey",
  intakeStart: "/intake",
  intakeForm: (id: string) => `/intake/${id}`,
  documents: "/documents",
  pending: "/pending",
  report: "/report",
  decision: "/decision",
  mySessionPrep: "/session-prep",
  notifications: "/notifications",
  notificationPreferences: "/notifications/preferences",
  parent: (studentId: string) => `/parent/students/${studentId}`,

  // Advisor
  cases: "/cases",
  disputes: "/disputes",
  studentDetail: (id: string) => `/students/${id}`,
  assessment: (id: string) => `/students/${id}/assessment`,
  gcri: (id: string) => `/students/${id}/gcri`,
  countryMapping: (id: string) => `/students/${id}/country-mapping`,
  universitySelection: (id: string) => `/students/${id}/university-selection`,
  documentPrep: (id: string) => `/students/${id}/document-prep`,
  studentDocuments: (id: string) => `/students/${id}/documents`,
  applicationTracker: (id: string) => `/students/${id}/applications`,
  preDeparture: (id: string) => `/students/${id}/pre-departure`,
  placement: (id: string) => `/students/${id}/placement`,
  reportBuilder: (id: string) => `/students/${id}/report`,
  sessionPrep: (id: string) => `/students/${id}/session1-questions`,
  calibration: "/calibration",
  advisorNotifications: "/advisor/notifications",
  advisorNotificationPreferences: "/advisor/notifications/preferences",

  // Internal ops
  leads: "/leads",
  documentVerify: "/document-verify",
  dataOps: "/data-ops",
  outcomes: "/outcomes",
  users: "/users",
  organizations: "/organizations",
  admin: "/admin",

  forbidden: "/forbidden",
} as const;
