import { Button, Card, CardBody, Label, Textarea } from "@viacerta/ui";
import { useState } from "react";

import { useCaptureYear1Outcome } from "./useCaptureYear1Outcome";
import { useCaptureYear3Outcome } from "./useCaptureYear3Outcome";

type OutcomeType = "year1" | "year3";

type RowResult = { studentId: string; status: "success" | "error"; message?: string };

const YEAR1_PLACEHOLDER =
  "studentId,year1Employed,year1Salary,year1Currency,year1Country,year1Role,notes\nstu_123,true,55000,USD,Canada,Software Engineer,";
const YEAR3_PLACEHOLDER = "studentId,year3Progression,notes\nstu_123,PROMOTED,";

function parseCsv(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((cells) => cells[0]?.toLowerCase() !== "studentid");
}

export function BulkOutcomeImportForm() {
  const [type, setType] = useState<OutcomeType>("year1");
  const [csvText, setCsvText] = useState("");
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureYear1 = useCaptureYear1Outcome();
  const captureYear3 = useCaptureYear3Outcome();

  const onSubmit = async () => {
    const rows = parseCsv(csvText);
    if (rows.length === 0) return;

    setIsSubmitting(true);
    const rowResults: RowResult[] = [];

    for (const cells of rows) {
      const studentId = cells[0] ?? "";
      try {
        if (type === "year1") {
          const [, employed, salary, currency, country, role, notes] = cells;
          await captureYear1.mutateAsync({
            studentId,
            year1Employed: employed?.toLowerCase() === "true",
            year1Salary: salary ? Number(salary) : null,
            year1Currency: currency || null,
            year1Country: country || null,
            year1Role: role || null,
            notes: notes || null,
          });
        } else {
          const [, progression, notes] = cells;
          await captureYear3.mutateAsync({
            studentId,
            year3Progression: progression ?? "",
            notes: notes || null,
          });
        }
        rowResults.push({ studentId, status: "success" });
      } catch {
        rowResults.push({ studentId, status: "error", message: "Could not capture this row." });
      }
    }

    setResults(rowResults);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <div>
          <Label htmlFor="bulk-type">Outcome type</Label>
          <select
            id="bulk-type"
            className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400"
            value={type}
            onChange={(e) => setType(e.target.value as OutcomeType)}
          >
            <option value="year1">Year 1</option>
            <option value="year3">Year 3</option>
          </select>
        </div>

        <div>
          <Label htmlFor="bulk-csv">CSV data</Label>
          <Textarea
            id="bulk-csv"
            rows={6}
            className="mt-1 font-mono text-xs"
            placeholder={type === "year1" ? YEAR1_PLACEHOLDER : YEAR3_PLACEHOLDER}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            One row per student, comma-separated. The header row is optional.
          </p>
        </div>

        <Button onClick={onSubmit} loading={isSubmitting} disabled={csvText.trim().length === 0}>
          Import outcomes
        </Button>

        {results && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {results.filter((r) => r.status === "success").length} of {results.length} rows imported
            </p>
            <ul className="space-y-1 text-xs">
              {results.map((r, i) => (
                <li
                  key={`${r.studentId}-${i}`}
                  className={r.status === "success" ? "text-flag-green-text" : "text-flag-red-solid"}
                >
                  {r.studentId}: {r.status === "success" ? "imported" : r.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
