import { Button, Card, CardBody, StatTile, Textarea } from "@viacerta/ui";
import { useState } from "react";

import { useEssay, useReviewEssay, useSaveEssay } from "./useEssay";

export function EssayReviewPanel() {
  const { data: essay, isLoading } = useEssay();
  const saveEssay = useSaveEssay();
  const reviewEssay = useReviewEssay();
  const [text, setText] = useState<string | null>(null);

  const currentText = text ?? essay?.text ?? "";

  if (isLoading) return null;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Statement of Purpose · AI Review</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Draft your SOP here, then run an AI review for feedback and an originality signal.
          </p>
        </div>

        <Textarea
          rows={8}
          value={currentText}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start writing your statement of purpose..."
        />

        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={saveEssay.isPending || text == null}
            onClick={() => saveEssay.mutate(currentText)}
          >
            {saveEssay.isPending ? "Saving..." : "Save draft"}
          </Button>
          <Button
            variant="accent"
            disabled={reviewEssay.isPending || !currentText.trim()}
            onClick={() => reviewEssay.mutate()}
          >
            {reviewEssay.isPending ? "Reviewing..." : "Run AI review"}
          </Button>
        </div>

        {essay?.lastReview && (
          <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Originality score" value={`${Math.round(essay.lastReview.originalityScore)}/100`} />
              <div className="sm:col-span-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Strengths
                </h4>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-700 dark:text-gray-200">
                  {essay.lastReview.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Weaknesses
                </h4>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-700 dark:text-gray-200">
                  {essay.lastReview.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Suggested edits
                </h4>
                <ul className="mt-1 list-inside list-disc text-sm text-gray-700 dark:text-gray-200">
                  {essay.lastReview.suggestedEdits.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Originality is an AI-estimated "generic vs. personalized" signal, not a plagiarism check:{" "}
              {essay.lastReview.originalityRationale}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
