import type { DocumentType } from "@viacerta/api-client";

export type DocumentCatalogEntry = {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
};

/** Static catalog of documents the student may need to provide. */
export const DOCUMENT_CATALOG: DocumentCatalogEntry[] = [
  { type: "TRANSCRIPT", label: "Academic transcript", description: "Your latest official transcript or marksheet.", required: true },
  { type: "SCORE_REPORT", label: "Test score report", description: "IELTS, TOEFL, GRE, GMAT or SAT score report.", required: true },
  { type: "CV", label: "CV / résumé", description: "Your current CV.", required: true },
  { type: "SOP", label: "Statement of purpose", description: "A draft or final statement of purpose.", required: true },
  { type: "LOR", label: "Letter of recommendation", description: "From a teacher, professor or manager.", required: true },
  { type: "PASSPORT", label: "Passport", description: "The bio-data page of your passport.", required: true },
  { type: "ID_PROOF", label: "Government ID", description: "Aadhaar, PAN or other government-issued ID.", required: true },
  { type: "BANK_STATEMENT", label: "Bank statement", description: "Proof of funds for your studies.", required: true },
  { type: "LOAN_SANCTION", label: "Loan sanction letter", description: "If you're funding your studies with an education loan.", required: false },
  { type: "SCHOLARSHIP_PROOF", label: "Scholarship proof", description: "Scholarship award letter, if any.", required: false },
  { type: "EMPLOYMENT_LETTER", label: "Employment letter", description: "Current employment or experience letter.", required: false },
  { type: "PROJECT_PORTFOLIO", label: "Project portfolio", description: "Portfolio of relevant projects or work.", required: false },
  { type: "OTHER", label: "Other document", description: "Anything else relevant to your application.", required: false },
];
