import { Button, Card, CardBody, Input } from "@viacerta/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FinancialPlanDonut } from "./FinancialPlanDonut";
import { useFinancialPlan, useSaveFinancialPlan } from "./useFinancialPlan";

const SOURCES = [
  { key: "EDUCATION_LOAN", label: "Education loan" },
  { key: "FAMILY_FUNDING", label: "Family funding" },
  { key: "SCHOLARSHIP", label: "Scholarship" },
  { key: "SAVINGS", label: "Savings" },
] as const;

type FormValues = Record<(typeof SOURCES)[number]["key"], number>;

export function FinancialPlanPanel() {
  const { data: plan, isLoading } = useFinancialPlan();
  const savePlan = useSaveFinancialPlan();

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { EDUCATION_LOAN: 0, FAMILY_FUNDING: 0, SCHOLARSHIP: 0, SAVINGS: 0 },
  });

  useEffect(() => {
    if (plan) {
      const values: Partial<FormValues> = {};
      for (const b of plan.breakdown) values[b.source as keyof FormValues] = b.amount;
      reset({ EDUCATION_LOAN: 0, FAMILY_FUNDING: 0, SCHOLARSHIP: 0, SAVINGS: 0, ...values });
    }
  }, [plan, reset]);

  if (isLoading || !plan) return null;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Financial Plan</h3>
        </div>

        {plan.breakdown.length > 0 && plan.totalAmount > 0 && (
          <FinancialPlanDonut breakdown={plan.breakdown} total={plan.totalAmount} />
        )}

        <form
          className="space-y-3"
          onSubmit={handleSubmit((values) =>
            savePlan.mutate({
              currency: plan.currency,
              breakdown: SOURCES.map((s) => ({ source: s.key, amount: Number(values[s.key]) || 0 })),
            }),
          )}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <label key={s.key} className="block text-sm">
                <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                <Input type="number" min={0} step={1000} {...register(s.key, { valueAsNumber: true })} />
              </label>
            ))}
          </div>
          <Button type="submit" variant="accent" size="sm" disabled={savePlan.isPending}>
            {savePlan.isPending ? "Saving..." : "Save funding plan"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
