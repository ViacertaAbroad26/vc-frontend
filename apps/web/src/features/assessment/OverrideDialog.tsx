import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiComponents } from "@viacerta/api-client";
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

import { useGcssOverride } from "./useGcssOverride";

type GcssDimension = ApiComponents["schemas"]["GcssDimension"];

export type OverrideTarget = {
  dimension: GcssDimension;
  subComponentKey: string;
  label: string;
  current: number;
  max: number;
};

function buildSchema(max: number) {
  return z.object({
    newRaw: z.coerce.number().min(0, "Must be at least 0").max(max, `Must be at most ${max}`),
    evidenceNote: z.string().min(10, "Evidence note must be at least 10 characters"),
  });
}

export function OverrideDialog({
  studentId,
  target,
  onClose,
}: {
  studentId: string;
  target: OverrideTarget;
  onClose: () => void;
}) {
  const override = useGcssOverride(studentId);
  const schema = buildSchema(target.max);
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newRaw: target.current, evidenceNote: "" },
  });

  const onSubmit = handleSubmit((values) => {
    override.mutate(
      {
        dimension: target.dimension,
        subComponentKey: target.subComponentKey,
        newRaw: values.newRaw,
        evidenceNote: values.evidenceNote,
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override score</DialogTitle>
          <DialogDescription>
            {target.label} · current {target.current} / {target.max}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newRaw">New score (0–{target.max})</Label>
            <Input
              id="newRaw"
              type="number"
              step="0.1"
              min={0}
              max={target.max}
              className="mt-1"
              error={!!errors.newRaw}
              {...register("newRaw")}
            />
            {errors.newRaw && <p className="mt-1 text-xs text-flag-red-solid">{errors.newRaw.message}</p>}
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
