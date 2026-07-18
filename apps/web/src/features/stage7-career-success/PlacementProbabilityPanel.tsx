import type { GcssFlag } from "@viacerta/design-tokens";
import { Button, Card, CardBody, Input, ScoreGauge } from "@viacerta/ui";
import { FileText, Linkedin, Mic } from "lucide-react";
import { useEffect, useState } from "react";

import { useCareerSuccess, useSaveCareerSignals } from "./useCareerSuccess";

function flagFor(probability: number): GcssFlag {
  if (probability >= 0.7) return "GREEN";
  if (probability >= 0.5) return "YELLOW";
  return "RED";
}

export function PlacementProbabilityPanel() {
  const { data: careerSuccess, isLoading } = useCareerSuccess();
  const saveSignals = useSaveCareerSignals();
  const [form, setForm] = useState({ resumeScore: "", linkedinScore: "", mockInterviews: "" });

  useEffect(() => {
    if (careerSuccess) {
      setForm({
        resumeScore: careerSuccess.resumeScore != null ? String(careerSuccess.resumeScore) : "",
        linkedinScore: careerSuccess.linkedinScore != null ? String(careerSuccess.linkedinScore) : "",
        mockInterviews: String(careerSuccess.mockInterviewsCompleted ?? 0),
      });
    }
  }, [careerSuccess]);

  if (isLoading || !careerSuccess) return null;

  const placement = careerSuccess.placementProbability;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Placement Probability</h3>
          {placement && (
            <span className="rounded-full bg-flag-green-bg px-2.5 py-0.5 text-xs font-medium text-flag-green-text">
              {placement.label}
            </span>
          )}
        </div>

        {placement ? (
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <ScoreGauge
              score={Math.round(placement.probability * 100)}
              flag={flagFor(placement.probability)}
              label={placement.estimateCaption}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <FileText className="h-4 w-4 text-mint-500" /> Resume Score
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {careerSuccess.resumeScore ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Linkedin className="h-4 w-4 text-navy-600" /> LinkedIn Score
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {careerSuccess.linkedinScore ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Mic className="h-4 w-4 text-violet-500" /> Mock interviews
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-50">
                  {careerSuccess.mockInterviewsCompleted} done
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your placement probability appears once your Global Career Assessment is confirmed.
          </p>
        )}

        <form
          className="grid gap-3 border-t border-gray-100 pt-4 dark:border-navy-700 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveSignals.mutate({
              resumeScore: form.resumeScore ? Number(form.resumeScore) : null,
              linkedinScore: form.linkedinScore ? Number(form.linkedinScore) : null,
              mockInterviewsCompleted: form.mockInterviews ? Number(form.mockInterviews) : null,
            });
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Resume score (0-100)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.resumeScore}
              onChange={(e) => setForm((f) => ({ ...f, resumeScore: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">LinkedIn score (0-100)</span>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.linkedinScore}
              onChange={(e) => setForm((f) => ({ ...f, linkedinScore: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Mock interviews done</span>
            <Input
              type="number"
              min={0}
              value={form.mockInterviews}
              onChange={(e) => setForm((f) => ({ ...f, mockInterviews: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-3">
            <Button type="submit" variant="accent" size="sm" disabled={saveSignals.isPending}>
              {saveSignals.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>

        {placement && <p className="text-xs text-gray-400 dark:text-gray-500">{placement.disclaimer}</p>}
      </CardBody>
    </Card>
  );
}
