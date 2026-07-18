import { Button, Card, CardBody, CountdownTiles, Input } from "@viacerta/ui";
import { useState } from "react";

import { useRelocationPlan, useSaveRelocationPlan } from "./useRelocationPlan";

export function CountdownPanel() {
  const { data: plan, isLoading } = useRelocationPlan();
  const savePlan = useSaveRelocationPlan();
  const [form, setForm] = useState({ departureAt: "", intakeCity: "", intakeTerm: "" });

  if (isLoading || !plan) return null;

  if (plan.departureAt) {
    const label = [plan.intakeTerm, plan.intakeCity].filter(Boolean).join(" · ");
    return (
      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">Countdown to Departure</h3>
          {label ? <CountdownTiles targetDate={plan.departureAt} label={label} /> : <CountdownTiles targetDate={plan.departureAt} />}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Countdown to Departure</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Add your departure date to start the countdown.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Departure date</span>
            <Input
              type="date"
              value={form.departureAt}
              onChange={(e) => setForm((f) => ({ ...f, departureAt: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">City</span>
            <Input
              placeholder="Toronto"
              value={form.intakeCity}
              onChange={(e) => setForm((f) => ({ ...f, intakeCity: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Intake term</span>
            <Input
              placeholder="Fall 2026"
              value={form.intakeTerm}
              onChange={(e) => setForm((f) => ({ ...f, intakeTerm: e.target.value }))}
            />
          </label>
        </div>
        <Button
          variant="accent"
          size="sm"
          disabled={!form.departureAt || savePlan.isPending}
          onClick={() =>
            savePlan.mutate({
              departureAt: new Date(form.departureAt).toISOString(),
              intakeCity: form.intakeCity || null,
              intakeTerm: form.intakeTerm || null,
            })
          }
        >
          {savePlan.isPending ? "Saving..." : "Save"}
        </Button>
      </CardBody>
    </Card>
  );
}
