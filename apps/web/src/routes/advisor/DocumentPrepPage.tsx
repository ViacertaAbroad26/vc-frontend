import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { DocumentPrepView } from "@/features/document-prep/DocumentPrepView";

export default function DocumentPrepPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document prep"
        description="Stage 4 · Confirm the document readiness checklist."
      />
      <DocumentPrepView studentId={studentId!} />
    </div>
  );
}
