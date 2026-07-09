import { type GcssFlag, type RiskBand, flagColors, riskBandColors } from "@viacerta/design-tokens";

export type { GcssFlag, RiskBand };

const FLAG_LABELS: Record<GcssFlag, string> = {
  GREEN: "Ready",
  YELLOW: "Ready with Plan",
  RED: "Not Yet Ready",
  DECLINED: "Refer to Prep Resources",
};

const FLAG_RECOMMENDATIONS: Record<GcssFlag, string> = {
  GREEN: "Proceed to country mapping and shortlisting.",
  YELLOW: "Close the gaps in the 90-day plan, then re-assess.",
  RED: "Focus on foundational readiness before applying.",
  DECLINED: "This pathway isn't a fit right now — explore prep resources.",
};

const RISK_BAND_LABELS: Record<RiskBand, string> = {
  LOW: "Low risk",
  MODERATE: "Moderate risk",
  HIGH: "High risk",
  VERY_HIGH: "Very high risk",
};

export function gcssFlagToLabel(flag: GcssFlag): string {
  return FLAG_LABELS[flag];
}

export function gcssFlagToColor(flag: GcssFlag) {
  return flagColors[flag];
}

export function recommendationFor(flag: GcssFlag): string {
  return FLAG_RECOMMENDATIONS[flag];
}

export function riskBandToLabel(band: RiskBand): string {
  return RISK_BAND_LABELS[band];
}

export function riskBandToColor(band: RiskBand) {
  return riskBandColors[band];
}
