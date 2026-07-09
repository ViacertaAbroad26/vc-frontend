import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { PlacementView } from "@/features/placement/PlacementView";

export default function PlacementPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Placement" description="Stage 7 · Confirm placement and complete the journey." />
      <PlacementView studentId={studentId!} />
    </div>
  );
}
