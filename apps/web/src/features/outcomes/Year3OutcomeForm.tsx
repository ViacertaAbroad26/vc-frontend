import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCaptureYear3Outcome } from "./useCaptureYear3Outcome";

const PROGRESSION_OPTIONS = [
  { value: "PROMOTED", label: "Promoted" },
  { value: "SAME", label: "Same role" },
  { value: "CHANGED_FIELD", label: "Changed field" },
  { value: "CHANGED_COUNTRY", label: "Changed country" },
  { value: "RETURNED_HOME", label: "Returned home" },
  { value: "UNEMPLOYED", label: "Unemployed" },
] as const;

const schema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  year3Progression: z.enum(PROGRESSION_OPTIONS.map((o) => o.value) as [string, ...string[]]),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function Year3OutcomeForm() {
  const capture = useCaptureYear3Outcome();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: "", year3Progression: "SAME" },
  });

  const onSubmit = handleSubmit((values) => {
    capture.mutate(
      { studentId: values.studentId, year3Progression: values.year3Progression, notes: values.notes || null },
      { onSuccess: () => reset() },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="y3-student-id">Student ID</Label>
        <Input id="y3-student-id" className="mt-1" error={!!errors.studentId} {...register("studentId")} />
        {errors.studentId && <p className="mt-1 text-xs text-flag-red-solid">{errors.studentId.message}</p>}
      </div>

      <div>
        <Label htmlFor="y3-progression">Year-3 progression</Label>
        <select
          id="y3-progression"
          className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
          {...register("year3Progression")}
        >
          {PROGRESSION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="y3-notes">Notes</Label>
        <Textarea id="y3-notes" rows={3} className="mt-1" {...register("notes")} />
      </div>

      {capture.isError && (
        <p className="text-xs text-flag-red-solid">Could not capture this outcome. Please try again.</p>
      )}
      {capture.isSuccess && <p className="text-xs text-flag-green-text">Year-3 outcome captured.</p>}

      <Button type="submit" loading={capture.isPending}>
        Capture Year-3 outcome
      </Button>
    </form>
  );
}
