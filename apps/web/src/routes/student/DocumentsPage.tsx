import { PageHeader } from "@viacerta/ui";

import { StudentDocuments } from "@/features/documents/StudentDocuments";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Documents" description="Upload the documents we need to assess you." />
      <StudentDocuments />
    </div>
  );
}
