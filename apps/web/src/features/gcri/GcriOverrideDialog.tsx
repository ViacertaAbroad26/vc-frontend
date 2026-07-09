import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useGcriOverride } from "./useGcriOverride";

const Schema = z.object({
  delta: z.coerce.number().min(-5, "Must be at least -5").max(5, "Must be at most 5"),
  evidenceNote: z.string().min(10, "Evidence note must be at least 10 characters"),
});

type FormValues = z.infer<typeof Schema>;

export function GcriOverrideDialog({
  studentId,
  country,
  onClose,
}: {
  studentId: string;
  country: string;
  onClose: () => void;
}) {
  const override = useGcriOverride(studentId, country);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { delta: 0, evidenceNote: "" },
  });

  const onSubmit = handleSubmit((values) => {
    override.mutate(
      { delta: values.delta, evidenceNote: values.evidenceNote },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override {country} score</DialogTitle>
          <DialogDescription>Apply a manual adjustment of up to ±5 points.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="delta">Adjustment (-5 to +5)</Label>
            <Input
              id="delta"
              type="number"
              step="0.5"
              min={-5}
              max={5}
              className="mt-1"
              error={!!errors.delta}
              {...register("delta")}
            />
            {errors.delta && <p className="mt-1 text-xs text-flag-red-solid">{errors.delta.message}</p>}
          </div>

          <div>
            <Label htmlFor="evidenceNote">Evidence note</Label>
            <Textarea
              id="evidenceNote"
              rows={3}
              className="mt-1"
              error={!!errors.evidenceNote}
              {...register("evidenceNote")}
            />
            {errors.evidenceNote && (
              <p className="mt-1 text-xs text-flag-red-solid">{errors.evidenceNote.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={override.isPending}>
              Save override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
