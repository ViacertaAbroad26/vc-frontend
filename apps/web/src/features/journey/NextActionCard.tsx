import type { StudentJourney } from "@viacerta/api-client";
import { Button, Card, CardBody } from "@viacerta/ui";
import { Link } from "react-router-dom";

/** Routes the student can jump to directly from their next action, keyed by `currentState`. */
const CTA_BY_STATE: Record<string, { to: string; label: string }> = {
  LEAD: { to: "/intake", label: "Start intake" },
  INTAKE_SENT: { to: "/intake", label: "Continue intake" },
  AI_PRESCORED: { to: "/pending", label: "View status" },
  GAP_LOOP: { to: "/journey", label: "View gap plan" },
  REPORT_BUILT: { to: "/report", label: "View report" },
  SESSION2_DONE: { to: "/decision", label: "Make decision" },
};

const LABEL_BY_ACTOR: Record<string, string> = {
  STUDENT: "Next step",
  ADVISOR: "With your advisor",
  SYSTEM: "In progress",
};

export function NextActionCard({ journey }: { journey: StudentJourney }) {
  const action = journey.nextActions?.[0];
  if (!action) return null;

  const cta = CTA_BY_STATE[journey.currentState];

  return (
    <Card>
      <CardBody className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-navy-600">
            {LABEL_BY_ACTOR[action.actorRole] ?? "Next step"}
          </div>
          <p className="mt-1 text-base text-gray-900">{action.description}</p>
          {action.dueAt && (
            <p className="mt-1 text-sm text-gray-500">Due {new Date(action.dueAt).toLocaleDateString()}</p>
          )}
        </div>
        {cta && (
          <Link to={cta.to}>
            <Button>{cta.label}</Button>
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
