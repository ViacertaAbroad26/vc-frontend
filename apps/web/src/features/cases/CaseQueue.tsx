import type { ApiComponents } from "@viacerta/api-client";
import {
  AsyncBoundary,
  GcssFlagBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@viacerta/ui";
import { routes } from "@viacerta/utils";
import { formatDistanceToNow } from "date-fns";
import { FileWarning } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useOrganizations } from "@/features/organizations/useOrganizations";
import { journeyStateLabel } from "@/lib/journey-state-labels";
import { useAuthStore } from "@/stores/auth-store";

import { useAdvisorCases } from "./useAdvisorCases";

type JourneyStateCode = ApiComponents["schemas"]["JourneyStateCode"];
type GcssFlag = ApiComponents["schemas"]["GcssFlag"];

const STAGES: { value: JourneyStateCode | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "AI_PRESCORED", label: "Pre-scored · awaiting Session 1" },
  { value: "SESSION1_BOOKED", label: "Session 1 booked" },
  { value: "GCSS_CONFIRMED", label: "GCSS confirmed" },
  { value: "GAP_LOOP", label: "Closing gaps" },
  { value: "GCRI_RUN", label: "Running GCRI" },
  { value: "REPORT_BUILT", label: "Report ready · awaiting Session 2" },
  { value: "DECISION_GATE", label: "Decision gate" },
  { value: "STAGE2_COUNTRY_MAPPING", label: "Stage 2 · Country mapping" },
  { value: "STAGE3_UNIVERSITY_SELECTION", label: "Stage 3 · University selection" },
  { value: "STAGE4_DOCUMENT_PREP", label: "Stage 4 · Document prep" },
  { value: "STAGE5_APPLICATIONS", label: "Stage 5 · Applications" },
  { value: "STAGE5_VISA", label: "Stage 5 · Visa" },
  { value: "STAGE6_PRE_DEPARTURE", label: "Stage 6 · Pre-departure" },
  { value: "STAGE7_PLACEMENT", label: "Stage 7 · Placement" },
  { value: "COMPLETED", label: "Completed" },
];

const FLAGS: { value: GcssFlag | "ALL"; label: string }[] = [
  { value: "ALL", label: "All flags" },
  { value: "GREEN", label: "Green" },
  { value: "YELLOW", label: "Yellow" },
  { value: "RED", label: "Red" },
  { value: "DECLINED", label: "Declined" },
];

export function CaseQueue() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const stage = (params.get("stage") ?? "ALL") as JourneyStateCode | "ALL";
  const flag = (params.get("flag") ?? "ALL") as GcssFlag | "ALL";
  const org = params.get("org") ?? "ALL";
  const search = params.get("q") ?? "";

  const isSuperAdmin = useAuthStore((s) => s.user?.role === "SUPER_ADMIN");
  const { data: orgsData } = useOrganizations({ enabled: isSuperAdmin });
  const branches = orgsData?.data ?? [];
  const branchName = (orgId: string | null | undefined) =>
    branches.find((b) => b.id === orgId)?.name ?? "Unassigned / HQ";

  const { data, isLoading, error } = useAdvisorCases({
    state: stage === "ALL" ? undefined : stage,
    flag: flag === "ALL" ? undefined : flag,
    orgId: org === "ALL" ? undefined : org,
  });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "ALL" || value === "") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STAGES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setParam("stage", s.value)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              stage === s.value
                ? "bg-navy-700 text-white"
                : "border border-gray-200 bg-white text-gray-600 hover:border-navy-200 hover:text-navy-700",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setParam("q", e.target.value)}
          className="h-10 w-full rounded-lg border-gray-200 bg-linen-50 text-sm focus:border-navy-500 focus:ring-navy-500 sm:max-w-xs"
        />
        <div className="flex items-center gap-2 overflow-x-auto">
          {FLAGS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setParam("flag", f.value)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                flag === f.value
                  ? "bg-navy-700 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-navy-200 hover:text-navy-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {isSuperAdmin && (
          <select
            value={org}
            onChange={(e) => setParam("org", e.target.value)}
            className="h-10 rounded-lg border-gray-200 bg-linen-50 text-sm focus:border-navy-500 focus:ring-navy-500"
          >
            <option value="ALL">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <AsyncBoundary isLoading={isLoading} error={error} data={data}>
        {(result) => {
          const cases = result.data.filter((c) =>
            search ? c.fullName.toLowerCase().includes(search.toLowerCase()) : true,
          );

          return (
            <>
              <p className="text-sm font-medium text-gray-500">
                {cases.length} {cases.length === 1 ? "student" : "students"}
              </p>
              {cases.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-linen-50 hover:bg-linen-50">
                        <TableHead>Student</TableHead>
                        {isSuperAdmin && <TableHead>Branch</TableHead>}
                        <TableHead>Stage</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Last updated</TableHead>
                        <TableHead>Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.map((c) => (
                        <TableRow
                          key={c.studentId}
                          onClick={() => navigate(routes.studentDetail(c.studentId))}
                          className="cursor-pointer hover:bg-linen-50/60"
                        >
                          <TableCell className="align-top py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={routes.studentDetail(c.studentId)}
                                className="whitespace-nowrap font-semibold text-navy-900 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {c.fullName}
                              </Link>
                              {(c.missingDocuments?.length ?? 0) > 0 && (
                                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                  <FileWarning className="h-3 w-3" />
                                  {c.missingDocuments?.length} missing
                                </span>
                              )}
                            </div>
                            {c.persona && <p className="mt-1 text-sm text-gray-500">{c.persona}</p>}
                          </TableCell>
                          {isSuperAdmin && (
                            <TableCell className="align-top py-4 text-gray-600">{branchName(c.orgId)}</TableCell>
                          )}
                          <TableCell className="align-top py-4 text-gray-700">
                            {journeyStateLabel(c.currentState)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-top py-4 text-gray-500">
                            {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true }) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-top py-4 text-gray-500">
                            {c.lastUpdatedAt
                              ? formatDistanceToNow(new Date(c.lastUpdatedAt), { addSuffix: true })
                              : "—"}
                          </TableCell>
                          <TableCell className="align-top py-4">
                            {c.aiPreScore?.flag ? <GcssFlagBadge flag={c.aiPreScore.flag as GcssFlag} /> : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {cases.length === 0 && (
                <p className="py-12 text-center text-sm text-gray-500">No cases match your filters.</p>
              )}
            </>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
