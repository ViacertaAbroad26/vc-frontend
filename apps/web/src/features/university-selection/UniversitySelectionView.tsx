import { AsyncBoundary, Badge, Button, Card, CardBody, Checkbox, Input, Label } from "@viacerta/ui";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { useCountryMapping } from "@/features/country-mapping/useCountryMapping";
import { COUNTRY_LABELS, countryLabel } from "@/lib/country-labels";

import { useConfirmUniversitySelection } from "./useConfirmUniversitySelection";
import { useUniversitySelection } from "./useUniversitySelection";
import { useUniversitySearch } from "./useUniversitySearch";
import { useUpdateUniversitySelection } from "./useUpdateUniversitySelection";

type CandidateFormValue = {
  id: string;
  university: string;
  country: string;
  program: string;
  degreeLevel: string;
  tuitionFee: string;
  applicationDeadline: string;
  rank: string;
  selected: boolean;
  notes: string;
};

type FormValues = { candidates: CandidateFormValue[] };

function UniversityNameField({
  id,
  value,
  disabled,
  onChange,
  onSelect,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const results = useUniversitySearch(value);

  return (
    <div className="relative">
      <Input
        id={id}
        disabled={disabled}
        className="mt-1"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (results.data?.data?.length ?? 0) > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-md">
          {results.data?.data.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(u.name);
                  setOpen(false);
                }}
              >
                <span className="truncate">{u.name}</span>
                <span className="ml-2 shrink-0 text-xs text-gray-400">#{u.worldRank}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const EMPTY_CANDIDATE: CandidateFormValue = {
  id: "",
  university: "",
  country: "",
  program: "",
  degreeLevel: "",
  tuitionFee: "",
  applicationDeadline: "",
  rank: "",
  selected: false,
  notes: "",
};

export function UniversitySelectionView({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useUniversitySelection(studentId);
  const countryMapping = useCountryMapping(studentId);
  const update = useUpdateUniversitySelection(studentId);
  const confirm = useConfirmUniversitySelection(studentId);

  const { control, register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { candidates: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "candidates" });
  const candidates = watch("candidates");

  useEffect(() => {
    if (!data) return;
    reset({
      candidates: data.candidates.map((c) => ({
        id: c.id,
        university: c.university,
        country: c.country,
        program: c.program,
        degreeLevel: c.degreeLevel ?? "",
        tuitionFee: c.tuitionFee != null ? String(c.tuitionFee) : "",
        applicationDeadline: c.applicationDeadline ? c.applicationDeadline.slice(0, 10) : "",
        rank: c.rank != null ? String(c.rank) : "",
        selected: c.selected ?? false,
        notes: c.notes ?? "",
      })),
    });
  }, [data, reset]);

  const isConfirmed = data?.status === "CONFIRMED";

  const countryOptions =
    countryMapping.data?.status === "CONFIRMED"
      ? countryMapping.data.candidates.filter((c) => c.selected).map((c) => c.country)
      : Object.keys(COUNTRY_LABELS);

  const onSave = handleSubmit((values) => {
    update.mutate({
      candidates: values.candidates.map((c) => ({
        id: c.id || null,
        university: c.university,
        country: c.country,
        program: c.program,
        degreeLevel: c.degreeLevel || null,
        tuitionFee: c.tuitionFee ? Number(c.tuitionFee) : null,
        applicationDeadline: c.applicationDeadline || null,
        rank: c.rank ? Number(c.rank) : null,
        selected: c.selected,
        notes: c.notes || null,
      })),
    });
  });

  const onConfirm = () => {
    confirm.mutate({});
  };

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {() => (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Add university/program candidates, mark the ones the student should pursue, then confirm to unlock
              Stage 4.
            </p>
            <Badge variant={isConfirmed ? "green" : "navy"}>{isConfirmed ? "Confirmed" : "Draft"}</Badge>
          </div>

          {fields.length === 0 && (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500">No candidates yet. Add at least one below.</p>
              </CardBody>
            </Card>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardBody className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      className="mt-2"
                      checked={candidates?.[index]?.selected ?? false}
                      disabled={isConfirmed}
                      onCheckedChange={(checked) =>
                        setValue(`candidates.${index}.selected`, checked === true, { shouldDirty: true })
                      }
                    />

                    <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <Label htmlFor={`university-${field.id}`} className="text-xs text-gray-500">
                          University
                        </Label>
                        <UniversityNameField
                          id={`university-${field.id}`}
                          disabled={isConfirmed}
                          value={candidates?.[index]?.university ?? ""}
                          onChange={(value) =>
                            setValue(`candidates.${index}.university`, value, { shouldDirty: true })
                          }
                          onSelect={(value) =>
                            setValue(`candidates.${index}.university`, value, { shouldDirty: true })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor={`program-${field.id}`} className="text-xs text-gray-500">
                          Program
                        </Label>
                        <Input
                          id={`program-${field.id}`}
                          disabled={isConfirmed}
                          className="mt-1"
                          {...register(`candidates.${index}.program`, { required: true })}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`country-${field.id}`} className="text-xs text-gray-500">
                          Country
                        </Label>
                        <select
                          id={`country-${field.id}`}
                          disabled={isConfirmed}
                          className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
                          {...register(`candidates.${index}.country`, { required: true })}
                        >
                          <option value="">Select…</option>
                          {countryOptions.map((code) => (
                            <option key={code} value={code}>
                              {countryLabel(code)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor={`degree-${field.id}`} className="text-xs text-gray-500">
                          Degree level
                        </Label>
                        <Input
                          id={`degree-${field.id}`}
                          disabled={isConfirmed}
                          className="mt-1"
                          {...register(`candidates.${index}.degreeLevel`)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`tuition-${field.id}`} className="text-xs text-gray-500">
                          Tuition fee
                        </Label>
                        <Input
                          id={`tuition-${field.id}`}
                          type="number"
                          min={0}
                          disabled={isConfirmed}
                          className="mt-1"
                          {...register(`candidates.${index}.tuitionFee`)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`deadline-${field.id}`} className="text-xs text-gray-500">
                          Application deadline
                        </Label>
                        <Input
                          id={`deadline-${field.id}`}
                          type="date"
                          disabled={isConfirmed}
                          className="mt-1"
                          {...register(`candidates.${index}.applicationDeadline`)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`rank-${field.id}`} className="text-xs text-gray-500">
                          Rank
                        </Label>
                        <Input
                          id={`rank-${field.id}`}
                          type="number"
                          min={1}
                          disabled={isConfirmed}
                          className="mt-1"
                          {...register(`candidates.${index}.rank`)}
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
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
                    </div>

                    {!isConfirmed && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Remove candidate"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {(update.isError || confirm.isError) && (
            <p className="text-sm text-flag-red-solid">
              {confirm.isError
                ? "Could not confirm the shortlist. Make sure at least one university is selected in a confirmed Stage 2 country."
                : "Could not save changes. Please try again."}
            </p>
          )}

          {!isConfirmed && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={() => append(EMPTY_CANDIDATE)}>
                Add candidate
              </Button>
              <Button type="button" variant="secondary" onClick={onSave} loading={update.isPending}>
                Save changes
              </Button>
              <Button type="button" onClick={onConfirm} loading={confirm.isPending}>
                Confirm shortlist
              </Button>
            </div>
          )}
        </div>
      )}
    </AsyncBoundary>
  );
}
