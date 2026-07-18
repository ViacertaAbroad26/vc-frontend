import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Snapshot = { recordedAt: string; gcssFinal: number };

export function ReadinessTrendChart({ snapshots }: { snapshots: Snapshot[] }) {
  const data = snapshots.map((s) => ({
    date: new Date(s.recordedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: s.gcssFinal,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#044e77"
            strokeWidth={2}
            dot={{ r: 4, fill: "#68b687" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
