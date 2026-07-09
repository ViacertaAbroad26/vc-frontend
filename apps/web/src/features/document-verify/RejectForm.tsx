import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRejectDocument } from "./useRejectDocument";

const Schema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

type FormValues = z.infer<typeof Schema>;

export function RejectForm({ documentId, onDone }: { documentId: string; onDone: () => void }) {
  const reject = useRejectDocument();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const onSubmit = handleSubmit(async (values) => {
    await reject.mutateAsync({ documentId, reason: values.reason });
    onDone();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded border border-flag-red-solid/30 bg-red-50 p-3">
      <label htmlFor="reject-reason" className="block text-sm font-medium text-red-800">
        Rejection reason (visible to student)
      </label>
      <Textarea id="reject-reason" rows={3} error={!!errors.reason} {...register("reason")} />
      {errors.reason && <p className="text-xs text-flag-red-solid">{errors.reason.message}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" loading={reject.isPending}>
          Reject
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
