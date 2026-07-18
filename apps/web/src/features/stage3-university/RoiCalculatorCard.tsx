import { Card, CardBody, StatTile } from "@viacerta/ui";

type Roi = {
  totalInvestment: number;
  fiveYearEarnings: number;
  roiMultiple?: number | null;
  breakEvenYears?: number | null;
};

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function RoiCalculatorCard({ roi, title = "ROI Calculator" }: { roi: Roi; title?: string }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center justify-center rounded-xl bg-mint-50 p-4 dark:bg-navy-700">
            <span className="text-2xl font-bold text-mint-600 dark:text-mint-400">
              {roi.roiMultiple != null ? `${roi.roiMultiple}x` : "—"}
            </span>
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">ROI multiple</span>
          </div>
          <StatTile label="Total investment" value={currency(roi.totalInvestment)} />
          <StatTile label="5-yr earnings" value={currency(roi.fiveYearEarnings)} />
          <StatTile label="Break-even" value={roi.breakEvenYears != null ? `${roi.breakEvenYears} yrs` : "—"} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">Modelled estimate · planning assumption.</p>
      </CardBody>
    </Card>
  );
}
