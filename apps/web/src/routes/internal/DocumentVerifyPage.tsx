import { PageHeader } from "@viacerta/ui";

import { DocumentQueue } from "@/features/document-verify/DocumentQueue";

export default function DocumentVerifyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Document verification" description="Review uploaded documents." />
      <DocumentQueue />
    </div>
  );
}
