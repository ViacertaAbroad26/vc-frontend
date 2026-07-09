import { Badge, Button, Card, CardBody } from "@viacerta/ui";

import { InsightEditor } from "./InsightEditor";
import { useAdvisorReport } from "./useAdvisorReport";
import { useBuildReport } from "./useBuildReport";
import { useExportReport } from "./useExportReport";
import { usePublishReport } from "./usePublishReport";

const SECTIONS = [
  { key: "EXECUTIVE_SUMMARY", label: "Executive summary" },
  { key: "GCSS_BREAKDOWN", label: "Sustainability score breakdown" },
  { key: "GCRI_BREAKDOWN", label: "Country-risk analysis" },
  { key: "ROI_ANALYSIS", label: "ROI analysis" },
  { key: "RISK_REGISTER", label: "Risk register" },
  { key: "NINETY_DAY_PLAN", label: "90-day plan" },
] as const;

export function ReportComposer({ studentId }: { studentId: string }) {
  const { data: report } = useAdvisorReport(studentId);
  const build = useBuildReport(studentId);
  const publish = usePublishReport(studentId);
  const exportReport = useExportReport(studentId);

  const isPublished = !!report?.publishedAt;
  const sections = SECTIONS.map(({ key, label }) => {
    const entry = report?.advisorInsights?.find((i) => i["section"] === key);
    const text = entry && typeof entry["text"] === "string" ? entry["text"] : "";
    return { key, label, text };
  });
  const allComplete = sections.every(({ text }) => text.trim().length > 0);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600">Author six advisor insights, then publish to the student.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => build.mutate()} loading={build.isPending} disabled={isPublished}>
            Build report
          </Button>
          {!isPublished ? (
            <Button
              disabled={!allComplete}
              onClick={() => publish.mutate()}
              loading={publish.isPending}
              title={allComplete ? "" : "All six sections must have at least one insight"}
            >
              Publish report
            </Button>
          ) : (
            <Badge variant="green">Published</Badge>
          )}
          {isPublished && (
            <>
              <Button
                variant="secondary"
                onClick={() => exportReport.mutate("pdf")}
                loading={exportReport.isPending && exportReport.variables === "pdf"}
              >
                Download PDF
              </Button>
              <Button
                variant="secondary"
                onClick={() => exportReport.mutate("docx")}
                loading={exportReport.isPending && exportReport.variables === "docx"}
              >
                Download DOCX
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="space-y-3">
        {sections.map(({ key, label, text }) => (
          <Card key={key}>
            <CardBody>
              <h3 className="font-medium text-gray-900">{label}</h3>
              <div className="mt-2">
                <InsightEditor studentId={studentId} section={key} initialText={text} disabled={isPublished} />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
