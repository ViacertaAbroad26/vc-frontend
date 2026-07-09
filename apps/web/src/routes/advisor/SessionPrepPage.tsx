import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { SessionPrepView } from "@/features/session-prep/SessionPrepView";

export default function SessionPrepPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Session 1 prep" description="AI-drafted questions for the first advising session." />
      <SessionPrepView studentId={studentId!} />
    </div>
  );
}
