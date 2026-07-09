import { Briefcase, GraduationCap, School } from "lucide-react";

export type Persona = "SCHOOL" | "FINAL_YEAR_UG" | "WORKING_PROFESSIONAL";

const ICONS: Record<Persona, typeof School> = {
  SCHOOL: School,
  FINAL_YEAR_UG: GraduationCap,
  WORKING_PROFESSIONAL: Briefcase,
};

export function PersonaIcon({
  persona,
  className = "h-5 w-5",
}: {
  persona: Persona;
  className?: string;
}) {
  const Icon = ICONS[persona];
  return <Icon className={className} aria-hidden />;
}
