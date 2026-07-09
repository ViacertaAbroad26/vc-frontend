import { Card, CardBody, Input, Label } from "@viacerta/ui";
import type { Control, UseFormRegister } from "react-hook-form";

import { CountrySelect } from "../CountrySelect";
import type { ProfileFormValues } from "../profile-schema";

export function PassportSection({
  control,
  register,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Passport information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="passport.passportNumber">Passport number</Label>
            <Input id="passport.passportNumber" className="mt-1" disabled={disabled} {...register("passport.passportNumber")} />
          </div>
          <div>
            <Label htmlFor="passport.issueCountry">Issuing country</Label>
            <div className="mt-1">
              <CountrySelect control={control} name="passport.issueCountry" id="passport.issueCountry" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label htmlFor="passport.issueDate">Issue date</Label>
            <Input id="passport.issueDate" type="date" className="mt-1" disabled={disabled} {...register("passport.issueDate")} />
          </div>
          <div>
            <Label htmlFor="passport.expiryDate">Expiry date</Label>
            <Input id="passport.expiryDate" type="date" className="mt-1" disabled={disabled} {...register("passport.expiryDate")} />
          </div>
          <div>
            <Label htmlFor="passport.cityOfBirth">City of birth</Label>
            <Input id="passport.cityOfBirth" className="mt-1" disabled={disabled} {...register("passport.cityOfBirth")} />
          </div>
          <div>
            <Label htmlFor="passport.countryOfBirth">Country of birth</Label>
            <div className="mt-1">
              <CountrySelect control={control} name="passport.countryOfBirth" id="passport.countryOfBirth" disabled={disabled} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
