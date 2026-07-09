import { PageHeader } from "@viacerta/ui";

import { StudentReport } from "@/features/report/StudentReport";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Your report" description="A summary of your readiness assessment." />
      <StudentReport />
    </div>
  );
}
