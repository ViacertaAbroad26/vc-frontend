import type { IntakeSection as IntakeSectionDef } from "@viacerta/api-client";
import { Card, CardBody } from "@viacerta/ui";
import { useFormContext, useWatch } from "react-hook-form";

import { IntakeQuestion } from "./IntakeQuestion";
import { isVisible } from "./visibility";

export function IntakeSection({ section }: { section: IntakeSectionDef }) {
  const { control } = useFormContext();
  const values = useWatch({ control }) as Record<string, unknown>;

  if (!isVisible(section.visibleIf, values)) return null;

  const visibleQuestions = section.questions.filter((q) => isVisible(q.visibleIf, values));
  if (visibleQuestions.length === 0) return null;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
          {section.description && <p className="mt-1 text-sm text-gray-500">{section.description}</p>}
        </div>
        {visibleQuestions.map((question) => (
          <IntakeQuestion key={question.id} question={question} />
        ))}
      </CardBody>
    </Card>
  );
}
