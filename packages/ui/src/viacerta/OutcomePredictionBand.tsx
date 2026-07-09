export function OutcomePredictionBand({
  probability,
  probabilityLow,
  probabilityHigh,
  confidenceLevel,
  modelVersion,
  rationale,
}: {
  probability: number;
  probabilityLow?: number | null | undefined;
  probabilityHigh?: number | null | undefined;
  confidenceLevel?: number | null | undefined;
  modelVersion?: string | null | undefined;
  rationale?: string | null | undefined;
}) {
  const pct = Math.round(probability * 100);
  const lowPct = probabilityLow != null ? Math.round(probabilityLow * 100) : null;
  const highPct = probabilityHigh != null ? Math.round(probabilityHigh * 100) : null;

  return (
    <div className="rounded-md border border-navy-100 bg-navy-50 px-3 py-2">
      <p className="text-sm font-medium text-navy-800">
        Predicted Year-1 employment likelihood:{" "}
        {lowPct != null && highPct != null ? (
          <span className="font-semibold">
            {lowPct}-{highPct}%
          </span>
        ) : (
          <span className="font-semibold">{pct}%</span>
        )}
      </p>
      {confidenceLevel != null && (
        <p className="mt-1 text-xs text-gray-600">Advisor confidence: {confidenceLevel}/10</p>
      )}
      {rationale && <p className="mt-1 text-xs text-gray-600">{rationale}</p>}
      {modelVersion && <p className="mt-1 text-xs text-gray-400">Model: {modelVersion}</p>}
    </div>
  );
}
