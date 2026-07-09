import { zodResolver } from "@hookform/resolvers/zod";
import type { AdvanceRequest } from "@viacerta/api-client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ADVANCEABLE_STATES } from "@/lib/journey-stages";

import { useAdvanceStage } from "./useAdvanceStage";

const schema = z.object({
  targetState: z.string().min(1, "Select a stage"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export function AdvanceStageDialog({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const advance = useAdvanceStage(studentId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { targetState: "", reason: "" },
  });

  const onSubmit = handleSubmit((values) => {
    advance.mutate(
      { targetState: values.targetState as AdvanceRequest["targetState"], reason: values.reason },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advance stage</DialogTitle>
          <DialogDescription>
            Move this student to a new stage. The reason is recorded in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="targetState">New stage</Label>
            <select
              id="targetState"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
              {...register("targetState")}
            >
              <option value="">Select a stage…</option>
              {ADVANCEABLE_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {errors.targetState && <p className="mt-1 text-xs text-flag-red-solid">{errors.targetState.message}</p>}
          </div>

          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={3} className="mt-1" error={!!errors.reason} {...register("reason")} />
            {errors.reason && <p className="mt-1 text-xs text-flag-red-solid">{errors.reason.message}</p>}
          </div>

          {advance.isError && (
            <p className="text-xs text-flag-red-solid">Could not advance the student&rsquo;s stage. Please try again.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={advance.isPending}>
              Advance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
