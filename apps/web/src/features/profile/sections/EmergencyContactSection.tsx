import { Card, CardBody, Input, Label } from "@viacerta/ui";
import type { UseFormRegister } from "react-hook-form";

import type { ProfileFormValues } from "../profile-schema";

export function EmergencyContactSection({
  register,
  disabled,
}: {
  register: UseFormRegister<ProfileFormValues>;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Emergency contact</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="emergencyContact.name">Contact name</Label>
            <Input id="emergencyContact.name" className="mt-1" disabled={disabled} {...register("emergencyContact.name")} />
          </div>
          <div>
            <Label htmlFor="emergencyContact.phone">Contact phone</Label>
            <Input id="emergencyContact.phone" className="mt-1" disabled={disabled} {...register("emergencyContact.phone")} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
