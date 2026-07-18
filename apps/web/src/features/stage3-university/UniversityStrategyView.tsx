import { ApiError } from "@viacerta/api-client";
import {
  Card,
  CardBody,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  UniversityTierBadge,
  type UniversityTier,
} from "@viacerta/ui";

import { RoiCalculatorCard } from "./RoiCalculatorCard";
import { useUniversityStrategy } from "./useUniversityStrategy";

export function UniversityStrategyView() {
  const { data, isLoading, error } = useUniversityStrategy();

  const notReady = error instanceof ApiError && error.status === 404;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!data || notReady) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stage 3 · University Strategy"
          description="A tiered Dream-Reach-Target-Safe shortlist driven by acceptance probability, ROI and employability."
        />
        <Card>
          <CardBody>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              This stage needs your country mapping confirmed by your advisor first (Stage 2). Once
              confirmed, your advisor will build a tiered university shortlist here, weighted against
              your career blueprint.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const candidates = data.candidates ?? [];

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stage 3 · University Strategy"
          description="A tiered Dream-Reach-Target-Safe shortlist driven by acceptance probability, ROI and employability."
        />
        <Card>
          <CardBody className="flex items-center gap-3">
            <Spinner />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Your advisor is building your university shortlist. Check back soon.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 3 · University Strategy"
        description="Your tiered Dream-Reach-Target-Safe shortlist, driven by acceptance probability, ROI and employability."
      />

      <Card>
        <CardBody>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
            University Shortlist · Tiered Strategy
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Ranking</TableHead>
                <TableHead>Accept prob.</TableHead>
                <TableHead>Employability</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((c, i) => (
                <TableRow key={`${c.university}-${i}`}>
                  <TableCell>
                    <p className="font-medium">{c.university}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {c.program} · {c.country}
                    </p>
                  </TableCell>
                  <TableCell>{c.tier && <UniversityTierBadge tier={c.tier as UniversityTier} />}</TableCell>
                  <TableCell>{c.rank ? `#${c.rank}` : "—"}</TableCell>
                  <TableCell>
                    {c.acceptanceProbability != null ? `${Math.round(c.acceptanceProbability * 100)}%` : "—"}
                  </TableCell>
                  <TableCell>{c.employabilityScore}</TableCell>
                  <TableCell>{c.roi.roiMultiple != null ? `${c.roi.roiMultiple}x` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {data.aggregateRoi && <RoiCalculatorCard roi={data.aggregateRoi} />}
    </div>
  );
}
