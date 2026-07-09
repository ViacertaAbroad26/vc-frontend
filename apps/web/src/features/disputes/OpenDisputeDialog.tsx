import { zodResolver } from "@hookform/resolvers/zod";
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

import { useOpenDispute } from "./useOpenDispute";

const schema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export function OpenDisputeDialog({ assessmentId, onClose }: { assessmentId: string; onClose: () => void }) {
  const openDispute = useOpenDispute();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  const onSubmit = handleSubmit((values) => {
    openDispute.mutate({ assessmentId, reason: values.reason }, { onSuccess: onClose });
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispute your score</DialogTitle>
          <DialogDescription>
            Tell us why you think your score should be reviewed. An advisor will respond within 5 business days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={4} className="mt-1" error={!!errors.reason} {...register("reason")} />
            {errors.reason && <p className="mt-1 text-xs text-flag-red-solid">{errors.reason.message}</p>}
          </div>

          {openDispute.isError && (
            <p className="text-xs text-flag-red-solid">Could not submit your dispute. Please try again.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={openDispute.isPending}>
              Submit dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
