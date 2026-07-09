import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Check, Loader2 } from "lucide-react";

import { useIntakeStore } from "@/stores/intake-store";

export function SaveResumeIndicator() {
  const { isSaving, isDirty, lastSavedAt } = useIntakeStore();

  if (isSaving) {
    return (
      <span className="inline-flex items-center text-xs text-gray-600">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="inline-flex items-center text-xs text-amber-700">
        <AlertCircle className="mr-1 h-3 w-3" /> Unsaved changes
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center text-xs text-emerald-700">
        <Check className="mr-1 h-3 w-3" />
        Saved {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
      </span>
    );
  }
  return null;
}
