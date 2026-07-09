import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAddInsight } from "./useAddInsight";

const Schema = z.object({
  text: z
    .string()
    .min(1, "Required")
    .refine((val) => sentenceCount(val) >= 1 && sentenceCount(val) <= 3, {
      message: "Write 1–3 sentences",
    }),
});

type FormValues = z.infer<typeof Schema>;

function sentenceCount(value: string): number {
  return value
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

export function InsightEditor({
  studentId,
  section,
  initialText,
  disabled,
}: {
  studentId: string;
  section: string;
  initialText: string;
  disabled: boolean;
}) {
  const addInsight = useAddInsight(studentId);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { text: initialText },
  });

  const onSubmit = handleSubmit((values) => {
    addInsight.mutate({ section, text: values.text });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea rows={3} disabled={disabled} error={!!errors.text} {...register("text")} />
      {errors.text && <p className="text-xs text-flag-red-solid">{errors.text.message}</p>}
      {!disabled && (
        <Button type="submit" size="sm" variant="secondary" loading={addInsight.isPending} disabled={!isDirty}>
          Save
        </Button>
      )}
    </form>
  );
}
