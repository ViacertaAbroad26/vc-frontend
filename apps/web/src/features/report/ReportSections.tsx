import type { StudentReport } from "@viacerta/api-client";
import type { GcssFlag, RiskBand } from "@viacerta/design-tokens";
import {
  Card,
  CardBody,
  DimensionBar,
  GcssFlagBadge,
  OutcomePredictionBand,
  RiskBandPill,
  ScoreGauge,
} from "@viacerta/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export function GcssSection({ gcss }: { gcss: StudentReport["gcss"] }) {
  const flag = gcss.flag as GcssFlag;
  return (
    <Section title="Your readiness score">
      <Card>
        <CardBody className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <ScoreGauge score={gcss.total} max={gcss.max ?? 100} flag={flag} label="GCSS" />
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold text-gray-900">{Math.round(gcss.total)}</span>
              <GcssFlagBadge flag={flag} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">{gcss.recommendation}</p>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-3">
        {gcss.dimensions.map((d) => (
          <DimensionBar key={d.key} label={d.label} score={d.score} max={d.max} />
        ))}
      </div>
    </Section>
  );
}

export function GcriSection({ gcri }: { gcri: StudentReport["gcri"] }) {
  if (!gcri || gcri.length === 0) return null;

  return (
    <Section title="Country-risk analysis">
      <div className="grid gap-4 md:grid-cols-2">
        {gcri.map((g, i) => (
          <Card key={`${g.country}-${i}`}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-gray-900">{g.country}</h3>
                  <p className="text-sm text-gray-600">{g.careerVertical}</p>
                </div>
                <RiskBandPill band={g.riskBand as RiskBand} />
              </div>
              <p className="mt-2 text-sm text-gray-700">Score: {g.score}</p>
              {g.dataSparseFlag && (
                <p className="mt-1 text-xs text-gray-500">Limited data is available for this country.</p>
              )}
              {g.outcomeProbability != null && (
                <div className="mt-2">
                  <OutcomePredictionBand
                    probability={g.outcomeProbability}
                    probabilityLow={g.outcomeProbabilityLow}
                    probabilityHigh={g.outcomeProbabilityHigh}
                  />
                </div>
              )}
              {g.factors && g.factors.length > 0 && (
                <div className="mt-4 space-y-2">
                  {g.factors.map((f) => (
                    <DimensionBar key={f.factor} label={f.factor} score={f.score} max={f.max} />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function InsightsSection({ insights }: { insights: StudentReport["advisorInsights"] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <Section title="Advisor insights">
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <Card key={`${insight.section}-${i}`}>
            <CardBody>
              <h3 className="text-xs font-medium uppercase tracking-wide text-navy-600">{insight.section}</h3>
              <p className="mt-1 text-sm text-gray-700">{insight.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function NinetyDayPlanSection({ plan }: { plan: StudentReport["ninetyDayPlan"] }) {
  if (!plan || plan.length === 0) return null;

  return (
    <Section title="Your 90-day plan">
      <div className="space-y-3">
        {plan.map((item, i) => (
          <Card key={i}>
            <CardBody>
              {"focus" in item && typeof item.focus === "string" && (
                <h3 className="font-medium text-gray-900">{item.focus}</h3>
              )}
              {"action" in item && typeof item.action === "string" && (
                <p className="mt-1 text-sm text-gray-700">{item.action}</p>
              )}
              {"window_days" in item && (
                <p className="mt-1 text-xs text-gray-500">Window: {String(item.window_days)} days</p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function RiskRegisterSection({ items }: { items: StudentReport["riskRegister"] }) {
  if (!items || items.length === 0) return null;

  return (
    <Section title="Risk register">
      <div className="space-y-3">
        {items.map((item, i) => (
          <Card key={i}>
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                {"area" in item && <h3 className="font-medium text-gray-900">{String(item.area)}</h3>}
                {/* This is a generic LOW/MEDIUM/HIGH severity (see report_build.py::_build_risk_register),
                    not a GCRI RiskBand (LOW/MODERATE/HIGH/VERY_HIGH) — a plain badge, not RiskBandPill. */}
                {"severity" in item && typeof item.severity === "string" && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {item.severity}
                  </span>
                )}
              </div>
              {"note" in item && <p className="mt-1 text-sm text-gray-700">{String(item.note)}</p>}
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function ParentSummarySection({ summary }: { summary: StudentReport["parentSummary"] }) {
  if (!summary) return null;

  return (
    <Section title="Summary for your parents">
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Cost</h3>
            <p className="mt-1 text-sm text-gray-700">{summary.cost}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Safety</h3>
            <p className="mt-1 text-sm text-gray-700">{summary.safety}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">Timeline</h3>
            <p className="mt-1 text-sm text-gray-700">{summary.timeline}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">ROI</h3>
            <p className="mt-1 text-sm text-gray-700">{summary.roi}</p>
          </div>
        </CardBody>
      </Card>
    </Section>
  );
}
