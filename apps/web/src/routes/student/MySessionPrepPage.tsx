import { PageHeader } from "@viacerta/ui";

import { MySessionPrepView } from "@/features/session-prep/MySessionPrepView";

export default function MySessionPrepPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Session 1 prep" description="Get ready for your first counseling session." />
      <MySessionPrepView />
    </div>
  );
}
