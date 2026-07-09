import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { UniversitySelectionView } from "@/features/university-selection/UniversitySelectionView";

export default function UniversitySelectionPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader
        title="University selection"
        description="Stage 3 · Build and confirm the university/program shortlist."
      />
      <UniversitySelectionView studentId={studentId!} />
    </div>
  );
}
