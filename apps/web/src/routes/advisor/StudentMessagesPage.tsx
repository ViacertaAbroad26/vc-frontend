import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { AdvisorMessageThreadView } from "@/features/messages-advisor/AdvisorMessageThreadView";

export default function StudentMessagesPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Direct messages with this student." />
      <AdvisorMessageThreadView studentId={studentId!} />
    </div>
  );
}
