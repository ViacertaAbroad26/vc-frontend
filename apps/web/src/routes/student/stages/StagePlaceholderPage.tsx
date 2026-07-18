import { EmptyState } from "@viacerta/ui";
import { Layers } from "lucide-react";
import { useParams } from "react-router-dom";

import { JOURNEY_STAGE_LABELS } from "@/lib/journey-stages";

/**
 * Placeholder for stages not yet rebuilt to the VC-UX-2026-01 design system
 * (built sequentially 0→7 — see the redesign plan). Existing functionality
 * for these stages remains reachable from Workspace (Report, Documents,
 * Decision, etc.) until each stage's dedicated screen ships.
 */
export default function StagePlaceholderPage() {
  const { stageNumber } = useParams<{ stageNumber: string }>();
  const stage = JOURNEY_STAGE_LABELS.find((s) => String(s.stage) === stageNumber);

  return (
    <div className="mx-auto max-w-3xl py-12">
      <EmptyState
        icon={<Layers className="h-8 w-8" aria-hidden />}
        title={stage ? `Stage ${stage.stage} · ${stage.label} is coming soon` : "This stage is coming soon"}
        description={
          stage
            ? `${stage.description} — this screen is being rebuilt. In the meantime, use My Journey and Workspace for this stage's existing tools.`
            : undefined
        }
      />
    </div>
  );
}
