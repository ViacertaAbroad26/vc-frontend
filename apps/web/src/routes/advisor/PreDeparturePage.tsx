import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { PreDepartureView } from "@/features/pre-departure/PreDepartureView";

export default function PreDeparturePage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Pre-departure" description="Stage 6 · Confirm pre-departure readiness." />
      <PreDepartureView studentId={studentId!} />
    </div>
  );
}
