import type { Persona } from "@viacerta/api-client";
import { Button, Card, CardBody, PageHeader } from "@viacerta/ui";
import { useNavigate } from "react-router-dom";

import { useStartIntake } from "@/features/intake/useStartIntake";

const PERSONAS: { key: Persona; label: string; blurb: string }[] = [
  { key: "SCHOOL_STUDENT", label: "School student", blurb: "Class 11 or 12, exploring undergraduate options." },
  {
    key: "FINAL_YEAR_UG",
    label: "Final-year UG",
    blurb: "In your last year of college and applying for Masters.",
  },
  {
    key: "WORKING_PROFESSIONAL",
    label: "Working professional",
    blurb: "1+ years of work experience, planning Masters or MBA.",
  },
];

export default function IntakeStartPage() {
  const navigate = useNavigate();
  const start = useStartIntake();

  const pick = async (persona: Persona) => {
    const res = await start.mutateAsync(persona);
    navigate(`/intake/${res.submissionId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Start your intake" description="Pick the option that fits where you are right now." />

      <div className="grid gap-4 md:grid-cols-3">
        {PERSONAS.map((p) => (
          <Card key={p.key}>
            <CardBody>
              <h3 className="font-medium text-gray-900">{p.label}</h3>
              <p className="mt-1 text-sm text-gray-600">{p.blurb}</p>
              <Button
                onClick={() => pick(p.key)}
                variant="outline"
                className="mt-4 w-full"
                loading={start.isPending}
              >
                Choose
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
