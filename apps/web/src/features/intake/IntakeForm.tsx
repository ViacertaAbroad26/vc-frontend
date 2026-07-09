import { zodResolver } from "@hookform/resolvers/zod";
import type { IntakeForm as IntakeFormDef } from "@viacerta/api-client";
import { Button } from "@viacerta/ui";
import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useIntakeStore } from "@/stores/intake-store";

import { IntakeSection } from "./IntakeSection";
import { SaveResumeIndicator } from "./SaveResumeIndicator";
import { buildIntakeSchema, defaultAnswers } from "./build-schema";
import { useIntakeSave } from "./useIntakeSave";
import { useIntakeSubmit } from "./useIntakeSubmit";

const DEBOUNCE_MS = 1500;

type Props = {
  form: IntakeFormDef;
  submissionId: string;
  initialAnswers: Record<string, unknown>;
};

export function IntakeForm({ form, submissionId, initialAnswers }: Props) {
  const allQuestions = useMemo(() => form.sections.flatMap((s) => s.questions), [form]);
  const schema = useMemo(() => buildIntakeSchema(allQuestions), [allQuestions]);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultAnswers(allQuestions), ...initialAnswers },
    mode: "onBlur",
  });

  const save = useIntakeSave(submissionId);
  const submit = useIntakeSubmit(submissionId);
  const { setAnswer, markSavingStart, markSaved, buffer, reset } = useIntakeStore();

  // Reset the shared buffer when entering/leaving this submission.
  useEffect(() => {
    reset();
    return reset;
  }, [reset]);

  // Mirror form field changes into the buffer as the student types.
  useEffect(() => {
    const subscription = methods.watch((values, { name }) => {
      if (name) setAnswer(name, values[name as keyof typeof values]);
    });
    return () => subscription.unsubscribe();
  }, [methods, setAnswer]);

  // Debounce-save the buffer to the server.
  const saveRef = useRef(save.mutate);
  saveRef.current = save.mutate;
  useEffect(() => {
    if (Object.keys(buffer).length === 0) return;
    const handle = setTimeout(() => {
      markSavingStart();
      saveRef.current({ answers: buffer }, { onSuccess: markSaved });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [buffer, markSavingStart, markSaved]);

  const onSubmit = methods.handleSubmit((values) => {
    save.mutate({ answers: values }, { onSuccess: () => submit.mutate() });
  });

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <SaveResumeIndicator />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {form.sections.map((section) => (
            <IntakeSection key={section.id} section={section} />
          ))}
          <div className="flex justify-end">
            <Button type="submit" loading={submit.isPending || save.isPending}>
              Submit and pre-score
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
