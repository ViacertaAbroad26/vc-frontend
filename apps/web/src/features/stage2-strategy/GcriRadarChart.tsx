import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const FACTOR_LABELS: Record<string, string> = {
  JOB_MARKET_DEMAND: "Job Market Demand",
  VISA_SUSTAINABILITY: "Visa Sustainability",
  SALARY_ROI: "Salary ROI",
  CAREER_CEILING: "Career Ceiling",
  COMPETITION_AND_SATURATION: "Competition",
  ECONOMIC_AND_POLITICAL_STABILITY: "Economic Stability",
  SKILL_GAP_DIFFICULTY: "Skill Gap",
};

type Factor = { factor: string; score: number; max: number };

export function GcriRadarChart({ factors }: { factors: Factor[] }) {
  const data = factors.map((f) => ({
    factor: FACTOR_LABELS[f.factor] ?? f.factor,
    pct: f.max ? Math.round((f.score / f.max) * 100) : 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#d1d5db" />
          <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: "#374151" }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="pct" stroke="#044e77" fill="#68b687" fillOpacity={0.45} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
