import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const SOURCE_LABELS: Record<string, string> = {
  EDUCATION_LOAN: "Education loan",
  FAMILY_FUNDING: "Family funding",
  SCHOLARSHIP: "Scholarship",
  SAVINGS: "Savings",
};

const SOURCE_COLORS: Record<string, string> = {
  EDUCATION_LOAN: "#044e77",
  FAMILY_FUNDING: "#68b687",
  SCHOLARSHIP: "#e9af2c",
  SAVINGS: "#a78bfa",
};

function formatLakhCr(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
  return `₹${amount.toLocaleString()}`;
}

type Breakdown = { source: string; amount: number }[];

export function FinancialPlanDonut({ breakdown, total }: { breakdown: Breakdown; total: number }) {
  const data = breakdown.filter((b) => b.amount > 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="source" innerRadius="65%" outerRadius="100%" paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] ?? "#94a3b8"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50">{formatLakhCr(total)}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">funded</span>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        {data.map((entry) => (
          <div key={entry.source} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SOURCE_COLORS[entry.source] ?? "#94a3b8" }}
            />
            <span className="text-gray-700 dark:text-gray-200">{SOURCE_LABELS[entry.source] ?? entry.source}</span>
            <span className="ml-auto font-medium text-gray-900 dark:text-gray-50">
              {formatLakhCr(entry.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
