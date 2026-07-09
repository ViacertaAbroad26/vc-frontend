import { AsyncBoundary } from "@viacerta/ui";

import { DocumentTile } from "./DocumentTile";
import { DOCUMENT_CATALOG } from "./document-catalog";
import { useDocuments } from "./useDocuments";

export function StudentDocuments() {
  const { data, isLoading, error } = useDocuments();

  return (
    <AsyncBoundary isLoading={isLoading} error={error} data={data}>
      {(documents) => {
        const byType = new Map(documents.map((d) => [d.type, d]));
        const required = DOCUMENT_CATALOG.filter((e) => e.required);
        const optional = DOCUMENT_CATALOG.filter((e) => !e.required);

        return (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              {required.map((entry) => (
                <DocumentTile key={entry.type} entry={entry} document={byType.get(entry.type)} />
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">
                Optional — improves your evidence score
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {optional.map((entry) => (
                  <DocumentTile key={entry.type} entry={entry} document={byType.get(entry.type)} />
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
