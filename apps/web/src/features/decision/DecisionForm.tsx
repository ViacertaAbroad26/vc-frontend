import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncBoundary, Badge, Button, Card, CardBody, Label, RadioGroup, RadioGroupItem, Textarea, cn } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useJourney } from "@/features/journey/use-journey";
import { journeyStateLabel } from "@/lib/journey-state-labels";

import { decisionForJourneyState, DECISION_OPTIONS, DECISION_VALUES } from "./decision-options";
import { useRecordDecision } from "./useRecordDecision";

const DecisionSchema = z.object({
  decision: z.enum(DECISION_VALUES, { message: "Choose one of the options below" }),
  notes: z
    .string()
    .min(10, "Tell us a little about why — it helps us improve.")
    .max(500, "Keep it under 500 characters."),
});

type DecisionValues = z.infer<typeof DecisionSchema>;

export function DecisionForm() {
  const record = useRecordDecision();
  const journey = useJourney();
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DecisionValues>({
    resolver: zodResolver(DecisionSchema),
    defaultValues: { notes: "" },
  });

  const selected = watch("decision");

  const onSubmit = handleSubmit((values) => {
    record.mutate({ decision: values.decision, notes: values.notes });
  });

  return (
    <AsyncBoundary isLoading={journey.isLoading} error={journey.error} data={journey.data}>
      {(data) => {
        const decidedValue = decisionForJourneyState(data.currentState);
        if (decidedValue) {
          const decided = DECISION_OPTIONS.find((option) => option.value === decidedValue);
          return (
            <Card>
              <CardBody className="space-y-3">
                <Badge>Decision recorded</Badge>
                <h3 className="font-medium text-gray-900">{decided?.title}</h3>
                <p className="text-sm text-gray-600">{decided?.blurb}</p>
                <p className="text-sm text-gray-500">
                  Your journey is now at: <span className="font-medium">{journeyStateLabel(data.currentState)}</span>
                </p>
                <Link to="/journey" className="inline-block text-sm font-medium text-navy-600 underline">
                  View your journey
                </Link>
              </CardBody>
            </Card>
          );
        }

        return (
          <form onSubmit={onSubmit} className="space-y-6">
            <RadioGroup
              className="space-y-3"
              value={selected ?? null}
              onValueChange={(v) => setValue("decision", v as DecisionValues["decision"], { shouldValidate: true })}
            >
              {DECISION_OPTIONS.map((option) => (
                <Card key={option.value} className={cn(selected === option.value && "ring-2 ring-navy-500")}>
                  <CardBody className="flex items-start gap-3">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <label htmlFor={option.value} className="cursor-pointer">
                      <h3 className="font-medium text-gray-900">{option.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{option.blurb}</p>
                    </label>
                  </CardBody>
                </Card>
              ))}
            </RadioGroup>
            {errors.decision && <p className="text-sm text-flag-red-solid">{errors.decision.message}</p>}

            <div>
              <Label htmlFor="notes">Why this choice?</Label>
              <Textarea id="notes" rows={4} className="mt-1" error={!!errors.notes} {...register("notes")} />
              {errors.notes && <p className="mt-1 text-xs text-flag-red-solid">{errors.notes.message}</p>}
            </div>

            <Button type="submit" loading={record.isPending}>
              Confirm decision
            </Button>
          </form>
        );
      }}
    </AsyncBoundary>
  );
}
