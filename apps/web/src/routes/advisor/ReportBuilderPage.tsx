import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { ReportComposer } from "@/features/report-builder/ReportComposer";

export default function ReportBuilderPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Report builder" description="Write insights and publish the report." />
      <ReportComposer studentId={studentId!} />
    </div>
  );
}
