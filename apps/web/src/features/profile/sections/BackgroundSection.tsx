import { Card, CardBody, Label } from "@viacerta/ui";
import type { Control } from "react-hook-form";

import type { ProfileFormValues } from "../profile-schema";
import { YesNoField } from "../YesNoField";

export function BackgroundSection({
  control,
  disabled = false,
}: {
  control: Control<ProfileFormValues>;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Background information</h3>
        <div className="space-y-4">
          <div>
            <Label>Have you ever applied for immigration to another country?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="background.appliedForImmigration" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label>Do you have any medical conditions we should be aware of?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="background.hasMedicalCondition" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label>Have you ever had a visa application refused?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="background.hasVisaRefusal" disabled={disabled} />
            </div>
          </div>
          <div>
            <Label>Have you ever been convicted of a criminal offence?</Label>
            <div className="mt-2">
              <YesNoField control={control} name="background.hasCriminalOffence" disabled={disabled} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
