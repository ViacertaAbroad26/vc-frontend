import { PageHeader } from "@viacerta/ui";

import { CalibrationView } from "@/features/calibration/CalibrationView";

export default function CalibrationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calibration" description="Weekly blind-scoring cases for inter-rater calibration." />
      <CalibrationView />
    </div>
  );
}
