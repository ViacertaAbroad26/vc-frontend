import { AsyncBoundary, Badge, Button, Card, CardBody, Checkbox, Input, Label } from "@viacerta/ui";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { DOCUMENT_CATALOG } from "@/features/documents/document-catalog";

import { useConfirmDocumentPrep } from "./useConfirmDocumentPrep";
import { useDocumentPrep } from "./useDocumentPrep";
import { useUpdateDocumentPrep } from "./useUpdateDocumentPrep";

type ItemFormValue = {
  documentType: string;
  required: boolean;
  waived: boolean;
  notes: string;
  documentStatus: string;
};

type FormValues = { items: ItemFormValue[] };

function documentTypeLabel(type: string): string {
  return DOCUMENT_CATALOG.find((d) => d.type === type)?.label ?? type;
}

function statusBadgeVariant(status: string): "green" | "amber" | "navy" | "red" | "default" {
  switch (status) {
    case "VERIFIED":
      return "green";
    case "REJECTED":
      return "red";
    case "UNDER_REVIEW":
      return "amber";
    case "UPLOADED":
      return "navy";
    default:
      return "default";
  }
}

export function DocumentPrepView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useDocumentPrep(studentId);
  const update = useUpdateDocumentPrep(studentId);
  const confirm = useConfirmDocumentPrep(studentId);

  const { control, register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { items: [] },
  });
  const { fields } = useFieldArray({ control, name: "items" });
  const items = watch("items");

  useEffect(() => {
    if (!data) return;
    reset({
      items: data.items.map((item) => ({
        documentType: item.documentType,
        required: item.required,
        waived: item.waived,
        notes: item.notes ?? "",
        documentStatus: item.documentStatus,
      })),
    });
  }, [data, reset]);

  const isConfirmed = data?.status === "CONFIRMED";

  const outstanding = (data?.items ?? []).filter(
    (item) => item.required && !item.waived && item.documentStatus !== "VERIFIED",
  );

  const onSave = handleSubmit((values) => {
    update.mutate({
      items: values.items.map((item) => ({
        documentType: item.documentType,
        required: item.required,
        waived: item.waived,
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
              Review the documents required ahead of applications. Waive items that don&apos;t apply, then confirm
              once every required document is verified to unlock Stage 5.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {documentTypeLabel(items?.[index]?.documentType ?? field.documentType)}
                      </span>
                      <Badge variant={statusBadgeVariant(items?.[index]?.documentStatus ?? field.documentStatus)}>
                        {(items?.[index]?.documentStatus ?? field.documentStatus).replace("_", " ")}
                      </Badge>
                    </div>

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
                          id={`waived-${field.id}`}
                          checked={items?.[index]?.waived ?? false}
                          disabled={isConfirmed}
                          onCheckedChange={(checked) =>
                            setValue(`items.${index}.waived`, checked === true, { shouldDirty: true })
                          }
                        />
                        <Label htmlFor={`waived-${field.id}`} className="text-sm text-gray-700">
                          Waived
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
              Not yet verified: {outstanding.map((item) => documentTypeLabel(item.documentType)).join(", ")}
            </p>
          )}

          {(update.isError || confirm.isError) && (
            <p className="text-sm text-flag-red-solid">
              {confirm.isError
                ? "Could not confirm. Every required, non-waived document must be verified first."
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
