import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { AssessmentView } from "@/features/assessment/AssessmentView";

export default function AssessmentPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Assessment" description="Review GCSS dimensions and overrides." />
      <AssessmentView studentId={studentId!} />
    </div>
  );
}
