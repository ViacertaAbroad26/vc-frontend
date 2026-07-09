import { createBrowserRouter, type RouteObject } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { RoleGate } from "@/components/shared/RoleGate";
import { StudentCaseLayout } from "@/features/student-detail/StudentCaseLayout";
import {
  ADMIN_ONLY,
  ADVISOR_ROLES,
  CAREER_ROLES,
  COORD_ROLES,
  DATA_OPS_ROLES,
  DOCS_OPS_ROLES,
  SENIOR_ROLES,
  SUPER_ADMIN_ONLY,
} from "@/lib/roles";
import ForbiddenPage from "@/routes/ForbiddenPage";
import HomePage from "@/routes/HomePage";
import NotFoundPage from "@/routes/NotFoundPage";
import ApplicationTrackerPage from "@/routes/advisor/ApplicationTrackerPage";
import AssessmentPage from "@/routes/advisor/AssessmentPage";
import CalibrationPage from "@/routes/advisor/CalibrationPage";
import CaseQueuePage from "@/routes/advisor/CaseQueuePage";
import CountryMappingPage from "@/routes/advisor/CountryMappingPage";
import DisputesQueuePage from "@/routes/advisor/DisputesQueuePage";
import DocumentPrepPage from "@/routes/advisor/DocumentPrepPage";
import GcriPage from "@/routes/advisor/GcriPage";
import AdvisorNotificationPreferencesPage from "@/routes/advisor/NotificationPreferencesPage";
import AdvisorNotificationsPage from "@/routes/advisor/NotificationsPage";
import PlacementPage from "@/routes/advisor/PlacementPage";
import PreDeparturePage from "@/routes/advisor/PreDeparturePage";
import ReportBuilderPage from "@/routes/advisor/ReportBuilderPage";
import SessionPrepPage from "@/routes/advisor/SessionPrepPage";
import StudentDetailPage from "@/routes/advisor/StudentDetailPage";
import StudentDocumentsPage from "@/routes/advisor/StudentDocumentsPage";
import UniversitySelectionPage from "@/routes/advisor/UniversitySelectionPage";
import LoginPage from "@/routes/auth/LoginPage";
import RegisterPage from "@/routes/auth/RegisterPage";
import AdminOverviewPage from "@/routes/internal/AdminOverviewPage";
import DataOpsPage from "@/routes/internal/DataOpsPage";
import DocumentVerifyPage from "@/routes/internal/DocumentVerifyPage";
import LeadsPage from "@/routes/internal/LeadsPage";
import OrganizationsPage from "@/routes/internal/OrganizationsPage";
import OutcomesPage from "@/routes/internal/OutcomesPage";
import UsersPage from "@/routes/internal/UsersPage";
import ParentSummaryPage from "@/routes/parent/ParentSummaryPage";
import DecisionGatePage from "@/routes/student/DecisionGatePage";
import DocumentsPage from "@/routes/student/DocumentsPage";
import IntakeFormPage from "@/routes/student/IntakeFormPage";
import IntakeStartPage from "@/routes/student/IntakeStartPage";
import JourneyPage from "@/routes/student/JourneyPage";
import MySessionPrepPage from "@/routes/student/MySessionPrepPage";
import NotificationPreferencesPage from "@/routes/student/NotificationPreferencesPage";
import NotificationsPage from "@/routes/student/NotificationsPage";
import PendingPage from "@/routes/student/PendingPage";
import ProfilePage from "@/routes/student/ProfilePage";
import ReportPage from "@/routes/student/ReportPage";

// Exported separately so tests can build a `createMemoryRouter` from the
// same route tree without a real browser history.
export const routeObjects: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <HomePage /> },

      // Student
      { path: "/profile", element: <ProfilePage /> },
      { path: "/journey", element: <JourneyPage /> },
      { path: "/intake", element: <IntakeStartPage /> },
      { path: "/intake/:submissionId", element: <IntakeFormPage /> },
      { path: "/documents", element: <DocumentsPage /> },
      { path: "/pending", element: <PendingPage /> },
      { path: "/report", element: <ReportPage /> },
      { path: "/decision", element: <DecisionGatePage /> },
      { path: "/session-prep", element: <MySessionPrepPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
      { path: "/notifications/preferences", element: <NotificationPreferencesPage /> },

      // Parent
      { path: "/parent/students/:studentId", element: <ParentSummaryPage /> },

      // Advisor
      {
        path: "/cases",
        element: (
          <RoleGate allow={ADVISOR_ROLES}>
            <CaseQueuePage />
          </RoleGate>
        ),
      },
      {
        path: "/disputes",
        element: (
          <RoleGate allow={ADVISOR_ROLES}>
            <DisputesQueuePage />
          </RoleGate>
        ),
      },
      {
        path: "/students/:studentId",
        element: (
          <RoleGate allow={ADVISOR_ROLES}>
            <StudentCaseLayout />
          </RoleGate>
        ),
        children: [
          { index: true, element: <StudentDetailPage /> },
          { path: "assessment", element: <AssessmentPage /> },
          { path: "gcri", element: <GcriPage /> },
          { path: "country-mapping", element: <CountryMappingPage /> },
          { path: "university-selection", element: <UniversitySelectionPage /> },
          { path: "document-prep", element: <DocumentPrepPage /> },
          { path: "documents", element: <StudentDocumentsPage /> },
          { path: "applications", element: <ApplicationTrackerPage /> },
          { path: "pre-departure", element: <PreDeparturePage /> },
          { path: "placement", element: <PlacementPage /> },
          { path: "report", element: <ReportBuilderPage /> },
          { path: "session1-questions", element: <SessionPrepPage /> },
        ],
      },
      {
        path: "/calibration",
        element: (
          <RoleGate allow={[...SENIOR_ROLES, ...ADVISOR_ROLES]}>
            <CalibrationPage />
          </RoleGate>
        ),
      },
      {
        path: "/advisor/notifications",
        element: (
          <RoleGate allow={ADVISOR_ROLES}>
            <AdvisorNotificationsPage />
          </RoleGate>
        ),
      },
      {
        path: "/advisor/notifications/preferences",
        element: (
          <RoleGate allow={ADVISOR_ROLES}>
            <AdvisorNotificationPreferencesPage />
          </RoleGate>
        ),
      },

      // Internal ops
      {
        path: "/leads",
        element: (
          <RoleGate allow={COORD_ROLES}>
            <LeadsPage />
          </RoleGate>
        ),
      },
      {
        path: "/document-verify",
        element: (
          <RoleGate allow={DOCS_OPS_ROLES}>
            <DocumentVerifyPage />
          </RoleGate>
        ),
      },
      {
        path: "/data-ops",
        element: (
          <RoleGate allow={DATA_OPS_ROLES}>
            <DataOpsPage />
          </RoleGate>
        ),
      },
      {
        path: "/outcomes",
        element: (
          <RoleGate allow={CAREER_ROLES}>
            <OutcomesPage />
          </RoleGate>
        ),
      },
      {
        path: "/users",
        element: (
          <RoleGate allow={ADMIN_ONLY}>
            <UsersPage />
          </RoleGate>
        ),
      },
      {
        path: "/organizations",
        element: (
          <RoleGate allow={SUPER_ADMIN_ONLY}>
            <OrganizationsPage />
          </RoleGate>
        ),
      },
      {
        path: "/admin",
        element: (
          <RoleGate allow={SUPER_ADMIN_ONLY}>
            <AdminOverviewPage />
          </RoleGate>
        ),
      },

      { path: "/forbidden", element: <ForbiddenPage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routeObjects);
