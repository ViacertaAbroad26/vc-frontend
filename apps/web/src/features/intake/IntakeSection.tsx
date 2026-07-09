import type { IntakeSection as IntakeSectionDef } from "@viacerta/api-client";
import { Card, CardBody } from "@viacerta/ui";

import { IntakeQuestion } from "./IntakeQuestion";

export function IntakeSection({ section }: { section: IntakeSectionDef }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
        {section.questions.map((question) => (
          <IntakeQuestion key={question.id} question={question} />
        ))}
      </CardBody>
    </Card>
  );
}
