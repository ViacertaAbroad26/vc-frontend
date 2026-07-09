import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Label, Textarea } from "@viacerta/ui";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCaptureYear1Outcome } from "./useCaptureYear1Outcome";

const schema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  year1Employed: z.enum(["true", "false"], { errorMap: () => ({ message: "Select an employment status" }) }),
  year1Salary: z.string().optional(),
  year1Currency: z.enum(["", "INR", "EUR", "USD"]).optional(),
  year1Country: z.string().optional(),
  year1Role: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function Year1OutcomeForm() {
  const capture = useCaptureYear1Outcome();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: "", year1Employed: "true", year1Currency: "" },
  });

  const onSubmit = handleSubmit((values) => {
    capture.mutate(
      {
        studentId: values.studentId,
        year1Employed: values.year1Employed === "true",
        year1Salary: values.year1Salary ? Number(values.year1Salary) : null,
        year1Currency: values.year1Currency || null,
        year1Country: values.year1Country || null,
        year1Role: values.year1Role || null,
        notes: values.notes || null,
      },
      { onSuccess: () => reset() },
    );
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="y1-student-id">Student ID</Label>
        <Input id="y1-student-id" className="mt-1" error={!!errors.studentId} {...register("studentId")} />
        {errors.studentId && <p className="mt-1 text-xs text-flag-red-solid">{errors.studentId.message}</p>}
      </div>

      <div>
        <Label htmlFor="y1-employed">Employed at Year 1</Label>
        <select
          id="y1-employed"
          className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
          {...register("year1Employed")}
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="y1-salary">Salary</Label>
          <Input id="y1-salary" type="number" step="any" className="mt-1" {...register("year1Salary")} />
        </div>
        <div>
          <Label htmlFor="y1-currency">Currency</Label>
          <select
            id="y1-currency"
            className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
            {...register("year1Currency")}
          >
            <option value="">—</option>
            <option value="INR">INR</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="y1-country">Country</Label>
          <Input id="y1-country" className="mt-1" {...register("year1Country")} />
        </div>
        <div>
          <Label htmlFor="y1-role">Role</Label>
          <Input id="y1-role" className="mt-1" {...register("year1Role")} />
        </div>
      </div>

      <div>
        <Label htmlFor="y1-notes">Notes</Label>
        <Textarea id="y1-notes" rows={3} className="mt-1" {...register("notes")} />
      </div>

      {capture.isError && (
        <p className="text-xs text-flag-red-solid">Could not capture this outcome. Please try again.</p>
      )}
      {capture.isSuccess && <p className="text-xs text-flag-green-text">Year-1 outcome captured.</p>}

      <Button type="submit" loading={capture.isPending}>
        Capture Year-1 outcome
      </Button>
    </form>
  );
}
