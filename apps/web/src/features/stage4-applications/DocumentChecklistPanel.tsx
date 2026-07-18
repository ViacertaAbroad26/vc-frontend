import { Card, CardBody } from "@viacerta/ui";
import { CheckCircle2, Circle } from "lucide-react";

import { DOCUMENT_CATALOG } from "@/features/documents/document-catalog";

import type { StudentDocumentPrep } from "./useDocumentPrep";

export function DocumentChecklistPanel({ prep }: { prep: StudentDocumentPrep }) {
  const items = prep.items ?? [];
  const verifiedCount = items.filter((i) => i.documentStatus === "VERIFIED").length;

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Document Checklist</h3>
          <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-semibold text-mint-700 dark:bg-navy-700 dark:text-mint-400">
            {verifiedCount}/{items.length}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-navy-700">
          {items.map((item) => {
            const catalogEntry = DOCUMENT_CATALOG.find((c) => c.type === item.documentType);
            const verified = item.documentStatus === "VERIFIED";
            return (
              <div key={item.documentType} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2.5">
                  {verified ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                    {catalogEntry?.label ?? item.documentType}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.documentStatus.replaceAll("_", " ").toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
