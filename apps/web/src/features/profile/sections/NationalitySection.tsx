import { Card, CardBody, Label } from "@viacerta/ui";
import type { Control } from "react-hook-form";

import { CountrySelect } from "../CountrySelect";
import type { ProfileFormValues } from "../profile-schema";
import { YesNoField } from "../YesNoField";

export function NationalitySection({
  control,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Nationality</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nationality.nationality">Nationality</Label>
            <div className="mt-1">
              <CountrySelect control={control} name="nationality.nationality" id="nationality.nationality" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label htmlFor="nationality.citizenship">Citizenship</Label>
            <div className="mt-1">
              <CountrySelect control={control} name="nationality.citizenship" id="nationality.citizenship" disabled={disabled} />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Do you hold multiple citizenships?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="nationality.hasMultipleCitizenship" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label>Are you currently living in a country other than your nationality?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="nationality.livingInOtherCountry" disabled={disabled} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
