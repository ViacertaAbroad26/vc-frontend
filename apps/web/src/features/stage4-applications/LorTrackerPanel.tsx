import { Button, Card, CardBody, Chip, Input } from "@viacerta/ui";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useLorTracker, useSaveLorTracker } from "./useLorTracker";

type FormValues = {
  recommenders: { id?: string; name: string; email: string; status: "PENDING" | "SUBMITTED" }[];
};

export function LorTrackerPanel() {
  const { data: tracker, isLoading } = useLorTracker();
  const saveLorTracker = useSaveLorTracker();

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { recommenders: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "recommenders" });

  useEffect(() => {
    if (tracker) {
      reset({
        recommenders: tracker.recommenders.map((r) => ({
          id: r.id, name: r.name, email: r.email, status: r.status as "PENDING" | "SUBMITTED",
        })),
      });
    }
  }, [tracker, reset]);

  if (isLoading || !tracker) return null;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Letters of Recommendation</h3>
          <Chip>
            {tracker.completedCount} of {tracker.requiredCount}
          </Chip>
        </div>

        <form
          className="space-y-3"
          onSubmit={handleSubmit((values) =>
            saveLorTracker.mutate({ requiredCount: tracker.requiredCount, recommenders: values.recommenders }),
          )}
        >
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="flex-1">
                <Input placeholder="Recommender name" {...register(`recommenders.${i}.name` as const)} />
              </div>
              <div className="flex-1">
                <Input placeholder="Email" {...register(`recommenders.${i}.email` as const)} />
              </div>
              <select
                className="h-9 rounded-md border border-gray-300 px-2 text-sm dark:border-navy-600 dark:bg-navy-800 dark:text-gray-100"
                {...register(`recommenders.${i}.status` as const)}
              >
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
              </select>
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ name: "", email: "", status: "PENDING" })}
            >
              <Plus className="mr-1 h-4 w-4" /> Add recommender
            </Button>
            <Button type="submit" variant="accent" size="sm" disabled={saveLorTracker.isPending}>
              {saveLorTracker.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
