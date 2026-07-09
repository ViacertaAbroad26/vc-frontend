import { ApiError } from "@viacerta/api-client";
import { AsyncBoundary, Badge, Button, Card, CardBody, EmptyState, Label, Textarea } from "@viacerta/ui";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useApproveSession1Questions } from "./useApproveSession1Questions";
import { useSession1Questions } from "./useSession1Questions";
import { useUpdateSession1Questions } from "./useUpdateSession1Questions";

type QuestionFormValue = {
  focusArea: string;
  prompt: string;
  rationale: string;
};

type FormValues = { questions: QuestionFormValue[] };

export function SessionPrepView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useSession1Questions(studentId);
  const update = useUpdateSession1Questions(studentId);
  const approve = useApproveSession1Questions(studentId);

  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { questions: [] },
  });
  const { fields } = useFieldArray({ control, name: "questions" });

  useEffect(() => {
    if (!data) return;
    reset({
      questions: data.questions.map((q) => ({
        focusArea: q.focusArea,
        prompt: q.prompt,
        rationale: q.rationale,
      })),
    });
  }, [data, reset]);

  const isApproved = data?.status === "APPROVED";

  const onSave = handleSubmit((values) => {
    update.mutate({ questions: values.questions });
  });

  const onApprove = () => {
    approve.mutate();
  };

  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      data={data}
      errorFallback={(err) =>
        err instanceof ApiError && err.status === 404 ? (
          <EmptyState
            title="Session prep not yet generated"
            description="The AI question sequence is generated once the assessment has been pre-scored. Check back after pre-scoring completes."
          />
        ) : (
          <p className="text-sm text-flag-red-solid">Could not load Session 1 questions.</p>
        )
      }
    >
      {(seq) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              AI-drafted questions for Session 1, focused on the student&apos;s weakest GCSS dimensions and career
              goal. Review and edit as needed, then approve before the session.
            </p>
            <Badge variant={isApproved ? "green" : "navy"}>{isApproved ? "Approved" : "Draft"}</Badge>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardBody className="space-y-2">
                  <div>
                    <Label htmlFor={`focus-${field.id}`} className="text-xs text-gray-500">
                      Focus area
                    </Label>
                    <Textarea
                      id={`focus-${field.id}`}
                      rows={1}
                      disabled={isApproved}
                      className="mt-1"
                      {...register(`questions.${index}.focusArea`)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`prompt-${field.id}`} className="text-xs text-gray-500">
                      Question
                    </Label>
                    <Textarea
                      id={`prompt-${field.id}`}
                      rows={2}
                      disabled={isApproved}
                      className="mt-1"
                      {...register(`questions.${index}.prompt`)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rationale-${field.id}`} className="text-xs text-gray-500">
                      Rationale
                    </Label>
                    <Textarea
                      id={`rationale-${field.id}`}
                      rows={2}
                      disabled={isApproved}
                      className="mt-1"
                      {...register(`questions.${index}.rationale`)}
                    />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <p className="text-xs text-gray-400">Model: {seq.modelVersion}</p>

          {(update.isError || approve.isError) && (
            <p className="text-sm text-flag-red-solid">Could not save changes. Please try again.</p>
          )}

          {!isApproved && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={onSave} loading={update.isPending}>
                Save changes
              </Button>
              <Button type="button" onClick={onApprove} loading={approve.isPending}>
                Approve
              </Button>
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
