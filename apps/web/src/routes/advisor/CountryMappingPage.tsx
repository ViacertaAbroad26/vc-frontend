import { PageHeader } from "@viacerta/ui";
import { useParams } from "react-router-dom";

import { CountryMappingView } from "@/features/country-mapping/CountryMappingView";

export default function CountryMappingPage() {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="space-y-6">
      <PageHeader title="Country mapping" description="Stage 2 · Confirm the countries this student will target." />
      <CountryMappingView studentId={studentId!} />
    </div>
  );
}
