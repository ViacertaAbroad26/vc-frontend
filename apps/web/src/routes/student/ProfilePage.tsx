import { PageHeader } from "@viacerta/ui";

import { StudentProfileView } from "@/features/profile/StudentProfileView";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Complete your application profile — personal details, academic qualifications, test scores and work experience."
      />
      <StudentProfileView />
    </div>
  );
}
