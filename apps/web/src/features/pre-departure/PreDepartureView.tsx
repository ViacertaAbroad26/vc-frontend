import { AsyncBoundary, Badge, Button, Card, CardBody, Checkbox, Input, Label } from "@viacerta/ui";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { enumLabel } from "@/lib/enum-label";

import { useConfirmPreDeparture } from "./useConfirmPreDeparture";
import { usePreDeparture } from "./usePreDeparture";
import { useUpdatePreDeparture } from "./useUpdatePreDeparture";

type ItemFormValue = {
  task: string;
  required: boolean;
  done: boolean;
  notes: string;
};

type FormValues = { items: ItemFormValue[] };

export function PreDepartureView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = usePreDeparture(studentId);
  const update = useUpdatePreDeparture(studentId);
  const confirm = useConfirmPreDeparture(studentId);

  const { control, register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { items: [] },
  });
  const { fields } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    if (!data) return;
    reset({
      items: data.items.map((item) => ({
        task: item.task,
        required: item.required,
        done: item.done,
        notes: item.notes ?? "",
      })),
    });
  }, [data, reset]);

  const isConfirmed = data?.status === "CONFIRMED";

  const outstanding = (data?.items ?? []).filter((item) => item.required && !item.done);

  const onSave = handleSubmit((values) => {
    update.mutate({
      items: values.items.map((item) => ({
        task: item.task,
        required: item.required,
        done: item.done,
        notes: item.notes || null,
      })),
    });
  });

  const onConfirm = () => {
    confirm.mutate({});
  };

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {() => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Track pre-departure preparations. Mark each required task done, then confirm readiness to unlock Stage
              7.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <span className="font-medium text-gray-900">{enumLabel(field.task)}</span>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={items?.[index]?.required ?? false}
                          disabled={isConfirmed}
                          onCheckedChange={(checked) =>
                            setValue(`items.${index}.required`, checked === true, { shouldDirty: true })
                          }
                        />
                        <Label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                          Required
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`done-${field.id}`}
                          checked={items?.[index]?.done ?? false}
                          disabled={isConfirmed}
                          onCheckedChange={(checked) =>
                            setValue(`items.${index}.done`, checked === true, { shouldDirty: true })
                          }
                        />
                        <Label htmlFor={`done-${field.id}`} className="text-sm text-gray-700">
                          Done
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`notes-${field.id}`} className="text-xs text-gray-500">
                        Notes
                      </Label>
                      <Input
                        id={`notes-${field.id}`}
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`items.${index}.notes`)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {!isConfirmed && outstanding.length > 0 && (
            <p className="text-sm text-amber-700">
              Not yet done: {outstanding.map((item) => enumLabel(item.task)).join(", ")}
            </p>
          )}

          {(update.isError || confirm.isError) && (
            <p className="text-sm text-flag-red-solid">
              {confirm.isError
                ? "Could not confirm. Every required task must be marked done first."
                : "Could not save changes. Please try again."}
            </p>
          )}

          {!isConfirmed && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onSave} loading={update.isPending}>
                Save changes
              </Button>
              <Button type="button" onClick={onConfirm} loading={confirm.isPending}>
                Confirm readiness
              </Button>
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
