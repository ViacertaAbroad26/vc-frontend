import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@viacerta/ui";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";

import { useConfigurations } from "@/features/configurations/useConfigurations";

import { CountrySelect } from "../CountrySelect";
import { EDUCATION_LEVEL_OPTIONS } from "../options";
import { emptyEducationRecord, type ProfileFormValues } from "../profile-schema";

const SCHOOL_LEVELS = new Set(["GRADE_10", "GRADE_12"]);

function EducationRecordRow({
  control,
  register,
  index,
  onRemove,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  index: number;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const levelOfStudy = useWatch({ control, name: `educationRecords.${index}.levelOfStudy` });
  const stateOfStudy = useWatch({ control, name: `educationRecords.${index}.stateOfStudy` });
  const isSchoolLevel = levelOfStudy ? SCHOOL_LEVELS.has(levelOfStudy) : false;

  const { data: states } = useConfigurations({ type: "STATE", enabled: isSchoolLevel });
  const { data: boards } = useConfigurations({
    type: "EDUCATION_BOARD",
    parentCode: stateOfStudy,
    enabled: isSchoolLevel && !!stateOfStudy,
  });

  const prefix = `educationRecords.${index}` as const;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Education record {index + 1}</h4>
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${prefix}.levelOfStudy`}>Level of study</Label>
            <Controller
              control={control}
              name={`${prefix}.levelOfStudy`}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger id={`${prefix}.levelOfStudy`}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor={`${prefix}.countryOfStudy`}>Country of study</Label>
            <div className="mt-1">
              <CountrySelect control={control} name={`${prefix}.countryOfStudy`} id={`${prefix}.countryOfStudy`} disabled={disabled} />
            </div>
          </div>

          {isSchoolLevel ? (
            <>
              <div>
                <Label htmlFor={`${prefix}.stateOfStudy`}>State / region</Label>
                <Controller
                  control={control}
                  name={`${prefix}.stateOfStudy`}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                      <SelectTrigger id={`${prefix}.stateOfStudy`}>
                        <SelectValue placeholder="Select a state / region" />
                      </SelectTrigger>
                      <SelectContent>
                        {(states ?? []).map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor={`${prefix}.board`}>Education board</Label>
                <Controller
                  control={control}
                  name={`${prefix}.board`}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled || !stateOfStudy}>
                      <SelectTrigger id={`${prefix}.board`}>
                        <SelectValue placeholder={stateOfStudy ? "Select a board" : "Select a state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(boards ?? []).map((b) => (
                          <SelectItem key={b.code} value={b.code}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor={`${prefix}.institutionName`}>School name</Label>
                <Input id={`${prefix}.institutionName`} className="mt-1" disabled={disabled} {...register(`${prefix}.institutionName`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.qualification`}>Qualification</Label>
                <Input id={`${prefix}.qualification`} className="mt-1" disabled={disabled} {...register(`${prefix}.qualification`)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor={`${prefix}.cityOfStudy`}>City of study</Label>
                <Input id={`${prefix}.cityOfStudy`} className="mt-1" disabled={disabled} {...register(`${prefix}.cityOfStudy`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.university`}>University / institution</Label>
                <Input id={`${prefix}.university`} className="mt-1" disabled={disabled} {...register(`${prefix}.university`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.qualification`}>Qualification</Label>
                <Input id={`${prefix}.qualification`} className="mt-1" disabled={disabled} {...register(`${prefix}.qualification`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.backlogs`}>Backlogs</Label>
                <Input id={`${prefix}.backlogs`} type="number" className="mt-1" disabled={disabled} {...register(`${prefix}.backlogs`)} />
              </div>
            </>
          )}

          <div>
            <Label htmlFor={`${prefix}.gradingSystem`}>Grading system</Label>
            <Input id={`${prefix}.gradingSystem`} className="mt-1" placeholder="e.g. Percentage, GPA" disabled={disabled} {...register(`${prefix}.gradingSystem`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.marksScored`}>Marks scored</Label>
            <Input id={`${prefix}.marksScored`} className="mt-1" disabled={disabled} {...register(`${prefix}.marksScored`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.primaryLanguage`}>Primary language of instruction</Label>
            <Input id={`${prefix}.primaryLanguage`} className="mt-1" disabled={disabled} {...register(`${prefix}.primaryLanguage`)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${prefix}.startDate`}>Start date</Label>
              <Input id={`${prefix}.startDate`} type="date" className="mt-1" disabled={disabled} {...register(`${prefix}.startDate`)} />
            </div>
            <div>
              <Label htmlFor={`${prefix}.endDate`}>End date</Label>
              <Input id={`${prefix}.endDate`} type="date" className="mt-1" disabled={disabled} {...register(`${prefix}.endDate`)} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function AcademicQualificationSection({
  control,
  register,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "educationRecords" });

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Education summary</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="educationSummary.countryOfEducation">Country of education</Label>
              <div className="mt-1">
                <CountrySelect
                  control={control}
                  name="educationSummary.countryOfEducation"
                  id="educationSummary.countryOfEducation"
                  disabled={disabled}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="educationSummary.highestLevelOfEducation">Highest level of education</Label>
              <Controller
                control={control}
                name="educationSummary.highestLevelOfEducation"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                    <SelectTrigger id="educationSummary.highestLevelOfEducation">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {fields.map((field, index) => (
        <EducationRecordRow
          key={field.id}
          control={control}
          register={register}
          index={index}
          onRemove={() => remove(index)}
          disabled={disabled}
        />
      ))}

      {!disabled && (
        <Button type="button" variant="secondary" onClick={() => append(emptyEducationRecord())}>
          <Plus className="mr-2 h-4 w-4" />
          Add education record
        </Button>
      )}
    </div>
  );
}
