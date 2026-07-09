import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { GcriView } from "@/features/gcri/GcriView";

export default function GcriPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Country risk" description="GCRI results for this student." />
      <GcriView studentId={studentId!} />
    </div>
  );
}
