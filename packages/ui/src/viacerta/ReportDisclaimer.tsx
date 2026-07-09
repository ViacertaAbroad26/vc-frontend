import { Info } from "lucide-react";

export function ReportDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden />
      <p className="text-sm text-gray-600">
        This report predicts probability, not certainty. Outcomes depend on Stage-7 execution and
        external factors outside any consultancy&apos;s control. ViaCerta does not earn commissions
        from universities; recommendations are career-first.
      </p>
    </div>
  );
}
