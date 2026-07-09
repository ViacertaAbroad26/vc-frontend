import { Button } from "@viacerta/ui";
import { useState } from "react";

import { FreshnessTable } from "./FreshnessTable";
import { HardcodedDowngradeDialog } from "./HardcodedDowngradeDialog";

export function DataOpsView() {
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowDowngradeDialog(true)}>Apply hard-coded downgrade</Button>
      </div>

      <FreshnessTable />

      {showDowngradeDialog && <HardcodedDowngradeDialog onClose={() => setShowDowngradeDialog(false)} />}
    </div>
  );
}
