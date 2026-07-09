import { zodResolver } from "@hookform/resolvers/zod";
import type { CareerVertical } from "@viacerta/api-client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useHardcodedDowngrade } from "./useHardcodedDowngrade";

const VERTICAL_OPTIONS: CareerVertical[] = [
  "TECH_SOFTWARE",
  "DATA_AND_AI",
  "ENGINEERING_CORE",
  "HEALTHCARE_LIFESCIENCES",
  "BUSINESS_AND_FINANCE",
  "DESIGN_AND_MEDIA",
  "RESEARCH_AND_ACADEMIA",
  "TRADES_AND_SKILLED",
];

const schema = z.object({
  vertical: z.enum(VERTICAL_OPTIONS as [string, ...string[]]),
  country: z.string().min(1, "Country is required"),
  factor: z.string().min(1, "Factor is required"),
  newRawValue: z.coerce.number(),
  evidence: z.string().min(10, "Evidence must be at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

export function HardcodedDowngradeDialog({ onClose }: { onClose: () => void }) {
  const downgrade = useHardcodedDowngrade();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vertical: "TECH_SOFTWARE", country: "", factor: "", newRawValue: 0, evidence: "" },
  });

  const onSubmit = handleSubmit((values) => {
    downgrade.mutate(
      {
        vertical: values.vertical,
        country: values.country,
        factor: values.factor,
        newRawValue: values.newRawValue,
        evidence: values.evidence,
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply a hard-coded downgrade</DialogTitle>
          <DialogDescription>
            Publishes a new matrix delta version with the corrected value. Requires evidence for the audit trail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="downgrade-vertical">Vertical</Label>
            <select
              id="downgrade-vertical"
              className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
              {...register("vertical")}
            >
              {VERTICAL_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="downgrade-country">Country</Label>
            <Input id="downgrade-country" className="mt-1" error={!!errors.country} {...register("country")} />
            {errors.country && <p className="mt-1 text-xs text-flag-red-solid">{errors.country.message}</p>}
          </div>

          <div>
            <Label htmlFor="downgrade-factor">Factor</Label>
            <Input id="downgrade-factor" className="mt-1" error={!!errors.factor} {...register("factor")} />
            {errors.factor && <p className="mt-1 text-xs text-flag-red-solid">{errors.factor.message}</p>}
          </div>

          <div>
            <Label htmlFor="downgrade-value">New raw value</Label>
            <Input
              id="downgrade-value"
              type="number"
              step="any"
              className="mt-1"
              error={!!errors.newRawValue}
              {...register("newRawValue")}
            />
            {errors.newRawValue && <p className="mt-1 text-xs text-flag-red-solid">{errors.newRawValue.message}</p>}
          </div>

          <div>
            <Label htmlFor="downgrade-evidence">Evidence</Label>
            <Textarea
              id="downgrade-evidence"
              rows={3}
              className="mt-1"
              error={!!errors.evidence}
              {...register("evidence")}
            />
            {errors.evidence && <p className="mt-1 text-xs text-flag-red-solid">{errors.evidence.message}</p>}
          </div>

          {downgrade.isError && (
            <p className="text-xs text-flag-red-solid">Could not apply this downgrade. Please try again.</p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={downgrade.isPending}>
              Apply downgrade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
