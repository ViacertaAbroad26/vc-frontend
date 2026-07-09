import {
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
import { Controller, type Control, type UseFormRegister } from "react-hook-form";

import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from "../options";
import type { ProfileFormValues } from "../profile-schema";

export function PersonalInfoSection({
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
        <h3 className="text-sm font-semibold text-gray-900">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" className="mt-1" disabled={disabled} {...register("fullName")} />
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone number</Label>
            <Input id="contactPhone" className="mt-1" disabled={disabled} {...register("contactPhone")} />
          </div>
          <div>
            <Label htmlFor="personalInfo.dateOfBirth">Date of birth</Label>
            <Input
              id="personalInfo.dateOfBirth"
              type="date"
              className="mt-1"
              disabled={disabled}
              {...register("personalInfo.dateOfBirth")}
            />
          </div>
          <div>
            <Label htmlFor="personalInfo.gender">Gender</Label>
            <Controller
              control={control}
              name="personalInfo.gender"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger id="personalInfo.gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
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
            <Label htmlFor="personalInfo.maritalStatus">Marital status</Label>
            <Controller
              control={control}
              name="personalInfo.maritalStatus"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger id="personalInfo.maritalStatus">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map((opt) => (
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
  );
}
