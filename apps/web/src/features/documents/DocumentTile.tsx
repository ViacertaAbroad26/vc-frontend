import type { DocumentResponse, DocumentStatus } from "@viacerta/api-client";
import { Badge, Card, CardBody } from "@viacerta/ui";
import type { ChangeEvent } from "react";

import type { DocumentCatalogEntry } from "./document-catalog";
import { useUploadDocument } from "./useUploadDocument";
import { useViewDocument } from "./useViewDocument";

const STATUS_BADGE: Record<DocumentStatus, { variant: "default" | "navy" | "amber" | "green" | "red"; label: string }> = {
  PENDING: { variant: "default", label: "Not uploaded" },
  UPLOADED: { variant: "navy", label: "Uploaded" },
  UNDER_REVIEW: { variant: "amber", label: "Under review" },
  VERIFIED: { variant: "green", label: "Verified" },
  REJECTED: { variant: "red", label: "Rejected" },
};

export function DocumentTile({ entry, document }: { entry: DocumentCatalogEntry; document: DocumentResponse | undefined }) {
  const upload = useUploadDocument();
  const view = useViewDocument();

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync({ type: entry.type, file });
    } finally {
      e.target.value = "";
    }
  };

  const status = STATUS_BADGE[document?.status ?? "PENDING"];

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-gray-900">
              {entry.label}
              {entry.required && <span className="ml-1 text-flag-red-solid">*</span>}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{entry.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            {document && <Badge variant="default">Evidence {document.evidenceLevel}</Badge>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
          {document?.fileName ? (
            <span className="truncate text-gray-600">{document.fileName}</span>
          ) : (
            <span className="text-gray-400">No file uploaded yet</span>
          )}
          <div className="flex shrink-0 items-center gap-3">
            {document && (
              <button
                type="button"
                className="font-medium text-navy-700 hover:text-navy-800 disabled:opacity-50"
                onClick={() => view.mutate(document.documentId)}
                disabled={view.isPending}
              >
                View
              </button>
            )}
            <label className="cursor-pointer font-medium text-navy-700 hover:text-navy-800">
              {document ? "Replace" : "Upload"}
              <input type="file" className="sr-only" onChange={onFile} disabled={upload.isPending} />
            </label>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
