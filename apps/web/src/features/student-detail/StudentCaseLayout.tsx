import { Badge, cn } from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { ChevronLeft } from "lucide-react";
import { NavLink, Outlet, useParams } from "react-router-dom";

import { journeyStateLabel } from "@/lib/journey-state-labels";

import { useStudentDetail } from "./useStudentDetail";

const STAGE_TABS = (studentId: string) => [
  { label: "Overview", to: routes.studentDetail(studentId), end: true },
  { label: "Assessment", to: routes.assessment(studentId), end: false },
  { label: "Country risk", to: routes.gcri(studentId), end: false },
  { label: "Session 1 prep", to: routes.sessionPrep(studentId), end: false },
  { label: "Country mapping", to: routes.countryMapping(studentId), end: false },
  { label: "University selection", to: routes.universitySelection(studentId), end: false },
  { label: "Document prep", to: routes.documentPrep(studentId), end: false },
  { label: "Documents", to: routes.studentDocuments(studentId), end: false },
  { label: "Applications & visa", to: routes.applicationTracker(studentId), end: false },
  { label: "Pre-departure", to: routes.preDeparture(studentId), end: false },
  { label: "Placement", to: routes.placement(studentId), end: false },
  { label: "Report builder", to: routes.reportBuilder(studentId), end: false },
];

export function StudentCaseLayout() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data } = useStudentDetail(studentId!);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <NavLink to={routes.cases} className="flex items-center gap-1 text-sm text-navy-600 hover:underline">
            <ChevronLeft className="h-4 w-4" />
            Case queue
          </NavLink>
          {data && <span className="text-sm font-medium text-gray-900">{data.fullName}</span>}
        </div>
        {data && <Badge variant="navy">{journeyStateLabel(data.currentState)}</Badge>}
      </div>

      <nav className="-mx-1 overflow-x-auto pb-1" aria-label="Student case stages">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 text-sm">
          {STAGE_TABS(studentId!).map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 font-medium transition-colors",
                  isActive ? "bg-white text-navy-700 shadow-sm" : "text-gray-600 hover:text-gray-900",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <Outlet />
    </div>
  );
}
