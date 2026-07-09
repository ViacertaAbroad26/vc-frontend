import type { RiskBand } from "@viacerta/design-tokens";
import { AsyncBoundary, Badge, Button, Card, CardBody, Checkbox, Input, Label, RiskBandPill } from "@viacerta/ui";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { countryLabel } from "@/lib/country-labels";

import { useConfirmCountryMapping } from "./useConfirmCountryMapping";
import { useCountryMapping } from "./useCountryMapping";
import { useUpdateCountryMapping } from "./useUpdateCountryMapping";

type FormValues = {
  candidates: { country: string; rank: number; selected: boolean; notes: string }[];
};

export function CountryMappingView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useCountryMapping(studentId);
  const update = useUpdateCountryMapping(studentId);
  const confirm = useConfirmCountryMapping(studentId);

  const { control, register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { candidates: [] },
  });
  const { fields } = useFieldArray({ control, name: "candidates" });
  const candidates = watch("candidates");

  useEffect(() => {
    if (!data) return;
    reset({
      candidates: data.candidates.map((c) => ({
        country: c.country,
        rank: c.rank,
        selected: c.selected ?? false,
        notes: c.notes ?? "",
      })),
    });
  }, [data, reset]);

  const isConfirmed = data?.status === "CONFIRMED";

  const onSave = handleSubmit((values) => {
    update.mutate({
      candidates: values.candidates.map((c) => ({
        country: c.country,
        rank: c.rank,
        selected: c.selected,
        notes: c.notes,
      })),
    });
  });

  const onConfirm = () => {
    confirm.mutate({});
  };

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(mapping) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Candidates are seeded from this student&rsquo;s GCRI results, ranked by score. Select the countries
              to pursue, then confirm to unlock Stage 3.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          {fields.length === 0 && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">No GCRI results yet — run GCRI from the country risk page.</p>
              </CardBody>
            </Card>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => {
              const source = mapping.candidates[index];
              return (
                <Card key={field.id}>
                  <CardBody className="flex flex-wrap items-center gap-4">
                    <Checkbox
                      checked={candidates?.[index]?.selected ?? false}
                      disabled={isConfirmed}
                      onCheckedChange={(checked) =>
                        setValue(`candidates.${index}.selected`, checked === true, { shouldDirty: true })
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{countryLabel(field.country)}</div>
                      {source?.finalScore != null && (
                        <div className="mt-1 text-xs text-gray-500">GCRI {source.finalScore.toFixed(0)}</div>
                      )}
                    </div>

                    {source?.riskBand && <RiskBandPill band={source.riskBand as RiskBand} />}

                    <div className="w-20">
                      <Label htmlFor={`rank-${field.id}`} className="text-xs text-gray-500">
                        Rank
                      </Label>
                      <Input
                        id={`rank-${field.id}`}
                        type="number"
                        min={1}
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`candidates.${index}.rank`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="w-48 min-w-0 flex-1 sm:flex-none">
                      <Label htmlFor={`notes-${field.id}`} className="text-xs text-gray-500">
                        Notes
                      </Label>
                      <Input
                        id={`notes-${field.id}`}
                        disabled={isConfirmed}
                        className="mt-1"
                        {...register(`candidates.${index}.notes`)}
                      />
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {(update.isError || confirm.isError) && (
            <p className="text-sm text-flag-red-solid">
              {confirm.isError
                ? "Could not confirm the shortlist. Select at least one country and try again."
                : "Could not save changes. Please try again."}
            </p>
          )}

          {!isConfirmed && fields.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={onSave} loading={update.isPending}>
                Save changes
              </Button>
              <Button onClick={onConfirm} loading={confirm.isPending}>
                Confirm shortlist
              </Button>
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
