import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { ApplicationTrackerView } from "@/features/application-tracker/ApplicationTrackerView";
import { useApplicationTracker } from "@/features/application-tracker/useApplicationTracker";
import { VisaTrackerView } from "@/features/visa-tracker/VisaTrackerView";

export default function ApplicationTrackerPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const applicationTracker = useApplicationTracker(studentId!);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <PageHeader
          title="Application tracker"
          description="Stage 5 · Track applications and confirm the accepted offer."
        />
        <ApplicationTrackerView studentId={studentId!} />
      </div>

      <div className="space-y-6">
        <PageHeader title="Visa tracker" description="Stage 5 · Track the visa application for the accepted offer." />
        <VisaTrackerView studentId={studentId!} enabled={applicationTracker.data?.status === "CONFIRMED"} />
      </div>
    </div>
  );
}
