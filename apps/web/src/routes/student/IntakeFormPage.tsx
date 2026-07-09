import { Button, EmptyState, PageHeader } from "@viacerta/ui";
import { useNavigate, useParams } from "react-router-dom";

import { IntakeForm } from "@/features/intake/IntakeForm";
import { loadIntakeCache } from "@/features/intake/intake-cache";

export default function IntakeFormPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const cached = submissionId ? loadIntakeCache(submissionId) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Intake form" description="Answer a few questions about your goals." />
      {cached && submissionId ? (
        <IntakeForm form={cached.form} submissionId={submissionId} initialAnswers={cached.answers} />
      ) : (
        <EmptyState
          title="We couldn't find this intake form"
          description="Start your intake again to pick up where the form left off."
          action={
            <Button onClick={() => navigate("/intake")} variant="outline">
              Start intake
            </Button>
          }
        />
      )}
    </div>
  );
}
