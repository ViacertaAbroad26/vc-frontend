import { zodResolver } from "@hookform/resolvers/zod";
import type { DisputeResponse } from "@viacerta/api-client";
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

import { useResolveDispute } from "./useResolveDispute";

const schema = z.object({
  resolution: z.enum(["KEEP", "REASSESS"]),
  notes: z.string().min(10, "Notes must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export function ResolveDisputeDialog({ dispute, onClose }: { dispute: DisputeResponse; onClose: () => void }) {
  const resolve = useResolveDispute();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resolution: "KEEP", notes: "" },
  });

  const onSubmit = handleSubmit((values) => {
    resolve.mutate({ disputeId: dispute.id, body: values }, { onSuccess: onClose });
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve dispute</DialogTitle>
          <DialogDescription>
            Review the assessment and audit trail before resolving. The notes are recorded as evidence.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="resolution">Resolution</Label>
            <select
              id="resolution"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
              {...register("resolution")}
            >
              <option value="KEEP">Keep the score</option>
              <option value="REASSESS">Flag for reassessment</option>
            </select>
            {errors.resolution && <p className="mt-1 text-xs text-flag-red-solid">{errors.resolution.message}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Resolution notes</Label>
            <Textarea id="notes" rows={3} className="mt-1" error={!!errors.notes} {...register("notes")} />
            {errors.notes && <p className="mt-1 text-xs text-flag-red-solid">{errors.notes.message}</p>}
          </div>

          {resolve.isError && (
            <p className="text-xs text-flag-red-solid">Could not resolve the dispute. Please try again.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={resolve.isPending}>
              Resolve
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
