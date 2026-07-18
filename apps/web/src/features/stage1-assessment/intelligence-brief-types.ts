// Mirrors app/integrations/openai_schemas.py::GcssIntelligenceBrief field-for-
// field (snake_case, since it's stored/transmitted as a loose passthrough
// dict — see app/models/report.py's ReportContent.intelligence_brief and
// the backend note on why CamelModel aliasing doesn't reach these keys).
export type DashboardMetrics = {
  readiness_index: number;
  confidence_stars: number;
  opportunity_score: number;
  risk_score: number;
  improvement_velocity: "HIGH" | "MEDIUM" | "LOW";
};

export type ExecutiveSummary = {
  biggest_strength: string;
  biggest_gap: string;
  most_urgent_action: string;
  parent_60_second_summary: string;
};

export type PillarNarrative = {
  dimension: string;
  narrative: string;
  contradiction_flags: { description: string }[];
};

export type HiddenRisk = { title: string; description: string };
export type TopRisk = { risk: string; severity: "LOW" | "MEDIUM" | "HIGH"; why_it_matters: string };
export type TopOpportunity = { opportunity: string; impact: "LOW" | "MEDIUM" | "HIGH"; what_it_unlocks: string };
export type ScenarioRow = { dimension: string; scenario_current: string; scenario_improved: string };
export type ScenarioAnalysis = { assessed_outlook: string; rows: ScenarioRow[] };
export type RoadmapAction = {
  priority: "GATE" | "HIGH" | "MEDIUM";
  action: string;
  deliverable: string;
  deadline: string;
};
export type Roadmap = { actions: RoadmapAction[]; gate_checklist: string[] };
export type ParentSummary = { is_ready: string; real_risks: string; is_investment_sound: string };
export type ConclusionRow = { before: string; after: string };
export type Conclusion = { before_after: ConclusionRow[]; next_steps: string };
export type EmployabilitySignal = { signal: string; your_status: string; market_expectation: string };
export type CostComponent = { component: string; your_estimate: string; assessed_range: string };

export type GcssIntelligenceBrief = {
  dashboard_metrics: DashboardMetrics;
  executive_summary: ExecutiveSummary;
  pillar_narratives: PillarNarrative[];
  employability_signals: EmployabilitySignal[];
  cost_breakdown: CostComponent[];
  strengths: string[];
  development_areas: string[];
  hidden_risks: HiddenRisk[];
  top_risks: TopRisk[];
  top_opportunities: TopOpportunity[];
  scenario_analysis: ScenarioAnalysis;
  roadmap: Roadmap;
  parent_summary: ParentSummary;
  conclusion: Conclusion;
};
