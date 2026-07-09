import { zodResolver } from "@hookform/resolvers/zod";
import type { CalibrationCaseView } from "@viacerta/api-client";
import type { GcssFlag } from "@viacerta/design-tokens";
import { Button, Card, CardBody, GcssFlagBadge, Input, Label, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useScoreCase } from "./useScoreCase";

const schema = z.object({
  score: z.coerce.number().min(0, "Must be at least 0").max(100, "Must be at most 100"),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

type IntakeDimension = { dimension?: string; raw?: number };

function isFlag(value: unknown): value is GcssFlag {
  return value === "GREEN" || value === "YELLOW" || value === "RED" || value === "DECLINED";
}

export function CalibrationCaseCard({ caseItem }: { caseItem: CalibrationCaseView }) {
  const score = useScoreCase();
  const snippet = caseItem.intakeSnippet as {
    gcss_final?: number;
    flag?: string;
    dimensions?: IntakeDimension[];
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { score: snippet.gcss_final ?? 0, notes: "" },
  });

  const onSubmit = handleSubmit((values) => {
    score.mutate(
      { caseId: caseItem.id, body: { score: values.score, notes: values.notes || null } },
      { onSuccess: () => reset(values) },
    );
  });

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Week of {new Date(caseItem.weekStarting).toLocaleDateString()}</p>
            <p className="text-lg font-semibold text-navy-700">GCSS {snippet.gcss_final ?? "—"}</p>
          </div>
          {isFlag(snippet.flag) && <GcssFlagBadge flag={snippet.flag} />}
        </div>

        {snippet.dimensions && snippet.dimensions.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {snippet.dimensions.map((d) => (
              <li key={d.dimension} className="rounded-md bg-gray-50 px-3 py-2 text-xs">
                <p className="text-gray-500">{d.dimension?.replace(/_/g, " ")}</p>
                <p className="font-medium text-gray-800">{d.raw}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={onSubmit} className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-end gap-3">
            <div className="w-28">
              <Label htmlFor={`score-${caseItem.id}`}>Your score</Label>
              <Input
                id={`score-${caseItem.id}`}
                type="number"
                step="1"
                min={0}
                max={100}
                className="mt-1"
                error={!!errors.score}
                {...register("score")}
              />
            </div>
            <Button type="submit" loading={score.isPending}>
              Submit score
            </Button>
          </div>
          {errors.score && <p className="text-xs text-flag-red-solid">{errors.score.message}</p>}

          <div>
            <Label htmlFor={`notes-${caseItem.id}`}>Notes (optional)</Label>
            <Textarea id={`notes-${caseItem.id}`} rows={2} className="mt-1" {...register("notes")} />
          </div>

          {score.isSuccess && <p className="text-xs text-flag-green-text">Score recorded.</p>}
          {score.isError && <p className="text-xs text-flag-red-solid">Could not submit score. Please try again.</p>}
        </form>
      </CardBody>
    </Card>
  );
}
