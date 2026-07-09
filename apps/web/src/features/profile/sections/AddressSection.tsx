import { Card, CardBody, Checkbox, Input, Label } from "@viacerta/ui";
import { useState } from "react";
import type { Control, UseFormGetValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { CountrySelect } from "../CountrySelect";
import type { ProfileFormValues } from "../profile-schema";

export function AddressSection({
  control,
  register,
  prefix,
  title,
  disabled,
  copyFromMailing,
  getValues,
  setValue,
}: {
  control: Control<ProfileFormValues>;
  register: UseFormRegister<ProfileFormValues>;
  prefix: "mailingAddress" | "permanentAddress";
  title: string;
  disabled?: boolean;
  copyFromMailing?: boolean;
  getValues?: UseFormGetValues<ProfileFormValues>;
  setValue?: UseFormSetValue<ProfileFormValues>;
}) {
  const [sameAsMailing, setSameAsMailing] = useState(false);

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {copyFromMailing && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="sameAsMailing"
                disabled={disabled}
                checked={sameAsMailing}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setSameAsMailing(isChecked);
                  if (isChecked && getValues && setValue) {
                    setValue("permanentAddress", getValues("mailingAddress"));
                  }
                }}
              />
              <Label htmlFor="sameAsMailing" className="font-normal">
                Same as mailing address
              </Label>
            </div>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor={`${prefix}.addressLine1`}>Address line 1</Label>
            <Input
              id={`${prefix}.addressLine1`}
              className="mt-1"
              disabled={disabled || sameAsMailing}
              {...register(`${prefix}.addressLine1`)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`${prefix}.addressLine2`}>Address line 2</Label>
            <Input
              id={`${prefix}.addressLine2`}
              className="mt-1"
              disabled={disabled || sameAsMailing}
              {...register(`${prefix}.addressLine2`)}
            />
          </div>
          <div>
            <Label htmlFor={`${prefix}.country`}>Country</Label>
            <div className="mt-1">
              <CountrySelect control={control} name={`${prefix}.country`} id={`${prefix}.country`} disabled={disabled || sameAsMailing} />
            </div>
          </div>
          <div>
            <Label htmlFor={`${prefix}.state`}>State / region</Label>
            <Input
              id={`${prefix}.state`}
              className="mt-1"
              disabled={disabled || sameAsMailing}
              {...register(`${prefix}.state`)}
            />
          </div>
          <div>
            <Label htmlFor={`${prefix}.city`}>City</Label>
            <Input
              id={`${prefix}.city`}
              className="mt-1"
              disabled={disabled || sameAsMailing}
              {...register(`${prefix}.city`)}
            />
          </div>
          <div>
            <Label htmlFor={`${prefix}.pincode`}>Pincode / ZIP</Label>
            <Input
              id={`${prefix}.pincode`}
              className="mt-1"
              disabled={disabled || sameAsMailing}
              {...register(`${prefix}.pincode`)}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
