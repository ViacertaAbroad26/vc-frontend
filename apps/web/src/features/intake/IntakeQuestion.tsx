import type { IntakeQuestion as IntakeQuestionDef } from "@viacerta/api-client";
import { Checkbox, Input, Label, RadioGroup, RadioGroupItem, Textarea } from "@viacerta/ui";
import { useFormContext } from "react-hook-form";

type Option = { value: string; label: string };

function ErrorText({ children }: { children: string }) {
  return <p className="mt-1 text-xs text-flag-red-solid">{children}</p>;
}

export function IntakeQuestion({ question }: { question: IntakeQuestionDef }) {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();
  const error = errors[question.id]?.message as string | undefined;
  const options = (question.options as Option[] | null | undefined) ?? [];

  const FieldLabel = (
    <Label htmlFor={question.id}>
      {question.prompt}
      {question.required && <span className="ml-1 text-flag-red-solid">*</span>}
    </Label>
  );

  switch (question.type) {
    case "short_text":
      return (
        <div>
          {FieldLabel}
          <Input id={question.id} className="mt-1" error={!!error} {...register(question.id)} />
          {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "long_text":
      return (
        <div>
          {FieldLabel}
          <Textarea id={question.id} className="mt-1" rows={4} error={!!error} {...register(question.id)} />
          {question.helpText && <p className="mt-1 text-xs text-gray-500">{question.helpText}</p>}
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "single_select": {
      const value = (watch(question.id) as string | undefined) ?? null;
      return (
        <div>
          {FieldLabel}
          <RadioGroup
            className="mt-2 space-y-2"
            value={value}
            onValueChange={(v) => setValue(question.id, v, { shouldValidate: true, shouldDirty: true })}
          >
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-900">
                <RadioGroupItem value={opt.value} />
                {opt.label}
              </label>
            ))}
          </RadioGroup>
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );
    }

    case "multi_select": {
      const value = (watch(question.id) as string[] | undefined) ?? [];
      return (
        <div>
          {FieldLabel}
          <div className="mt-2 space-y-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-900">
                <Checkbox
                  checked={value.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const next = checked ? [...value, opt.value] : value.filter((v) => v !== opt.value);
                    setValue(question.id, next, { shouldValidate: true, shouldDirty: true });
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );
    }

    case "number":
      return (
        <div>
          {FieldLabel}
          <Input
            id={question.id}
            className="mt-1"
            type="number"
            error={!!error}
            {...register(question.id, { valueAsNumber: true })}
          />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    case "date":
      return (
        <div>
          {FieldLabel}
          <Input id={question.id} className="mt-1" type="date" error={!!error} {...register(question.id)} />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
      );

    default:
      return <p className="text-sm text-flag-red-solid">Unsupported question type: {question.type}</p>;
  }
}
