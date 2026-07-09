import { Label, RadioGroup, RadioGroupItem } from "@viacerta/ui";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

export function YesNoField<TFieldValues extends FieldValues>({
  control,
  name,
  disabled = false,
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RadioGroup
          className="flex items-center gap-6"
          value={field.value === true ? "yes" : field.value === false ? "no" : ""}
          onValueChange={(value) => field.onChange(value === "yes")}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem id={`${field.name}-yes`} value="yes" />
            <Label htmlFor={`${field.name}-yes`} className="font-normal">
              Yes
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id={`${field.name}-no`} value="no" />
            <Label htmlFor={`${field.name}-no`} className="font-normal">
              No
            </Label>
          </div>
        </RadioGroup>
      )}
    />
  );
}
