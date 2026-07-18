import type { GcssFlag } from "@viacerta/design-tokens";
import {
  Button,
  Card,
  CardBody,
  DimensionBar,
  GcssFlagBadge,
  ListRow,
  PageHeader,
  ScoreGauge,
  StatTile,
} from "@viacerta/ui";
import type { StudentReport } from "@viacerta/api-client";
import { Download, TrendingUp, Zap } from "lucide-react";

import { useReportPdf } from "@/features/report/useReportPdf";

import type { GcssIntelligenceBrief } from "./intelligence-brief-types";

const PRIORITY_LABEL: Record<string, string> = { GATE: "Gate", HIGH: "High", MEDIUM: "Medium" };
const SEVERITY_LABEL: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export function AssessmentResults({ report }: { report: StudentReport }) {
  const flag = report.gcss.flag as GcssFlag;
  const gcri = report.gcri ?? [];
  const advisorInsights = report.advisorInsights ?? [];
  const brief = report.intelligenceBrief as unknown as GcssIntelligenceBrief | null | undefined;
  const pdf = useReportPdf();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Stage 1 · Global Career Assessment"
          description="A deep profile feeding the GCSS engine, risk indicators and an AI summary."
        />
        {report.publishedAt && (
          <Button variant="secondary" className="gap-2 shrink-0" onClick={() => pdf.mutate()} loading={pdf.isPending}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        )}
      </div>

      <Card>
        <CardBody className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <ScoreGauge score={report.gcss.total} flag={flag} label="GCSS" max={report.gcss.max ?? 100} />
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                {Math.round(report.gcss.total)}
              </span>
              <GcssFlagBadge flag={flag} />
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{report.gcss.recommendation}</p>
          </div>
        </CardBody>
      </Card>

      {brief && (
        <>
          {/* Executive summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-l-4 border-l-mint-400">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-mint-600 dark:text-mint-400">
                  Your single biggest strength
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.executive_summary.biggest_strength}</p>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-flag-red-solid">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-flag-red-solid">
                  Your single biggest gap
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.executive_summary.biggest_gap}</p>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-amber-400">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Your single most urgent action
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.executive_summary.most_urgent_action}</p>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-navy-700">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-700 dark:text-navy-300">
                  The 60-second read for a busy parent
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.executive_summary.parent_60_second_summary}</p>
              </CardBody>
            </Card>
          </div>

          {/* Dashboard metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatTile label="Readiness Index" value={brief.dashboard_metrics.readiness_index.toFixed(2)} />
            <StatTile label="Confidence" value={`${brief.dashboard_metrics.confidence_stars}/5 ★`} />
            <StatTile icon={TrendingUp} label="Opportunity" value={brief.dashboard_metrics.opportunity_score.toFixed(2)} />
            <StatTile label="Risk Score" value={brief.dashboard_metrics.risk_score.toFixed(2)} />
            <StatTile icon={Zap} label="Improvement Velocity" value={brief.dashboard_metrics.improvement_velocity} />
          </div>
        </>
      )}

      <Card>
        <CardBody className="space-y-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Readiness by dimension</p>
          {report.gcss.dimensions.map((d) => (
            <DimensionBar key={d.key} label={d.label} score={d.score} max={d.max} />
          ))}
        </CardBody>
      </Card>

      {brief && (
        <>
          {/* Pillar narratives */}
          <div className="space-y-4">
            {brief.pillar_narratives.map((p) => (
              <Card key={p.dimension}>
                <CardBody>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {p.dimension.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{p.narrative}</p>
                  {p.contradiction_flags.map((f, i) => (
                    <div key={i} className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                      Contradiction flag: {f.description}
                    </div>
                  ))}
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Strengths / development areas */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-mint-300 bg-mint-50 dark:border-mint-700 dark:bg-mint-950/20">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-mint-700 dark:text-mint-400">
                  Strengths &amp; Competitive Advantages
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  {brief.strengths.map((s, i) => <li key={i}>· {s}</li>)}
                </ul>
              </CardBody>
            </Card>
            <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <CardBody>
                <p className="text-xs font-semibold uppercase tracking-wide text-flag-red-solid">
                  Development Areas
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  {brief.development_areas.map((s, i) => <li key={i}>· {s}</li>)}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Hidden risks */}
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hidden Risks &amp; Blind Spots</p>
              {brief.hidden_risks.map((r, i) => (
                <div key={i} className="rounded-md border border-navy-200 bg-navy-50/50 p-3 dark:border-navy-700 dark:bg-navy-800/40">
                  <p className="text-sm font-medium text-navy-900 dark:text-gray-50">{r.title}</p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{r.description}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Top risks / opportunities */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardBody className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Risks</p>
                {brief.top_risks.map((r, i) => (
                  <ListRow key={i} title={r.risk} subtitle={r.why_it_matters}
                    trailing={<span className="text-xs font-semibold text-flag-red-solid">{SEVERITY_LABEL[r.severity]}</span>} />
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardBody className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Opportunities</p>
                {brief.top_opportunities.map((o, i) => (
                  <ListRow key={i} title={o.opportunity} subtitle={o.what_it_unlocks}
                    trailing={<span className="text-xs font-semibold text-mint-600 dark:text-mint-400">{SEVERITY_LABEL[o.impact]}</span>} />
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Scenario analysis */}
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scenario Analysis</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{brief.scenario_analysis.assessed_outlook}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-navy-700 dark:text-gray-400">
                      <th className="py-2 pr-3">Dimension</th>
                      <th className="py-2 pr-3">Scenario A · As-Is</th>
                      <th className="py-2">Scenario B · After Roadmap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.scenario_analysis.rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-navy-800">
                        <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-50">{row.dimension}</td>
                        <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">{row.scenario_current}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-300">{row.scenario_improved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* 90-day roadmap */}
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your 90-Day Action Roadmap</p>
              {brief.roadmap.actions.map((a, i) => (
                <ListRow
                  key={i}
                  title={a.action}
                  subtitle={`${a.deliverable} · Due ${a.deadline}`}
                  trailing={<span className="text-xs font-semibold text-navy-700 dark:text-mint-400">{PRIORITY_LABEL[a.priority]}</span>}
                />
              ))}
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-navy-700">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Gate checklist — what unlocks Stage 2
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                  {brief.roadmap.gate_checklist.map((item, i) => <li key={i}>☐ {item}</li>)}
                </ul>
              </div>
            </CardBody>
          </Card>

          {/* Parent summary */}
          <Card>
            <CardBody className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Is the student ready?</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.parent_summary.is_ready}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">What are the real risks?</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.parent_summary.real_risks}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Is the investment sound?</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{brief.parent_summary.is_investment_sound}</p>
              </div>
            </CardBody>
          </Card>

          {/* Conclusion */}
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conclusion — What Stage 1 Has Changed</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-navy-700 dark:text-gray-400">
                      <th className="py-2 pr-3">Before Stage 1</th>
                      <th className="py-2">After Stage 1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.conclusion.before_after.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-navy-800">
                        <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">{row.before}</td>
                        <td className="py-2 text-gray-900 dark:text-gray-50">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rounded-md bg-mint-50 p-3 text-sm text-gray-800 dark:bg-mint-950/20 dark:text-gray-200">
                {brief.conclusion.next_steps}
              </p>
            </CardBody>
          </Card>
        </>
      )}

      {gcri.length > 0 && (
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Risk indicators</p>
            <div className="space-y-2">
              {gcri.map((g) => (
                <div key={g.country} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 dark:text-gray-50">{g.country}</span>
                  <span className="text-gray-500 dark:text-gray-400">{g.riskBand}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {advisorInsights.length > 0 && (
        <Card>
          <CardBody>
            <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">AI summary</p>
            <div className="space-y-3">
              {advisorInsights.map((insight, i) => (
                <p key={i} className="text-sm text-gray-700 dark:text-gray-200">
                  {insight.text}
                </p>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">{report.disclaimer}</p>
    </div>
  );
}
