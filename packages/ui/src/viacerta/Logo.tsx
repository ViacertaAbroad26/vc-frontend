import { cn } from "../lib/cn";

export type LogoProps = {
  className?: string;
  /** Show the "Career First. Countries Second." tagline under the wordmark. */
  tagline?: boolean;
  /** Use the light (cream/mint) palette for dark backgrounds. */
  inverted?: boolean;
  /** Hide the wordmark and render only the checkmark glyph. */
  markOnly?: boolean;
};

/**
 * ViaCerta brand mark: the official checkmark glyph artwork paired with the
 * "ViaCerta" wordmark, optional tagline.
 */
export function Logo({ className, tagline = false, inverted = false, markOnly = false }: LogoProps) {
  const variant = inverted ? "-inverted" : "";

  if (markOnly) {
    return (
      <img
        src={`/brand/logo-mark${variant}.png`}
        alt="ViaCerta"
        className={cn("h-8 w-auto object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <div className="inline-flex items-center gap-2">
        <img
          src={`/brand/logo-mark${variant}.png`}
          alt=""
          aria-hidden="true"
          className="h-8 w-auto object-contain"
        />
        <span className="font-heading text-xl font-bold leading-none tracking-tight">
          <span className={inverted ? "text-linen-100" : "text-navy-700"}>Via</span>
          <span className="text-mint-400">Certa</span>
        </span>
      </div>
      {tagline && (
        <p
          className={cn(
            "text-xs font-semibold tracking-wide",
            inverted ? "text-linen-200" : "text-mint-600",
          )}
        >
          Career First. Countries Second.
        </p>
      )}
    </div>
  );
}
