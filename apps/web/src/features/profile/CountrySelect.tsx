import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@viacerta/ui";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { useConfigurations } from "@/features/configurations/useConfigurations";

export function CountrySelect<TFieldValues extends FieldValues>({
  control,
  name,
  id,
  disabled = false,
  placeholder = "Select a country",
}: {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const { data: countries } = useConfigurations({ type: "COUNTRY" });

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {(countries ?? []).map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
