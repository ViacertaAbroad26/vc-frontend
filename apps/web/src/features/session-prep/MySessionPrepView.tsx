import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@viacerta/api-client";
import { AsyncBoundary, Button, Card, CardBody, EmptyState, Label, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Session1BookingSection } from "./booking/Session1BookingSection";
import { useMySession1Questions } from "./useMySession1Questions";
import { useSubmitSession1Answers } from "./useSubmitSession1Answers";

function buildAnswersSchema(count: number) {
  return z.object({
    answers: z.array(z.string().min(1, "Please answer this question.")).length(count),
  });
}

type AnswersValues = { answers: string[] };

export function MySessionPrepView() {
  const { data, isLoading, error } = useMySession1Questions();

  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      data={data}
      errorFallback={(err) =>
        err instanceof ApiError && err.status === 404 ? (
          <EmptyState
            title="Session 1 prep isn't ready yet"
            description="Your advisor hasn't approved your Session 1 questions yet. Check back closer to your session."
          />
        ) : (
          <p className="text-sm text-flag-red-solid">Could not load your Session 1 prep.</p>
        )
      }
    >
      {(seq) => (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Your advisor has prepared the following questions to help you get the most out of Session 1.
            Take a few minutes to think through your answers beforehand.
          </p>
          <ol className="space-y-3">
            {seq.questions.map((q, i) => (
              <li key={i}>
                <Card>
                  <CardBody className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-navy-600">{q.focusArea}</p>
                    <p className="text-sm text-gray-900">{q.prompt}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ol>

          {seq.answeredAt ? (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Your answers</h3>
              <ol className="space-y-3">
                {(seq.studentAnswers ?? []).map((answer, i) => (
                  <li key={i}>
                    <Card>
                      <CardBody>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{answer}</p>
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <AnswersForm questionCount={seq.questions.length} />
          )}

          <Session1BookingSection />
        </div>
      )}
    </AsyncBoundary>
  );
}

function AnswersForm({ questionCount }: { questionCount: number }) {
  const submitAnswers = useSubmitSession1Answers();
  const schema = buildAnswersSchema(questionCount);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswersValues>({
    resolver: zodResolver(schema),
    defaultValues: { answers: Array.from({ length: questionCount }, () => "") },
  });

  const onSubmit = handleSubmit((values) => {
    submitAnswers.mutate({ answers: values.answers });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="font-medium text-gray-900">Your answers</h3>
      {Array.from({ length: questionCount }).map((_, i) => (
        <div key={i}>
          <Label htmlFor={`answer-${i}`}>Answer {i + 1}</Label>
          <Textarea
            id={`answer-${i}`}
            rows={3}
            className="mt-1"
            error={!!errors.answers?.[i]}
            {...register(`answers.${i}` as const)}
          />
          {errors.answers?.[i] && <p className="mt-1 text-xs text-flag-red-solid">{errors.answers[i]?.message}</p>}
        </div>
      ))}
      <Button type="submit" loading={submitAnswers.isPending}>
        Submit answers
      </Button>
    </form>
  );
}
