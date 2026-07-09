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
import { Controller, useFieldArray, type Control, type UseFormRegister } from "react-hook-form";

import { APTITUDE_TEST_TYPES, ENGLISH_TEST_TYPES } from "../options";
import { emptyTestScore, type ProfileFormValues } from "../profile-schema";

function TestScoreRow({
  control,
  register,
  index,
  category,
  onRemove,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  index: number;
  category: "APTITUDE" | "ENGLISH";
  onRemove: () => void;
  disabled?: boolean;
}) {
  const prefix = `testScores.${index}` as const;
  const typeOptions = category === "APTITUDE" ? APTITUDE_TEST_TYPES : ENGLISH_TEST_TYPES;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{category === "APTITUDE" ? "Aptitude test" : "English test"}</h4>
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${prefix}.testType`}>Test</Label>
            <Controller
              control={control}
              name={`${prefix}.testType`}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger id={`${prefix}.testType`}>
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
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
            <Label htmlFor={`${prefix}.overallScore`}>Overall score</Label>
            <Input id={`${prefix}.overallScore`} className="mt-1" disabled={disabled} {...register(`${prefix}.overallScore`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.dateOfExamination`}>Date of examination</Label>
            <Input id={`${prefix}.dateOfExamination`} type="date" className="mt-1" disabled={disabled} {...register(`${prefix}.dateOfExamination`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.registrationNumber`}>Registration number</Label>
            <Input id={`${prefix}.registrationNumber`} className="mt-1" disabled={disabled} {...register(`${prefix}.registrationNumber`)} />
          </div>

          {category === "APTITUDE" ? (
            <>
              <div>
                <Label htmlFor={`${prefix}.quantitative`}>Quantitative</Label>
                <Input id={`${prefix}.quantitative`} className="mt-1" disabled={disabled} {...register(`${prefix}.quantitative`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.verbal`}>Verbal</Label>
                <Input id={`${prefix}.verbal`} className="mt-1" disabled={disabled} {...register(`${prefix}.verbal`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.analyticalWriting`}>Analytical writing (AWA)</Label>
                <Input id={`${prefix}.analyticalWriting`} className="mt-1" disabled={disabled} {...register(`${prefix}.analyticalWriting`)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor={`${prefix}.reading`}>Reading</Label>
                <Input id={`${prefix}.reading`} className="mt-1" disabled={disabled} {...register(`${prefix}.reading`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.listening`}>Listening</Label>
                <Input id={`${prefix}.listening`} className="mt-1" disabled={disabled} {...register(`${prefix}.listening`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.writing`}>Writing</Label>
                <Input id={`${prefix}.writing`} className="mt-1" disabled={disabled} {...register(`${prefix}.writing`)} />
              </div>
              <div>
                <Label htmlFor={`${prefix}.speaking`}>Speaking</Label>
                <Input id={`${prefix}.speaking`} className="mt-1" disabled={disabled} {...register(`${prefix}.speaking`)} />
              </div>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function TestScoresSection({
  control,
  register,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "testScores" });

  const indexed = fields.map((field, index) => ({ field, index }));
  const aptitude = indexed.filter((f) => f.field.category === "APTITUDE");
  const english = indexed.filter((f) => f.field.category === "ENGLISH");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Aptitude test scores</h3>
        {aptitude.map(({ field, index }) => (
          <TestScoreRow
            key={field.id}
            control={control}
            register={register}
            index={index}
            category="APTITUDE"
            onRemove={() => remove(index)}
            disabled={disabled}
          />
        ))}
        {!disabled && (
          <Button type="button" variant="secondary" onClick={() => append(emptyTestScore("APTITUDE"))}>
            <Plus className="mr-2 h-4 w-4" />
            Add aptitude score
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">English proficiency scores</h3>
        {english.map(({ field, index }) => (
          <TestScoreRow
            key={field.id}
            control={control}
            register={register}
            index={index}
            category="ENGLISH"
            onRemove={() => remove(index)}
            disabled={disabled}
          />
        ))}
        {!disabled && (
          <Button type="button" variant="secondary" onClick={() => append(emptyTestScore("ENGLISH"))}>
            <Plus className="mr-2 h-4 w-4" />
            Add English score
          </Button>
        )}
      </div>
    </div>
  );
}
