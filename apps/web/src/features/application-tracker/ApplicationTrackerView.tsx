import { AsyncBoundary, Badge, Button, Card, CardBody, Input, Label } from "@viacerta/ui";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { countryLabel } from "@/lib/country-labels";
import { enumLabel } from "@/lib/enum-label";

import { useApplicationTracker } from "./useApplicationTracker";
import { useConfirmApplicationTracker } from "./useConfirmApplicationTracker";
import { useUpdateApplicationTracker } from "./useUpdateApplicationTracker";

const APPLICATION_STATUSES = [
  "NOT_STARTED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "OFFER_RECEIVED",
  "WAITLISTED",
  "ACCEPTED",
  "REJECTED",
  "DECLINED",
];

type ApplicationFormValue = {
  id: string;
  university: string;
  country: string;
  program: string;
  status: string;
  submittedAt: string;
  decisionAt: string;
  notes: string;
};

type FormValues = { applications: ApplicationFormValue[]; acceptedApplicationId: string };

export function ApplicationTrackerView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useApplicationTracker(studentId);
  const update = useUpdateApplicationTracker(studentId);
  const confirm = useConfirmApplicationTracker(studentId);

  const { control, register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: { applications: [], acceptedApplicationId: "" },
  });
  const { fields } = useFieldArray({ control, name: "applications" });
  const applications = watch("applications");

  useEffect(() => {
    if (!data) return;
    reset({
      applications: data.applications.map((a) => ({
        id: a.id,
        university: a.university,
        country: a.country,
        program: a.program,
        status: a.status,
        submittedAt: a.submittedAt ? a.submittedAt.slice(0, 10) : "",
        decisionAt: a.decisionAt ? a.decisionAt.slice(0, 10) : "",
        notes: a.notes ?? "",
      })),
      acceptedApplicationId: data.acceptedApplicationId ?? "",
    });
  }, [data, reset]);

  const isConfirmed = data?.status === "CONFIRMED";

  const acceptedOptions = (applications ?? []).filter((a) => a.status === "ACCEPTED");

  const onSave = handleSubmit((values) => {
    update.mutate({
      applications: values.applications.map((a) => ({
        id: a.id,
        status: a.status,
        submittedAt: a.submittedAt || null,
        decisionAt: a.decisionAt || null,
        notes: a.notes || null,
      })),
    });
  });

  const onConfirm = handleSubmit((values) => {
    if (!values.acceptedApplicationId) return;
    confirm.mutate({ acceptedApplicationId: values.acceptedApplicationId });
  });

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {() => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Track each application from the confirmed Stage 3 shortlist, then confirm the accepted offer to unlock
              visa tracking.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          {fields.length === 0 && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">No applications yet.</p>
              </CardBody>
            </Card>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardBody className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-900">{field.university}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      {field.program} · {countryLabel(field.country)}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor={`status-${field.id}`} className="text-xs text-gray-500">
                        Status
                      </Label>
                      <select
                        id={`status-${field.id}`}
                        disabled={isConfirmed}
                        className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                        {...register(`applications.${index}.status`)}
                      >
                        {APPLICATION_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {enumLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor={`submitted-${field.id}`} className="text-xs text-gray-500">
                        Submitted
                      </Label>
                      <Input
                        id={`submitted-${field.id}`}
                        type="date"
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`applications.${index}.submittedAt`)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`decision-${field.id}`} className="text-xs text-gray-500">
                        Decision
                      </Label>
                      <Input
                        id={`decision-${field.id}`}
                        type="date"
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`applications.${index}.decisionAt`)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`notes-${field.id}`} className="text-xs text-gray-500">
                        Notes
                      </Label>
                      <Input
                        id={`notes-${field.id}`}
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`applications.${index}.notes`)}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {update.isError && <p className="text-sm text-flag-red-solid">Could not save changes. Please try again.</p>}

          {!isConfirmed && fields.length > 0 && (
            <Card>
              <CardBody className="flex flex-wrap items-end gap-3">
                <div>
                  <Label htmlFor="accepted-application" className="text-xs text-gray-500">
                    Accepted offer
                  </Label>
                  <select
                    id="accepted-application"
                    className="mt-1 h-10 w-64 rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                    {...register("acceptedApplicationId")}
                  >
                    <option value="">Select…</option>
                    {acceptedOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.university} · {a.program}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="button" variant="secondary" onClick={onSave} loading={update.isPending}>
                  Save changes
                </Button>
                <Button type="button" onClick={onConfirm} loading={confirm.isPending}>
                  Confirm accepted offer
                </Button>
              </CardBody>
            </Card>
          )}

          {confirm.isError && (
            <p className="text-sm text-flag-red-solid">
              Could not confirm. Mark an application ACCEPTED and select it as the accepted offer first.
            </p>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
