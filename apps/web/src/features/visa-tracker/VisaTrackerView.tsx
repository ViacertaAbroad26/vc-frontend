import { AsyncBoundary, Badge, Button, Card, CardBody, Input, Label } from "@viacerta/ui";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { countryLabel } from "@/lib/country-labels";
import { enumLabel } from "@/lib/enum-label";

import { useConfirmVisaTracker } from "./useConfirmVisaTracker";
import { useUpdateVisaTracker } from "./useUpdateVisaTracker";
import { useVisaTracker } from "./useVisaTracker";

const VISA_STATUSES = ["NOT_STARTED", "DOCUMENTS_SUBMITTED", "INTERVIEW_SCHEDULED", "APPROVED", "REJECTED"];

type FormValues = {
  visaStatus: string;
  applicationSubmittedAt: string;
  interviewAt: string;
  decisionAt: string;
  notes: string;
};

export function VisaTrackerView({ studentId, enabled }: { studentId: string; enabled: boolean }) {
  const { data, isLoading, error } = useVisaTracker(studentId, enabled);
  const update = useUpdateVisaTracker(studentId);
  const confirm = useConfirmVisaTracker(studentId);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { visaStatus: "NOT_STARTED", applicationSubmittedAt: "", interviewAt: "", decisionAt: "", notes: "" },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      visaStatus: data.visaStatus,
      applicationSubmittedAt: data.applicationSubmittedAt ? data.applicationSubmittedAt.slice(0, 10) : "",
      interviewAt: data.interviewAt ? data.interviewAt.slice(0, 10) : "",
      decisionAt: data.decisionAt ? data.decisionAt.slice(0, 10) : "",
      notes: data.notes ?? "",
    });
  }, [data, reset]);

  if (!enabled) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500">Confirm the accepted offer above to start visa tracking.</p>
        </CardBody>
      </Card>
    );
  }

  const isConfirmed = data?.status === "CONFIRMED";

  const onSave = handleSubmit((values) => {
    update.mutate({
      visaStatus: values.visaStatus,
      applicationSubmittedAt: values.applicationSubmittedAt || null,
      interviewAt: values.interviewAt || null,
      decisionAt: values.decisionAt || null,
      notes: values.notes || null,
    });
  });

  const onConfirm = () => {
    confirm.mutate({});
  };

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(visa) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Track the visa application for {countryLabel(visa.country)}. Confirm once the visa is approved to
              unlock Stage 6.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          <Card>
            <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="visa-status" className="text-xs text-gray-500">
                  Visa status
                </Label>
                <select
                  id="visa-status"
                  disabled={isConfirmed}
                  className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                  {...register("visaStatus")}
                >
                  {VISA_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {enumLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="visa-submitted" className="text-xs text-gray-500">
                  Application submitted
                </Label>
                <Input
                  id="visa-submitted"
                  type="date"
                  disabled={isConfirmed}
                  className="mt-1"
                  {...register("applicationSubmittedAt")}
                />
              </div>

              <div>
                <Label htmlFor="visa-interview" className="text-xs text-gray-500">
                  Interview
                </Label>
                <Input
                  id="visa-interview"
                  type="date"
                  disabled={isConfirmed}
                  className="mt-1"
                  {...register("interviewAt")}
                />
              </div>

              <div>
                <Label htmlFor="visa-decision" className="text-xs text-gray-500">
                  Decision
                </Label>
                <Input
                  id="visa-decision"
                  type="date"
                  disabled={isConfirmed}
                  className="mt-1"
                  {...register("decisionAt")}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <Label htmlFor="visa-notes" className="text-xs text-gray-500">
                  Notes
                </Label>
                <Input id="visa-notes" disabled={isConfirmed} className="mt-1" {...register("notes")} />
              </div>
            </CardBody>
          </Card>

          {(update.isError || confirm.isError) && (
            <p className="text-sm text-flag-red-solid">
              {confirm.isError
                ? "Could not confirm. The visa status must be Approved first."
                : "Could not save changes. Please try again."}
            </p>
          )}

          {!isConfirmed && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onSave} loading={update.isPending}>
                Save changes
              </Button>
              <Button type="button" onClick={onConfirm} loading={confirm.isPending}>
                Confirm visa approved
              </Button>
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
