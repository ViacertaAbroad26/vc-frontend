import { Button, Card, CardBody, Checkbox, Input, Label } from "@viacerta/ui";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useWatch, type Control, type UseFormRegister } from "react-hook-form";

import { emptyWorkExperience, type ProfileFormValues } from "../profile-schema";

function WorkExperienceRow({
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
  const prefix = `workExperience.${index}` as const;
  const isCurrent = useWatch({ control, name: `${prefix}.isCurrent` });

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Work experience {index + 1}</h4>
          {!disabled && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${prefix}.designation`}>Designation</Label>
            <Input id={`${prefix}.designation`} className="mt-1" disabled={disabled} {...register(`${prefix}.designation`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.company`}>Company</Label>
            <Input id={`${prefix}.company`} className="mt-1" disabled={disabled} {...register(`${prefix}.company`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.fromDate`}>From</Label>
            <Input id={`${prefix}.fromDate`} type="date" className="mt-1" disabled={disabled} {...register(`${prefix}.fromDate`)} />
          </div>
          <div>
            <Label htmlFor={`${prefix}.toDate`}>To</Label>
            <Input id={`${prefix}.toDate`} type="date" className="mt-1" disabled={disabled || !!isCurrent} {...register(`${prefix}.toDate`)} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name={`${prefix}.isCurrent`}
            render={({ field }) => (
              <Checkbox
                id={`${prefix}.isCurrent`}
                disabled={disabled}
                checked={field.value}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  field.onChange(isChecked);
                }}
              />
            )}
          />
          <Label htmlFor={`${prefix}.isCurrent`} className="font-normal">
            I currently work here
          </Label>
        </div>
      </CardBody>
    </Card>
  );
}

export function WorkExperienceSection({
  control,
  register,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "workExperience" });

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">No work experience added yet.</p>
          </CardBody>
        </Card>
      )}

      {fields.map((field, index) => (
        <WorkExperienceRow
          key={field.id}
          control={control}
          register={register}
          index={index}
          onRemove={() => remove(index)}
          disabled={disabled}
        />
      ))}

      {!disabled && (
        <Button type="button" variant="secondary" onClick={() => append(emptyWorkExperience())}>
          <Plus className="mr-2 h-4 w-4" />
          Add work experience
        </Button>
      )}
    </div>
  );
}
