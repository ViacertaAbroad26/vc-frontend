import { AsyncBoundary, Section } from "@viacerta/ui";

import { SENIOR_ROLES } from "@/lib/roles";
import { useAuthStore } from "@/stores/auth-store";

import { CalibrationCaseCard } from "./CalibrationCaseCard";
import { CalibrationLoopSection } from "./CalibrationLoopSection";
import { VarianceDashboard } from "./VarianceDashboard";
import { useCalibrationCases } from "./useCalibrationCases";

export function CalibrationView() {
  const user = useAuthStore((s) => s.user);
  const isSenior = !!user && (SENIOR_ROLES as readonly string[]).includes(user.role) && user.role === "SENIOR_ADVISOR";
  const { data, isLoading, error } = useCalibrationCases();

  return (
    <div className="space-y-8">
      <Section
        title="This week's cases"
        description="Score these anonymised cases independently. Your scores feed the inter-rater variance check."
      >
        <AsyncBoundary isLoading={isLoading} error={error} data={data}>
          {(result) =>
            result.data.length > 0 ? (
              <ul className="space-y-4">
                {result.data.map((c) => (
                  <li key={c.id}>
                    <CalibrationCaseCard caseItem={c} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-12 text-center text-sm text-gray-500">No calibration cases this week.</p>
            )
          }
        </AsyncBoundary>
      </Section>

      {isSenior && <VarianceDashboard />}
      {isSenior && <CalibrationLoopSection />}
    </div>
  );
}
